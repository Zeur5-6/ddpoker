// ========================================
// Tutorial Panel Component
// ========================================

import { motion } from 'framer-motion';
import { Button } from './Button';

interface TutorialPanelProps {
  onClose: () => void;
}

export function TutorialPanel({ onClose }: TutorialPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-gradient-to-br from-emerald-900/95 to-emerald-950/95 border-2 border-yellow-400/30 rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-yellow-400">📖 ゲームのルール</h2>
          <Button variant="ghost" onClick={onClose} size="sm">
            ✕
          </Button>
        </div>
        
        <div className="space-y-4 text-white">
          {/* Basic Rules */}
          <section>
            <h3 className="text-lg font-bold text-yellow-400 mb-2">🎲 基本ルール</h3>
            <ul className="space-y-2 text-sm">
              <li>• サイコロを2つ振ってAP（行動ポイント）を決定します</li>
              <li>• ゾロ目（同じ数字）が出ると、ジョーカーを購入できます</li>
              <li>• 各ラウンドで5枚のカードが配られます</li>
              <li>• APを使って手札を強化できます</li>
              <li>• ベッティングフェーズで勝負します</li>
            </ul>
          </section>
          
          {/* AP Actions */}
          <section>
            <h3 className="text-lg font-bold text-yellow-400 mb-2">⚡ APアクション</h3>
            <div className="space-y-2 text-sm">
              <div className="bg-black/30 rounded p-2">
                <span className="font-bold text-green-400">🔄 リドロー (1AP):</span>
                <span className="ml-2">手札を1枚捨て、山札から1枚引く</span>
              </div>
              <div className="bg-black/30 rounded p-2">
                <span className="font-bold text-blue-400">🔍 サーチ (4AP):</span>
                <span className="ml-2">山札から3枚見て1枚選び、手札から1枚捨てる（キャンセル不可）</span>
              </div>
              <div className="bg-black/30 rounded p-2">
                <span className="font-bold text-purple-400">➕ アド (3AP):</span>
                <span className="ml-2">山札から1枚追加（最大7枚まで）</span>
              </div>
              <div className="bg-black/30 rounded p-2">
                <span className="font-bold text-yellow-400">🃏 ジョーカー購入 (AP/2):</span>
                <span className="ml-2">ゾロ目時のみ。手札1枚をジョーカーに交換</span>
              </div>
            </div>
          </section>
          
          {/* Giant Killing */}
          <section>
            <h3 className="text-lg font-bold text-orange-400 mb-2">🔥 ジャイアントキリング</h3>
            <div className="bg-black/30 rounded p-3 text-sm">
              <p className="mb-2">
                <span className="font-bold">APが4以下のプレイヤー</span>が勝利すると、特別なボーナスが発生します！
              </p>
              <ul className="space-y-1 ml-4">
                <li>• 敗者のAPが10以下 → <span className="text-yellow-400">1.5倍ボーナス</span>（表記のみ）</li>
                <li>• 敗者のAPが11以上 → <span className="text-orange-400">2.0倍ボーナス</span>（演出あり）</li>
              </ul>
              <p className="mt-2 text-xs text-gray-400">
                複数の相手を倒した場合、各敗者ごとに適切な倍率が適用されます
              </p>
            </div>
          </section>
          
          {/* Hand Rankings */}
          <section>
            <h3 className="text-lg font-bold text-purple-400 mb-2">🃏 手の強さ（弱い順）</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>ハイカード</div>
              <div>ワンペア</div>
              <div>ツーペア</div>
              <div>スリーカード</div>
              <div>ストレート</div>
              <div>フラッシュ</div>
              <div>フルハウス</div>
              <div>フォーカード</div>
              <div>ストレートフラッシュ</div>
              <div>ロイヤルフラッシュ</div>
              <div>ファイブカード（ジョーカー）</div>
            </div>
          </section>
          
          {/* Betting */}
          <section>
            <h3 className="text-lg font-bold text-green-400 mb-2">💰 ベッティング</h3>
            <ul className="space-y-1 text-sm">
              <li>• <span className="font-bold">チェック:</span> ベットせずにパス</li>
              <li>• <span className="font-bold">ベット:</span> 最初のベットを置く</li>
              <li>• <span className="font-bold">コール:</span> 現在のベット額に合わせる</li>
              <li>• <span className="font-bold">レイズ:</span> ベット額を上げる</li>
              <li>• <span className="font-bold">フォールド:</span> 降りる</li>
              <li>• <span className="font-bold">オールイン:</span> 全チップを賭ける</li>
            </ul>
          </section>
          
          {/* Tips */}
          <section>
            <h3 className="text-lg font-bold text-blue-400 mb-2">💡 ヒント</h3>
            <ul className="space-y-1 text-sm">
              <li>• 手の強さが表示されます（%で表示）</li>
              <li>• 低APでもジャイアントキリングで逆転可能！</li>
              <li>• サーチは強力ですが、一度見たらキャンセルできません</li>
              <li>• 7枚の手札から最強の5枚が選ばれます</li>
              <li>• サイドポットシステムで、オールイン時も公平に分配されます</li>
            </ul>
          </section>
        </div>
        
        <div className="mt-6 flex justify-center">
          <Button variant="primary" onClick={onClose} size="lg">
            閉じる
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
