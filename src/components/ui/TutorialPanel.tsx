// ========================================
// Tutorial Panel Component
// ========================================

import { motion } from 'framer-motion';
import { Button } from './Button';
import { useGameStore } from '../../store/gameStore';

interface TutorialPanelProps {
  onClose: () => void;
}

export function TutorialPanel({ onClose }: TutorialPanelProps) {
  const { getTranslations } = useGameStore();
  const t = getTranslations();
  
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
          <h2 className="text-2xl font-bold text-yellow-400">📖 {t.ui.gameRules}</h2>
          <Button variant="ghost" onClick={onClose} size="sm">
            ✕
          </Button>
        </div>
        
        <div className="space-y-4 text-white">
          {/* Basic Rules */}
          <section>
            <h3 className="text-lg font-bold text-yellow-400 mb-2">🎲 {t.ui.basicRules}</h3>
            <ul className="space-y-2 text-sm">
              {t.ui.tutorialBasicRules.map((rule: string, i: number) => (
                <li key={i}>• {rule}</li>
              ))}
            </ul>
          </section>
          
          {/* AP Actions */}
          <section>
            <h3 className="text-lg font-bold text-yellow-400 mb-2">⚡ {t.ui.apActions}</h3>
            <div className="space-y-2 text-sm">
              {t.ui.tutorialAPActions.map((action: string, i: number) => (
                <div key={i} className="bg-black/30 rounded p-2">
                  {action}
                </div>
              ))}
            </div>
          </section>
          
          {/* Giant Killing */}
          <section>
            <h3 className="text-lg font-bold text-orange-400 mb-2">🔥 {t.ui.giantKilling}</h3>
            <div className="bg-black/30 rounded p-3 text-sm">
              {t.ui.tutorialGiantKilling.map((text, i) => (
                <p key={i} className={i === 0 ? 'mb-2' : i === t.ui.tutorialGiantKilling.length - 1 ? 'mt-2 text-xs text-gray-400' : ''}>
                  {i === 0 ? <><span className="font-bold">{text.split('が')[0]}が</span>{text.split('が')[1]}</> : `• ${text}`}
                </p>
              ))}
            </div>
          </section>
          
          {/* Hand Rankings */}
          <section>
            <h3 className="text-lg font-bold text-purple-400 mb-2">🃏 {t.ui.handRankings}</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {t.ui.tutorialHandRankings.map((rank: string, i: number) => (
                <div key={i}>{rank}</div>
              ))}
            </div>
          </section>
          
          {/* Betting */}
          <section>
            <h3 className="text-lg font-bold text-green-400 mb-2">💰 {t.ui.bettingRules}</h3>
            <ul className="space-y-1 text-sm">
              {t.ui.tutorialBetting.map((bet: string, i: number) => (
                <li key={i}>• <span className="font-bold">{bet.split(':')[0]}:</span> {bet.split(':')[1]}</li>
              ))}
            </ul>
          </section>
          
          {/* Tips */}
          <section>
            <h3 className="text-lg font-bold text-blue-400 mb-2">💡 {t.ui.tips}</h3>
            <ul className="space-y-1 text-sm">
              {t.ui.tutorialTips.map((tip: string, i: number) => (
                <li key={i}>• {tip}</li>
              ))}
            </ul>
          </section>
        </div>
        
        <div className="mt-6 flex justify-center">
          <Button variant="primary" onClick={onClose} size="lg">
            {t.ui.close}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
