// ========================================
// Zustand Game Store
// ========================================

import { create } from 'zustand';
import {
  GameState,
  GamePhase,
  GameConfig,
  DEFAULT_CONFIG,
  BettingAction,
  APAction,
  UIState,
  Card,
  GameStatistics,
  HandRank,
} from '../core/types';
import {
  createGameState,
  startNewRound,
  setupPhase,
  dealCards,
  processBettingAction,
  processAPAction,
  showdown,
  cpuTakeTurn,
  getAvailableBettingActions,
  advanceToNextPhase,
} from '../core/engine/GameEngine';
import { getAvailableActions, getRemainingAP, evaluatePlayerHand } from '../core/models/Player';
import { soundManager } from '../utils/soundManager';
import { decideBettingAction, decideAPAction } from '../core/models/CPUPlayer';

interface GameStore {
  // Game State
  gameState: GameState;
  config: GameConfig;
  
  // Statistics
  statistics: GameStatistics;
  
  // UI State
  uiState: UIState;
  
  // Dice roll results (stored separately for animation)
  diceResults: Map<string, { dice: [number, number]; ap: number; isZorro: boolean }>;
  
  // Search state (for Search action UI) - actual deck cards
  searchCards: Card[] | null;
  
  // Dice rolling state
  isDiceRolling: boolean;
  
  // Track AP actions used this round (for statistics)
  apActionsUsedThisRound: APAction[];
  
  // Actions
  initGame: (config?: Partial<GameConfig>) => void;
  startRound: () => void;
  rollDiceAndSetup: () => Promise<void>;
  dealCardsToPlayers: () => void;
  
  // Player Actions
  placeBet: (action: BettingAction, amount?: number) => void;
  performAction: (action: APAction, cardIndex?: number, searchSelection?: number) => void;
  
  // Search preview (get top 3 cards from deck)
  previewSearchCards: () => Card[] | null;
  clearSearchCards: () => void;
  
  // UI Actions
  setShowDiceRoll: (show: boolean) => void;
  revealPlayerCards: (playerId: string) => void;
  setHighlightedCards: (indices: number[]) => void;
  
  // CPU Turn
  processCPUTurn: () => Promise<void>;
  
  // Helpers
  getAvailableBettingActions: () => BettingAction[];
  getAvailableAPActions: () => APAction[];
  isHumanTurn: () => boolean;
  getCurrentPlayer: () => GameState['players'][0] | null;
  getHumanPlayer: () => GameState['players'][0] | null;
  
  // Statistics
  updateStatistics: (roundWon: boolean, giantKilling: boolean, chipsWon: number, bestHand: HandRank, apUsed: APAction[]) => void;
  toggleStatistics: () => void;
  toggleTutorial: () => void;
}

