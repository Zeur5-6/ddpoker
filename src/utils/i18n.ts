// ========================================
// Internationalization (i18n) Utilities
// ========================================

export type Language = 'en' | 'ja';

export interface Translations {
  // Game phases
  phases: {
    LOBBY: string;
    SETUP: string;
    BET_PHASE_1: string;
    DEAL: string;
    ACTION_PHASE: string;
    BET_PHASE_2: string;
    SHOWDOWN: string;
  };
  
  // Common
  common: {
    chips: string;
    pot: string;
    bet: string;
    call: string;
    raise: string;
    fold: string;
    check: string;
    allIn: string;
    dealer: string;
    eliminated: string;
    victory: string;
    gameOver: string;
    home: string;
    nextRound: string;
    newGame: string;
    statistics: string;
    tutorial: string;
  };
  
  // Actions
  actions: {
    redraw: { name: string; description: string };
    search: { name: string; description: string };
    add: { name: string; description: string };
    buyJoker: { name: string; description: string };
    pass: { name: string; description: string };
  };
  
  // Hand ranks
  handRanks: {
    HIGH_CARD: string;
    ONE_PAIR: string;
    TWO_PAIR: string;
    THREE_OF_A_KIND: string;
    STRAIGHT: string;
    FLUSH: string;
    FULL_HOUSE: string;
    FOUR_OF_A_KIND: string;
    STRAIGHT_FLUSH: string;
    ROYAL_FLUSH: string;
    FIVE_OF_A_KIND: string;
  };
  
  // Messages
  messages: {
    gameStart: string;
    roundStart: string;
    blindIncrease: string;
    bettingPhase1: string;
    bettingPhase2: string;
    actionPhase: string;
    dealingCards: string;
    showdown: string;
    winner: string;
    allFolded: string;
    gameEnd: string;
    completeVictory: string;
    chipsExhausted: string;
  };
  
  // UI
  ui: {
    title: string;
    startGame: string;
    selectOpponents: string;
    vs1: string;
    vs2: string;
    vs3: string;
    homeButton: string;
    searchWarning: string;
    searchCost: string;
  };
  
  // Statistics
  stats: {
    roundsPlayed: string;
    roundsWon: string;
    giantKillings: string;
    totalChipsWon: string;
    totalChipsLost: string;
    bestHand: string;
    longestWinStreak: string;
    currentWinStreak: string;
    averageAP: string;
    actionsUsed: string;
  };
}

