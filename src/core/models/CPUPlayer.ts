// ========================================
// CPU Player AI Logic
// ========================================

import { PlayerState, CPUPersona, BettingAction, APAction, GameState, GamePhase } from '../types';
import { evaluatePlayerHand, getRemainingAP, canPerformAction } from './Player';
import { HandRank } from '../types';

// Get minimum bet from game state (BB)
function getMinBet(gameState: GameState): number {
  return gameState.currentBlinds?.bb || 100;
}

// AI Decision making for betting
export function decideBettingAction(
  player: PlayerState,
  gameState: GameState
): { action: BettingAction; amount: number } {
  const persona = player.persona || 'logic';
  
  // Safety check - if player can't act, check or fold
  // Eliminated: chips <= 0 AND not all-in AND no current bet
  const isEliminated = player.chips <= 0 && !player.isAllIn && player.currentBet <= 0;
  if (player.chips <= 0 || player.isFolded || player.isAllIn || isEliminated) {
    return { action: 'check', amount: 0 };
  }
  
  switch (persona) {
    case 'logic':
      return logicBettingStrategy(player, gameState);
    case 'gambler':
      return gamblerBettingStrategy(player, gameState);
    case 'bluffer':
      return blufferBettingStrategy(player, gameState);
    default:
      return logicBettingStrategy(player, gameState);
  }
}

// AI Decision making for AP actions
export function decideAPAction(
  player: PlayerState,
  _gameState: GameState
): { action: APAction; cardIndex?: number } {
  const persona = player.persona || 'logic';
  const handResult = evaluatePlayerHand(player);
  const remainingAP = getRemainingAP(player);
  
  // If no AP left, pass
  if (remainingAP <= 0) {
    return { action: 'pass' };
  }
  
  // Check for Joker opportunity (all personas want this if available)
  if (canPerformAction(player, 'buyJoker') && handResult.rank < HandRank.FULL_HOUSE) {
    // Find weakest card to discard
    const weakestIndex = findWeakestCardIndex(player);
    return { action: 'buyJoker', cardIndex: weakestIndex };
  }
  
  switch (persona) {
    case 'logic':
      return logicAPStrategy(player, handResult, remainingAP);
    case 'gambler':
      return gamblerAPStrategy(player, handResult, remainingAP);
    case 'bluffer':
      return blufferAPStrategy(player, handResult, remainingAP);
    default:
      return logicAPStrategy(player, handResult, remainingAP);
  }
}

// ========================================
// Logic (論理型) AI - Improved
// ========================================

