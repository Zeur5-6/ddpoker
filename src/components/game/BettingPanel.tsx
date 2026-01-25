// ========================================
// Betting Panel Component
// ========================================

import { useState } from 'react';
import { motion } from 'framer-motion';
import { BettingAction } from '../../core/types';
import { Button } from '../ui/Button';

interface BettingPanelProps {
  availableActions: BettingAction[];
  currentBet: number;
  playerBet: number;
  playerChips: number;
  minBet: number;
  pot: number;
  onAction: (action: BettingAction, amount?: number) => void;
}

export function BettingPanel({
  availableActions,
  currentBet,
  playerBet,
  playerChips,
  minBet,
  pot,
  onAction,
}: BettingPanelProps) {
  const toCall = currentBet - playerBet;
  const [raiseAmount, setRaiseAmount] = useState(toCall + minBet);
  const [showRaiseSlider, setShowRaiseSlider] = useState(false);
  
  const canCheck = availableActions.includes('check');
  const canBet = availableActions.includes('bet');
  const canCall = availableActions.includes('call');
  const canRaise = availableActions.includes('raise');
  const canFold = availableActions.includes('fold');
  const canAllIn = availableActions.includes('all-in');
  
  const handleRaise = () => {
    if (showRaiseSlider) {
      onAction('raise', raiseAmount);
      setShowRaiseSlider(false);
    } else {
      setShowRaiseSlider(true);
    }
  };
  
  const handleBet = () => {
    if (showRaiseSlider) {
      onAction('bet', raiseAmount);
      setShowRaiseSlider(false);
    } else {
      setRaiseAmount(minBet);
      setShowRaiseSlider(true);
    }
  };
  
  // Quick bet amounts
  const quickBets = [
    { label: '1/3 Pot', amount: Math.floor(pot / 3) },
    { label: '1/2 Pot', amount: Math.floor(pot / 2) },
    { label: 'Pot', amount: pot },
    { label: '2x Pot', amount: pot * 2 },
  ].filter(b => b.amount >= minBet && b.amount <= playerChips);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-black/40 backdrop-blur-md rounded-xl p-3 shadow-2xl border border-white/10"
    >
      <div className="flex items-center justify-center gap-3 mb-2">
        <span className="text-gray-400 text-xs">Betting</span>
        {toCall > 0 && (
          <span className="text-yellow-400 text-sm font-bold">
            Call: {toCall}
          </span>
        )}
      </div>
      
      {/* Raise/Bet slider */}
      {showRaiseSlider && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="mb-2 bg-black/30 rounded-lg p-2"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-gray-400 text-xs">
              {canBet ? 'Bet' : 'Raise'}
            </span>
            <span className="text-yellow-400 font-bold">
              {raiseAmount}
            </span>
          </div>
          
          <input
            type="range"
            min={canBet ? minBet : toCall + minBet}
            max={playerChips}
            value={raiseAmount}
            onChange={(e) => setRaiseAmount(Number(e.target.value))}
            className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-4
              [&::-webkit-slider-thumb]:h-4
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-yellow-400
              [&::-webkit-slider-thumb]:cursor-pointer
            "
          />
          
          {/* Quick bet buttons */}
          <div className="flex gap-1 mt-2 flex-wrap justify-center">
            {quickBets.map((bet) => (
              <button
                key={bet.label}
                onClick={() => setRaiseAmount(bet.amount)}
                className="px-2 py-0.5 text-[10px] bg-white/10 hover:bg-white/20 text-white rounded transition"
              >
                {bet.label}
              </button>
            ))}
          </div>
        </motion.div>
      )}
      
      {/* Action buttons */}
      <div className="flex flex-wrap gap-2 justify-center">
        {canFold && (
          <Button variant="danger" onClick={() => onAction('fold')} size="md">
            フォールド
          </Button>
        )}
        
        {canCheck && (
          <Button variant="secondary" onClick={() => onAction('check')} size="md">
            チェック
          </Button>
        )}
        
        {canCall && (
          <Button variant="success" onClick={() => onAction('call')} size="md">
            コール ({toCall})
          </Button>
        )}
        
        {canBet && (
          <Button variant="primary" onClick={handleBet} size="md">
            {showRaiseSlider ? `ベット (${raiseAmount})` : 'ベット'}
          </Button>
        )}
        
        {canRaise && (
          <Button variant="primary" onClick={handleRaise} size="md">
            {showRaiseSlider ? `レイズ (${raiseAmount})` : 'レイズ'}
          </Button>
        )}
        
        {canAllIn && (
          <Button variant="danger" onClick={() => onAction('all-in')} size="md">
            オールイン ({playerChips})
          </Button>
        )}
        
        {showRaiseSlider && (
          <Button variant="ghost" onClick={() => setShowRaiseSlider(false)} size="sm">
            ✕
          </Button>
        )}
      </div>
    </motion.div>
  );
}
