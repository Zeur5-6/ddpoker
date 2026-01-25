// ========================================
// Card Component
// ========================================

import { motion } from 'framer-motion';
import { Card as CardType } from '../../core/types';
import { SUIT_SYMBOLS, SUIT_COLORS } from '../../core/models/Card';

interface CardProps {
  card: CardType;
  faceDown?: boolean;
  selected?: boolean;
  highlighted?: boolean;
  onClick?: () => void;
  small?: boolean;
  index?: number;
}

export function Card({
  card,
  faceDown = false,
  selected = false,
  highlighted = false,
  onClick,
  small = false,
  index = 0,
}: CardProps) {
  const isJoker = card.isJoker;
  const color = isJoker ? 'black' : SUIT_COLORS[card.suit];
  const symbol = isJoker ? '🃏' : SUIT_SYMBOLS[card.suit];
  
  const sizeClasses = small 
    ? 'w-12 h-16 text-xs' 
    : 'w-14 h-20 sm:w-16 sm:h-24 text-sm';
  
  if (faceDown) {
    return (
      <motion.div
        initial={{ rotateY: 180, opacity: 0 }}
        animate={{ rotateY: 0, opacity: 1 }}
        transition={{ delay: index * 0.1, duration: 0.3 }}
        className={`
          ${sizeClasses}
          rounded-lg bg-gradient-to-br from-blue-800 via-blue-700 to-blue-800
          border-2 border-yellow-500
          flex items-center justify-center
          shadow-lg
          relative overflow-hidden
        `}
      >
        {/* Pattern */}
        <div className="absolute inset-2 border border-yellow-500/40 rounded-md" />
        <div className="absolute inset-4 border border-yellow-500/20 rounded-sm" />
        <span className="text-3xl">🎴</span>
      </motion.div>
    );
  }
  
  return (
    <motion.div
      initial={{ rotateY: -90, opacity: 0 }}
      animate={{ 
        rotateY: 0, 
        opacity: 1,
        y: selected ? -16 : 0,
        scale: highlighted ? 1.05 : 1,
      }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      whileHover={onClick ? { y: -10, scale: 1.03 } : {}}
      onClick={onClick}
      className={`
        ${sizeClasses}
        rounded-lg bg-white
        border-2 ${selected ? 'border-yellow-400 ring-2 ring-yellow-400' : 'border-gray-200'}
        ${highlighted ? 'ring-2 ring-green-400' : ''}
        flex flex-col justify-between
        p-2
        shadow-lg
        ${onClick ? 'cursor-pointer hover:shadow-xl' : ''}
        ${color === 'red' ? 'text-red-600' : 'text-gray-900'}
        relative
        select-none
      `}
    >
      {isJoker ? (
        <div className="flex flex-col items-center justify-center h-full gap-0.5">
          <span className={small ? 'text-2xl' : 'text-3xl sm:text-4xl'}>🃏</span>
          <span className="text-[10px] sm:text-xs font-bold text-purple-600">JOKER</span>
        </div>
      ) : (
        <>
          {/* Top left */}
          <div className="flex flex-col items-start leading-none">
            <span className={`font-bold ${small ? 'text-xs' : 'text-sm sm:text-base'}`}>{card.rank}</span>
            <span className={small ? 'text-sm' : 'text-base sm:text-lg'}>{symbol}</span>
          </div>
          
          {/* Center suit */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className={`${small ? 'text-2xl' : 'text-3xl sm:text-4xl'} opacity-15`}>{symbol}</span>
          </div>
          
          {/* Bottom right (rotated) */}
          <div className="flex flex-col items-end leading-none rotate-180">
            <span className={`font-bold ${small ? 'text-xs' : 'text-sm sm:text-base'}`}>{card.rank}</span>
            <span className={small ? 'text-sm' : 'text-base sm:text-lg'}>{symbol}</span>
          </div>
        </>
      )}
    </motion.div>
  );
}

// Mini card for compact display
export function MiniCard({ card }: { card: CardType }) {
  const color = card.isJoker ? 'black' : SUIT_COLORS[card.suit];
  const symbol = card.isJoker ? '🃏' : SUIT_SYMBOLS[card.suit];
  
  return (
    <span className={`
      inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded
      bg-white border border-gray-300
      ${color === 'red' ? 'text-red-600' : 'text-gray-900'}
      text-sm font-bold
    `}>
      {card.isJoker ? '🃏' : `${card.rank}${symbol}`}
    </span>
  );
}
