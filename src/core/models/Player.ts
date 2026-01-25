// ========================================
// Player Model
// ========================================

import { Card, PlayerState, CPUPersona, APAction, HandResult, ACTION_COSTS } from '../types';
import { evaluateHand } from '../poker/HandEvaluator';

// Create a new player state
export function createPlayer(
  id: string,
  name: string,
  isHuman: boolean,
  startingChips: number,
  persona?: CPUPersona
): PlayerState {
  return {
    id,
    name,
    isHuman,
    chips: startingChips,
    hand: [],
    ap: 0,
    apUsed: 0,
    hasZorro: false,
    hasBoughtJoker: false,
    isFolded: false,
    isAllIn: false,
    currentBet: 0,
    totalBetThisRound: 0,
    persona,
  };
}

// Reset player for new round
export function resetPlayerForRound(player: PlayerState): PlayerState {
  // Players with 0 chips (after round ended, not during betting) are eliminated
  // Note: chips here is the final amount after previous round's pot distribution
  const isEliminated = player.chips <= 0;
  
  return {
    ...player,
    hand: [],
    ap: 0,
    apUsed: 0,
    hasZorro: false,
    hasBoughtJoker: false,
    isFolded: isEliminated, // Auto-fold if no chips
    isAllIn: false,
    currentBet: 0,
    totalBetThisRound: 0,
  };
}

// Check if player is eliminated (has no chips and not currently betting)
export function isPlayerEliminated(player: PlayerState): boolean {
  // A player is eliminated only if they have 0 chips AND are not in a betting situation
  // During a round, chips can be 0 if all-in, but they're still playing
  return player.chips <= 0 && !player.isAllIn && player.currentBet <= 0;
}

// Roll dice and set AP
export function rollDice(): { dice: [number, number]; ap: number; isZorro: boolean } {
  const die1 = Math.floor(Math.random() * 6) + 1;
  const die2 = Math.floor(Math.random() * 6) + 1;
  return {
    dice: [die1, die2],
    ap: die1 + die2,
    isZorro: die1 === die2,
  };
}

// Get remaining AP
export function getRemainingAP(player: PlayerState): number {
  return player.ap - player.apUsed;
}

// Check if player can perform an action
export function canPerformAction(player: PlayerState, action: APAction): boolean {
  const remaining = getRemainingAP(player);
  
  switch (action) {
    case 'redraw':
      return remaining >= 1 && player.hand.length > 0;
    case 'search':
      return remaining >= 3 && player.hand.length < 7;
    case 'add':
      return remaining >= 4 && player.hand.length < 7;
    case 'buyJoker':
      const jokerCost = Math.ceil(player.ap / 2);
      return player.hasZorro && !player.hasBoughtJoker && remaining >= jokerCost && player.hand.length > 0;
    case 'pass':
      return true;
    default:
      return false;
  }
}

// Get available actions for a player
export function getAvailableActions(player: PlayerState): APAction[] {
  const actions: APAction[] = [];
  
  if (canPerformAction(player, 'redraw')) actions.push('redraw');
  if (canPerformAction(player, 'search')) actions.push('search');
  if (canPerformAction(player, 'add')) actions.push('add');
  if (canPerformAction(player, 'buyJoker')) actions.push('buyJoker');
  actions.push('pass');
  
  return actions;
}

// Get action cost
export function getActionCost(player: PlayerState, action: APAction): number {
  if (action === 'buyJoker') {
    return Math.ceil(player.ap / 2);
  }
  return ACTION_COSTS[action];
}

// Evaluate player's current hand
export function evaluatePlayerHand(player: PlayerState): HandResult {
  return evaluateHand(player.hand);
}

// Add card to hand
export function addCardToHand(player: PlayerState, card: Card): PlayerState {
  if (player.hand.length >= 7) {
    throw new Error('Hand is full (max 7 cards)');
  }
  return {
    ...player,
    hand: [...player.hand, card],
  };
}

// Remove card from hand
export function removeCardFromHand(player: PlayerState, cardIndex: number): { player: PlayerState; card: Card } {
  if (cardIndex < 0 || cardIndex >= player.hand.length) {
    throw new Error('Invalid card index');
  }
  const card = player.hand[cardIndex];
  const newHand = [...player.hand];
  newHand.splice(cardIndex, 1);
  return {
    player: { ...player, hand: newHand },
    card,
  };
}

// Place a bet
export function placeBet(player: PlayerState, amount: number): PlayerState {
  const actualAmount = Math.min(amount, player.chips);
  const isAllIn = actualAmount >= player.chips;
  
  return {
    ...player,
    chips: player.chips - actualAmount,
    currentBet: player.currentBet + actualAmount,
    totalBetThisRound: player.totalBetThisRound + actualAmount,
    isAllIn,
  };
}

// Fold
export function fold(player: PlayerState): PlayerState {
  return {
    ...player,
    isFolded: true,
  };
}

// Win pot
export function winPot(player: PlayerState, amount: number): PlayerState {
  return {
    ...player,
    chips: player.chips + amount,
  };
}

// Check if player is still active in the round
export function isActivePlayer(player: PlayerState): boolean {
  return !player.isFolded && player.chips > 0;
}
