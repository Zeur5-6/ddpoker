// ========================================
// Poker Hand Evaluator
// ========================================

import { Card, HandRank, HandResult } from '../types';
import { RANK_VALUES } from '../models/Card';

// Get numeric value for a rank
function getRankValue(rank: string): number {
  return RANK_VALUES[rank as keyof typeof RANK_VALUES] || 0;
}

// Count occurrences of each rank
function countRanks(cards: Card[]): Map<number, number> {
  const counts = new Map<number, number>();
  for (const card of cards) {
    if (card.isJoker) continue;
    const value = getRankValue(card.rank);
    counts.set(value, (counts.get(value) || 0) + 1);
  }
  return counts;
}

// Count occurrences of each suit
function countSuits(cards: Card[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const card of cards) {
    if (card.isJoker) continue;
    counts.set(card.suit, (counts.get(card.suit) || 0) + 1);
  }
  return counts;
}

// Check if cards form a straight (returns high card value or 0)
function checkStraight(values: number[]): number {
  const unique = [...new Set(values)].sort((a, b) => b - a);
  
  // Check for Ace-low straight (A-2-3-4-5)
  if (unique.includes(14) && unique.includes(2) && unique.includes(3) && 
      unique.includes(4) && unique.includes(5)) {
    return 5; // 5-high straight
  }
  
  // Check for regular straight
  for (let i = 0; i <= unique.length - 5; i++) {
    let isStraight = true;
    for (let j = 0; j < 4; j++) {
      if (unique[i + j] - unique[i + j + 1] !== 1) {
        isStraight = false;
        break;
      }
    }
    if (isStraight) return unique[i];
  }
  
  return 0;
}

// Evaluate a 5-card hand
function evaluateFiveCards(cards: Card[]): HandResult {
  const jokerCount = cards.filter(c => c.isJoker).length;
  const nonJokerCards = cards.filter(c => !c.isJoker);
  
  const rankCounts = countRanks(nonJokerCards);
  const suitCounts = countSuits(nonJokerCards);
  const values = nonJokerCards.map(c => getRankValue(c.rank)).sort((a, b) => b - a);
  
  // Check for flush
  const isFlush = [...suitCounts.values()].some(count => count + jokerCount >= 5);
  
  // Check for straight
  const straightHigh = checkStraight(values);
  const isStraight = straightHigh > 0 || (jokerCount > 0 && canMakeStraightWithJokers(values, jokerCount));
  
  // Count pairs, trips, quads
  const counts = [...rankCounts.values()].sort((a, b) => b - a);
  
  // Five of a kind (only with joker)
  if (jokerCount > 0 && counts[0] + jokerCount >= 5) {
    return {
      rank: HandRank.FIVE_OF_A_KIND,
      rankName: 'Five of a Kind',
      highCards: values,
      cards,
    };
  }
  
  // Royal Flush
  if (isFlush && isStraight && (straightHigh === 14 || (jokerCount > 0 && values.includes(14)))) {
    return {
      rank: HandRank.ROYAL_FLUSH,
      rankName: 'Royal Flush',
      highCards: [14],
      cards,
    };
  }
  
  // Straight Flush
  if (isFlush && isStraight) {
    return {
      rank: HandRank.STRAIGHT_FLUSH,
      rankName: 'Straight Flush',
      highCards: [straightHigh || Math.max(...values)],
      cards,
    };
  }
  
  // Four of a kind
  if (counts[0] + jokerCount >= 4) {
    const quadValue = [...rankCounts.entries()].find(([, c]) => c + jokerCount >= 4)?.[0] || values[0];
    return {
      rank: HandRank.FOUR_OF_A_KIND,
      rankName: 'Four of a Kind',
      highCards: [quadValue, ...values.filter(v => v !== quadValue)],
      cards,
    };
  }
  
  // Full House
  if ((counts[0] >= 3 && counts[1] >= 2) || (counts[0] >= 2 && counts[1] >= 2 && jokerCount >= 1)) {
    const tripValue = [...rankCounts.entries()].find(([, c]) => c >= 3)?.[0] || values[0];
    const pairValue = [...rankCounts.entries()].find(([v, c]) => c >= 2 && v !== tripValue)?.[0] || values[1];
    return {
      rank: HandRank.FULL_HOUSE,
      rankName: 'Full House',
      highCards: [tripValue, pairValue],
      cards,
    };
  }
  
  // Flush
  if (isFlush) {
    return {
      rank: HandRank.FLUSH,
      rankName: 'Flush',
      highCards: values.slice(0, 5),
      cards,
    };
  }
  
  // Straight
  if (isStraight) {
    return {
      rank: HandRank.STRAIGHT,
      rankName: 'Straight',
      highCards: [straightHigh || Math.max(...values)],
      cards,
    };
  }
  
  // Three of a kind
  if (counts[0] + jokerCount >= 3) {
    const tripValue = [...rankCounts.entries()].find(([, c]) => c + jokerCount >= 3)?.[0] || values[0];
    return {
      rank: HandRank.THREE_OF_A_KIND,
      rankName: 'Three of a Kind',
      highCards: [tripValue, ...values.filter(v => v !== tripValue)],
      cards,
    };
  }
  
  // Two Pair
  if (counts[0] >= 2 && counts[1] >= 2) {
    const pairs = [...rankCounts.entries()]
      .filter(([, c]) => c >= 2)
      .map(([v]) => v)
      .sort((a, b) => b - a);
    const kicker = values.find(v => !pairs.includes(v)) || 0;
    return {
      rank: HandRank.TWO_PAIR,
      rankName: 'Two Pair',
      highCards: [...pairs, kicker],
      cards,
    };
  }
  
  // One Pair
  if (counts[0] >= 2 || jokerCount >= 1) {
    const pairValue = [...rankCounts.entries()].find(([, c]) => c >= 2)?.[0] || values[0];
    return {
      rank: HandRank.ONE_PAIR,
      rankName: 'One Pair',
      highCards: [pairValue, ...values.filter(v => v !== pairValue)],
      cards,
    };
  }
  
  // High Card
  return {
    rank: HandRank.HIGH_CARD,
    rankName: 'High Card',
    highCards: values,
    cards,
  };
}

