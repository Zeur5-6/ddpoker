// ========================================
// Double Dice Poker - Type Definitions
// ========================================

// Card Types
export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface Card {
  suit: Suit;
  rank: Rank;
  isJoker?: boolean;
}

// Poker Hand Rankings
export enum HandRank {
  HIGH_CARD = 0,
  ONE_PAIR = 1,
  TWO_PAIR = 2,
  THREE_OF_A_KIND = 3,
  STRAIGHT = 4,
  FLUSH = 5,
  FULL_HOUSE = 6,
  FOUR_OF_A_KIND = 7,
  STRAIGHT_FLUSH = 8,
  ROYAL_FLUSH = 9,
  FIVE_OF_A_KIND = 10, // Only possible with Joker
}

export interface HandResult {
  rank: HandRank;
  rankName: string;
  highCards: number[]; // For tie-breaking
  cards: Card[]; // The 5 cards that make the hand
}

// Game Phase State Machine
export enum GamePhase {
  LOBBY = 'LOBBY',
  SETUP = 'SETUP',               // Ante & Dice Roll
  BET_PHASE_1 = 'BET_PHASE_1',   // Pre-Action Betting
  DEAL = 'DEAL',                 // Card Distribution
  ACTION_PHASE = 'ACTION_PHASE', // AP Actions
  BET_PHASE_2 = 'BET_PHASE_2',   // Post-Action Betting
  SHOWDOWN = 'SHOWDOWN',         // Result
}

// Player Types
export type CPUPersona = 'logic' | 'gambler' | 'bluffer';

export interface PlayerState {
  id: string;
  name: string;
  isHuman: boolean;
  chips: number;
  hand: Card[];
  ap: number;
  apUsed: number;
  hasZorro: boolean;
  hasBoughtJoker: boolean; // Joker can only be bought once per round
  isFolded: boolean;
  isAllIn: boolean;
  currentBet: number;
  totalBetThisRound: number;
  persona?: CPUPersona;
}

// Betting Actions
export type BettingAction = 'check' | 'bet' | 'call' | 'raise' | 'fold' | 'all-in';

export interface BettingActionResult {
  action: BettingAction;
  amount: number;
  playerId: string;
}

// AP Actions
export type APAction = 'redraw' | 'search' | 'add' | 'buyJoker' | 'pass';

export interface APActionResult {
  action: APAction;
  cost: number;
  playerId: string;
  cardsDiscarded?: Card[];
  cardsDrawn?: Card[];
}

// Action Costs
export const ACTION_COSTS: Record<APAction, number> = {
  redraw: 1,
  search: 4,  // Increased from 3 (was too strong)
  add: 3,     // Decreased from 4 (more accessible)
  buyJoker: 0, // Calculated as ceil(AP / 2)
  pass: 0,
};

// Blind Level Structure
export interface BlindLevel {
  sb: number;  // Small Blind
  bb: number;  // Big Blind
  ante: number; // Optional ante
}

// Default blind levels (increases every round)
export const BLIND_LEVELS: BlindLevel[] = [
  { sb: 50, bb: 100, ante: 0 },
  { sb: 75, bb: 150, ante: 0 },
  { sb: 100, bb: 200, ante: 0 },
  { sb: 150, bb: 300, ante: 25 },
  { sb: 200, bb: 400, ante: 50 },
  { sb: 300, bb: 600, ante: 75 },
  { sb: 400, bb: 800, ante: 100 },
  { sb: 500, bb: 1000, ante: 100 },
  { sb: 750, bb: 1500, ante: 150 },
  { sb: 1000, bb: 2000, ante: 200 },
];

// Game Configuration
export interface GameConfig {
  startingChips: number;
  maxHandSize: number;
  cpuCount: 1 | 2 | 3;
  cpuPersonas?: CPUPersona[];
  blindLevels: BlindLevel[];
  roundsPerLevel: number; // How many rounds before blinds increase
}

export const DEFAULT_CONFIG: GameConfig = {
  startingChips: 1000,
  maxHandSize: 7,
  cpuCount: 1,
  blindLevels: BLIND_LEVELS,
  roundsPerLevel: 1, // Blinds increase every round
};

// Side Pot Structure
export interface SidePot {
  amount: number;
  eligiblePlayerIds: string[]; // Players who can win this pot
}

// Game State
export interface GameState {
  phase: GamePhase;
  players: PlayerState[];
  deck: Card[];
  discardPile: Card[];
  pot: number; // Total pot (sum of all side pots)
  pots: SidePot[]; // Main pot + side pots
  currentPlayerIndex: number;
  dealerIndex: number;
  currentBet: number; // Current highest bet in this betting round
  lastRaiseAmount: number; // The amount of the last raise (for min-raise rule)
  lastRaiseIndex: number; // Index of player who last raised
  bettingStartIndex: number; // Index of player who started the betting round
  playersActedThisRound: Set<string>; // Player IDs who have acted this betting round
  roundNumber: number;
  blindLevel: number; // Current blind level index
  roundsAtCurrentLevel: number; // Rounds played at current blind level
  currentBlinds: BlindLevel; // Current SB/BB/Ante
  winner: string | null;
  winnings: { playerId: string; amount: number; potType: string }[]; // Detailed winnings info
  isGiantKilling: boolean;
  message: string;
}

// Game Statistics
export interface GameStatistics {
  roundsPlayed: number;
  roundsWon: number;
  giantKillings: number;
  totalChipsWon: number;
  totalChipsLost: number;
  bestHand: HandRank;
  actionsUsed: Record<APAction, number>;
  averageAP: number;
  longestWinStreak: number;
  currentWinStreak: number;
}

// UI State for animations
export interface UIState {
  showDiceRoll: boolean;
  diceValues: [number, number];
  revealedCards: Set<string>; // Player IDs whose cards are revealed
  highlightedCards: number[]; // Indices of highlighted cards
  showGiantKilling: boolean;
  showStatistics: boolean;
  showTutorial: boolean;
}
