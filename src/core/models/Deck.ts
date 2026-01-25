// ========================================
// Deck Model
// ========================================

import { Card } from '../types';
import { SUITS, RANKS, createCard } from './Card';

export class Deck {
  private cards: Card[] = [];

  constructor() {
    this.reset();
  }

  reset(): void {
    this.cards = [];
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        this.cards.push(createCard(suit, rank));
      }
    }
  }

  shuffle(): void {
    // Fisher-Yates shuffle
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  draw(count: number = 1): Card[] {
    if (count > this.cards.length) {
      throw new Error(`Cannot draw ${count} cards, only ${this.cards.length} remaining`);
    }
    return this.cards.splice(0, count);
  }

  drawOne(): Card | null {
    return this.cards.shift() || null;
  }

  peek(count: number = 1): Card[] {
    return this.cards.slice(0, count);
  }

  addToBottom(cards: Card[]): void {
    this.cards.push(...cards);
  }

  addToTop(cards: Card[]): void {
    this.cards.unshift(...cards);
  }

  returnCards(cards: Card[]): void {
    this.addToBottom(cards);
  }

  get remaining(): number {
    return this.cards.length;
  }

  get isEmpty(): boolean {
    return this.cards.length === 0;
  }

  getCards(): Card[] {
    return [...this.cards];
  }

  setCards(cards: Card[]): void {
    this.cards = [...cards];
  }
}

// Utility function to create and shuffle a new deck
export function createShuffledDeck(): Card[] {
  const deck = new Deck();
  deck.shuffle();
  return deck.getCards();
}
