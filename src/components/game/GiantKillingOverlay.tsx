// ========================================
// Giant Killing Overlay Component
// ========================================

import { motion } from 'framer-motion';

export function GiantKillingOverlay() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
    >
      {/* Background flash */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.7, 0.4] }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500"
      />
      
      {/* Particle effects - fewer, faster */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            opacity: 0,
            scale: 0,
            x: 0,
            y: 0,
          }}
          animate={{ 
            opacity: [0, 1, 0],
            scale: [0, 1.2, 0],
            x: (Math.random() - 0.5) * 300,
            y: (Math.random() - 0.5) * 300,
          }}
          transition={{ 
            duration: 0.6,
            delay: Math.random() * 0.2,
          }}
          className="absolute w-3 h-3 bg-yellow-400 rounded-full"
          style={{
            boxShadow: '0 0 15px 8px rgba(255, 200, 0, 0.5)',
          }}
        />
      ))}
      
      {/* Main text */}
      <motion.div
        initial={{ scale: 0, rotate: -15 }}
        animate={{ 
          scale: [0, 1.3, 1],
          rotate: [-15, 5, 0],
        }}
        transition={{ 
          duration: 0.4,
          type: 'spring',
          stiffness: 300,
        }}
        className="relative"
      >
        {/* Glow effect */}
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{ 
            duration: 0.3,
            repeat: 2,
          }}
          className="absolute inset-0 blur-xl bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
        />
        
        {/* Text */}
        <div className="relative flex flex-col items-center">
          <motion.span
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 0.2, repeat: 2 }}
            className="text-5xl sm:text-7xl mb-2"
          >
            ⚡
          </motion.span>
          
          <h1 
            className="text-3xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-400 to-orange-500"
            style={{
              textShadow: '0 0 30px rgba(255, 200, 0, 0.8)',
              WebkitTextStroke: '1px rgba(255, 150, 0, 0.5)',
            }}
          >
            GIANT
          </h1>
          <h1 
            className="text-3xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 to-red-600"
            style={{
              textShadow: '0 0 30px rgba(255, 100, 0, 0.8)',
              WebkitTextStroke: '1px rgba(255, 50, 0, 0.5)',
            }}
          >
            KILLING!!
          </h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-2 text-lg sm:text-xl text-yellow-200 font-bold"
          >
            💰 ボーナス 2倍！ 💰
          </motion.p>
        </div>
      </motion.div>
    </motion.div>
  );
}