function logicBettingStrategy(
  player: PlayerState,
  gameState: GameState
): { action: BettingAction; amount: number } {
  const handResult = evaluatePlayerHand(player);
  const currentBet = gameState.currentBet || 0;
  const toCall = Math.max(0, currentBet - player.currentBet);
  const pot = gameState.pot || 0;
  const minBet = getMinBet(gameState);
  
  // Safety: if toCall > chips, must fold or all-in
  if (toCall > player.chips) {
    if (handResult.rank >= HandRank.STRAIGHT) {
      return { action: 'all-in', amount: player.chips };
    }
    if (handResult.rank >= HandRank.TWO_PAIR) {
      return { action: 'call', amount: player.chips };
    }
    return { action: 'fold', amount: 0 };
  }
  
  // Pre-action phase (BET_PHASE_1): bet based on AP
  if (gameState.phase === GamePhase.BET_PHASE_1) {
    if (player.ap >= 9) {
      // High AP - be aggressive
      if (currentBet === 0) {
        const betAmount = Math.min(minBet * 2, player.chips * 0.15);
        return { action: 'bet', amount: Math.max(betAmount, minBet) };
      }
      // Call and sometimes raise
      if (toCall <= player.chips * 0.3) {
        if (Math.random() > 0.7) {
          const raiseAmount = Math.min(toCall + minBet, player.chips * 0.25);
          return { action: 'raise', amount: raiseAmount };
        }
        return { action: 'call', amount: toCall };
      }
      return { action: 'fold', amount: 0 };
    } else if (player.ap >= 5) {
      // Medium AP - play normally
      if (currentBet === 0) {
        if (Math.random() > 0.5) {
          return { action: 'bet', amount: Math.min(minBet, player.chips) };
        }
        return { action: 'check', amount: 0 };
      }
      if (toCall <= player.chips * 0.25) {
        return { action: 'call', amount: toCall };
      }
      return { action: 'fold', amount: 0 };
    } else {
      // Low AP - still participate sometimes (Giant Killing!)
      if (currentBet === 0) {
        if (Math.random() > 0.7) {
          return { action: 'bet', amount: Math.min(minBet, player.chips) };
        }
        return { action: 'check', amount: 0 };
      }
      if (toCall <= player.chips * 0.2) {
        return { action: 'call', amount: toCall };
      }
      return { action: 'fold', amount: 0 };
    }
  }
  
  // Post-action phase (BET_PHASE_2): bet based on hand strength
  const handStrength = calculateHandStrength(handResult.rank, player.ap);
  
  // Very strong hands (FULL_HOUSE+) - NEVER fold!
  if (handResult.rank >= HandRank.FULL_HOUSE) {
    if (currentBet === 0) {
      const betAmount = Math.min(Math.floor(pot * 0.7) + minBet, player.chips * 0.5);
      return { action: 'bet', amount: Math.max(betAmount, minBet) };
    }
    // Always call or raise with very strong hands
    if (toCall >= player.chips * 0.8) {
      // Almost all-in, go for it!
      return { action: 'all-in', amount: player.chips };
    }
    if (handResult.rank >= HandRank.FOUR_OF_A_KIND && Math.random() > 0.3) {
      const raiseAmount = Math.min(toCall + minBet * 3, player.chips * 0.6);
      return { action: 'raise', amount: raiseAmount };
    }
    return { action: 'call', amount: toCall };
  }
  
  if (handStrength > 0.6) {
    // Strong hand - value bet
    if (currentBet === 0) {
      const betAmount = Math.min(Math.floor(pot * 0.6) + minBet, player.chips * 0.4);
      return { action: 'bet', amount: Math.max(betAmount, minBet) };
    }
    // Call or raise
    if (toCall <= player.chips * 0.5) {
      if (handResult.rank >= HandRank.THREE_OF_A_KIND && Math.random() > 0.5) {
        const raiseAmount = Math.min(toCall + minBet * 2, player.chips * 0.5);
        return { action: 'raise', amount: raiseAmount };
      }
      return { action: 'call', amount: toCall };
    }
    return { action: 'fold', amount: 0 };
  } else if (handStrength > 0.35) {
    // Medium hand - call/check, sometimes bet
    if (currentBet === 0) {
      if (Math.random() > 0.6) {
        return { action: 'bet', amount: Math.min(minBet, player.chips) };
      }
      return { action: 'check', amount: 0 };
    }
    if (toCall <= pot * 0.4 && toCall <= player.chips * 0.3) {
      return { action: 'call', amount: toCall };
    }
    return { action: 'fold', amount: 0 };
  } else {
    // Weak hand - check, sometimes bluff
    if (currentBet === 0) {
      // Occasional bluff
      if (Math.random() > 0.85) {
        return { action: 'bet', amount: Math.min(minBet, player.chips) };
      }
      return { action: 'check', amount: 0 };
    }
    if (toCall <= pot * 0.2 && toCall <= player.chips * 0.15) {
      return { action: 'call', amount: toCall };
    }
    return { action: 'fold', amount: 0 };
  }
}

function logicAPStrategy(
  player: PlayerState,
  handResult: ReturnType<typeof evaluatePlayerHand>,
  remainingAP: number
): { action: APAction; cardIndex?: number } {
  // Priority: Use ALL available AP effectively
  
  // Already have a great hand - add cards if possible
  if (handResult.rank >= HandRank.STRAIGHT && remainingAP >= 4 && player.hand.length < 7) {
    return { action: 'add' };
  }
  
  // Good hand (two pair or better) - maybe add or search for improvement
  if (handResult.rank >= HandRank.TWO_PAIR) {
    if (remainingAP >= 4 && player.hand.length < 7) {
      return { action: 'add' };
    }
    if (remainingAP >= 3 && handResult.rank < HandRank.FULL_HOUSE) {
      return { action: 'search' };
    }
    if (remainingAP >= 1 && player.hand.length > 0) {
      const weakestIndex = findWeakestCardIndex(player);
      if (weakestIndex >= 0) {
        return { action: 'redraw', cardIndex: weakestIndex };
      }
    }
    return { action: 'pass' };
  }
  
  // Medium hand (one pair) - search and redraw to improve
  if (handResult.rank === HandRank.ONE_PAIR) {
    if (remainingAP >= 3) {
      return { action: 'search' };
    }
    if (remainingAP >= 1 && player.hand.length > 0) {
      const weakestIndex = findWeakestCardIndex(player);
      if (weakestIndex >= 0) {
        return { action: 'redraw', cardIndex: weakestIndex };
      }
    }
    return { action: 'pass' };
  }
  
  // Weak hand (high card) - aggressively improve!
  // First priority: Search (best value)
  if (remainingAP >= 3) {
    return { action: 'search' };
  }
  
  // Second priority: Redraw multiple times
  if (remainingAP >= 1 && player.hand.length > 0) {
    const weakestIndex = findWeakestCardIndex(player);
    if (weakestIndex >= 0) {
      return { action: 'redraw', cardIndex: weakestIndex };
    }
  }
  
  return { action: 'pass' };
}

