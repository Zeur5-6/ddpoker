// ========================================
// Game Engine - Core Game Logic
// ========================================

import {
  GameState,
  GamePhase,
  PlayerState,
  BettingAction,
  APAction,
  GameConfig,
  DEFAULT_CONFIG,
  BLIND_LEVELS,
  SidePot,
} from '../types';
import { createShuffledDeck } from '../models/Deck';
import {
  createPlayer,
  resetPlayerForRound,
  rollDice,
  placeBet,
  fold,
  getRemainingAP,
  getActionCost,
  canPerformAction,
  addCardToHand,
  removeCardFromHand,
  evaluatePlayerHand,
} from '../models/Player';
import { getRandomPersona, decideBettingAction, decideAPAction } from '../models/CPUPlayer';
import { createJoker } from '../models/Card';
import { compareHands } from '../poker/HandEvaluator';

// Check if player is still in the round (not folded)
function isInRound(player: PlayerState): boolean {
  // Player is in round if not folded AND not eliminated
  // Eliminated: chips <= 0 AND not all-in AND no current bet
  const isEliminated = player.chips <= 0 && !player.isAllIn && player.currentBet <= 0;
  return !player.isFolded && !isEliminated;
}

// Check if player can still act (not folded, not all-in, not eliminated)
function canAct(player: PlayerState): boolean {
  // Player can act if:
  // 1. Not folded
  // 2. Not all-in (in betting phases)
  // 3. Not eliminated (chips <= 0 AND not all-in AND no current bet)
  const isEliminated = player.chips <= 0 && !player.isAllIn && player.currentBet <= 0;
  return !player.isFolded && !player.isAllIn && !isEliminated;
}

// Create initial game state
export function createGameState(config: GameConfig = DEFAULT_CONFIG): GameState {
  const players: PlayerState[] = [];
  
  // Create human player
  players.push(createPlayer('human', 'あなた', true, config.startingChips));
  
  // Create CPU players
  const cpuNames = ['CPU 1', 'CPU 2', 'CPU 3'];
  const cpuPersonas = config.cpuPersonas || [];
  
  for (let i = 0; i < config.cpuCount; i++) {
    const persona = cpuPersonas[i] || getRandomPersona();
    players.push(createPlayer(`cpu-${i}`, cpuNames[i], false, config.startingChips, persona));
  }
  
  const initialBlinds = config.blindLevels[0] || BLIND_LEVELS[0];
  
  return {
    phase: GamePhase.LOBBY,
    players,
    deck: [],
    discardPile: [],
    pot: 0,
    pots: [],
    currentPlayerIndex: 0,
    dealerIndex: 0,
    currentBet: 0,
    lastRaiseAmount: 0,
    lastRaiseIndex: -1,
    bettingStartIndex: 0,
    playersActedThisRound: new Set<string>(),
    roundNumber: 0,
    blindLevel: 0,
    roundsAtCurrentLevel: 0,
    currentBlinds: initialBlinds,
    winner: null,
    winnings: [],
    isGiantKilling: false,
    message: 'ゲームを開始してください',
  };
}

// Start a new round
export function startNewRound(state: GameState, config: GameConfig = DEFAULT_CONFIG): GameState {
  // Reset deck
  const deck = createShuffledDeck();
  
  // Reset players for new round (players with 0 chips are auto-folded)
  const players = state.players.map(p => resetPlayerForRound(p));
  
  // Count active players (those with chips)
  const activePlayers = players.filter(p => p.chips > 0);
  
  // Check for game over conditions
  if (activePlayers.length <= 1) {
    const winner = activePlayers[0];
    return {
      ...state,
      phase: GamePhase.SHOWDOWN,
      players,
      winner: winner?.id || null,
      message: winner 
        ? `🏆 ${winner.name} の完全勝利！ゲーム終了！`
        : 'ゲーム終了',
    };
  }
  
  const newRoundNumber = state.roundNumber + 1;
  
  // Move dealer button (skip eliminated players)
  let dealerIndex = (state.dealerIndex + 1) % players.length;
  let attempts = 0;
  while (players[dealerIndex].chips <= 0 && attempts < players.length) {
    dealerIndex = (dealerIndex + 1) % players.length;
    attempts++;
  }
  
  // Calculate new blind level
  // Blinds increase after ALL active players have been BB once (one full rotation)
  let newBlindLevel = state.blindLevel;
  let roundsAtCurrentLevel = state.roundsAtCurrentLevel + 1;
  
  // Check if a full rotation has completed
  if (roundsAtCurrentLevel >= activePlayers.length) {
    newBlindLevel = Math.min(newBlindLevel + 1, config.blindLevels.length - 1);
    roundsAtCurrentLevel = 0;
  }
  
  const currentBlinds = config.blindLevels[newBlindLevel] || BLIND_LEVELS[0];
  
  // Find first active player after dealer
  let startIndex = (dealerIndex + 1) % players.length;
  attempts = 0;
  while (players[startIndex].chips <= 0 && attempts < players.length) {
    startIndex = (startIndex + 1) % players.length;
    attempts++;
  }
  
  const blindsChanged = newBlindLevel > state.blindLevel;
  const message = blindsChanged
    ? `ラウンド ${newRoundNumber} - ⬆️ ブラインド上昇！ ${currentBlinds.sb}/${currentBlinds.bb}`
    : `ラウンド ${newRoundNumber} - ブラインド ${currentBlinds.sb}/${currentBlinds.bb}`;
  
  return {
    ...state,
    phase: GamePhase.SETUP,
    players,
    deck,
    discardPile: [],
    pot: 0,
    pots: [],
    currentPlayerIndex: startIndex,
    dealerIndex,
    currentBet: 0,
    lastRaiseAmount: 0,
    lastRaiseIndex: -1,
    bettingStartIndex: startIndex,
    playersActedThisRound: new Set<string>(),
    roundNumber: newRoundNumber,
    blindLevel: newBlindLevel,
    roundsAtCurrentLevel,
    currentBlinds,
    winner: null,
    winnings: [],
    isGiantKilling: false,
    message,
  };
}

