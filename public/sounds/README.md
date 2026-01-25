# 効果音ファイルの配置場所

このフォルダに効果音ファイルを配置してください。

## ファイル名とタイミング

以下のファイル名で配置すると、対応するタイミングで自動的に再生されます：

### ゲーム基本アクション
- **dice-roll.mp3** (または .wav, .ogg)
  - タイミング: サイコロを振る時
  - 例: `rollDiceAndSetup()` が呼ばれた時

- **card-deal.mp3**
  - タイミング: カードを配る時
  - 例: `dealCards()` が呼ばれた時

- **card-flip.mp3**
  - タイミング: カードをめくる/表示する時
  - 例: ショーダウンでカードを表示する時

### ベッティングアクション
- **bet.mp3**
  - タイミング: ベットする時
  - 例: `placeBet('bet', amount)` が呼ばれた時

- **call.mp3**
  - タイミング: コールする時
  - 例: `placeBet('call', amount)` が呼ばれた時

- **raise.mp3**
  - タイミング: レイズする時
  - 例: `placeBet('raise', amount)` が呼ばれた時

- **fold.mp3**
  - タイミング: フォールドする時
  - 例: `placeBet('fold')` が呼ばれた時

- **all-in.mp3**
  - タイミング: オールインする時
  - 例: `placeBet('all-in', amount)` が呼ばれた時

- **chip-drop.mp3**
  - タイミング: チップを置く音（ベット/コール/レイズ時にも再生）
  - 例: ベッティングアクション全般

### APアクション
- **search.mp3**
  - タイミング: サーチアクションを実行する時
  - 例: `performAction('search', cardIndex, searchSelection)` が呼ばれた時

- **add-card.mp3**
  - タイミング: カードを追加する時
  - 例: `performAction('add')` が呼ばれた時

- **redraw.mp3**
  - タイミング: リドローする時
  - 例: `performAction('redraw', cardIndex)` が呼ばれた時

- **joker.mp3**
  - タイミング: ジョーカーを購入する時
  - 例: `performAction('buyJoker', cardIndex)` が呼ばれた時

### ゲーム結果
- **victory.mp3**
  - タイミング: 勝利した時
  - 例: ショーダウンで勝利した時、全員を倒した時

- **defeat.mp3**
  - タイミング: 敗北した時
  - 例: チップが0になった時

- **giant-killing.mp3**
  - タイミング: ジャイアントキリングが発生した時
  - 例: ショーダウンでジャイアントキリングが発生した時

## ファイル形式

以下の形式がサポートされています：
- MP3 (.mp3) - 推奨
- WAV (.wav)
- OGG (.ogg)

## 使用方法

1. このフォルダに音声ファイルを配置
2. ファイル名は上記のリストに従ってください
3. アプリを起動すると自動的に読み込まれます
4. ファイルが存在しない場合は、エラーなくスキップされます

## 音量調整

ゲーム内で音量を調整する機能を追加することもできます。
現在のデフォルト音量は 50% です。

## 無料の効果音リソース

以下のサイトから無料の効果音をダウンロードできます：
- [Freesound](https://freesound.org/)
- [Zapsplat](https://www.zapsplat.com/)
- [Mixkit](https://mixkit.co/free-sound-effects/)