// ========================================
// Gambler (特攻型) AI - Improved
// ========================================

function gamblerBettingStrategy(
  player: PlayerState,
  gameState: GameState
): { action: BettingAction; amount: number } {
  const handResult = evaluatePlayerHand(player);
  const currentBet = gameState.currentBet || 0;
  const toCall = Math.max(0, currentBet - player.currentBet);
  const pot = gameState.pot || 0;
  const minBet = getMinBet(gameState);
  const isGiantKillingCandidate = player.ap >= 2 && player.ap <= 4;
  
  // Safety check
  if (toCall > player.chips) {
    if (handResult.rank >= HandRank.THREE_OF_A_KIND || isGiantKillingCandidate) {
      return { action: 'all-in', amount: player.chips };
    }
    if (handResult.rank >= HandRank.ONE_PAIR) {
      return { action: 'call', amount: player.chips };
    }
    return { action: 'fold', amount: 0 };
  }
  
  // Giant Killing potential - BE AGGRESSIVE!
  if (isGiantKillingCandidate && gameState.phase === GamePhase.BET_PHASE_2) {
    if (handResult.rank >= HandRank.THREE_OF_A_KIND) {
      // Strong hand + Giant Killing = go for it!
      if (Math.random() > 0.4) {
        return { action: 'all-in', amount: player.chips };
      }
      const bigBet = Math.min(Math.floor(pot * 0.8), player.chips * 0.6);
      return { action: 'bet', amount: Math.max(bigBet, minBet * 2) };
    }
    if (handResult.rank >= HandRank.ONE_PAIR) {
      if (currentBet === 0) {
        const betAmount = Math.min(Math.floor(pot * 0.6), player.chips * 0.4);
        return { action: 'bet', amount: Math.max(betAmount, minBet) };
      }
      if (toCall <= player.chips * 0.4) {
        if (Math.random() > 0.6) {
          const raiseAmount = Math.min(toCall + minBet * 2, player.chips * 0.5);
          return { action: 'raise', amount: raiseAmount };
        }
        return { action: 'call', amount: toCall };
      }
    }
  }
  
  // Pre-action betting - aggressive with high AP
  if (gameState.phase === GamePhase.BET_PHASE_1) {
    if (player.ap >= 8) {
      if (currentBet === 0) {
        const betAmount = Math.min(minBet * 3, player.chips * 0.2);
        return { action: 'bet', amount: Math.max(betAmount, minBet) };
      }
      if (toCall <= player.chips * 0.3) {
        if (Math.random() > 0.6) {
          const raiseAmount = Math.min(toCall + minBet * 2, player.chips * 0.35);
          return { action: 'raise', amount: raiseAmount };
        }
        return { action: 'call', amount: toCall };
      }
      return { action: 'fold', amount: 0 };
    }
    // Medium/Low AP - still bet sometimes
    if (currentBet === 0) {
      if (Math.random() > 0.4) {
        return { action: 'bet', amount: Math.min(minBet * 2, player.chips * 0.15) };
      }
      return { action: 'check', amount: 0 };
    }
    if (toCall <= player.chips * 0.25) {
      return { action: 'call', amount: toCall };
    }
    return { action: 'fold', amount: 0 };
  }
  
  // Post-action with hand
  // Very strong hands (FULL_HOUSE+) - NEVER fold!
  if (handResult.rank >= HandRank.FULL_HOUSE) {
    if (currentBet === 0) {
      const betAmount = Math.min(Math.floor(pot * 0.8), player.chips * 0.5);
      return { action: 'bet', amount: Math.max(betAmount, minBet * 2) };
    }
    // Always call or raise with very strong hands
    if (toCall >= player.chips * 0.8) {
      return { action: 'all-in', amount: player.chips };
    }
    if (handResult.rank >= HandRank.FOUR_OF_A_KIND && Math.random() > 0.4) {
      const raiseAmount = Math.min(toCall + minBet * 3, player.chips * 0.6);
      return { action: 'raise', amount: raiseAmount };
    }
    return { action: 'call', amount: toCall };
  }
  
  if (handResult.rank >= HandRank.TWO_PAIR) {
    if (currentBet === 0) {
      const betAmount = Math.min(Math.floor(pot * 0.7), player.chips * 0.4);
      return { action: 'bet', amount: Math.max(betAmount, minBet * 2) };
    }
    if (toCall <= player.chips * 0.5) {
      if (Math.random() > 0.5) {
        const raiseAmount = Math.min(toCall + minBet * 2, player.chips * 0.5);
        return { action: 'raise', amount: raiseAmount };
      }
      return { action: 'call', amount: toCall };
    }
  } else if (handResult.rank >= HandRank.ONE_PAIR) {
    if (currentBet === 0) {
      return { action: 'bet', amount: Math.min(minBet * 2, player.chips * 0.2) };
    }
    if (toCall <= player.chips * 0.3) {
      return { action: 'call', amount: toCall };
    }
  }
  
  // Default - still aggressive
  if (currentBet === 0) {
    if (Math.random() > 0.6) {
      return { action: 'bet', amount: Math.min(minBet, player.chips) };
    }
    return { action: 'check', amount: 0 };
  }
  if (toCall <= player.chips * 0.2) {
    return { action: 'call', amount: toCall };
  }
  
  return { action: 'fold', amount: 0 };
}