// Setup phase: Pay blinds, ante and roll dice
export function setupPhase(
  state: GameState
): { state: GameState; diceResults: Map<string, { dice: [number, number]; ap: number; isZorro: boolean }> } {
  let newState = { ...state };
  const diceResults = new Map<string, { dice: [number, number]; ap: number; isZorro: boolean }>();
  const blinds = state.currentBlinds;
  let totalPot = 0;
  
  // Find active player positions for blinds
  const numPlayers = newState.players.length;
  
  // Find SB position (first active player after dealer)
  let sbIndex = (newState.dealerIndex + 1) % numPlayers;
  let attempts = 0;
  while ((newState.players[sbIndex].isFolded || newState.players[sbIndex].chips <= 0) && attempts < numPlayers) {
    sbIndex = (sbIndex + 1) % numPlayers;
    attempts++;
  }
  
  // Find BB position (first active player after SB)
  let bbIndex = (sbIndex + 1) % numPlayers;
  attempts = 0;
  while ((newState.players[bbIndex].isFolded || newState.players[bbIndex].chips <= 0) && attempts < numPlayers) {
    bbIndex = (bbIndex + 1) % numPlayers;
    attempts++;
  }
  
  // Find UTG position (first active player after BB - this is where action starts)
  let utgIndex = (bbIndex + 1) % numPlayers;
  attempts = 0;
  while ((newState.players[utgIndex].isFolded || newState.players[utgIndex].chips <= 0) && attempts < numPlayers) {
    utgIndex = (utgIndex + 1) % numPlayers;
    attempts++;
  }
  
  // Process each player: pay blinds/ante and roll dice
  const updatedPlayers = newState.players.map((player, index) => {
    // Skip eliminated players (no chips)
    if (player.isFolded || player.chips <= 0) {
      diceResults.set(player.id, { dice: [0, 0], ap: 0, isZorro: false });
      return {
        ...player,
        isFolded: true,
        ap: 0,
        hasZorro: false,
        currentBet: 0,
      };
    }
    
    // Roll dice for AP
    const diceResult = rollDice();
    diceResults.set(player.id, diceResult);
    
    // Calculate forced bets
    let forcedBet = 0;
    let currentBet = 0;
    
    // Pay ante (everyone pays)
    if (blinds.ante > 0) {
      const anteAmount = Math.min(blinds.ante, player.chips);
      forcedBet += anteAmount;
      // Ante doesn't count toward currentBet
    }
    
    // Pay SB
    if (index === sbIndex) {
      const sbAmount = Math.min(blinds.sb, player.chips - forcedBet);
      forcedBet += sbAmount;
      currentBet = sbAmount;
    }
    
    // Pay BB
    if (index === bbIndex) {
      const bbAmount = Math.min(blinds.bb, player.chips - forcedBet);
      forcedBet += bbAmount;
      currentBet = bbAmount;
    }
    
    totalPot += forcedBet;
    const newChips = player.chips - forcedBet;
    
    return {
      ...player,
      chips: newChips,
      ap: diceResult.ap,
      hasZorro: diceResult.isZorro,
      currentBet: currentBet,
      totalBetThisRound: forcedBet, // Track total bet including blinds/ante
      isAllIn: newChips <= 0 && currentBet > 0,
    };
  });
  
  newState = {
    ...newState,
    players: updatedPlayers,
    pot: totalPot,
    phase: GamePhase.BET_PHASE_1,
    currentPlayerIndex: utgIndex,
    currentBet: blinds.bb, // BB is the current bet to match
    lastRaiseIndex: bbIndex, // BB counts as the last "raise"
    bettingStartIndex: utgIndex,
    playersActedThisRound: new Set<string>(),
    message: `第1ベッティングフェーズ (SB: ${blinds.sb} / BB: ${blinds.bb})`,
  };
  
  return { state: newState, diceResults };
}

// Deal cards to all players
export function dealCards(state: GameState): GameState {
  let deck = [...state.deck];
  const players = state.players.map(player => {
    if (player.isFolded) return player;
    
    const cards = deck.splice(0, 5);
    return {
      ...player,
      hand: cards,
    };
  });
  
  // Find first active player after dealer who has AP
  let startIndex = (state.dealerIndex + 1) % players.length;
  let attempts = 0;
  while (attempts < players.length) {
    const player = players[startIndex];
    // Must not be folded and must have AP remaining
    if (!player.isFolded && getRemainingAP(player) > 0) {
      break;
    }
    startIndex = (startIndex + 1) % players.length;
    attempts++;
  }
  
  return {
    ...state,
    players,
    deck,
    phase: GamePhase.ACTION_PHASE,
    currentPlayerIndex: startIndex,
    message: 'アクションフェーズ - APを使って手札を強化',
  };
}

