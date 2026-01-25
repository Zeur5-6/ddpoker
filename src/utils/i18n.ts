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
    playerFolded: string;
    playerChecked: string;
    playerCalled: string;
    playerBet: string;
    playerRaised: string;
    playerAllIn: string;
    playerRedraw: string;
    playerSearch: string;
    playerAdd: string;
    playerBuyJoker: string;
    playerPass: string;
    winnerWithHand: string;
    giantKilling: string;
    bonusOnly: string;
    finalChips: string;
    winnerName: string;
    allPlayersDefeated: string;
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
    gameDescription: string;
    nextRound: string;
    completeVictoryTitle: string;
    gameOverTitle: string;
    chipsExhausted: string;
    betting: string;
    call: string;
    bet: string;
    raise: string;
    close: string;
    times: string;
    occurred: string;
    netProfit: string;
    won: string;
    lost: string;
    bestHand: string;
    soFar: string;
    currentStreak: string;
    averageDice: string;
    actionsUsed: string;
    redraw: string;
    search: string;
    add: string;
    joker: string;
    gameRules: string;
    basicRules: string;
    apActions: string;
    giantKilling: string;
    handRankings: string;
    bettingRules: string;
    tips: string;
    bonus2x: string;
    tutorialBasicRules: string[];
    tutorialAPActions: string[];
    tutorialGiantKilling: string[];
    tutorialHandRankings: string[];
    tutorialBetting: string[];
    tutorialTips: string[];
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
      playerFolded: '{name} folded',
      playerChecked: '{name} checked',
      playerCalled: '{name} called {amount}',
      playerBet: '{name} bet {amount}',
      playerRaised: '{name} raised to {amount}',
      playerAllIn: '{name} went ALL-IN! ({amount})',
      playerRedraw: '{name} exchanged 1 card (Cost: {cost} AP)',
      playerSearch: '{name} searched (Cost: {cost} AP)',
      playerAdd: '{name} added 1 card (Cost: {cost} AP)',
      playerBuyJoker: '{name} bought a Joker! (Cost: {cost} AP)',
      playerPass: '{name} passed',
      winnerWithHand: '{name} wins! {hand} for {amount} chips',
      giantKilling: '🎉 GIANT KILLING! 🎉 {name} made a comeback with AP {ap}! {message} + Bonus {bonus} ({type})',
      bonusOnly: '{message} + Bonus {bonus} ({type})',
      finalChips: '{name} final chips: {chips}',
      winnerName: 'Winner: {name}',
      allPlayersDefeated: 'Defeated all players!',
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
      gameDescription: 'Use AP (Action Points) determined by dice to strengthen your hand and compete in poker!',
      nextRound: 'Next Round',
      completeVictoryTitle: 'Complete Victory!',
      gameOverTitle: 'Game Over',
      chipsExhausted: 'Chips exhausted...',
      betting: 'Betting',
      call: 'Call',
      bet: 'Bet',
      raise: 'Raise',
      close: 'Close',
      times: 'times',
      occurred: 'occurred',
      netProfit: 'Net Profit',
      won: 'Won',
      lost: 'Lost',
      bestHand: 'Best Hand',
      soFar: 'so far',
      currentStreak: 'Current: {streak} win streak',
      averageDice: 'Average dice value',
      actionsUsed: 'Actions Used',
      redraw: 'Redraw',
      search: 'Search',
      add: 'Add',
      joker: 'Joker',
      gameRules: 'Game Rules',
      basicRules: 'Basic Rules',
      apActions: 'AP Actions',
      giantKilling: 'Giant Killing',
      handRankings: 'Hand Rankings (weakest to strongest)',
      bettingRules: 'Betting',
      tips: 'Tips',
      bonus2x: '💰 Bonus 2x! 💰',
      tutorialBasicRules: [
        'Roll 2 dice to determine AP (Action Points)',
        'If you roll doubles (same number), you can buy a Joker',
        '5 cards are dealt each round',
        'Use AP to strengthen your hand',
        'Compete in betting phases',
      ],
      tutorialAPActions: [
        '🔄 Redraw (1AP): Discard 1 card, draw 1 from deck',
        '🔍 Search (4AP): Peek at 3 cards, choose 1, discard 1 from hand (cannot cancel)',
        '➕ Add (3AP): Add 1 card from deck (max 7 cards)',
        '🃏 Buy Joker (AP/2): Only when rolling doubles. Exchange 1 card for Joker',
      ],
      tutorialGiantKilling: [
        'When a player with AP 4 or less wins, a special bonus occurs!',
        'Loser AP ≤ 10 → 1.5x bonus (text only)',
        'Loser AP ≥ 11 → 2.0x bonus (with animation)',
        'When defeating multiple opponents, appropriate multipliers are applied per loser',
      ],
      tutorialHandRankings: [
        'High Card', 'One Pair', 'Two Pair', 'Three of a Kind',
        'Straight', 'Flush', 'Full House', 'Four of a Kind',
        'Straight Flush', 'Royal Flush', 'Five of a Kind (Joker)',
      ],
      tutorialBetting: [
        'Check: Pass without betting',
        'Bet: Place the first bet',
        'Call: Match the current bet amount',
        'Raise: Increase the bet amount',
        'Fold: Give up',
        'All-In: Bet all chips',
      ],
      tutorialTips: [
        'Hand strength is displayed',
        'Low AP can still win with Giant Killing!',
        'Search is powerful but cannot be cancelled once viewed',
        'The strongest 5 cards are selected from 7 cards in hand',
        'Side pot system ensures fair distribution even with all-ins',
      ],
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
      playerFolded: '{name} がフォールド',
      playerChecked: '{name} がチェック',
      playerCalled: '{name} が {amount} でコール',
      playerBet: '{name} が {amount} をベット',
      playerRaised: '{name} が {amount} にレイズ',
      playerAllIn: '{name} がオールイン！ ({amount})',
      playerRedraw: '{name} が1枚交換 (コスト: {cost} AP)',
      playerSearch: '{name} がサーチ (コスト: {cost} AP)',
      playerAdd: '{name} が1枚追加 (コスト: {cost} AP)',
      playerBuyJoker: '{name} がジョーカーを購入！ (コスト: {cost} AP)',
      playerPass: '{name} がパス',
      winnerWithHand: '{name} の勝利！ {hand} で {amount} チップ獲得',
      giantKilling: '🎉 GIANT KILLING! 🎉 {name} がAP {ap} で大逆転！ {message} + ボーナス {bonus} ({type})',
      bonusOnly: '{message} + ボーナス {bonus} ({type})',
      finalChips: '{name} の最終チップ: {chips}',
      winnerName: '勝者: {name}',
      allPlayersDefeated: '全員のプレイヤーを倒しました！',
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
      gameDescription: 'サイコロで決まるAP（行動ポイント）を使って手札を強化し、ポーカーで勝負！',
      nextRound: '次のラウンドへ',
      completeVictoryTitle: '完全勝利！',
      gameOverTitle: 'ゲームオーバー',
      chipsExhausted: 'チップが尽きてしまいました...',
      betting: 'ベッティング',
      call: 'コール',
      bet: 'ベット',
      raise: 'レイズ',
      close: '閉じる',
      times: '回',
      occurred: '発生',
      netProfit: '純利益',
      won: '獲得',
      lost: '損失',
      bestHand: '最高の手',
      soFar: 'これまでに出した',
      currentStreak: '現在: {streak}連勝',
      averageDice: 'サイコロの平均値',
      actionsUsed: '使用したアクション',
      redraw: 'リドロー',
      search: 'サーチ',
      add: 'アド',
      joker: 'ジョーカー',
      gameRules: 'ゲームのルール',
      basicRules: '基本ルール',
      apActions: 'APアクション',
      giantKilling: 'ジャイアントキリング',
      handRankings: '手の強さ（弱い順）',
      bettingRules: 'ベッティング',
      tips: 'ヒント',
      bonus2x: '💰 ボーナス 2倍！ 💰',
      tutorialBasicRules: [
        'サイコロを2つ振ってAP（行動ポイント）を決定します',
        'ゾロ目（同じ数字）が出ると、ジョーカーを購入できます',
        '各ラウンドで5枚のカードが配られます',
        'APを使って手札を強化できます',
        'ベッティングフェーズで勝負します',
      ],
      tutorialAPActions: [
        '🔄 リドロー (1AP): 手札を1枚捨て、山札から1枚引く',
        '🔍 サーチ (4AP): 山札から3枚見て1枚選び、手札から1枚捨てる（キャンセル不可）',
        '➕ アド (3AP): 山札から1枚追加（最大7枚まで）',
        '🃏 ジョーカー購入 (AP/2): ゾロ目時のみ。手札1枚をジョーカーに交換',
      ],
      tutorialGiantKilling: [
        'APが4以下のプレイヤーが勝利すると、特別なボーナスが発生します！',
        '敗者のAPが10以下 → 1.5倍ボーナス（表記のみ）',
        '敗者のAPが11以上 → 2.0倍ボーナス（演出あり）',
        '複数の相手を倒した場合、各敗者ごとに適切な倍率が適用されます',
      ],
      tutorialHandRankings: [
        'ハイカード', 'ワンペア', 'ツーペア', 'スリーカード',
        'ストレート', 'フラッシュ', 'フルハウス', 'フォーカード',
        'ストレートフラッシュ', 'ロイヤルフラッシュ', 'ファイブカード（ジョーカー）',
      ],
      tutorialBetting: [
        'チェック: ベットせずにパス',
        'ベット: 最初のベットを置く',
        'コール: 現在のベット額に合わせる',
        'レイズ: ベット額を上げる',
        'フォールド: 降りる',
        'オールイン: 全チップを賭ける',
      ],
      tutorialTips: [
        '手の強さが表示されます',
        '低APでもジャイアントキリングで逆転可能！',
        'サーチは強力ですが、一度見たらキャンセルできません',
        '7枚の手札から最強の5枚が選ばれます',
        'サイドポットシステムで、オールイン時も公平に分配されます',
      ],
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
