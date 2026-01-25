// ========================================
// Player Area Component
// ========================================

import { motion } from 'framer-motion';
import { PlayerState, GamePhase, HandRank } from '../../core/types';
import { Card } from '../ui/Card';
import { evaluatePlayerHand } from '../../core/models/Player';
import { getPersonaName } from '../../core/models/CPUPlayer';
import { useGameStore } from '../../store/gameStore';

interface PlayerAreaProps {
  player: PlayerState;
  isCurrentPlayer: boolean;
  isDealer: boolean;
  phase: GamePhase;
  showCards: boolean;
  onCardClick?: (index: number) => void;
  selectedCardIndex?: number;
  position: 'bottom' | 'top' | 'left' | 'right';
}

export function PlayerArea({
  player,
  isCurrentPlayer,
  isDealer,
  showCards,
  onCardClick,
  selectedCardIndex,
  position,
}: PlayerAreaProps) {
  const { getTranslations } = useGameStore();
  const t = getTranslations();
  const isHuman = player.isHuman;
  const handResult = player.hand.length >= 5 ? evaluatePlayerHand(player) : null;
  
  // Position-based styling
  const positionStyles = {
    bottom: 'flex-col',
    top: 'flex-col-reverse',
    left: 'flex-row',
    right: 'flex-row-reverse',
  };
  
  const cardContainerStyles = {
    bottom: 'flex-row',
    top: 'flex-row',
    left: 'flex-col',
    right: 'flex-col',
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: position === 'bottom' ? 30 : position === 'top' ? -30 : 0 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        flex ${positionStyles[position]} items-center gap-3
        ${isCurrentPlayer ? 'ring-2 ring-yellow-400' : ''}
        ${player.isFolded ? 'opacity-40' : ''}
        bg-black/20 rounded-xl p-3
        backdrop-blur-sm
      `}
    >
      {/* Player Info */}
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className={`
          w-10 h-10 rounded-full
          flex items-center justify-center
          text-xl
          ${isHuman ? 'bg-blue-600' : 'bg-purple-600'}
          border-2 ${isCurrentPlayer ? 'border-yellow-400' : 'border-white/30'}
        `}>
          {isHuman ? '👤' : '🤖'}
        </div>
        
        {/* Info */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-white font-bold">{player.name}</span>
            {isDealer && (
              <span className="bg-yellow-500 text-yellow-900 text-xs px-2 py-0.5 rounded-full font-bold">
                D
              </span>
            )}
            {/* Eliminated: 0 chips and not all-in (truly out of the game) */}
            {player.chips <= 0 && !player.isAllIn && player.currentBet <= 0 ? (
              <span className="bg-gray-700 text-gray-300 text-xs px-2 py-0.5 rounded-full">
                {t.common.eliminated}
              </span>
            ) : player.isAllIn ? (
              <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full font-bold animate-pulse">
                {t.common.allIn}
              </span>
            ) : player.isFolded && (
              <span className="bg-red-500/50 text-white text-xs px-2 py-0.5 rounded-full">
                {t.common.fold}
              </span>
            )}
          </div>
          
          {/* Chips */}
          <div className="flex items-center gap-2 mt-1">
            <span className="text-yellow-400 font-mono font-bold">
              💰 {player.chips.toLocaleString()}
            </span>
            {player.currentBet > 0 && (
              <span className="text-green-400 text-sm">
                (Bet: {player.currentBet})
              </span>
            )}
          </div>
        </div>
      </div>
      
      {/* Cards */}
      {player.hand.length > 0 && (
        <div className={`flex ${cardContainerStyles[position]} gap-1`}>
          {player.hand.map((card, index) => (
            <Card
              key={index}
              card={card}
              faceDown={!showCards && !isHuman}
              selected={selectedCardIndex === index}
              onClick={onCardClick && showCards ? () => onCardClick(index) : undefined}
              index={index}
            />
          ))}
        </div>
      )}
      
      {/* Hand Rank */}
      {showCards && handResult && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-sm font-bold"
        >
          {t.handRanks[HandRank[handResult.rank] as keyof typeof t.handRanks]}
        </motion.div>
      )}
    </motion.div>
  );
}

// Compact player area for opponents
export function OpponentArea({
  player,
  isCurrentPlayer,
  phase,
  showCards,
}: {
  player: PlayerState;
  isCurrentPlayer: boolean;
  phase: GamePhase;
  showCards: boolean;
}) {
  const { getTranslations } = useGameStore();
  const t = getTranslations();
  const handResult = player.hand.length >= 5 && showCards ? evaluatePlayerHand(player) : null;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`
        flex flex-col items-center gap-1 p-2
        bg-black/30 rounded-lg backdrop-blur-sm
        ${isCurrentPlayer ? 'ring-2 ring-yellow-400' : ''}
        ${player.chips <= 0 && !player.isAllIn && player.currentBet <= 0 ? 'opacity-30 grayscale' : player.isFolded ? 'opacity-40' : ''}
      `}
    >
      {/* Header */}
      <div className="flex items-center gap-1">
        <span className="text-sm">🤖</span>
        <span className="text-white font-bold text-xs">{player.name}</span>
        {player.persona && (
          <span className="text-gray-400 text-[10px]">({getPersonaName(player.persona)})</span>
        )}
      </div>
      
      {/* Status */}
      <div className="flex items-center gap-1 text-[10px]">
        <span className="text-yellow-400">💰{player.chips}</span>
        {player.currentBet > 0 && (
          <span className="text-green-400">(+{player.currentBet})</span>
        )}
        {/* Eliminated: 0 chips and not all-in */}
        {player.chips <= 0 && !player.isAllIn && player.currentBet <= 0 ? (
          <span className="bg-gray-700 text-gray-300 px-1 rounded-full">{t.common.eliminated}</span>
        ) : player.isAllIn ? (
          <span className="bg-red-600 text-white px-1 rounded-full animate-pulse">{t.common.allIn}</span>
        ) : player.isFolded && (
          <span className="text-red-400">{t.common.fold}</span>
        )}
      </div>
      
      {/* Cards */}
      <div className="flex gap-0.5">
        {player.hand.map((card, index) => (
          <Card
            key={index}
            card={card}
            faceDown={!showCards}
            small
            index={index}
          />
        ))}
      </div>
      
      {/* Hand result */}
      {handResult && (
        <span className="bg-purple-600/80 text-white text-[10px] px-1.5 py-0.5 rounded-full">
          {t.handRanks[HandRank[handResult.rank] as keyof typeof t.handRanks]}
        </span>
      )}
      
      {/* AP (shown in showdown) */}
      {phase === GamePhase.SHOWDOWN && player.ap > 0 && (
        <span className={`text-[10px] font-bold ${player.ap <= 4 ? 'text-orange-400' : 'text-blue-400'}`}>
          AP: {player.ap}
        </span>
      )}
    </motion.div>
  );
}