// Helper: Check if we can make a straight with jokers
function canMakeStraightWithJokers(values: number[], jokerCount: number): boolean {
  const unique = [...new Set(values)].sort((a, b) => b - a);
  
  // Try each possible straight
  for (let high = 14; high >= 5; high--) {
    let gaps = 0;
    for (let i = 0; i < 5; i++) {
      const needed = high - i;
      if (!unique.includes(needed) && !(needed === 1 && unique.includes(14))) {
        gaps++;
      }
    }
    if (gaps <= jokerCount) return true;
  }
  
  return false;
}

// Generate all 5-card combinations from a hand
function* combinations(cards: Card[], size: number): Generator<Card[]> {
  if (size === 0) {
    yield [];
    return;
  }
  if (cards.length < size) return;
  
  const [first, ...rest] = cards;
  for (const combo of combinations(rest, size - 1)) {
    yield [first, ...combo];
  }
  yield* combinations(rest, size);
}

// Evaluate the best 5-card hand from any number of cards
export function evaluateHand(cards: Card[]): HandResult {
  if (cards.length < 5) {
    // Pad with virtual low cards for incomplete hands
    const paddedCards = [...cards];
    while (paddedCards.length < 5) {
      paddedCards.push({ suit: 'spades', rank: '2' });
    }
    return evaluateFiveCards(paddedCards);
  }
  
  if (cards.length === 5) {
    return evaluateFiveCards(cards);
  }
  
  // Find best 5-card combination
  let bestResult: HandResult | null = null;
  
  for (const combo of combinations(cards, 5)) {
    const result = evaluateFiveCards(combo);
    if (!bestResult || compareHands(result, bestResult) > 0) {
      bestResult = result;
    }
  }
  
  return bestResult!;
}

// Compare two hand results (positive if a > b)
export function compareHands(a: HandResult, b: HandResult): number {
  if (a.rank !== b.rank) {
    return a.rank - b.rank;
  }
  
  // Same rank - compare high cards
  for (let i = 0; i < Math.min(a.highCards.length, b.highCards.length); i++) {
    if (a.highCards[i] !== b.highCards[i]) {
      return a.highCards[i] - b.highCards[i];
    }
  }
  
  return 0;
}

// Get hand rank name
export function getHandRankName(rank: HandRank): string {
  const names: Record<HandRank, string> = {
    [HandRank.HIGH_CARD]: 'ハイカード',
    [HandRank.ONE_PAIR]: 'ワンペア',
    [HandRank.TWO_PAIR]: 'ツーペア',
    [HandRank.THREE_OF_A_KIND]: 'スリーカード',
    [HandRank.STRAIGHT]: 'ストレート',
    [HandRank.FLUSH]: 'フラッシュ',
    [HandRank.FULL_HOUSE]: 'フルハウス',
    [HandRank.FOUR_OF_A_KIND]: 'フォーカード',
    [HandRank.STRAIGHT_FLUSH]: 'ストレートフラッシュ',
    [HandRank.ROYAL_FLUSH]: 'ロイヤルフラッシュ',
    [HandRank.FIVE_OF_A_KIND]: 'ファイブカード',
  };
  return names[rank];
}
