// ========================================
// Game Board Component
// ========================================

import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import { GamePhase } from '../../core/types';
import { PlayerArea, OpponentArea } from './PlayerArea';
import { BettingPanel } from './BettingPanel';
import { ActionPanel } from './ActionPanel';
import { PotDisplay } from '../ui/Chip';
import { DicePair } from '../ui/Dice';
import { Button } from '../ui/Button';
import { GiantKillingOverlay } from './GiantKillingOverlay';
import { StatisticsPanel } from '../ui/StatisticsPanel';
import { TutorialPanel } from '../ui/TutorialPanel';

export function GameBoard() {
  const {
    gameState,
    statistics,
    uiState,
    language,
    isDiceRolling,
    initGame,
    startRound,
    rollDiceAndSetup,
    placeBet,
    performAction,
    getAvailableBettingActions,
    getAvailableAPActions,
    isHumanTurn,
    getHumanPlayer,
    toggleStatistics,
    toggleTutorial,
    setLanguage,
    getTranslations,
  } = useGameStore();
  
  const t = getTranslations();
  
  const { phase, players, pot, pots, currentPlayerIndex, dealerIndex, message, winner, isGiantKilling } = gameState;
  const humanPlayer = getHumanPlayer();
  const opponents = players.filter(p => !p.isHuman);
  
  // Format pot display (handle NaN)
  const displayPot = Number.isFinite(pot) ? pot : 0;
  
  // Create player name map for pot display
  const playerNames = new Map(players.map(p => [p.id, p.name]));
  
  return (
    <div className="h-screen w-full flex flex-col overflow-hidden">
      {/* Header - more compact */}
      <header className="bg-black/30 backdrop-blur-sm px-4 py-2 border-b border-white/10 shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
            🎲 Double Dice Poker
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-gray-400 text-xs">
              R{gameState.roundNumber}
            </span>
            {gameState.currentBlinds && (
              <span className="text-yellow-400 text-xs font-mono bg-yellow-400/10 px-2 py-0.5 rounded">
                {gameState.currentBlinds.sb}/{gameState.currentBlinds.bb}
                {gameState.currentBlinds.ante > 0 && ` +${gameState.currentBlinds.ante}`}
              </span>
            )}
            <span className="text-white text-sm font-bold px-2 py-0.5 bg-white/10 rounded">
              {t.phases[phase] || phase}
            </span>
            {/* Language switcher */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'ja' : 'en')}
              className="text-gray-400 hover:text-white text-sm px-2 py-1 rounded hover:bg-white/10 transition font-bold"
              title={language === 'en' ? 'Switch to Japanese' : '日本語に切り替え'}
            >
              {language === 'en' ? '🇯🇵' : '🇺🇸'}
            </button>
            {/* Statistics button */}
            <button
              onClick={toggleStatistics}
              className="text-gray-400 hover:text-white text-sm px-2 py-1 rounded hover:bg-white/10 transition"
              title={t.common.statistics}
            >
              📊
            </button>
            {/* Tutorial button */}
            <button
              onClick={toggleTutorial}
              className="text-gray-400 hover:text-white text-sm px-2 py-1 rounded hover:bg-white/10 transition"
              title={t.common.tutorial}
            >
              ❓
            </button>
          </div>
        </div>
      </header>
      
      {/* Main game area - fixed height layout */}
      <main className="flex-1 flex flex-col p-2 max-w-7xl mx-auto w-full min-h-0">
        {/* Opponents area - compact */}
        <div className="flex justify-center gap-2 flex-wrap shrink-0">
          {opponents.map((opponent) => (
            <OpponentArea
              key={opponent.id}
              player={opponent}
              isCurrentPlayer={players[currentPlayerIndex]?.id === opponent.id}
              phase={phase}
              showCards={phase === GamePhase.SHOWDOWN}
            />
          ))}
        </div>
        
        {/* Center area - Pot and messages */}
        <div className="flex-1 flex flex-col items-center justify-center gap-2 min-h-0">
          {/* Pot + Message row */}
          <div className="flex items-center gap-4">
            <PotDisplay amount={displayPot} sidePots={pots} playerNames={playerNames} />
            <motion.div
              key={message}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-white text-sm font-bold text-center bg-black/30 px-4 py-2 rounded-lg max-w-md"
            >
              {message}
            </motion.div>
          </div>
          
          {/* Dice roll display */}
          <AnimatePresence>
            {uiState.showDiceRoll && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="bg-black/50 backdrop-blur-md rounded-xl p-3"
              >
                <DicePair 
                  values={uiState.diceValues} 
                  rolling={isDiceRolling}
                  size="md"
                />
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Lobby / Setup controls */}
          {phase === GamePhase.LOBBY && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-3"
            >
              <p className="text-gray-400 text-center text-sm max-w-md">
                ダイスを振ってAP（行動ポイント）を決め、カードを強化し、相手を出し抜いて勝利を掴もう！
              </p>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => initGame({ cpuCount: 1 })}
                >
                  1 vs 1
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => initGame({ cpuCount: 2 })}
                >
                  1 vs 2
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => initGame({ cpuCount: 3 })}
                >
                  1 vs 3
                </Button>
              </div>
              <Button
                variant="primary"
                onClick={() => {
                  startRound();
                  rollDiceAndSetup();
                }}
              >
                🎲 ゲーム開始
              </Button>
            </motion.div>
          )}
          
          {/* Showdown - winner display (only if game is not over) */}
          {phase === GamePhase.SHOWDOWN && winner && (() => {
            // Check for game over: human player has 0 chips OR all opponents have 0 chips
            // Note: After showdown, chips are distributed, so we check final chip counts
            const humanChips = humanPlayer?.chips || 0;
            const opponentChips = opponents.map(o => o.chips || 0);
            const allOpponentsEliminated = opponentChips.every(chips => chips <= 0);
            const humanEliminated = humanChips <= 0;
            
            const isGameOver = humanEliminated || allOpponentsEliminated;
            if (isGameOver) return null;
            
            return (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-2"
              >
                <div className="text-center">
                  <p className="text-yellow-400 text-xl font-bold">
                    {players.find(p => p.id === winner)?.name} の勝利！
                  </p>
                </div>
                
                <Button
                  variant="primary"
                  onClick={() => {
                    startRound();
                    rollDiceAndSetup();
                  }}
                >
                  次のラウンドへ
                </Button>
              </motion.div>
            );
          })()}
          
          {/* Game Over Screen - Full screen overlay */}
          {phase === GamePhase.SHOWDOWN && winner && (
            (() => {
              // After showdown, check if game is truly over
              // A player is eliminated if they have 0 chips (regardless of all-in status, since showdown is done)
              // Wait a bit for state to update after showdown
              const activePlayers = players.filter(p => p.chips > 0);
              const isHumanEliminated = humanPlayer && humanPlayer.chips <= 0;
              const allOpponentsEliminated = opponents.every(o => o.chips <= 0);
              const isGameOver = activePlayers.length <= 1; // Only one or zero players left
              const isHumanWinner = humanPlayer && humanPlayer.chips > 0 && allOpponentsEliminated;
              const isHumanLoser = isHumanEliminated;
              
              if (!isGameOver) return null;
              
              return (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"
                >
                  <motion.div
                    initial={{ scale: 0.8, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    className="bg-gradient-to-br from-emerald-900/95 to-emerald-950/95 border-2 border-yellow-400/30 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl"
                  >
                    <div className="text-center space-y-4">
                      {isHumanWinner ? (
                        <>
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring" }}
                            className="text-6xl mb-4"
                          >
                            🏆
                          </motion.div>
                          <h2 className="text-3xl font-bold text-yellow-400 mb-2">
                            完全勝利！
                          </h2>
                          <p className="text-white text-lg mb-4">
                            全員のプレイヤーを倒しました！
                          </p>
                          <p className="text-gray-300 text-sm">
                            {humanPlayer.name} の最終チップ: {humanPlayer.chips.toLocaleString()}
                          </p>
                        </>
                      ) : isHumanLoser ? (
                        <>
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring" }}
                            className="text-6xl mb-4"
                          >
                            💀
                          </motion.div>
                          <h2 className="text-3xl font-bold text-red-400 mb-2">
                            ゲームオーバー
                          </h2>
                          <p className="text-white text-lg mb-4">
                            チップが尽きてしまいました...
                          </p>
                          <p className="text-gray-300 text-sm">
                            勝者: {players.find(p => p.id === winner)?.name}
                          </p>
                        </>
                      ) : null}
                      
                      <div className="flex flex-col gap-3 mt-6">
                        <Button
                          variant="primary"
                          size="lg"
                          onClick={() => {
                            // Stop any CPU processing and reset game to LOBBY phase
                            initGame();
                          }}
                        >
                          🏠 ホームに戻る
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })()
          )}
        </div>
        
        {/* Human player area + Controls - horizontal layout */}
        <div className="flex items-end justify-center gap-6 shrink-0 mt-auto pb-2">
          {/* Human player area */}
          {humanPlayer && (
            <div className="flex flex-col items-center gap-2">
              <PlayerArea
                player={humanPlayer}
                isCurrentPlayer={players[currentPlayerIndex]?.id === humanPlayer.id}
                isDealer={players[dealerIndex]?.id === humanPlayer.id}
                phase={phase}
                showCards={true}
                position="bottom"
              />
              
              {/* Human player AP display */}
              {humanPlayer.ap > 0 && (
                <div className="flex items-center gap-3 bg-black/30 rounded-lg px-4 py-2">
                  <span className="text-gray-400 text-sm">あなたのAP:</span>
                  <span className={`
                    text-xl font-bold
                    ${humanPlayer.ap <= 4 ? 'text-orange-400' : humanPlayer.ap >= 9 ? 'text-green-400' : 'text-blue-400'}
                  `}>
                    {humanPlayer.ap - humanPlayer.apUsed}/{humanPlayer.ap}
                  </span>
                  {humanPlayer.hasZorro && (
                    <span className="text-yellow-400 text-sm animate-pulse">🎲ゾロ目！</span>
                  )}
                </div>
              )}
            </div>
          )}
          
          {/* Control panels - side by side */}
          <div className="flex flex-col justify-end min-w-[320px]">
            {/* Betting panel */}
            {(phase === GamePhase.BET_PHASE_1 || phase === GamePhase.BET_PHASE_2) && 
             isHumanTurn() && humanPlayer && (
              <BettingPanel
                availableActions={getAvailableBettingActions()}
                currentBet={gameState.currentBet}
                playerBet={humanPlayer.currentBet}
                playerChips={humanPlayer.chips}
                minBet={gameState.currentBlinds?.bb || 100}
                pot={displayPot}
                onAction={placeBet}
              />
            )}
            
            {/* Action panel */}
            {phase === GamePhase.ACTION_PHASE && isHumanTurn() && humanPlayer && (
              <ActionPanel
                player={humanPlayer}
                availableActions={getAvailableAPActions()}
                onAction={performAction}
              />
            )}
            
            {/* Waiting indicator */}
            {!isHumanTurn() && phase !== GamePhase.LOBBY && phase !== GamePhase.SHOWDOWN && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-gray-400 py-2"
              >
                <span className="animate-pulse text-sm">
                  {players[currentPlayerIndex]?.name} の番...
                </span>
              </motion.div>
            )}
          </div>
        </div>
      </main>
      
      {/* Giant Killing overlay */}
      <AnimatePresence>
        {isGiantKilling && uiState.showGiantKilling && (
          <GiantKillingOverlay />
        )}
      </AnimatePresence>
      
      {/* Statistics Panel */}
      <AnimatePresence>
        {uiState.showStatistics && (
          <StatisticsPanel
            statistics={statistics}
            onClose={toggleStatistics}
          />
        )}
      </AnimatePresence>
      
      {/* Tutorial Panel */}
      <AnimatePresence>
        {uiState.showTutorial && (
          <TutorialPanel
            onClose={toggleTutorial}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Removed getPhaseLabel - now using translations
