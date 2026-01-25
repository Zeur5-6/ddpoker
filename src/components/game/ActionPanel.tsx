// ========================================
// Action Panel Component (AP Actions)
// ========================================

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { APAction, PlayerState, Card as CardType } from '../../core/types';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { getActionCost, getRemainingAP, canPerformAction } from '../../core/models/Player';
import { useGameStore } from '../../store/gameStore';

interface ActionPanelProps {
  player: PlayerState;
  availableActions: APAction[];
  onAction: (action: APAction, cardIndex?: number, searchSelection?: number) => void;
  searchCards?: CardType[] | null; // From store - actual deck cards
}

export function ActionPanel({
  player,
  availableActions,
  onAction,
}: ActionPanelProps) {
  const [selectedAction, setSelectedAction] = useState<APAction | null>(null);
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);
  const [selectedSearchCard, setSelectedSearchCard] = useState<number | null>(null);
  const [searchStep, setSearchStep] = useState<'select' | 'discard'>('select');
  
  // Get search functions from store
  const { searchCards, previewSearchCards, clearSearchCards } = useGameStore();
  
  const remainingAP = getRemainingAP(player);
  
  const actionInfo: Record<APAction, { name: string; description: string; icon: string }> = {
    redraw: {
      name: 'リドロー',
      description: '手札を1枚捨て、山札から1枚引く',
      icon: '🔄',
    },
    search: {
      name: 'サーチ',
      description: '山札から3枚見て1枚選ぶ',
      icon: '🔍',
    },
    add: {
      name: 'アド',
      description: '山札から1枚追加（最大7枚）',
      icon: '➕',
    },
    buyJoker: {
      name: 'ジョーカー購入',
      description: '手札1枚をジョーカーに交換',
      icon: '🃏',
    },
    pass: {
      name: 'パス',
      description: 'APを全て消費して終了',
      icon: '⏭️',
    },
  };
  
  // Clear search cards when component unmounts or action changes
  useEffect(() => {
    return () => {
      clearSearchCards();
    };
  }, [clearSearchCards]);
  
  // Clear search cards when action is cancelled
  useEffect(() => {
    if (selectedAction !== 'search') {
      clearSearchCards();
    }
  }, [selectedAction, clearSearchCards]);
  
  const handleActionClick = (action: APAction) => {
    if (action === 'pass') {
      onAction('pass');
      return;
    }
    
    if (action === 'add') {
      onAction('add');
      return;
    }
    
    // Actions that need card selection
    if (action === 'redraw' || action === 'buyJoker') {
      setSelectedAction(action);
      setSelectedCardIndex(null);
    }
    
    // Search has a special flow
    if (action === 'search') {
      // Get actual cards from deck
      const cards = previewSearchCards();
      if (!cards || cards.length < 3) {
        console.error('Not enough cards in deck for search');
        return;
      }
      
      setSelectedAction('search');
      setSearchStep('select');
      setSelectedSearchCard(null);
      setSelectedCardIndex(null);
    }
  };
  
  const handleCardSelect = (index: number) => {
    setSelectedCardIndex(index);
  };
  
  const handleSearchCardSelect = (index: number) => {
    setSelectedSearchCard(index);
  };
  
  const handleConfirm = () => {
    if (selectedAction === 'search') {
      if (searchStep === 'select' && selectedSearchCard !== null) {
        // Move to discard step
        setSearchStep('discard');
        setSelectedCardIndex(null);
      } else if (searchStep === 'discard' && selectedCardIndex !== null && selectedSearchCard !== null) {
        // Complete search action
        onAction('search', selectedCardIndex, selectedSearchCard);
        resetState();
      }
    } else if (selectedAction && selectedCardIndex !== null) {
      onAction(selectedAction, selectedCardIndex);
      resetState();
    }
  };
  
  const resetState = () => {
    setSelectedAction(null);
    setSelectedCardIndex(null);
    setSelectedSearchCard(null);
    setSearchStep('select');
    clearSearchCards();
  };
  
  const handleCancel = () => {
    resetState();
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-black/40 backdrop-blur-md rounded-xl p-4 shadow-2xl border border-white/10"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-gray-400 text-sm">アクションフェーズ</span>
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-sm">残りAP:</span>
          <span className={`
            font-bold text-xl
            ${remainingAP <= 2 ? 'text-red-400' : remainingAP <= 4 ? 'text-yellow-400' : 'text-green-400'}
          `}>
            {remainingAP}
          </span>
        </div>
      </div>
      
      <AnimatePresence mode="wait">
        {!selectedAction ? (
          /* Action selection */
          <motion.div
            key="actions"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-wrap gap-2 justify-center"
          >
            {availableActions.map((action) => {
              const info = actionInfo[action];
              const cost = getActionCost(player, action);
              const canDo = canPerformAction(player, action);
              
              return (
                <motion.button
                  key={action}
                  whileHover={canDo ? { scale: 1.03 } : {}}
                  whileTap={canDo ? { scale: 0.97 } : {}}
                  onClick={() => handleActionClick(action)}
                  disabled={!canDo}
                  className={`
                    px-4 py-2 rounded-lg transition-all
                    ${canDo 
                      ? 'bg-white/10 hover:bg-white/20 cursor-pointer' 
                      : 'bg-white/5 opacity-50 cursor-not-allowed'
                    }
                    border border-white/10
                  `}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{info.icon}</span>
                    <span className="text-white font-bold text-sm">{info.name}</span>
                    {cost > 0 && (
                      <span className={`
                        text-xs font-bold
                        ${cost <= remainingAP ? 'text-green-400' : 'text-red-400'}
                      `}>
                        ({cost}AP)
                      </span>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        ) : selectedAction === 'search' ? (
          /* Search action - special UI (NO CANCEL - cards are revealed) */
          <motion.div
            key="search"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            <div className="text-center">
              <span className="text-white font-bold">🔍 サーチ (3AP消費)</span>
              <p className="text-yellow-400 text-xs mt-1">⚠️ カードを見たためキャンセル不可</p>
            </div>
            
            {searchStep === 'select' ? (
              <div className="flex flex-col items-center gap-3">
                <div className="text-gray-300 text-sm">山札から1枚選択:</div>
                <div className="flex justify-center gap-2">
                  {searchCards?.map((card, index) => (
                    <div
                      key={`search-${index}`}
                      onClick={() => handleSearchCardSelect(index)}
                      className="cursor-pointer transition-transform hover:scale-105"
                    >
                      <Card card={card} selected={selectedSearchCard === index} index={index} />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="text-gray-300 text-sm">手札から捨てるカードを選択:</div>
                <div className="flex justify-center gap-2">
                  {player.hand.map((card, index) => (
                    <div key={`hand-${index}`} onClick={() => handleCardSelect(index)} className="cursor-pointer">
                      <Card card={card} selected={selectedCardIndex === index} index={index} />
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex gap-2 justify-center">
              {searchStep === 'discard' && (
                <Button variant="secondary" onClick={() => { setSearchStep('select'); setSelectedCardIndex(null); }} size="md">
                  戻る
                </Button>
              )}
              <Button
                variant="primary"
                onClick={handleConfirm}
                disabled={searchStep === 'select' ? selectedSearchCard === null : selectedCardIndex === null}
                size="md"
              >
                {searchStep === 'select' ? '次へ' : '決定'}
              </Button>
            </div>
          </motion.div>
        ) : (
          /* Card selection for redraw/buyJoker */
          <motion.div
            key="card-select"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            <div className="text-center">
              <span className="text-white font-bold">
                {actionInfo[selectedAction].icon} {actionInfo[selectedAction].name}
              </span>
              <p className="text-gray-400 text-sm mt-1">交換するカードを選択</p>
            </div>
            
            <div className="flex justify-center gap-2">
              {player.hand.map((card, index) => (
                <div key={`hand-${index}`} onClick={() => handleCardSelect(index)} className="cursor-pointer">
                  <Card card={card} selected={selectedCardIndex === index} index={index} />
                </div>
              ))}
            </div>
            
            <div className="flex gap-2 justify-center">
              <Button variant="secondary" onClick={handleCancel} size="md">キャンセル</Button>
              <Button variant="primary" onClick={handleConfirm} disabled={selectedCardIndex === null} size="md">
                決定
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Zorro bonus indicator */}
      {player.hasZorro && !player.hasBoughtJoker && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-2 text-center bg-yellow-500/20 rounded px-2 py-1"
        >
          <span className="text-yellow-400 text-xs">✨ ゾロ目！ジョーカー購入可 ✨</span>
        </motion.div>
      )}
    </motion.div>
  );
}