// Delay helper for animations
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Initialize statistics
const initialStatistics: GameStatistics = {
  roundsPlayed: 0,
  roundsWon: 0,
  giantKillings: 0,
  totalChipsWon: 0,
  totalChipsLost: 0,
  bestHand: HandRank.HIGH_CARD,
  actionsUsed: {
    redraw: 0,
    search: 0,
    add: 0,
    buyJoker: 0,
    pass: 0,
  },
  averageAP: 0,
  longestWinStreak: 0,
  currentWinStreak: 0,
};

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial State
  gameState: createGameState(),
  config: DEFAULT_CONFIG,
  statistics: initialStatistics,
  uiState: {
    showDiceRoll: false,
    diceValues: [1, 1],
    revealedCards: new Set(),
    highlightedCards: [],
    showGiantKilling: false,
    showStatistics: false,
    showTutorial: false,
  },
  diceResults: new Map(),
  searchCards: null,
  isDiceRolling: false,
  apActionsUsedThisRound: [],
  
  // Initialize game
  initGame: (configOverride) => {
    const config = { ...DEFAULT_CONFIG, ...configOverride };
    const gameState = createGameState(config);
    // Reset all state including stopping any CPU processing
    // BUT keep statistics (don't reset them)
    const currentStatistics = get().statistics;
    set({
      gameState: {
        ...gameState,
        phase: GamePhase.LOBBY, // Ensure phase is LOBBY
      },
      config,
      diceResults: new Map(),
      searchCards: null,
      isDiceRolling: false,
      apActionsUsedThisRound: [],
      statistics: currentStatistics, // Keep existing statistics
      uiState: {
        showDiceRoll: false,
        diceValues: [1, 1],
        revealedCards: new Set(),
        highlightedCards: [],
        showGiantKilling: false,
        showStatistics: false,
        showTutorial: false,
      },
    });
    // Force stop any running CPU processing by setting phase to LOBBY
    // This ensures processCPUTurn will exit early
  },
  
  // Start a new round
  startRound: () => {
    const { gameState, config } = get();
    const newState = startNewRound(gameState, config);
    set({ 
      gameState: newState,
      searchCards: null,
      isDiceRolling: false,
      apActionsUsedThisRound: [], // Reset AP actions tracking
      uiState: {
        ...get().uiState,
        revealedCards: new Set(),
        highlightedCards: [],
        showGiantKilling: false,
        showDiceRoll: false,
      },
    });
  },
  
  // Roll dice and setup phase
  rollDiceAndSetup: async () => {
    const { gameState } = get();
    
    // Play dice roll sound immediately (before animation)
    soundManager.play('dice-roll');
    
    // Show dice animation
    set(state => ({
      isDiceRolling: true,
      uiState: { ...state.uiState, showDiceRoll: true },
    }));
    
    // Wait for dice animation
    await delay(1200);
    
    // Setup phase - this rolls the dice
    const { state: newState, diceResults } = setupPhase(gameState);
    
    // Update UI with human player's dice (stop rolling animation)
    const humanResult = diceResults.get('human');
    if (humanResult) {
      set(state => ({
        isDiceRolling: false,
        uiState: {
          ...state.uiState,
          diceValues: humanResult.dice,
        },
      }));
    }
    
    // Show result for a moment
    await delay(1500);
    
    // Hide dice display and update game state
    set({
      gameState: newState,
      diceResults,
      uiState: {
        ...get().uiState,
        showDiceRoll: false,
      },
    });
    
    // Wait a bit before CPU turns start
    await delay(500);
    
    // Start CPU turns if needed
    if (!get().isHumanTurn()) {
      await get().processCPUTurn();
    }
  },
  
  // Deal cards
  dealCardsToPlayers: () => {
    const { gameState } = get();
    // Play sound before dealing cards
    soundManager.play('card-deal');
    const newState = dealCards(gameState);
    set({ gameState: newState });
  },
  
  // Place a bet
  placeBet: (action, amount = 0) => {
    const { gameState } = get();
    const humanPlayer = gameState.players.find(p => p.isHuman);
    if (!humanPlayer) return;
    
    // Ensure amount is a valid number
    const safeAmount = Number.isFinite(amount) ? amount : 0;
    
    // Play sound BEFORE action (immediate feedback)
    switch (action) {
      case 'bet':
        soundManager.play('bet');
        soundManager.play('chip-drop', 0.3);
        break;
      case 'call':
        soundManager.play('call');
        soundManager.play('chip-drop', 0.3);
        break;
      case 'raise':
        soundManager.play('raise');
        soundManager.play('chip-drop', 0.3);
        break;
      case 'fold':
        soundManager.play('fold');
        break;
      case 'all-in':
        soundManager.play('all-in');
        soundManager.play('chip-drop', 0.5);
        break;
      case 'check':
        // Check is silent
        break;
    }
    
    let newState = processBettingAction(gameState, humanPlayer.id, action, safeAmount);
    set({ gameState: newState });
    
    // Check if we need to deal cards
    if (newState.phase === GamePhase.DEAL) {
      // Play sound before dealing cards
      soundManager.play('card-deal');
      setTimeout(async () => {
        const dealtState = dealCards(get().gameState);
        set({ gameState: dealtState });
        
        // Wait and start action phase CPU turns if needed
        await delay(500);
        if (!get().isHumanTurn()) {
          get().processCPUTurn();
        }
      }, 500);
      return;
    }
    
    // Check for showdown
    if (newState.phase === GamePhase.SHOWDOWN && !newState.winner) {
      const finalState = showdown(newState);
      set({ gameState: finalState });
      
      // Play card flip sound for showdown
      soundManager.play('card-flip');
      
      // Check if human player won or lost
      const humanPlayer = finalState.players.find(p => p.isHuman);
      if (humanPlayer) {
        const roundWon = finalState.winner === humanPlayer.id;
        const bestHand = evaluatePlayerHand(humanPlayer);
        const chipsWon = roundWon 
          ? finalState.winnings.filter(w => w.playerId === humanPlayer.id).reduce((sum, w) => sum + w.amount, 0)
          : -humanPlayer.currentBet;
        
        // Track AP actions used (simplified - track from apUsed)
        const apUsed: APAction[] = [];
        // This is a simplified tracking - in a real implementation, we'd track actions as they happen
        // For now, we'll just update statistics with basic info
        
        // Update statistics
        get().updateStatistics(
          roundWon,
          finalState.isGiantKilling && roundWon,
          chipsWon,
          bestHand.rank,
          apUsed
        );
        
        if (roundWon) {
          soundManager.play('victory');
        } else if (humanPlayer.chips <= 0) {
          soundManager.play('defeat');
        }
      }
      
      if (finalState.isGiantKilling) {
        set(state => ({
          uiState: { ...state.uiState, showGiantKilling: true },
        }));
        // Play giant killing sound
        soundManager.play('giant-killing');
        // Auto-hide after 1 second
        setTimeout(() => {
          set(state => ({
            uiState: { ...state.uiState, showGiantKilling: false },
          }));
        }, 1000);
      }
      return;
    }
    
    // Process CPU turns
    if (!get().isHumanTurn() && newState.phase !== GamePhase.SHOWDOWN) {
      setTimeout(() => get().processCPUTurn(), 600);
    }
  },
  
  // Preview search cards (get top 3 from deck without removing)
  previewSearchCards: () => {
    const { gameState } = get();
    if (gameState.deck.length < 3) return null;
    
    const cards = gameState.deck.slice(0, 3);
    set({ searchCards: cards });
    return cards;
  },
  
  // Clear search cards
  clearSearchCards: () => {
    set({ searchCards: null });
  },
  
  // Perform AP action
  performAction: (action, cardIndex, searchSelection) => {
    const { gameState } = get();
    const humanPlayer = gameState.players.find(p => p.isHuman);
    if (!humanPlayer) return;
    
    // Track AP action for statistics
    if (action !== 'pass') {
      set(state => ({
        apActionsUsedThisRound: [...state.apActionsUsedThisRound, action],
      }));
    }
    
    // Play sound BEFORE action (immediate feedback)
    switch (action) {
      case 'search':
        soundManager.play('search');
        break;
      case 'add':
        soundManager.play('add-card');
        break;
      case 'redraw':
        soundManager.play('redraw');
        break;
      case 'buyJoker':
        soundManager.play('joker');
        break;
      case 'pass':
        // Pass is silent
        break;
    }
    
    const newState = processAPAction(gameState, humanPlayer.id, action, cardIndex, searchSelection);
    set({ gameState: newState, searchCards: null });
    
    // Move to betting phase 2 if action phase complete
    if (newState.phase === GamePhase.BET_PHASE_2) {
      if (!get().isHumanTurn()) {
        setTimeout(() => get().processCPUTurn(), 600);
      }
      return;
    }
    
    // Process CPU turns if action phase continues
    if (newState.phase === GamePhase.ACTION_PHASE && !get().isHumanTurn()) {
      setTimeout(() => get().processCPUTurn(), 600);
    }
  },
  
  // UI Actions
  setShowDiceRoll: (show) => {
    set(state => ({
      uiState: { ...state.uiState, showDiceRoll: show },
    }));
  },
  
  revealPlayerCards: (playerId) => {
    set(state => ({
      uiState: {
        ...state.uiState,
        revealedCards: new Set([...state.uiState.revealedCards, playerId]),
      },
    }));
  },
  
  setHighlightedCards: (indices) => {
    set(state => ({
      uiState: { ...state.uiState, highlightedCards: indices },
    }));
  },
  
  // Process CPU turn
  processCPUTurn: async () => {
    let iterations = 0;
    const maxIterations = 200; // Safety limit
    
    while (iterations < maxIterations) {
      iterations++;
      const currentState = get().gameState; // Always get fresh state
      
      // Check if game is in lobby (game was reset)
      if (currentState.phase === GamePhase.LOBBY) {
        return;
      }
      
      // Check if game is over
      if (currentState.winner) {
        return;
      }
      
      // Check phase - if showdown, run showdown if needed and return
      if (currentState.phase === GamePhase.SHOWDOWN) {
        if (!currentState.winner) {
          const finalState = showdown(currentState);
          set({ gameState: finalState });
          
          // Play card flip sound for showdown
          soundManager.play('card-flip');
          
          // Check if human player won or lost
          const humanPlayer = finalState.players.find(p => p.isHuman);
          if (humanPlayer) {
            const roundWon = finalState.winner === humanPlayer.id;
            const bestHand = evaluatePlayerHand(humanPlayer);
            const chipsWon = roundWon 
              ? finalState.winnings.filter(w => w.playerId === humanPlayer.id).reduce((sum, w) => sum + w.amount, 0)
              : -humanPlayer.currentBet;
            
            // Get AP actions used this round
            const apActionsUsed = get().apActionsUsedThisRound;
            
            // Update statistics
            get().updateStatistics(
              roundWon,
              finalState.isGiantKilling && roundWon,
              chipsWon,
              bestHand.rank,
              apActionsUsed
            );
            
            // Reset AP actions tracking for next round
            set({ apActionsUsedThisRound: [] });
            
            if (roundWon) {
              soundManager.play('victory');
            } else if (humanPlayer.chips <= 0) {
              soundManager.play('defeat');
            }
          }
          
          if (finalState.isGiantKilling) {
            set(state => ({
              uiState: { ...state.uiState, showGiantKilling: true },
            }));
            // Play giant killing sound
            soundManager.play('giant-killing');
            // Auto-hide after 1 second
            setTimeout(() => {
              set(state => ({
                uiState: { ...state.uiState, showGiantKilling: false },
              }));
            }, 1000);
          }
        }
        // Always return when in showdown phase
        return;
      }
      
      // Get current player
      const currentPlayer = currentState.players[currentState.currentPlayerIndex];
      
      // Check if current player can act
      if (!currentPlayer) {
        return;
      }
      
      // If human's turn and human can act, stop CPU processing
      if (currentPlayer.isHuman) {
        // In betting phases, all-in or folded players can't act
        const isBettingPhase = currentState.phase === GamePhase.BET_PHASE_1 || 
                               currentState.phase === GamePhase.BET_PHASE_2;
        
        // In action phase, only skip if folded (all-in players can still use AP)
        if (currentState.phase === GamePhase.ACTION_PHASE && currentPlayer.isFolded) {
          // Folded players can't act in action phase - force pass
          const passedState = processAPAction(currentState, currentPlayer.id, 'pass');
          set({ gameState: passedState });
          await delay(100);
          continue;
        }
        
        if (isBettingPhase && (currentPlayer.isAllIn || currentPlayer.isFolded)) {
          // In betting phase, all-in or folded players can't act - need to advance
          // Check if anyone can still act (not folded, not all-in, not eliminated)
          const playersWhoCanAct = currentState.players.filter(p => {
            const pIsEliminated = p.chips <= 0 && !p.isAllIn && p.currentBet <= 0;
            return !p.isFolded && !p.isAllIn && !pIsEliminated;
          });
          
          if (playersWhoCanAct.length === 0) {
            // No one can act - advance to next phase
            let advancedState = { ...currentState };
            if (currentState.phase === GamePhase.BET_PHASE_1) {
              soundManager.play('card-deal');
              advancedState = dealCards(advancedState);
            } else {
              const finalState = showdown(advancedState);
              set({ gameState: finalState });
              if (finalState.isGiantKilling) {
                set(state => ({
                  uiState: { ...state.uiState, showGiantKilling: true },
                }));
                setTimeout(() => {
                  set(state => ({
                    uiState: { ...state.uiState, showGiantKilling: false },
                  }));
                }, 1000);
              }
              return;
            }
            set({ gameState: advancedState });
            await delay(300);
            continue;
          }
          
          // Find next player who can act
          const numPlayers = currentState.players.length;
          let nextIndex = (currentState.currentPlayerIndex + 1) % numPlayers;
          let attempts = 0;
          
          while (attempts < numPlayers) {
            const nextPlayer = currentState.players[nextIndex];
            const nextIsEliminated = nextPlayer.chips <= 0 && !nextPlayer.isAllIn && nextPlayer.currentBet <= 0;
            if (!nextPlayer.isFolded && !nextPlayer.isAllIn && !nextIsEliminated) {
              break;
            }
            nextIndex = (nextIndex + 1) % numPlayers;
            attempts++;
          }
          
          // Move to next player
          set({ 
            gameState: { 
              ...currentState, 
              currentPlayerIndex: nextIndex 
            } 
          });
          await delay(100);
          continue;
        }
        
        // Human can act - stop CPU processing
        return;
      }
      
      // Skip folded, all-in, or eliminated CPU players (only in betting phases)
      const isBettingPhase = currentState.phase === GamePhase.BET_PHASE_1 || 
                             currentState.phase === GamePhase.BET_PHASE_2;
      
      if (isBettingPhase) {
        // Check if player is eliminated (chips <= 0 AND not all-in AND no current bet)
        const isEliminated = currentPlayer.chips <= 0 && !currentPlayer.isAllIn && currentPlayer.currentBet <= 0;
        
        if (currentPlayer.isFolded || currentPlayer.isAllIn || isEliminated) {
          // In betting phase, skip folded/all-in/eliminated players
          // We need to manually advance to next player and check if betting round is complete
          const numPlayers = currentState.players.length;
          let nextIndex = (currentState.currentPlayerIndex + 1) % numPlayers;
          let attempts = 0;
          
          // Find next player who can act (not folded, not all-in, not eliminated)
          while (attempts < numPlayers) {
            const nextPlayer = currentState.players[nextIndex];
            const nextIsEliminated = nextPlayer.chips <= 0 && !nextPlayer.isAllIn && nextPlayer.currentBet <= 0;
            if (!nextPlayer.isFolded && !nextPlayer.isAllIn && !nextIsEliminated) {
              break;
            }
            nextIndex = (nextIndex + 1) % numPlayers;
            attempts++;
          }
          
          // Check if anyone can still act
          const playersWhoCanAct = currentState.players.filter(p => {
            const pIsEliminated = p.chips <= 0 && !p.isAllIn && p.currentBet <= 0;
            return !p.isFolded && !p.isAllIn && !pIsEliminated;
          });
          
          if (playersWhoCanAct.length === 0) {
            // No one can act - advance to next phase
            let advancedState = { ...currentState };
            if (currentState.phase === GamePhase.BET_PHASE_1) {
              soundManager.play('card-deal');
              advancedState = dealCards(advancedState);
            } else {
              advancedState = { ...advancedState, phase: GamePhase.SHOWDOWN };
            }
            set({ gameState: advancedState });
            await delay(300);
            continue;
          }
          
          // Move to next player
          set({ 
            gameState: { 
              ...currentState, 
              currentPlayerIndex: nextIndex 
            } 
          });
          await delay(100);
          continue;
        }
      }
      
      // Skip CPU players with no chips in action phase (but allow all-in players to use AP)
      // Only skip if truly eliminated (chips <= 0 AND not all-in AND no current bet)
      const isEliminated = currentPlayer.chips <= 0 && !currentPlayer.isAllIn && currentPlayer.currentBet <= 0;
      if (isEliminated && currentState.phase === GamePhase.ACTION_PHASE) {
        const passedState = processAPAction(currentState, currentPlayer.id, 'pass');
        set({ gameState: passedState });
        await delay(100);
        continue;
      }
      
      // For action phase, check if CPU has any AP left
      if (currentState.phase === GamePhase.ACTION_PHASE) {
        const remainingAP = getRemainingAP(currentPlayer);
        if (remainingAP <= 0) {
          // This CPU is done, but engine should have moved to next player
          // If we're stuck, force a pass
          const passedState = processAPAction(currentState, currentPlayer.id, 'pass');
          set({ gameState: passedState });
          
          // Check if phase changed
          if (passedState.phase !== GamePhase.ACTION_PHASE) {
            if (passedState.phase === GamePhase.BET_PHASE_2) {
              // Continue to betting phase 2
              await delay(400);
              continue;
            } else if (passedState.phase === GamePhase.SHOWDOWN) {
              // Action phase completed and went to showdown
              // Run showdown and return
              if (!passedState.winner) {
                const finalState = showdown(passedState);
                set({ gameState: finalState });
                
                // Play card flip sound for showdown
                soundManager.play('card-flip');
                
                // Check if human player won or lost
                const humanPlayer = finalState.players.find(p => p.isHuman);
                if (humanPlayer) {
                  const roundWon = finalState.winner === humanPlayer.id;
                  const bestHand = evaluatePlayerHand(humanPlayer);
                  const chipsWon = roundWon 
                    ? finalState.winnings.filter(w => w.playerId === humanPlayer.id).reduce((sum, w) => sum + w.amount, 0)
                    : -humanPlayer.currentBet;
                  
                  // Get AP actions used this round
                  const apActionsUsed = get().apActionsUsedThisRound;
                  
                  // Update statistics
                  get().updateStatistics(
                    roundWon,
                    finalState.isGiantKilling && roundWon,
                    chipsWon,
                    bestHand.rank,
                    apActionsUsed
                  );
                  
                  // Reset AP actions tracking for next round
                  set({ apActionsUsedThisRound: [] });
                  
                  if (roundWon) {
                    soundManager.play('victory');
                  } else if (humanPlayer.chips <= 0) {
                    soundManager.play('defeat');
                  }
                }
                
                if (finalState.isGiantKilling) {
                  set(state => ({
                    uiState: { ...state.uiState, showGiantKilling: true },
                  }));
                  // Play giant killing sound
                  soundManager.play('giant-killing');
                  // Auto-hide after 1 second
                  setTimeout(() => {
                    set(state => ({
                      uiState: { ...state.uiState, showGiantKilling: false },
                    }));
                  }, 1000);
                }
              }
              return;
            }
            return;
          }
          
          // Continue to next iteration
          await delay(200);
          continue;
        }
      }
      
      await delay(500);
      
      // Store state before action for comparison
      const prevPlayerIndex = currentState.currentPlayerIndex;
      const prevPhase = currentState.phase;
      const prevAPUsed = currentPlayer.apUsed;
      
      // Play sound for CPU action BEFORE executing
      if (currentState.phase === GamePhase.BET_PHASE_1 || currentState.phase === GamePhase.BET_PHASE_2) {
        const { action } = decideBettingAction(currentPlayer, currentState);
        switch (action) {
          case 'bet':
            soundManager.play('bet', 0.7);
            soundManager.play('chip-drop', 0.2);
            break;
          case 'call':
            soundManager.play('call', 0.7);
            soundManager.play('chip-drop', 0.2);
            break;
          case 'raise':
            soundManager.play('raise', 0.7);
            soundManager.play('chip-drop', 0.2);
            break;
          case 'fold':
            soundManager.play('fold', 0.7);
            break;
          case 'all-in':
            soundManager.play('all-in', 0.7);
            soundManager.play('chip-drop', 0.4);
            break;
          case 'check':
            // Check is silent
            break;
        }
      } else if (currentState.phase === GamePhase.ACTION_PHASE) {
        const { action } = decideAPAction(currentPlayer, currentState);
        switch (action) {
          case 'search':
            soundManager.play('search', 0.7);
            break;
          case 'add':
            soundManager.play('add-card', 0.7);
            break;
          case 'redraw':
            soundManager.play('redraw', 0.7);
            break;
          case 'buyJoker':
            soundManager.play('joker', 0.7);
            break;
          case 'pass':
            // Pass is silent
            break;
        }
      }
      
      // Take CPU turn
      let newState = cpuTakeTurn(currentState);
      
      // Validate state - check for NaN in pot
      if (!Number.isFinite(newState.pot)) {
        console.error('Invalid pot value detected, fixing...');
        newState = { ...newState, pot: currentState.pot || 0 };
      }
      
      set({ gameState: newState });
      
      // CRITICAL: Check for phase transitions IMMEDIATELY after cpuTakeTurn
      // Check for DEAL phase FIRST (transition from BET_PHASE_1)
      if (newState.phase === GamePhase.DEAL) {
        soundManager.play('card-deal');
        await delay(400);
        const dealtState = dealCards(newState);
        set({ gameState: dealtState });
        // Continue loop to check if next player is CPU
        await delay(300);
        continue;
      }
      
      // Check for SHOWDOWN phase (transition from ACTION_PHASE or BET_PHASE_2)
      if (newState.phase === GamePhase.SHOWDOWN) {
        if (!newState.winner) {
          const finalState = showdown(newState);
          set({ gameState: finalState });
          
          // Play card flip sound for showdown
          soundManager.play('card-flip');
          
          // Check if human player won or lost
          const humanPlayer = finalState.players.find(p => p.isHuman);
          if (humanPlayer) {
            const roundWon = finalState.winner === humanPlayer.id;
            const bestHand = evaluatePlayerHand(humanPlayer);
            const chipsWon = roundWon 
              ? finalState.winnings.filter(w => w.playerId === humanPlayer.id).reduce((sum, w) => sum + w.amount, 0)
              : -humanPlayer.currentBet;
            
            // Get AP actions used this round
            const apActionsUsed = get().apActionsUsedThisRound;
            
            // Update statistics
            get().updateStatistics(
              roundWon,
              finalState.isGiantKilling && roundWon,
              chipsWon,
              bestHand.rank,
              apActionsUsed
            );
            
            // Reset AP actions tracking for next round
            set({ apActionsUsedThisRound: [] });
            
            if (roundWon) {
              soundManager.play('victory');
            } else if (humanPlayer.chips <= 0) {
              soundManager.play('defeat');
            }
          }
          
          if (finalState.isGiantKilling) {
            set(state => ({
              uiState: { ...state.uiState, showGiantKilling: true },
            }));
            // Play giant killing sound
            soundManager.play('giant-killing');
            // Auto-hide after 1 second
            setTimeout(() => {
              set(state => ({
                uiState: { ...state.uiState, showGiantKilling: false },
              }));
            }, 1000);
          }
        }
        return;
      }
      
      // Check if phase changed
      if (newState.phase !== prevPhase) {
        // Double-check for SHOWDOWN phase (in case it was missed above)
        // Note: TypeScript may not recognize SHOWDOWN as possible here, but it can happen
        // when processAPAction -> checkActionPhaseComplete transitions to showdown
        if ((newState.phase as GamePhase) === GamePhase.SHOWDOWN) {
          if (!newState.winner) {
            const finalState = showdown(newState);
            set({ gameState: finalState });
            soundManager.play('card-flip');
            const humanPlayer = finalState.players.find(p => p.isHuman);
            if (humanPlayer) {
              const roundWon = finalState.winner === humanPlayer.id;
              const bestHand = evaluatePlayerHand(humanPlayer);
              const chipsWon = roundWon 
                ? finalState.winnings.filter(w => w.playerId === humanPlayer.id).reduce((sum, w) => sum + w.amount, 0)
                : -humanPlayer.currentBet;
              const apActionsUsed = get().apActionsUsedThisRound;
              get().updateStatistics(roundWon, finalState.isGiantKilling && roundWon, chipsWon, bestHand.rank, apActionsUsed);
              set({ apActionsUsedThisRound: [] });
              if (roundWon) soundManager.play('victory');
              else if (humanPlayer.chips <= 0) soundManager.play('defeat');
            }
            if (finalState.isGiantKilling) {
              set(state => ({ uiState: { ...state.uiState, showGiantKilling: true } }));
              soundManager.play('giant-killing');
              setTimeout(() => {
                set(state => ({ uiState: { ...state.uiState, showGiantKilling: false } }));
              }, 1000);
            }
          }
          return;
        }
        // Phase changed to something else, continue loop
        await delay(300);
        continue;
      }
      
      // Check if player changed
      if (newState.currentPlayerIndex !== prevPlayerIndex) {
        // Player changed, check if new player is human
        const nextPlayer = newState.players[newState.currentPlayerIndex];
        if (nextPlayer && nextPlayer.isHuman) {
          return;
        }
        // Continue with next CPU
        continue;
      }
      
      // Same player, same phase - check if action was taken (AP used)
      if (newState.phase === GamePhase.ACTION_PHASE) {
        const newPlayer = newState.players[newState.currentPlayerIndex];
        if (newPlayer.apUsed > prevAPUsed) {
          // AP was used, player can continue taking actions
          continue;
        }
        // No AP used but same player - something is wrong, force pass
        console.warn('CPU stuck in action phase, forcing pass');
        const passedState = processAPAction(newState, newPlayer.id, 'pass');
        set({ gameState: passedState });
        await delay(300);
        continue;
      }
      
      // For betting phases, if same player and same phase, something is wrong
      // Check if betting round should be complete
      const playersWhoCanAct = newState.players.filter(p => {
        const pIsEliminated = p.chips <= 0 && !p.isAllIn && p.currentBet <= 0;
        return !p.isFolded && !p.isAllIn && !pIsEliminated;
      });
      
      // If no one can act, force advance to next phase
      if (playersWhoCanAct.length === 0) {
        if (newState.phase === GamePhase.BET_PHASE_1) {
          // Force advance to DEAL phase
          const advancedState = advanceToNextPhase(newState);
          set({ gameState: advancedState });
          // DEAL phase will be handled in next iteration
          await delay(300);
          continue;
        } else if (newState.phase === GamePhase.BET_PHASE_2) {
          const showdownState = showdown(newState);
          soundManager.play('card-flip');
          set({ gameState: showdownState });
          
          if (showdownState.isGiantKilling) {
            set(state => ({
              uiState: { ...state.uiState, showGiantKilling: true },
            }));
            setTimeout(() => {
              set(state => ({
                uiState: { ...state.uiState, showGiantKilling: false },
              }));
            }, 1000);
          }
          return;
        }
      }
      
      // Try to find next player who can act
      const numPlayers = newState.players.length;
      let nextIndex = (newState.currentPlayerIndex + 1) % numPlayers;
      let attempts = 0;
      
      while (attempts < numPlayers) {
        const nextPlayer = newState.players[nextIndex];
        const nextIsEliminated = nextPlayer.chips <= 0 && !nextPlayer.isAllIn && nextPlayer.currentBet <= 0;
        if (!nextPlayer.isFolded && !nextPlayer.isAllIn && !nextIsEliminated) {
          // Found a player who can act
          set({ gameState: { ...newState, currentPlayerIndex: nextIndex } });
          await delay(200);
          continue;
        }
        nextIndex = (nextIndex + 1) % numPlayers;
        attempts++;
      }
      
      // If we couldn't find anyone, force advance phase
      console.warn('CPU turn: same player and phase in betting, forcing advance');
      if (newState.phase === GamePhase.BET_PHASE_1) {
        const advancedState = advanceToNextPhase(newState);
        set({ gameState: advancedState });
        await delay(300);
        continue;
      } else if (newState.phase === GamePhase.BET_PHASE_2) {
        const showdownState = showdown(newState);
        soundManager.play('card-flip');
        set({ gameState: showdownState });
        return;
      }
      
      // Fallback: just wait and continue
      await delay(200);
      continue;
    }
    
    if (iterations >= maxIterations) {
      console.error('CPU turn exceeded max iterations');
    }
  },
  
  // Helpers
  getAvailableBettingActions: () => {
    const { gameState } = get();
    const humanPlayer = gameState.players.find(p => p.isHuman);
    if (!humanPlayer) return [];
    return getAvailableBettingActions(gameState, humanPlayer.id);
  },
  
  getAvailableAPActions: () => {
    const { gameState } = get();
    const humanPlayer = gameState.players.find(p => p.isHuman);
    if (!humanPlayer) return [];
    return getAvailableActions(humanPlayer);
  },
  
  isHumanTurn: () => {
    const { gameState } = get();
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (!currentPlayer?.isHuman) return false;
    
    // In betting phases, human can't act if folded or all-in
    const isBettingPhase = gameState.phase === GamePhase.BET_PHASE_1 || 
                           gameState.phase === GamePhase.BET_PHASE_2;
    if (isBettingPhase && (currentPlayer.isFolded || currentPlayer.isAllIn)) {
      return false;
    }
    
    // In action phase, human can act if not folded (all-in players can still use AP)
    if (gameState.phase === GamePhase.ACTION_PHASE && currentPlayer.isFolded) {
      return false;
    }
    
    // Check if player has remaining AP in action phase
    if (gameState.phase === GamePhase.ACTION_PHASE) {
      const remainingAP = getRemainingAP(currentPlayer);
      if (remainingAP <= 0) {
        return false;
      }
    }
    
    return true;
  },
  
  getCurrentPlayer: () => {
    const { gameState } = get();
    return gameState.players[gameState.currentPlayerIndex] ?? null;
  },
  
  getHumanPlayer: () => {
    const { gameState } = get();
    return gameState.players.find(p => p.isHuman) ?? null;
  },
  
  // Update statistics
  updateStatistics: (roundWon, giantKilling, chipsWon, bestHand, apUsed) => {
    const stats = get().statistics;
    const newStats: GameStatistics = {
      ...stats,
      roundsPlayed: stats.roundsPlayed + 1,
      roundsWon: roundWon ? stats.roundsWon + 1 : stats.roundsWon,
      giantKillings: giantKilling ? stats.giantKillings + 1 : stats.giantKillings,
      totalChipsWon: roundWon ? stats.totalChipsWon + chipsWon : stats.totalChipsWon,
      totalChipsLost: !roundWon ? stats.totalChipsLost + Math.abs(chipsWon) : stats.totalChipsLost,
      bestHand: bestHand > stats.bestHand ? bestHand : stats.bestHand,
      actionsUsed: {
        ...stats.actionsUsed,
        ...apUsed.reduce((acc, action) => {
          acc[action] = (acc[action] || 0) + 1;
          return acc;
        }, {} as Record<APAction, number>),
      },
      currentWinStreak: roundWon ? stats.currentWinStreak + 1 : 0,
      longestWinStreak: roundWon && stats.currentWinStreak + 1 > stats.longestWinStreak 
        ? stats.currentWinStreak + 1 
        : stats.longestWinStreak,
    };
    
    // Calculate average AP (simplified - just track last round's AP)
    const humanPlayer = get().gameState.players.find(p => p.isHuman);
    if (humanPlayer) {
      newStats.averageAP = Math.round(
        (stats.averageAP * stats.roundsPlayed + humanPlayer.ap) / (stats.roundsPlayed + 1)
      );
    }
    
    set({ statistics: newStats });
  },
  
  // Toggle statistics display
  toggleStatistics: () => {
    set(state => ({
      uiState: { ...state.uiState, showStatistics: !state.uiState.showStatistics },
    }));
  },
  
  // Toggle tutorial display
  toggleTutorial: () => {
    set(state => ({
      uiState: { ...state.uiState, showTutorial: !state.uiState.showTutorial },
    }));
  },
  
}));