const translations: Record<Language, Translations> = {
  en: {
    phases: {
      LOBBY: 'Lobby',
      SETUP: 'Setup',
      BET_PHASE_1: 'Betting Phase 1',
      DEAL: 'Deal',
      ACTION_PHASE: 'Action Phase',
      BET_PHASE_2: 'Betting Phase 2',
      SHOWDOWN: 'Showdown',
    },
    common: {
      chips: 'Chips',
      pot: 'Pot',
      bet: 'Bet',
      call: 'Call',
      raise: 'Raise',
      fold: 'Fold',
      check: 'Check',
      allIn: 'ALL-IN',
      dealer: 'D',
      eliminated: 'Eliminated',
      victory: 'Victory',
      gameOver: 'Game Over',
      home: 'Home',
      nextRound: 'Next Round',
      newGame: 'New Game',
      statistics: 'Statistics',
      tutorial: 'Tutorial',
    },
    actions: {
      redraw: {
        name: 'Redraw',
        description: 'Discard 1 card, draw 1 from deck',
      },
      search: {
        name: 'Search',
        description: 'Peek at 3 cards, choose 1',
      },
      add: {
        name: 'Add',
        description: 'Add 1 card from deck (max 7)',
      },
      buyJoker: {
        name: 'Buy Joker',
        description: 'Exchange 1 card for Joker',
      },
      pass: {
        name: 'Pass',
        description: 'Use all AP and end',
      },
    },
    handRanks: {
      HIGH_CARD: 'High Card',
      ONE_PAIR: 'One Pair',
      TWO_PAIR: 'Two Pair',
      THREE_OF_A_KIND: 'Three of a Kind',
      STRAIGHT: 'Straight',
      FLUSH: 'Flush',
      FULL_HOUSE: 'Full House',
      FOUR_OF_A_KIND: 'Four of a Kind',
      STRAIGHT_FLUSH: 'Straight Flush',
      ROYAL_FLUSH: 'Royal Flush',
      FIVE_OF_A_KIND: 'Five of a Kind',
    },
    messages: {
      gameStart: 'Start the game',
      roundStart: 'Round {round} - Blinds {sb}/{bb}',
      blindIncrease: 'Round {round} - ⬆️ Blinds increased! {sb}/{bb}',
      bettingPhase1: 'Betting Phase 1 (SB: {sb} / BB: {bb})',
      bettingPhase2: 'Betting Phase 2',
      actionPhase: 'Action Phase - Use AP to strengthen your hand',
      dealingCards: 'Dealing cards',
      showdown: 'Showdown!',
      winner: '{name} wins!',
      allFolded: '{name} wins! (All others folded) {amount} chips',
      gameEnd: 'Game End',
      completeVictory: '🏆 {name} complete victory! Game over!',
      chipsExhausted: 'Chips exhausted...',
    },
    ui: {
      title: '🎲 Double Dice Poker',
      startGame: '🎲 Start Game',
      selectOpponents: 'Select Opponents',
      vs1: '1 vs 1',
      vs2: '1 vs 2',
      vs3: '1 vs 3',
      homeButton: '🏠 Return to Home',
      searchWarning: '⚠️ Cannot cancel after viewing cards',
      searchCost: '3 AP consumed',
    },
    stats: {
      roundsPlayed: 'Rounds Played',
      roundsWon: 'Rounds Won',
      giantKillings: 'Giant Killings',
      totalChipsWon: 'Total Chips Won',
      totalChipsLost: 'Total Chips Lost',
      bestHand: 'Best Hand',
      longestWinStreak: 'Longest Win Streak',
      currentWinStreak: 'Current Win Streak',
      averageAP: 'Average AP',
      actionsUsed: 'Actions Used',
    },
  },
  ja: {
    phases: {
      LOBBY: 'ロビー',
      SETUP: 'セットアップ',
      BET_PHASE_1: '第1ベッティングフェーズ',
      DEAL: '配布',
      ACTION_PHASE: 'アクションフェーズ',
      BET_PHASE_2: '第2ベッティングフェーズ',
      SHOWDOWN: 'ショーダウン',
    },
    common: {
      chips: 'チップ',
      pot: 'ポット',
      bet: 'ベット',
      call: 'コール',
      raise: 'レイズ',
      fold: 'フォールド',
      check: 'チェック',
      allIn: 'オールイン',
      dealer: 'D',
      eliminated: '脱落',
      victory: '勝利',
      gameOver: 'ゲームオーバー',
      home: 'ホーム',
      nextRound: '次のラウンドへ',
      newGame: '新しいゲームを開始',
      statistics: '統計情報',
      tutorial: 'チュートリアル',
    },
    actions: {
      redraw: {
        name: 'リドロー',
        description: '手札を1枚捨て、山札から1枚引く',
      },
      search: {
        name: 'サーチ',
        description: '山札から3枚見て1枚選ぶ',
      },
      add: {
        name: 'アド',
        description: '山札から1枚追加（最大7枚）',
      },
      buyJoker: {
        name: 'ジョーカー購入',
        description: '手札1枚をジョーカーに交換',
      },
      pass: {
        name: 'パス',
        description: 'APを全て消費して終了',
      },
    },
    handRanks: {
      HIGH_CARD: 'ハイカード',
      ONE_PAIR: 'ワンペア',
      TWO_PAIR: 'ツーペア',
      THREE_OF_A_KIND: 'スリーカード',
      STRAIGHT: 'ストレート',
      FLUSH: 'フラッシュ',
      FULL_HOUSE: 'フルハウス',
      FOUR_OF_A_KIND: 'フォーカード',
      STRAIGHT_FLUSH: 'ストレートフラッシュ',
      ROYAL_FLUSH: 'ロイヤルフラッシュ',
      FIVE_OF_A_KIND: 'ファイブカード',
    },
    messages: {
      gameStart: 'ゲームを開始してください',
      roundStart: 'ラウンド {round} - ブラインド {sb}/{bb}',
      blindIncrease: 'ラウンド {round} - ⬆️ ブラインド上昇！ {sb}/{bb}',
      bettingPhase1: '第1ベッティングフェーズ (SB: {sb} / BB: {bb})',
      bettingPhase2: '第2ベッティングフェーズ',
      actionPhase: 'アクションフェーズ - APを使って手札を強化',
      dealingCards: 'カードを配ります',
      showdown: 'ショーダウン！',
      winner: '{name} の勝利！',
      allFolded: '{name} の勝利！ (他全員フォールド) {amount} チップ獲得',
      gameEnd: 'ゲーム終了',
      completeVictory: '🏆 {name} の完全勝利！ゲーム終了！',
      chipsExhausted: 'チップが尽きてしまいました...',
    },
    ui: {
      title: '🎲 Double Dice Poker',
      startGame: '🎲 ゲーム開始',
      selectOpponents: '対戦相手を選択',
      vs1: '1 vs 1',
      vs2: '1 vs 2',
      vs3: '1 vs 3',
      homeButton: '🏠 ホームに戻る',
      searchWarning: '⚠️ カードを見たためキャンセルできません',
      searchCost: '3 AP消費済み',
    },
    stats: {
      roundsPlayed: 'プレイ回数',
      roundsWon: '勝利回数',
      giantKillings: 'ジャイアントキリング',
      totalChipsWon: '獲得チップ総額',
      totalChipsLost: '損失チップ総額',
      bestHand: '最高役',
      longestWinStreak: '最大連勝',
      currentWinStreak: '現在の連勝',
      averageAP: '平均AP',
      actionsUsed: '使用アクション',
    },
  },
};

// Get current language from localStorage or default to English
export function getLanguage(): Language {
  if (typeof window === 'undefined') return 'en';
  const saved = localStorage.getItem('language') as Language | null;
  return saved && (saved === 'en' || saved === 'ja') ? saved : 'en';
}

// Save language preference
export function setLanguage(lang: Language): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('language', lang);
  }
}

// Get translations for current language
export function t(lang: Language = getLanguage()): Translations {
  return translations[lang];
}

// Format message with placeholders
export function formatMessage(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    return values[key]?.toString() || '';
  });
}
