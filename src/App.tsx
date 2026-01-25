// ========================================
// Double Dice Poker - Main App
// ========================================

import { GameBoard } from './components/game/GameBoard';
import { HomeScreen } from './components/HomeScreen';
import { useGameStore } from './store/gameStore';
import { GamePhase } from './core/types';

function App() {
  const { gameState } = useGameStore();
  const { phase } = gameState;
  
  // Show home screen if in LOBBY phase
  const showHomeScreen = phase === GamePhase.LOBBY;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950">
      {/* Background pattern */}
      <div 
        className="fixed inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 0%, transparent 50%)
          `,
        }}
      />
      
      {/* Felt texture overlay */}
      <div 
        className="fixed inset-0 opacity-30 pointer-events-none mix-blend-multiply"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Game content */}
      <div className="relative z-10">
        {showHomeScreen ? <HomeScreen /> : <GameBoard />}
      </div>
    </div>
  );
}

export default App;
