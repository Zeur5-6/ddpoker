// ========================================
// Hand Strength Calculator
// ========================================

import { HandRank, HandResult } from '../core/types';

/**
 * Calculate hand strength as a percentage (0-100)
 * Based on hand rank and high cards
 */
export function calculateHandStrength(handResult: HandResult): number {
  // Base strength from rank (0-100)
  const rankStrength = (handResult.rank / HandRank.FIVE_OF_A_KIND) * 100;
  
  // Bonus from high cards (0-10 points)
  const highCardBonus = Math.min(
    handResult.highCards.slice(0, 3).reduce((sum, val) => sum + val, 0) / 30,
    10
  );
  
  return Math.min(rankStrength + highCardBonus, 100);
}

/**
 * Get hand strength category
 */
export function getHandStrengthCategory(strength: number): {
  label: string;
  color: string;
  emoji: string;
} {
  if (strength >= 90) {
    return { label: '極強', color: 'text-purple-400', emoji: '🔥' };
  } else if (strength >= 70) {
    return { label: '強', color: 'text-green-400', emoji: '💪' };
  } else if (strength >= 50) {
    return { label: '中', color: 'text-yellow-400', emoji: '👍' };
  } else if (strength >= 30) {
    return { label: '弱', color: 'text-orange-400', emoji: '😐' };
  } else {
    return { label: '極弱', color: 'text-red-400', emoji: '😢' };
  }
}

/**
 * Get win probability estimate (very rough)
 * Based on hand strength and number of opponents
 */
export function estimateWinProbability(
  handStrength: number,
  opponentCount: number
): number {
  // Very rough estimate
  // Stronger hands have better odds, but more opponents = lower odds
  const baseOdds = handStrength / 100;
  const opponentPenalty = 1 - (opponentCount * 0.15);
  return Math.max(0, Math.min(100, baseOdds * opponentPenalty * 100));
}