// Process betting action
export function processBettingAction(
  state: GameState,
  playerId: string,
  action: BettingAction,
  amount: number
): GameState {
  const playerIndex = state.players.findIndex(p => p.id === playerId);
  if (playerIndex === -1) return state;
  
  let player = state.players[playerIndex];
  let newState = { ...state };
  
  // Ensure pot is a valid number
  if (!Number.isFinite(newState.pot)) {
    newState.pot = 0;
  }
  
  // Ensure amount is a valid number
  let safeAmount = Number.isFinite(amount) ? Math.max(0, Math.floor(amount)) : 0;
  
  const toCall = Math.max(0, (state.currentBet || 0) - (player.currentBet || 0));
  const minBet = state.currentBlinds?.bb || 100;
  // Minimum raise must be at least the size of the last raise (or BB if no raise yet)
  const minRaiseSize = Math.max(state.lastRaiseAmount || 0, minBet);
  
  switch (action) {
    case 'fold':
      player = fold(player);
      newState.message = `${player.name} がフォールド`;
      break;
      
    case 'check':
      if (toCall > 0) return state; // Can't check if there's a bet to call
      newState.message = `${player.name} がチェック`;
      break;
      
    case 'call':
      // Can't call if there's nothing to call (should use check instead)
      if (toCall <= 0) {
        // Treat as check
        newState.message = `${player.name} がチェック`;
        break;
      }
      const callAmount = Math.min(toCall, player.chips);
      player = placeBet(player, callAmount);
      newState.pot = (newState.pot || 0) + callAmount;
      newState.message = `${player.name} が ${callAmount} でコール`;
      break;
      
    case 'bet':
      // First bet of the round - must be at least BB
      if (safeAmount < minBet) safeAmount = minBet;
      safeAmount = Math.min(safeAmount, player.chips);
      player = placeBet(player, safeAmount);
      newState.pot = (newState.pot || 0) + safeAmount;
      newState.currentBet = player.currentBet;
      newState.lastRaiseAmount = safeAmount; // The raise amount is the bet itself
      newState.lastRaiseIndex = playerIndex;
      newState.message = `${player.name} が ${safeAmount} をベット`;
      break;
      
    case 'raise':
      // Raise must be at least: toCall + minRaiseSize
      // The "raise" amount is how much MORE than the current bet
      const minTotalRaise = toCall + minRaiseSize;
      let raiseTotal = Math.max(safeAmount, minTotalRaise);
      raiseTotal = Math.min(raiseTotal, player.chips);
      
      // Calculate the actual raise size (how much above current bet)
      const actualRaiseSize = (player.currentBet + raiseTotal) - state.currentBet;
      
      player = placeBet(player, raiseTotal);
      newState.pot = (newState.pot || 0) + raiseTotal;
      newState.currentBet = player.currentBet;
      newState.lastRaiseAmount = actualRaiseSize;
      newState.lastRaiseIndex = playerIndex;
      newState.message = `${player.name} が ${player.currentBet} にレイズ`;
      break;
      
    case 'all-in':
      const allInAmount = Math.max(0, player.chips);
      const newPlayerBet = player.currentBet + allInAmount;
      const wasRaise = newPlayerBet > state.currentBet;
      
      player = placeBet(player, allInAmount);
      newState.pot = (newState.pot || 0) + allInAmount;
      
      // Update currentBet to reflect the new maximum bet (if this all-in is higher)
      if (newPlayerBet > state.currentBet) {
        newState.currentBet = newPlayerBet;
      }
      
      if (wasRaise) {
        const allInRaiseSize = newPlayerBet - state.currentBet;
        // Only count as a "raise" that reopens betting if it's at least min raise
        if (allInRaiseSize >= minRaiseSize) {
          newState.lastRaiseAmount = allInRaiseSize;
          newState.lastRaiseIndex = playerIndex;
        }
      }
      newState.message = `${player.name} がオールイン！ (${allInAmount})`;
      break;
  }
  
  // Update player in state
  const updatedPlayers = [...newState.players];
  updatedPlayers[playerIndex] = player;
  newState.players = updatedPlayers;
  
  // Mark this player as having acted this round
  const playersActed = new Set(newState.playersActedThisRound);
  playersActed.add(playerId);
  newState.playersActedThisRound = playersActed;
  
  // Move to next player first
  newState = moveToNextBettingPlayer(newState);
  
  // Then check if betting round is complete
  newState = checkBettingRoundComplete(newState);
  
  return newState;
}

