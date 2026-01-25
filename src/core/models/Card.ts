// ========================================
// Card Model
// ========================================

import { Card, Suit, Rank } from '../types';

export const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
export const RANKS: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

// Rank values for comparison (Ace can be high or low)
export const RANK_VALUES: Record<Rank, number> = {
  'A': 14, // Can also be 1 for low straights
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  '10': 10,
  'J': 11,
  'Q': 12,
  'K': 13,
};

export const SUIT_SYMBOLS: Record<Suit, string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
};

export const SUIT_COLORS: Record<Suit, 'red' | 'black'> = {
  hearts: 'red',
  diamonds: 'red',
  clubs: 'black',
  spades: 'black',
};

export function createCard(suit: Suit, rank: Rank): Card {
  return { suit, rank };
}

export function createJoker(): Card {
  return { suit: 'spades', rank: 'A', isJoker: true };
}

export function getCardValue(card: Card): number {
  if (card.isJoker) return 15; // Joker is highest
  return RANK_VALUES[card.rank];
}

export function getCardDisplay(card: Card): string {
  if (card.isJoker) return '🃏 JOKER';
  return `${card.rank}${SUIT_SYMBOLS[card.suit]}`;
}

export function getCardColor(card: Card): 'red' | 'black' {
  if (card.isJoker) return 'black';
  return SUIT_COLORS[card.suit];
}

export function compareCards(a: Card, b: Card): number {
  return getCardValue(b) - getCardValue(a);
}

export function cardToString(card: Card): string {
  if (card.isJoker) return 'JOKER';
  return `${card.rank}_${card.suit}`;
}

export function isSameCard(a: Card, b: Card): boolean {
  if (a.isJoker && b.isJoker) return true;
  return a.suit === b.suit && a.rank === b.rank;
}
