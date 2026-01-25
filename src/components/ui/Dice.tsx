// ========================================
// 3D Dice Component
// ========================================

import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';

interface DiceProps {
  value: number;
  rolling?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

// Dot positions for each face value [row, col] in 3x3 grid
const DOT_PATTERNS: Record<number, [number, number][]> = {
  1: [[1, 1]],
  2: [[0, 2], [2, 0]],
  3: [[0, 2], [1, 1], [2, 0]],
  4: [[0, 0], [0, 2], [2, 0], [2, 2]],
  5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
  6: [[0, 0], [0, 2], [1, 0], [1, 2], [2, 0], [2, 2]],
};

// Create a dice face
function DiceFace({ value, size }: { value: number; size: 'sm' | 'md' | 'lg' }) {
  const dots = DOT_PATTERNS[value] || DOT_PATTERNS[1];
  
  const dotSizes = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
  };
  
  const grid: boolean[][] = [
    [false, false, false],
    [false, false, false],
    [false, false, false],
  ];
  
  dots.forEach(([row, col]) => {
    grid[row][col] = true;
  });
  
  return (
    <div className="w-full h-full grid grid-cols-3 grid-rows-3 gap-0.5 p-1">
      {grid.flatMap((row, rowIndex) =>
        row.map((hasDot, colIndex) => (
          <div 
            key={`${rowIndex}-${colIndex}`}
            className="flex items-center justify-center"
          >
            {hasDot && (
              <div
                className={`${dotSizes[size]} bg-gray-900 rounded-full`}
                style={{
                  boxShadow: 'inset 0 -1px 2px rgba(255,255,255,0.3)',
                }}
              />
            )}
          </div>
        ))
      )}
    </div>
  );
}

export function Dice3D({ value, rolling = false, size = 'md' }: DiceProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<{ interval?: ReturnType<typeof setInterval>; timeout?: ReturnType<typeof setTimeout> }>({});
  
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
  };
  
  const faceSize = {
    sm: 48,
    md: 64,
    lg: 80,
  };
  
  useEffect(() => {
    // Clear any existing animations
    if (animationRef.current.interval) {
      clearInterval(animationRef.current.interval);
    }
    if (animationRef.current.timeout) {
      clearTimeout(animationRef.current.timeout);
    }
    
    if (rolling) {
      setIsAnimating(true);
      
      // Animate through random values
      animationRef.current.interval = setInterval(() => {
        setDisplayValue(Math.floor(Math.random() * 6) + 1);
      }, 80);
      
      // Stop after animation and show final value
      animationRef.current.timeout = setTimeout(() => {
        if (animationRef.current.interval) {
          clearInterval(animationRef.current.interval);
        }
        setDisplayValue(value);
        setIsAnimating(false);
      }, 800);
    } else {
      // Not rolling - just show the value
      setDisplayValue(value);
      setIsAnimating(false);
    }
    
    return () => {
      if (animationRef.current.interval) {
        clearInterval(animationRef.current.interval);
      }
      if (animationRef.current.timeout) {
        clearTimeout(animationRef.current.timeout);
      }
    };
  }, [rolling, value]);
  
  const halfSize = faceSize[size] / 2;
  
  return (
    <div 
      className={`${sizeClasses[size]} relative`}
      style={{ 
        perspective: '300px',
        perspectiveOrigin: 'center center',
      }}
    >
      <motion.div
        animate={isAnimating ? {
          rotateX: [0, 360, 720],
          rotateY: [0, 360, 720],
        } : {
          rotateX: 0,
          rotateY: 0,
        }}
        transition={isAnimating ? {
          duration: 0.8,
          ease: 'easeOut',
        } : {
          duration: 0.3,
        }}
        className="w-full h-full relative"
        style={{
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Front face (showing current value) */}
        <div
          className="absolute inset-0 bg-white rounded-lg border-2 border-gray-200"
          style={{
            transform: `translateZ(${halfSize}px)`,
            boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.5)',
          }}
        >
          <DiceFace value={displayValue} size={size} />
        </div>
        
        {/* Back face */}
        <div
          className="absolute inset-0 bg-white rounded-lg border-2 border-gray-200"
          style={{
            transform: `rotateY(180deg) translateZ(${halfSize}px)`,
          }}
        >
          <DiceFace value={7 - displayValue} size={size} />
        </div>
        
        {/* Top face */}
        <div
          className="absolute inset-0 bg-gray-100 rounded-lg border-2 border-gray-200"
          style={{
            transform: `rotateX(90deg) translateZ(${halfSize}px)`,
          }}
        >
          <DiceFace value={((displayValue) % 6) + 1} size={size} />
        </div>
        
        {/* Bottom face */}
        <div
          className="absolute inset-0 bg-gray-100 rounded-lg border-2 border-gray-200"
          style={{
            transform: `rotateX(-90deg) translateZ(${halfSize}px)`,
          }}
        >
          <DiceFace value={((displayValue + 2) % 6) + 1} size={size} />
        </div>
        
        {/* Left face */}
        <div
          className="absolute inset-0 bg-gray-50 rounded-lg border-2 border-gray-200"
          style={{
            transform: `rotateY(-90deg) translateZ(${halfSize}px)`,
          }}
        >
          <DiceFace value={((displayValue + 3) % 6) + 1} size={size} />
        </div>
        
        {/* Right face */}
        <div
          className="absolute inset-0 bg-gray-50 rounded-lg border-2 border-gray-200"
          style={{
            transform: `rotateY(90deg) translateZ(${halfSize}px)`,
          }}
        >
          <DiceFace value={((displayValue + 4) % 6) + 1} size={size} />
        </div>
      </motion.div>
    </div>
  );
}

// Simple 2D dice as fallback
export function Dice({ value, rolling = false, size = 'md' }: DiceProps) {
  return <Dice3D value={value} rolling={rolling} size={size} />;
}

// Dice pair component
interface DicePairProps {
  values: [number, number];
  rolling?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function DicePair({ values, rolling = false, size = 'md' }: DicePairProps) {
  const isZorro = !rolling && values[0] === values[1];
  
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-6 items-center">
        <Dice3D value={values[0]} rolling={rolling} size={size} />
        <Dice3D value={values[1]} rolling={rolling} size={size} />
      </div>
      
      {!rolling && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center"
        >
          <span className="text-white font-bold text-2xl">
            AP: {values[0] + values[1]}
          </span>
          {isZorro && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500 }}
              className="text-yellow-400 font-bold text-sm flex items-center gap-1 mt-1"
            >
              ✨ ゾロ目！ジョーカー購入可能 ✨
            </motion.span>
          )}
        </motion.div>
      )}
    </div>
  );
}