// Process AP action
export function processAPAction(
  state: GameState,
  playerId: string,
  action: APAction,
  cardIndex?: number,
  searchSelection?: number // For search action: which of the 3 cards to keep
): GameState {
  const playerIndex = state.players.findIndex(p => p.id === playerId);
  if (playerIndex === -1) return state;
  
  let player = state.players[playerIndex];
  let deck = [...state.deck];
  let discardPile = [...state.discardPile];
  let newState = { ...state };
  
  if (!canPerformAction(player, action)) {
    return state;
  }
  
  const cost = getActionCost(player, action);
  
  switch (action) {
    case 'redraw':
      if (cardIndex === undefined || cardIndex < 0 || cardIndex >= player.hand.length) {
        return state;
      }
      // Discard selected card
      const { player: afterDiscard, card: discardedCard } = removeCardFromHand(player, cardIndex);
      discardPile.push(discardedCard);
      // Draw new card
      const newCard = deck.shift();
      if (newCard) {
        player = addCardToHand(afterDiscard, newCard);
      } else {
        player = afterDiscard;
      }
      player.apUsed += cost;
      newState.message = `${player.name} が1枚交換 (コスト: ${cost} AP)`;
      break;
      
    case 'search':
      // Cannot search if hand is full
      if (player.hand.length >= 7) return state;
      
      // Peek at top 3 cards
      const searchCards = deck.splice(0, 3);
      // Select one (default to first if not specified)
      const selectedIndex = searchSelection ?? 0;
      const selectedCard = searchCards[selectedIndex];
      // Discard the rest
      const notSelected = searchCards.filter((_, i) => i !== selectedIndex);
      discardPile.push(...notSelected);
      
      // Add selected card to hand
      player = addCardToHand(player, selectedCard);
      
      // Discard one card from hand (use provided cardIndex or find weakest)
      const discardIndex = cardIndex ?? player.hand.length - 1;
      const { player: afterSearchDiscard, card: searchDiscarded } = removeCardFromHand(player, discardIndex);
      discardPile.push(searchDiscarded);
      player = afterSearchDiscard;
      player.apUsed += cost;
      newState.message = `${player.name} がサーチ (コスト: ${cost} AP)`;
      break;
      
    case 'add':
      if (player.hand.length >= 7) return state;
      const addedCard = deck.shift();
      if (addedCard) {
        player = addCardToHand(player, addedCard);
      }
      player.apUsed += cost;
      newState.message = `${player.name} が1枚追加 (コスト: ${cost} AP)`;
      break;
      
    case 'buyJoker':
      if (!player.hasZorro || player.hasBoughtJoker) return state;
      if (cardIndex === undefined || cardIndex < 0 || cardIndex >= player.hand.length) {
        return state;
      }
      // Discard selected card
      const { player: afterJokerDiscard, card: jokerDiscarded } = removeCardFromHand(player, cardIndex);
      discardPile.push(jokerDiscarded);
      // Add joker
      player = addCardToHand(afterJokerDiscard, createJoker());
      player.hasBoughtJoker = true;
      player.apUsed += cost;
      newState.message = `${player.name} がジョーカーを購入！ (コスト: ${cost} AP)`;
      break;
      
    case 'pass':
      player.apUsed = player.ap; // Mark all AP as used
      newState.message = `${player.name} がパス`;
      break;
  }
  
  // Update state
  const updatedPlayers = [...newState.players];
  updatedPlayers[playerIndex] = player;
  
  newState = {
    ...newState,
    players: updatedPlayers,
    deck,
    discardPile,
  };
  
  // Check if this player still has AP
  if (action === 'pass' || getRemainingAP(player) <= 0) {
    // Move to next player
    newState = moveToNextActionPlayer(newState);
    
    // Check if action phase is complete
    newState = checkActionPhaseComplete(newState);
  }
  
  return newState;
}

// Move to next player who can still bet
function moveToNextBettingPlayer(state: GameState): GameState {
  const numPlayers = state.players.length;
  let nextIndex = (state.currentPlayerIndex + 1) % numPlayers;
  let attempts = 0;
  
  // Find next player who can act (not folded, not all-in, not eliminated)
  while (attempts < numPlayers) {
    const player = state.players[nextIndex];
    if (canAct(player)) {
      return {
        ...state,
        currentPlayerIndex: nextIndex,
      };
    }
    nextIndex = (nextIndex + 1) % numPlayers;
    attempts++;
  }
  
  // If we've gone full circle and no one can act, return state as-is
  // (checkBettingRoundComplete will handle advancing to next phase)
  return state;
}

// Move to next player in action phase
function moveToNextActionPlayer(state: GameState): GameState {
  const numPlayers = state.players.length;
  let nextIndex = (state.currentPlayerIndex + 1) % numPlayers;
  let attempts = 0;
  
  while (attempts < numPlayers) {
    const player = state.players[nextIndex];
    // In action phase, only need to not be folded and have AP remaining
    if (isInRound(player) && getRemainingAP(player) > 0) {
      return {
        ...state,
        currentPlayerIndex: nextIndex,
      };
    }
    nextIndex = (nextIndex + 1) % numPlayers;
    attempts++;
  }
  
  return state;
}

// Check if betting round is complete
function checkBettingRoundComplete(state: GameState): GameState {
  const playersInRound = state.players.filter(p => isInRound(p));
  const playersWhoCanAct = state.players.filter(p => canAct(p));
  
  // If only one player remains (others folded), they win immediately (no Giant Killing)
  if (playersInRound.length === 1) {
    return distributePotToSingleWinner(state, playersInRound[0].id, false);
  }
  
  // If no one can act anymore (all are folded or all-in), move to next phase
  if (playersWhoCanAct.length === 0) {
    return advanceToNextPhase(state);
  }
  
  // Calculate the maximum bet among all players in round (including all-in players)
  const maxBetInRound = Math.max(
    ...playersInRound.map(p => p.currentBet),
    state.currentBet
  );
  
  // Check if all players who can act have had a chance to act this round
  const allPlayersHaveActed = playersWhoCanAct.every(p => 
    state.playersActedThisRound.has(p.id)
  );
  
  // If not everyone has acted yet, don't complete the round
  if (!allPlayersHaveActed) {
    return state;
  }
  
  // Check if all players who can act have matched the maximum bet
  // Note: For all-in players, their currentBet might be less than maxBetInRound,
  // but they can't act anymore, so we only check players who can act
  const allMatched = playersWhoCanAct.every(p => p.currentBet >= maxBetInRound);
  
  // Special case: If only one player can act and everyone else is all-in or matched
  if (playersWhoCanAct.length === 1) {
    const actingPlayer = playersWhoCanAct[0];
    const allInPlayers = playersInRound.filter(p => p.isAllIn);
    
    // If acting player has matched the maximum bet and there's at least one all-in
    if (actingPlayer.currentBet >= maxBetInRound && allInPlayers.length > 0) {
      return advanceToNextPhase(state);
    }
    
    // If acting player has matched and there are no all-in players, check if we've gone around
    if (actingPlayer.currentBet >= maxBetInRound && allInPlayers.length === 0) {
      // Check if we've gone back to the betting start or last raiser
      const backToRaiser = state.lastRaiseIndex !== -1 && state.currentPlayerIndex === state.lastRaiseIndex;
      const backToStart = state.currentBet === 0 && state.currentPlayerIndex === state.bettingStartIndex;
      if (backToRaiser || backToStart) {
        return advanceToNextPhase(state);
      }
    }
  }
  
  // General case: Check if all players who can act have matched and we've gone around
  if (allMatched) {
    // Check if we've gone around the table
    // 1. Back to last raiser (if there was a raise)
    const backToRaiser = state.lastRaiseIndex !== -1 && state.currentPlayerIndex === state.lastRaiseIndex;
    // 2. Back to betting start (UTG) if no raise and currentBet is 0 (everyone checked)
    const backToStart = state.currentBet === 0 && state.currentPlayerIndex === state.bettingStartIndex;
    // 3. No raise yet and currentBet is 0 (shouldn't happen in normal flow, but safety check)
    const noRaiseYet = state.lastRaiseIndex === -1 && state.currentBet === 0;
    
    // Complete the round if all have matched and we've gone around
    if (backToRaiser || backToStart || noRaiseYet) {
      return advanceToNextPhase(state);
    }
  }
  
  return state;
}

