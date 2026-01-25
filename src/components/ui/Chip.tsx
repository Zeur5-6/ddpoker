// ========================================
// Chip Component
// ========================================

import { motion } from 'framer-motion';

interface ChipProps {
  value: number;
  color?: 'white' | 'red' | 'blue' | 'green' | 'black' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  stacked?: boolean;
  stackIndex?: number;
}

const CHIP_COLORS = {
  white: 'bg-gray-100 border-gray-300',
  red: 'bg-red-600 border-red-400',
  blue: 'bg-blue-600 border-blue-400',
  green: 'bg-green-600 border-green-400',
  black: 'bg-gray-800 border-gray-600',
  gold: 'bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 border-yellow-300',
};

const CHIP_TEXT_COLORS = {
  white: 'text-gray-800',
  red: 'text-white',
  blue: 'text-white',
  green: 'text-white',
  black: 'text-white',
  gold: 'text-yellow-900',
};

// Determine chip color based on value
function getChipColor(value: number): ChipProps['color'] {
  if (value >= 1000) return 'gold';
  if (value >= 500) return 'black';
  if (value >= 100) return 'green';
  if (value >= 50) return 'blue';
  if (value >= 25) return 'red';
  return 'white';
}

export function Chip({
  value,
  color,
  size = 'md',
  stacked = false,
  stackIndex = 0,
}: ChipProps) {
  const chipColor = color || getChipColor(value);
  
  const sizeClasses = {
    sm: 'w-8 h-8 text-[10px]',
    md: 'w-10 h-10 text-xs',
    lg: 'w-14 h-14 text-sm',
  };
  
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ 
        scale: 1, 
        opacity: 1,
        y: stacked ? stackIndex * -4 : 0,
      }}
      transition={{ 
        delay: stackIndex * 0.05,
        type: 'spring',
        stiffness: 400,
      }}
      className={`
        ${sizeClasses[size]}
        ${chipColor ? CHIP_COLORS[chipColor] : ''}
        ${chipColor ? CHIP_TEXT_COLORS[chipColor] : ''}
        rounded-full
        border-4 border-dashed
        flex items-center justify-center
        font-bold
        shadow-lg
        relative
      `}
      style={{
        boxShadow: `
          0 ${2 + stackIndex}px ${4 + stackIndex * 2}px rgba(0,0,0,0.3),
          inset 0 2px 4px rgba(255,255,255,0.2)
        `,
      }}
    >
      {/* Inner ring */}
      <div className="absolute inset-1.5 rounded-full border border-white/30" />
      <span className="relative z-10">{value}</span>
    </motion.div>
  );
}

// Chip stack for displaying total chips
interface ChipStackProps {
  total: number;
  maxDisplay?: number;
}

export function ChipStack({ total, maxDisplay = 5 }: ChipStackProps) {
  // Calculate chip breakdown
  const chips: { value: number; count: number }[] = [];
  let remaining = total;
  
  const denominations = [1000, 500, 100, 50, 25, 10, 5, 1];
  
  for (const denom of denominations) {
    if (remaining >= denom) {
      const count = Math.floor(remaining / denom);
      chips.push({ value: denom, count: Math.min(count, 3) });
      remaining = remaining % denom;
    }
  }
  
  // Take only a few chips for display
  const displayChips = chips.slice(0, maxDisplay);
  
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative h-16">
        {displayChips.map((chip, i) => (
          <div
            key={i}
            className="absolute left-1/2 -translate-x-1/2"
            style={{ bottom: i * 6 }}
          >
            <Chip 
              value={chip.value} 
              size="sm" 
              stacked 
              stackIndex={i}
            />
          </div>
        ))}
      </div>
      <span className="text-yellow-400 font-bold text-sm">
        {total.toLocaleString()}
      </span>
    </div>
  );
}

// Pot display
interface PotDisplayProps {
  amount: number;
  sidePots?: { amount: number; eligiblePlayerIds: string[] }[];
  playerNames?: Map<string, string>; // id -> name mapping for display
}

export function PotDisplay({ amount, sidePots, playerNames }: PotDisplayProps) {
  if (amount === 0 && (!sidePots || sidePots.length === 0)) return null;
  
  // If we have side pots, show them individually
  const hasSidePots = sidePots && sidePots.length > 1;
  
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="flex flex-col items-center gap-2 bg-black/30 rounded-xl px-4 py-2"
    >
      {hasSidePots ? (
        // Multiple pots
        <div className="flex flex-col gap-1">
          {sidePots.map((pot, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="text-gray-400 text-xs min-w-[60px]">
                {index === 0 ? 'Main' : `Side ${index}`}:
              </span>
              <Chip value={pot.amount >= 100 ? 100 : pot.amount >= 25 ? 25 : 10} size="sm" />
              <span className="text-yellow-400 font-bold text-sm">
                {pot.amount.toLocaleString()}
              </span>
              {playerNames && pot.eligiblePlayerIds.length < 4 && (
                <span className="text-gray-500 text-xs">
                  ({pot.eligiblePlayerIds.map(id => playerNames.get(id) || id).join(', ')})
                </span>
              )}
            </div>
          ))}
          <div className="border-t border-white/20 pt-1 flex items-center gap-2">
            <span className="text-gray-300 text-xs min-w-[60px]">Total:</span>
            <span className="text-yellow-400 font-bold text-lg">
              {amount.toLocaleString()}
            </span>
          </div>
        </div>
      ) : (
        // Single pot
        <>
          <span className="text-gray-300 text-xs">POT</span>
          <div className="flex items-center gap-2">
            <Chip value={amount >= 100 ? 100 : amount >= 25 ? 25 : 10} size="sm" />
            <span className="text-yellow-400 font-bold text-xl">
              {amount.toLocaleString()}
            </span>
          </div>
        </>
      )}
    </motion.div>
  );
}
