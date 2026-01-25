// ========================================
// Statistics Panel Component
// ========================================

import { motion } from 'framer-motion';
import { GameStatistics } from '../../core/types';
import { getHandRankName } from '../../core/poker/HandEvaluator';
import { Button } from './Button';

interface StatisticsPanelProps {
  statistics: GameStatistics;
  onClose: () => void;
}

export function StatisticsPanel({ statistics, onClose }: StatisticsPanelProps) {
  const winRate = statistics.roundsPlayed > 0
    ? Math.round((statistics.roundsWon / statistics.roundsPlayed) * 100)
    : 0;
  
  const netChips = statistics.totalChipsWon - statistics.totalChipsLost;
  
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
        className="bg-gradient-to-br from-emerald-900/95 to-emerald-950/95 border-2 border-yellow-400/30 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-yellow-400">📊 統計情報</h2>
          <Button variant="ghost" onClick={onClose} size="sm">
            ✕
          </Button>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {/* Win Rate */}
          <div className="bg-black/30 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">勝率</div>
            <div className="text-3xl font-bold text-green-400">{winRate}%</div>
            <div className="text-gray-500 text-xs mt-1">
              {statistics.roundsWon}勝 / {statistics.roundsPlayed}戦
            </div>
          </div>
          
          {/* Giant Killings */}
          <div className="bg-black/30 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">ジャイアントキリング</div>
            <div className="text-3xl font-bold text-orange-400">{statistics.giantKillings}</div>
            <div className="text-gray-500 text-xs mt-1">回発生</div>
          </div>
          
          {/* Net Chips */}
          <div className="bg-black/30 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">純利益</div>
            <div className={`text-3xl font-bold ${netChips >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {netChips >= 0 ? '+' : ''}{netChips.toLocaleString()}
            </div>
            <div className="text-gray-500 text-xs mt-1">
              獲得: {statistics.totalChipsWon.toLocaleString()} / 損失: {statistics.totalChipsLost.toLocaleString()}
            </div>
          </div>
          
          {/* Best Hand */}
          <div className="bg-black/30 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">最高の手</div>
            <div className="text-xl font-bold text-purple-400">
              {getHandRankName(statistics.bestHand)}
            </div>
            <div className="text-gray-500 text-xs mt-1">これまでに出した</div>
          </div>
          
          {/* Win Streak */}
          <div className="bg-black/30 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">連勝記録</div>
            <div className="text-2xl font-bold text-yellow-400">{statistics.longestWinStreak}</div>
            <div className="text-gray-500 text-xs mt-1">
              現在: {statistics.currentWinStreak}連勝
            </div>
          </div>
          
          {/* Average AP */}
          <div className="bg-black/30 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">平均AP</div>
            <div className="text-2xl font-bold text-blue-400">{statistics.averageAP}</div>
            <div className="text-gray-500 text-xs mt-1">サイコロの平均値</div>
          </div>
        </div>
        
        {/* Actions Used */}
        <div className="mt-4 bg-black/30 rounded-lg p-4">
          <div className="text-gray-400 text-sm mb-3">使用したアクション</div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-300">🔄 リドロー:</span>
              <span className="text-white font-bold">{statistics.actionsUsed.redraw}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">🔍 サーチ:</span>
              <span className="text-white font-bold">{statistics.actionsUsed.search}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">➕ アド:</span>
              <span className="text-white font-bold">{statistics.actionsUsed.add}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">🃏 ジョーカー:</span>
              <span className="text-white font-bold">{statistics.actionsUsed.buyJoker}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