// Advance to the next phase
export function advanceToNextPhase(state: GameState): GameState {
  // Reset current bets for next phase
  const players = state.players.map(p => ({
    ...p,
    currentBet: 0,
  }));
  
  // Find first active player after dealer
  let startIndex = (state.dealerIndex + 1) % players.length;
  while (players[startIndex].isFolded && startIndex !== state.dealerIndex) {
    startIndex = (startIndex + 1) % players.length;
  }
  
  if (state.phase === GamePhase.BET_PHASE_1) {
    return {
      ...state,
      players,
      phase: GamePhase.DEAL,
      currentBet: 0,
      lastRaiseIndex: -1,
      lastRaiseAmount: 0,
      bettingStartIndex: startIndex,
      playersActedThisRound: new Set<string>(),
      currentPlayerIndex: startIndex,
      message: 'カードを配ります',
    };
  } else if (state.phase === GamePhase.BET_PHASE_2) {
    return {
      ...state,
      players,
      phase: GamePhase.SHOWDOWN,
      currentBet: 0,
      lastRaiseIndex: -1,
      lastRaiseAmount: 0,
      playersActedThisRound: new Set<string>(),
      currentPlayerIndex: startIndex,
      message: 'ショーダウン！',
    };
  }
  
  return state;
}

// Reset betting round tracking for a new betting phase (unused but kept for potential future use)
// function resetBettingRound(state: GameState, startIndex: number): GameState {
//   return {
//     ...state,
//     currentBet: 0,
//     lastRaiseIndex: -1,
//     bettingStartIndex: startIndex,
//     playersActedThisRound: new Set<string>(),
//     currentPlayerIndex: startIndex,
//   };
// }

// Check if action phase is complete
function checkActionPhaseComplete(state: GameState): GameState {
  const activePlayers = state.players.filter(p => isInRound(p));
  
  // Check if all players have used all AP or passed
  // Note: All-in players can still use AP in action phase
  const allDone = activePlayers.every(p => getRemainingAP(p) <= 0);
  
  if (allDone) {
    // Reset for next betting phase
    const players = state.players.map(p => ({
      ...p,
      currentBet: 0,
    }));
    
    // Find first active player who can act in betting phase (not folded, not all-in)
    let startIndex = (state.dealerIndex + 1) % players.length;
    let attempts = 0;
    while (attempts < players.length) {
      const player = players[startIndex];
      if (!player.isFolded && !player.isAllIn) {
        break;
      }
      startIndex = (startIndex + 1) % players.length;
      attempts++;
    }
    
    // Pre-add all-in players to playersActedThisRound for betting phase (they can't act in betting)
    const playersActed = new Set<string>();
    players.forEach(p => {
      if (p.isAllIn && !p.isFolded) {
        playersActed.add(p.id);
      }
    });
    
    // Check if anyone can actually act in betting phase
    const playersWhoCanAct = players.filter(p => !p.isFolded && !p.isAllIn);
    
    // If no one can act (all are all-in or folded), go straight to showdown
    if (playersWhoCanAct.length === 0) {
      // Set currentPlayerIndex to a valid player (for UI purposes)
      // Use the first active player (in round) or dealer
      let showdownIndex = state.dealerIndex;
      const activeInRound = players.find(p => isInRound(p));
      if (activeInRound) {
        showdownIndex = players.findIndex(p => p.id === activeInRound.id);
      }
      
      return {
        ...state,
        players,
        phase: GamePhase.SHOWDOWN,
        currentPlayerIndex: showdownIndex,
        currentBet: 0,
        lastRaiseIndex: -1,
        bettingStartIndex: showdownIndex,
        playersActedThisRound: new Set<string>(),
        message: 'ショーダウン！',
      };
    }
    
    return {
      ...state,
      players,
      phase: GamePhase.BET_PHASE_2,
      currentPlayerIndex: startIndex,
      currentBet: 0,
      lastRaiseIndex: -1,
      bettingStartIndex: startIndex,
      playersActedThisRound: playersActed,
      message: '第2ベッティングフェーズ',
    };
  }
  
  return state;
}