function gamblerAPStrategy(
  player: PlayerState,
  _handResult: ReturnType<typeof evaluatePlayerHand>,
  remainingAP: number
): { action: APAction; cardIndex?: number } {
  // Gambler uses ALL AP aggressively
  
  // Add cards whenever possible
  if (remainingAP >= 4 && player.hand.length < 7) {
    return { action: 'add' };
  }
  
  // Search is great value
  if (remainingAP >= 3) {
    return { action: 'search' };
  }
  
  // Redraw repeatedly
  if (remainingAP >= 1 && player.hand.length > 0) {
    const weakestIndex = findWeakestCardIndex(player);
    if (weakestIndex >= 0) {
      return { action: 'redraw', cardIndex: weakestIndex };
    }
  }
  
  return { action: 'pass' };
}

// ========================================
// Bluffer (詐欺師) AI - Improved
// ========================================

function blufferBettingStrategy(
  player: PlayerState,
  gameState: GameState
): { action: BettingAction; amount: number } {
  const handResult = evaluatePlayerHand(player);
  const currentBet = gameState.currentBet || 0;
  const toCall = Math.max(0, currentBet - player.currentBet);
  const pot = gameState.pot || 0;
  const minBet = getMinBet(gameState);
  
  // Safety check
  if (toCall > player.chips) {
    // Bluffer might bluff-shove with nothing!
    if (handResult.rank >= HandRank.TWO_PAIR || Math.random() > 0.7) {
      return { action: 'all-in', amount: player.chips };
    }
    return { action: 'fold', amount: 0 };
  }
  
  // Very strong hands (FULL_HOUSE+) - NEVER fold! (but can slowplay)
  if (handResult.rank >= HandRank.FULL_HOUSE) {
    if (currentBet === 0) {
      // Can slowplay, but sometimes bet big
      if (Math.random() > 0.4) {
        return { action: 'check', amount: 0 };
      }
      // Value bet
      const betAmount = Math.min(Math.floor(pot * 0.6), player.chips * 0.3);
      return { action: 'bet', amount: Math.max(betAmount, minBet) };
    }
    // Someone bet into us - ALWAYS call or raise (never fold!)
    if (toCall >= player.chips * 0.8) {
      return { action: 'all-in', amount: player.chips };
    }
    if (Math.random() > 0.3) {
      const raiseAmount = Math.min(toCall + Math.floor(pot * 0.5), player.chips * 0.5);
      return { action: 'raise', amount: raiseAmount };
    }
    return { action: 'call', amount: toCall };
  }
  
  // Strong hand - SLOWPLAY (trap)
  if (handResult.rank >= HandRank.THREE_OF_A_KIND) {
    if (currentBet === 0) {
      // Check to trap most of the time
      if (Math.random() > 0.3) {
        return { action: 'check', amount: 0 };
      }
      // Small bet to induce raise
      return { action: 'bet', amount: Math.min(minBet, player.chips * 0.1) };
    }
    // Someone bet into us - RAISE (spring the trap)
    if (toCall <= player.chips * 0.4) {
      if (Math.random() > 0.4) {
        const raiseAmount = Math.min(toCall + Math.floor(pot * 0.5), player.chips * 0.5);
        return { action: 'raise', amount: raiseAmount };
      }
      return { action: 'call', amount: toCall };
    }
    return { action: 'call', amount: Math.min(toCall, player.chips) };
  }
  
  // Medium hand - mix it up
  if (handResult.rank >= HandRank.ONE_PAIR) {
    if (currentBet === 0) {
      if (Math.random() > 0.4) {
        const betAmount = Math.min(minBet * 2, player.chips * 0.2);
        return { action: 'bet', amount: betAmount };
      }
      return { action: 'check', amount: 0 };
    }
    if (toCall <= player.chips * 0.3) {
      return { action: 'call', amount: toCall };
    }
    return { action: 'fold', amount: 0 };
  }
  
  // Weak hand - THIS IS WHERE BLUFFER SHINES!
  if (currentBet === 0) {
    // Bluff frequently with big bets!
    if (Math.random() > 0.35) {
      const bluffAmount = Math.min(Math.floor(pot * 0.7) + minBet, player.chips * 0.3);
      return { action: 'bet', amount: Math.max(bluffAmount, minBet * 2) };
    }
    return { action: 'check', amount: 0 };
  }
  
  // Facing a bet with weak hand - sometimes re-bluff!
  if (Math.random() > 0.7 && toCall <= player.chips * 0.25) {
    // Re-raise as a bluff!
    const reraiseAmount = Math.min(toCall + Math.floor(pot * 0.5), player.chips * 0.4);
    return { action: 'raise', amount: reraiseAmount };
  }
  
  // Float (call to bluff later) sometimes
  if (toCall <= pot * 0.3 && toCall <= player.chips * 0.2 && Math.random() > 0.5) {
    return { action: 'call', amount: toCall };
  }
  
  return { action: 'fold', amount: 0 };
}

