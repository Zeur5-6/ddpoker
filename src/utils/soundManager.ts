// ========================================
// Sound Manager - 効果音管理
// ========================================

/**
 * 効果音の種類
 * 
 * 音声ファイルを public/sounds/ フォルダに配置してください。
 * ファイル名は以下の通りです：
 * 
 * - dice-roll.mp3 / dice-roll.wav        : サイコロを振る音
 * - card-deal.mp3 / card-deal.wav        : カードを配る音
 * - card-flip.mp3 / card-flip.wav        : カードをめくる音
 * - bet.mp3 / bet.wav                    : ベットする音
 * - call.mp3 / call.wav                  : コールする音
 * - raise.mp3 / raise.wav                : レイズする音
 * - fold.mp3 / fold.wav                  : フォールドする音
 * - all-in.mp3 / all-in.wav              : オールインする音
 * - search.mp3 / search.wav               : サーチアクション
 * - add-card.mp3 / add-card.wav          : カード追加
 * - redraw.mp3 / redraw.wav               : リドロー
 * - joker.mp3 / joker.wav                : ジョーカー購入
 * - victory.mp3 / victory.wav            : 勝利
 * - defeat.mp3 / defeat.wav               : 敗北
 * - giant-killing.mp3 / giant-killing.wav : ジャイアントキリング
 * - chip-drop.mp3 / chip-drop.wav        : チップを置く音
 */

export type SoundType =
  | 'dice-roll'
  | 'card-deal'
  | 'card-flip'
  | 'bet'
  | 'call'
  | 'raise'
  | 'fold'
  | 'all-in'
  | 'search'
  | 'add-card'
  | 'redraw'
  | 'joker'
  | 'victory'
  | 'defeat'
  | 'giant-killing'
  | 'chip-drop';

class SoundManager {
  private sounds: Map<SoundType, HTMLAudioElement> = new Map();
  private enabled: boolean = true;
  private volume: number = 0.5;

  /**
   * 効果音を初期化
   * 音声ファイルが存在する場合のみ読み込みます
   */
  init() {
    const soundTypes: SoundType[] = [
      'dice-roll',
      'card-deal',
      'card-flip',
      'bet',
      'call',
      'raise',
      'fold',
      'all-in',
      'search',
      'add-card',
      'redraw',
      'joker',
      'victory',
      'defeat',
      'giant-killing',
      'chip-drop',
    ];

    soundTypes.forEach((type) => {
      // MP3とWAVの両方を試す
      const extensions = ['mp3', 'wav', 'ogg'];
      let audio: HTMLAudioElement | null = null;

      for (const ext of extensions) {
        const testAudio = new Audio(`/sounds/${type}.${ext}`);
        // ファイルが存在するかは再生時にエラーで判断
        audio = testAudio;
        break; // 最初の拡張子を試す
      }

      if (audio) {
        audio.volume = this.volume;
        audio.preload = 'auto';
        this.sounds.set(type, audio);
      }
    });
  }

  /**
   * 効果音を再生
   * @param type 効果音の種類
   * @param volume 音量（0.0-1.0、省略時はデフォルト音量）
   */
  play(type: SoundType, volume?: number) {
    if (!this.enabled) return;

    const audio = this.sounds.get(type);
    if (!audio) {
      // ファイルが存在しない場合はサイレントに失敗
      console.debug(`Sound file not found: /sounds/${type}.mp3`);
      return;
    }

    try {
      // 新しいAudioインスタンスを作成して再生（同時再生を可能にする）
      const newAudio = audio.cloneNode() as HTMLAudioElement;
      if (volume !== undefined) {
        newAudio.volume = Math.max(0, Math.min(1, volume));
      } else {
        newAudio.volume = this.volume;
      }
      newAudio.play().catch((err) => {
        // ユーザー操作なしで再生しようとした場合など、エラーを無視
        console.debug(`Failed to play sound: ${type}`, err);
      });
    } catch (err) {
      console.debug(`Error playing sound: ${type}`, err);
    }
  }

  /**
   * 効果音の有効/無効を切り替え
   */
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  /**
   * 効果音の音量を設定（0.0-1.0）
   */
  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    this.sounds.forEach((audio) => {
      audio.volume = this.volume;
    });
  }

  /**
   * 効果音が有効かどうか
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * 現在の音量
   */
  getVolume(): number {
    return this.volume;
  }
}

// シングルトンインスタンス
export const soundManager = new SoundManager();

// 初期化（アプリ起動時に呼び出す）
soundManager.init();