// Calculate side pots based on player contributions
function calculateSidePots(state: GameState): SidePot[] {
  // Get all players who contributed to the pot
  const contributors = state.players
    .filter(p => p.totalBetThisRound > 0)
    .map(p => ({ id: p.id, bet: p.totalBetThisRound, isFolded: p.isFolded }));
  
  if (contributors.length === 0) {
    const eligibleIds = state.players.filter(p => isInRound(p)).map(p => p.id);
    return [{ amount: state.pot, eligiblePlayerIds: eligibleIds }];
  }
  
  // Get unique bet levels, sorted ascending
  const betLevels = [...new Set(contributors.map(c => c.bet))].sort((a, b) => a - b);
  
  const sidePots: SidePot[] = [];
  let previousLevel = 0;
  
  for (const currentLevel of betLevels) {
    const betDiff = currentLevel - previousLevel;
    if (betDiff <= 0) continue;
    
    // Count how many players contributed at least this level (including folded)
    const playersAtThisLevel = contributors.filter(c => c.bet >= currentLevel);
    
    // Pot amount is the difference times number of players who reached this level
    const potAmount = betDiff * playersAtThisLevel.length;
    
    // Eligible players are those who contributed at least this level AND are not folded
    const eligiblePlayerIds = playersAtThisLevel
      .filter(c => !c.isFolded)
      .map(c => c.id);
    
    if (potAmount > 0 && eligiblePlayerIds.length > 0) {
      sidePots.push({ amount: potAmount, eligiblePlayerIds });
    }
    
    previousLevel = currentLevel;
  }
  
  // If no side pots were created, create a single main pot
  if (sidePots.length === 0) {
    const eligibleIds = state.players.filter(p => isInRound(p)).map(p => p.id);
    if (eligibleIds.length > 0) {
      return [{ amount: state.pot, eligiblePlayerIds: eligibleIds }];
    }
  }
  
  // Merge consecutive pots with the same eligible players
  const mergedPots: SidePot[] = [];
  for (const pot of sidePots) {
    const lastPot = mergedPots[mergedPots.length - 1];
    if (lastPot && 
        lastPot.eligiblePlayerIds.length === pot.eligiblePlayerIds.length &&
        lastPot.eligiblePlayerIds.every(id => pot.eligiblePlayerIds.includes(id))) {
      lastPot.amount += pot.amount;
    } else {
      mergedPots.push({ ...pot });
    }
  }
  
  return mergedPots;
}