function blufferAPStrategy(
  player: PlayerState,
  handResult: ReturnType<typeof evaluatePlayerHand>,
  remainingAP: number
): { action: APAction; cardIndex?: number } {
  // Bluffer still wants to improve hand
  
  if (handResult.rank >= HandRank.TWO_PAIR) {
    // Good hand - add if possible for better odds
    if (remainingAP >= 4 && player.hand.length < 7) {
      return { action: 'add' };
    }
    // Pass to hide strength
    if (Math.random() > 0.5) {
      return { action: 'pass' };
    }
  }
  
  // Try to improve weak hand secretly
  if (remainingAP >= 3) {
    return { action: 'search' };
  }
  
  if (remainingAP >= 1 && player.hand.length > 0) {
    const idx = findWeakestCardIndex(player);
    if (idx >= 0) {
      return { action: 'redraw', cardIndex: idx };
    }
  }
  
  return { action: 'pass' };
}

// ========================================
// Helper Functions
// ========================================

function calculateHandStrength(rank: HandRank, ap: number): number {
  // Normalize hand rank to 0-1 (more granular)
  const rankStrength = rank / HandRank.FIVE_OF_A_KIND;
  // AP bonus (high AP means more potential in pre-action)
  const apBonus = Math.min((ap || 0) / 12, 1) * 0.15;
  return Math.min(rankStrength + apBonus, 1);
}

function findWeakestCardIndex(player: PlayerState): number {
  if (!player.hand || player.hand.length === 0) return -1;
  
  const handResult = evaluatePlayerHand(player);
  const bestCards = handResult.cards || [];
  
  // Find a card not in the best hand
  for (let i = 0; i < player.hand.length; i++) {
    const card = player.hand[i];
    const isInBest = bestCards.some(bc => 
      bc && card && bc.suit === card.suit && bc.rank === card.rank
    );
    if (!isInBest) return i;
  }
  
  // All cards are in best hand - find lowest rank card
  const rankOrder = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  let lowestIndex = 0;
  let lowestRank = rankOrder.indexOf(player.hand[0]?.rank || 'A');
  
  for (let i = 1; i < player.hand.length; i++) {
    const cardRank = rankOrder.indexOf(player.hand[i]?.rank || 'A');
    if (cardRank < lowestRank) {
      lowestRank = cardRank;
      lowestIndex = i;
    }
  }
  
  return lowestIndex;
}

// Get random persona
export function getRandomPersona(): CPUPersona {
  const personas: CPUPersona[] = ['logic', 'gambler', 'bluffer'];
  return personas[Math.floor(Math.random() * personas.length)];
}

// Get persona display name
export function getPersonaName(persona: CPUPersona): string {
  const names: Record<CPUPersona, string> = {
    logic: '論理型',
    gambler: '特攻型',
    bluffer: '詐欺師',
  };
  return names[persona];
}
