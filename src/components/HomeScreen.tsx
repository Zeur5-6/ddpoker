// ========================================
// Home Screen Component
// ========================================

import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { Button } from './ui/Button';
import { StatisticsPanel } from './ui/StatisticsPanel';
import { TutorialPanel } from './ui/TutorialPanel';

export function HomeScreen() {
  const { 
    initGame, 
    startRound, 
    rollDiceAndSetup, 
    statistics, 
    uiState,
    language,
    toggleStatistics, 
    toggleTutorial,
    setLanguage,
    getTranslations,
  } = useGameStore();
  
  const t = getTranslations();
  
  return (
    <div className="h-screen w-full flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-emerald-900/95 to-emerald-950/95 border-2 border-yellow-400/30 rounded-2xl p-8 max-w-2xl w-full shadow-2xl"
      >
        <div className="text-center space-y-6">
          {/* Title */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="relative"
          >
            {/* Language switcher - top right */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'ja' : 'en')}
              className="absolute top-0 right-0 text-gray-400 hover:text-white text-2xl px-3 py-2 rounded-lg hover:bg-white/10 transition font-bold"
              title={language === 'en' ? 'Switch to Japanese' : '日本語に切り替え'}
            >
              {language === 'en' ? '🇯🇵' : '🇺🇸'}
            </button>
            
            <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 mb-2">
              🎲 Double Dice Poker
            </h1>
            <p className="text-gray-300 text-lg">
              {language === 'en' 
                ? 'Use AP (Action Points) determined by dice to strengthen your hand and compete in poker!'
                : 'サイコロで決まるAP（行動ポイント）を使って手札を強化し、ポーカーで勝負！'
              }
            </p>
          </motion.div>
          
          {/* Statistics Summary */}
          {statistics.roundsPlayed > 0 && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-black/30 rounded-lg p-4 grid grid-cols-3 gap-4 text-center"
            >
              <div>
                <div className="text-gray-400 text-sm">{language === 'en' ? 'Win Rate' : '勝率'}</div>
                <div className="text-2xl font-bold text-green-400">
                  {Math.round((statistics.roundsWon / statistics.roundsPlayed) * 100)}%
                </div>
              </div>
              <div>
                <div className="text-gray-400 text-sm">{language === 'en' ? 'Giant Killings' : 'ジャイアントキリング'}</div>
                <div className="text-2xl font-bold text-orange-400">
                  {statistics.giantKillings}
                </div>
              </div>
              <div>
                <div className="text-gray-400 text-sm">{language === 'en' ? 'Win Streak' : '連勝記録'}</div>
                <div className="text-2xl font-bold text-yellow-400">
                  {statistics.longestWinStreak}
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Game Start Options */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <div>
              <h2 className="text-xl font-bold text-white mb-3">{t.ui.selectOpponents}</h2>
              <div className="flex gap-3 justify-center flex-wrap">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => {
                    initGame({ cpuCount: 1 });
                    // Start the game immediately
                    setTimeout(() => {
                      startRound();
                      rollDiceAndSetup();
                    }, 100);
                  }}
                >
                  1 vs 1
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => {
                    initGame({ cpuCount: 2 });
                    // Start the game immediately
                    setTimeout(() => {
                      startRound();
                      rollDiceAndSetup();
                    }, 100);
                  }}
                >
                  1 vs 2
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => {
                    initGame({ cpuCount: 3 });
                    // Start the game immediately
                    setTimeout(() => {
                      startRound();
                      rollDiceAndSetup();
                    }, 100);
                  }}
                >
                  1 vs 3
                </Button>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3 justify-center pt-4">
              <Button
                variant="secondary"
                size="md"
                onClick={toggleStatistics}
              >
                📊 {t.common.statistics}
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={toggleTutorial}
              >
                ❓ {t.common.tutorial}
              </Button>
            </div>
          </motion.div>
        </div>
      </motion.div>
      
      {/* Statistics Panel */}
      {uiState.showStatistics && (
        <StatisticsPanel statistics={statistics} onClose={toggleStatistics} />
      )}
      
      {/* Tutorial Panel */}
      {uiState.showTutorial && (
        <TutorialPanel onClose={toggleTutorial} />
      )}
    </div>
  );
}