// Showdown - determine winner(s) and distribute pots
export function showdown(state: GameState): GameState {
  const activePlayers = state.players.filter(p => isInRound(p));
  
  if (activePlayers.length === 0) {
    return state;
  }
  
  // If only one player left (others folded), they win the whole pot - NO side pots needed
  if (activePlayers.length === 1) {
    return distributePotToSingleWinner(state, activePlayers[0].id, false);
  }
  
  // Calculate side pots
  const sidePots = calculateSidePots(state);
  
  // Verify total pot amount matches sum of side pots
  const totalSidePotAmount = sidePots.reduce((sum, p) => sum + p.amount, 0);
  const actualPotAmount = state.pot;
  
  // Debug: Log pot calculation
  console.log('Pot calculation:', {
    actualPot: actualPotAmount,
    sidePotsTotal: totalSidePotAmount,
    difference: actualPotAmount - totalSidePotAmount,
    playerBets: state.players.map(p => ({ name: p.name, totalBet: p.totalBetThisRound, chips: p.chips })),
    sidePots: sidePots.map(p => ({ amount: p.amount, eligible: p.eligiblePlayerIds.length })),
  });
  
  // If there's a discrepancy, adjust the main pot to ensure all chips are distributed
  let potAdjustment = 0;
  if (Math.abs(actualPotAmount - totalSidePotAmount) > 0.01) {
    console.warn(`Pot mismatch: actual=${actualPotAmount}, calculated=${totalSidePotAmount}, adjusting main pot`);
    potAdjustment = actualPotAmount - totalSidePotAmount;
    // Adjust the first pot (main pot) if it exists
    if (sidePots.length > 0) {
      sidePots[0].amount += potAdjustment;
    }
  }
  
  // Evaluate all active hands
  const handResults = activePlayers.map(p => ({
    player: p,
    result: evaluatePlayerHand(p),
  }));
  
  // Sort by hand strength (best first)
  // compareHands returns positive if first > second
  // We want descending order (best first), so compare b to a
  handResults.sort((a, b) => compareHands(b.result, a.result));
  
  // Debug: Log final sorted results
  if (handResults.length > 1) {
    console.log('Showdown Results (sorted):', handResults.map((hr, idx) => ({
      rank: idx + 1,
      player: hr.player.name,
      ap: hr.player.ap,
      handRank: hr.result.rank,
      rankName: hr.result.rankName,
      hand: hr.player.hand.map(c => `${c.rank}${c.suit[0]}`).join(' '),
    })));
  }
  
  // Copy players for updates
  const updatedPlayers = [...state.players];
  const winningsInfo: { playerId: string; amount: number; potType: string }[] = [];
  let totalWonByMainWinner = 0;
  let mainWinnerId = '';
  
  // Distribute each pot
  for (let potIndex = 0; potIndex < sidePots.length; potIndex++) {
    const pot = sidePots[potIndex];
    const potName = potIndex === 0 ? 'メインポット' : `サイドポット${potIndex}`;
    
    // Find the best hand among eligible players for this pot
    const eligibleResults = handResults.filter(hr => 
      pot.eligiblePlayerIds.includes(hr.player.id)
    );
    
    if (eligibleResults.length === 0) continue;
    
    // Winner of this pot is the first in sorted order (best hand)
    const potWinner = eligibleResults[0].player;
    const winnerIndex = updatedPlayers.findIndex(p => p.id === potWinner.id);
    
    if (winnerIndex !== -1) {
      updatedPlayers[winnerIndex] = {
        ...updatedPlayers[winnerIndex],
        chips: updatedPlayers[winnerIndex].chips + pot.amount,
      };
      
      winningsInfo.push({
        playerId: potWinner.id,
        amount: pot.amount,
        potType: potName,
      });
      
      // Track main winner for Giant Killing
      if (potIndex === 0) {
        mainWinnerId = potWinner.id;
        totalWonByMainWinner = pot.amount;
      } else if (potWinner.id === mainWinnerId) {
        totalWonByMainWinner += pot.amount;
      }
    }
  }
  
  // Check for Giant Killing (only for main pot winner, AP <= 4)
  const mainWinner = state.players.find(p => p.id === mainWinnerId);
  const canTriggerGiantKilling = mainWinner && mainWinner.ap <= 4;
  let bonusCollected = 0;
  let isGiantKilling = false; // Only true for 2.0x (AP 11+)
  
  if (canTriggerGiantKilling && mainWinner) {
    // Giant Killing bonus: collect from losers who didn't fold
    const losers = state.players.filter(p => 
      p.id !== mainWinnerId && isInRound(p)
    );
    
    if (losers.length > 0) {
      // Calculate bonus from each loser based on their chips (not pot-based)
      // Each loser contributes: (multiplier - 1) * their current chips
      // This ensures total chips don't increase (only redistributed)
      let has2xBonus = false; // Track if any loser triggers 2.0x bonus
      
      for (const loser of losers) {
        const loserAP = loser.ap || 0;
        // Determine multiplier for this specific loser
        // AP 10以下 → 1.5倍、AP 11以上 → 2.0倍
        const loserMultiplier = loserAP <= 10 ? 1.5 : 2.0;
        
        if (loserMultiplier === 2.0) {
          has2xBonus = true; // At least one loser triggers 2.0x
        }
        
        const loserIndex = updatedPlayers.findIndex(p => p.id === loser.id);
        if (loserIndex !== -1) {
          // Take bonus from loser's current chips (after pot distribution)
          // Bonus = (multiplier - 1) * loser's chips
          // This ensures total chips remain constant
          const loserChips = updatedPlayers[loserIndex].chips;
          const bonusFromThisLoser = Math.floor(loserChips * (loserMultiplier - 1));
          
          // Take the bonus (but don't take more than they have)
          const amountToTake = Math.min(bonusFromThisLoser, loserChips);
          updatedPlayers[loserIndex] = {
            ...updatedPlayers[loserIndex],
            chips: updatedPlayers[loserIndex].chips - amountToTake,
          };
          bonusCollected += amountToTake;
        }
      }
      
      // Set effect flag based on whether any loser triggered 2.0x
      if (has2xBonus) {
        isGiantKilling = true; // Special effect for 2.0x
      } else {
        isGiantKilling = false; // No special effect for 1.5x
      }
      
      // Give bonus to main winner
      const mainWinnerIndex = updatedPlayers.findIndex(p => p.id === mainWinnerId);
      if (mainWinnerIndex !== -1) {
        updatedPlayers[mainWinnerIndex] = {
          ...updatedPlayers[mainWinnerIndex],
          chips: updatedPlayers[mainWinnerIndex].chips + bonusCollected,
        };
        
        // Create detailed bonus info
        const bonusDetails: string[] = [];
        const loserMultipliers = new Map<number, number>(); // Track how many losers at each multiplier
        for (const loser of losers) {
          const loserAP = loser.ap || 0;
          const multiplier = loserAP <= 10 ? 1.5 : 2.0;
          loserMultipliers.set(multiplier, (loserMultipliers.get(multiplier) || 0) + 1);
        }
        
        // Build bonus description
        if (loserMultipliers.size === 1) {
          // All losers have same multiplier
          const multiplier = Array.from(loserMultipliers.keys())[0];
          bonusDetails.push(`${multiplier}倍`);
        } else {
          // Mixed multipliers
          const parts: string[] = [];
          if (loserMultipliers.has(1.5)) {
            parts.push(`${loserMultipliers.get(1.5)}人(1.5倍)`);
          }
          if (loserMultipliers.has(2.0)) {
            parts.push(`${loserMultipliers.get(2.0)}人(2.0倍)`);
          }
          bonusDetails.push(parts.join(' + '));
        }
        
        winningsInfo.push({
          playerId: mainWinnerId,
          amount: bonusCollected,
          potType: `Giant Killingボーナス (${bonusDetails.join(', ')})`,
        });
      }
    }
  }
  
  // Build message
  const mainWinnerHand = handResults[0].result;
  let message = '';
  
  if (sidePots.length === 1) {
    // Simple case - one pot
    message = `${handResults[0].player.name} の勝利！ ${mainWinnerHand.rankName} で ${sidePots[0].amount} チップ獲得`;
  } else {
    // Multiple pots
    const potWinners = [...new Set(winningsInfo.map(w => w.playerId))];
    if (potWinners.length === 1) {
      const totalWon = winningsInfo.filter(w => w.playerId === potWinners[0]).reduce((s, w) => s + w.amount, 0);
      message = `${state.players.find(p => p.id === potWinners[0])?.name} の勝利！ ${mainWinnerHand.rankName} で ${totalWon} チップ獲得`;
    } else {
      message = winningsInfo.map(w => {
        const player = state.players.find(p => p.id === w.playerId);
        return `${player?.name}: ${w.potType} ${w.amount}`;
      }).join(' / ');
    }
  }
  
  if (canTriggerGiantKilling && bonusCollected > 0) {
    // Find bonus info to get multiplier details
    const bonusInfo = winningsInfo.find(w => w.playerId === mainWinnerId && w.potType.includes('Giant Killing'));
    const bonusType = bonusInfo?.potType || '';
    
    if (isGiantKilling) {
      // 2.0倍が含まれる場合は特別なメッセージ（演出あり）
      message = `🎉 GIANT KILLING! 🎉 ${mainWinner?.name} がAP ${mainWinner?.ap} で大逆転！ ${message} + ボーナス ${bonusCollected} (${bonusType.replace('Giant Killingボーナス (', '').replace(')', '')})`;
    } else {
      // 1.5倍のみの場合は通常のメッセージにボーナス情報を追加（演出なし）
      message = `${message} + ボーナス ${bonusCollected} (${bonusType.replace('Giant Killingボーナス (', '').replace(')', '')})`;
    }
  }
  
  // After distributing chips, check for game over conditions
  // Count active players (those with chips > 0)
  const activePlayersAfterShowdown = updatedPlayers.filter(p => p.chips > 0);
  
  // Check if game is over (only one or zero players left)
  if (activePlayersAfterShowdown.length <= 1) {
    const finalWinner = activePlayersAfterShowdown[0];
    return {
      ...state,
      players: updatedPlayers,
      pots: sidePots,
      winner: finalWinner?.id || mainWinnerId,
      winnings: winningsInfo,
      isGiantKilling: isGiantKilling && bonusCollected > 0,
      pot: 0,
      phase: GamePhase.SHOWDOWN,
      message: finalWinner 
        ? `🏆 ${finalWinner.name} の完全勝利！ゲーム終了！`
        : message,
    };
  }
  
  return {
    ...state,
    players: updatedPlayers,
    pots: sidePots,
    winner: mainWinnerId,
    winnings: winningsInfo,
    isGiantKilling: isGiantKilling && bonusCollected > 0,
    pot: 0,
    phase: GamePhase.SHOWDOWN,
    message,
  };
}

// Simple pot distribution when only one player remains (all others folded)
function distributePotToSingleWinner(state: GameState, winnerId: string, _isShowdownWin: boolean): GameState {
  const winnerIndex = state.players.findIndex(p => p.id === winnerId);
  if (winnerIndex === -1) return state;
  
  const winner = state.players[winnerIndex];
  
  const updatedPlayers = [...state.players];
  updatedPlayers[winnerIndex] = {
    ...updatedPlayers[winnerIndex],
    chips: updatedPlayers[winnerIndex].chips + state.pot,
  };
  
  const winningsInfo = [{ playerId: winnerId, amount: state.pot, potType: 'メインポット' }];
  
  // After distributing chips, check for game over conditions
  // Count active players (those with chips > 0)
  const activePlayersAfterWin = updatedPlayers.filter(p => p.chips > 0);
  
  // Check if game is over (only one or zero players left)
  if (activePlayersAfterWin.length <= 1) {
    const finalWinner = activePlayersAfterWin[0];
    return {
      ...state,
      players: updatedPlayers,
      pots: [{ amount: state.pot, eligiblePlayerIds: [winnerId] }],
      winner: finalWinner?.id || winnerId,
      winnings: winningsInfo,
      isGiantKilling: false, // No Giant Killing when everyone folds
      pot: 0,
      phase: GamePhase.SHOWDOWN,
      message: finalWinner 
        ? `🏆 ${finalWinner.name} の完全勝利！ゲーム終了！`
        : `${winner.name} の勝利！ (他全員フォールド) ${state.pot} チップ獲得`,
    };
  }
  
  return {
    ...state,
    players: updatedPlayers,
    pots: [{ amount: state.pot, eligiblePlayerIds: [winnerId] }],
    winner: winnerId,
    winnings: winningsInfo,
    isGiantKilling: false, // No Giant Killing when everyone folds
    pot: 0,
    phase: GamePhase.SHOWDOWN,
    message: `${winner.name} の勝利！ (他全員フォールド) ${state.pot} チップ獲得`,
  };
}

// CPU takes its turn
export function cpuTakeTurn(state: GameState): GameState {
  const currentPlayer = state.players[state.currentPlayerIndex];
  
  if (currentPlayer.isHuman || currentPlayer.isFolded) {
    return state;
  }
  
  // Decide based on current phase
  if (state.phase === GamePhase.BET_PHASE_1 || state.phase === GamePhase.BET_PHASE_2) {
    // In betting phases, skip all-in players
    if (currentPlayer.isAllIn) {
      return state;
    }
    const { action, amount } = decideBettingAction(currentPlayer, state);
    return processBettingAction(state, currentPlayer.id, action, amount);
  }
  
  if (state.phase === GamePhase.ACTION_PHASE) {
    // In action phase, all-in players can still use AP
    const { action, cardIndex } = decideAPAction(currentPlayer, state);
    return processAPAction(state, currentPlayer.id, action, cardIndex);
  }
  
  return state;
}

// Get available betting actions for a player
export function getAvailableBettingActions(
  state: GameState,
  playerId: string
): BettingAction[] {
  const player = state.players.find(p => p.id === playerId);
  if (!player || player.isFolded || player.isAllIn) return [];
  
  const actions: BettingAction[] = [];
  const toCall = state.currentBet - player.currentBet;
  
  if (toCall === 0) {
    actions.push('check');
    actions.push('bet');
  } else {
    actions.push('fold');
    if (player.chips >= toCall) {
      actions.push('call');
    }
    if (player.chips > toCall) {
      actions.push('raise');
    }
  }
  
  if (player.chips > 0) {
    actions.push('all-in');
  }
  
  return actions;
}

// Check if game is over (someone is out of chips)
export function isGameOver(state: GameState): boolean {
  return state.players.some(p => p.chips <= 0);
}

// Get players still in the game
export function getActivePlayers(state: GameState): PlayerState[] {
  return state.players.filter(p => p.chips > 0);
}
