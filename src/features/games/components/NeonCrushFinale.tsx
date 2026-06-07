import { AnimatePresence, motion } from 'framer-motion'
import { GameDuelRematchActions } from './GameDuelRematchActions'

type Props = {
  winner: 'p1' | 'p2' | 'draw'
  p1Score: number
  p2Score: number
  onRestart: () => void
  onExit: () => void
  opponentName?: string
}

function formatScore(n: number) {
  return n.toLocaleString('tr-TR')
}

/** Kompakt maç sonucu — tahtalar görünür kalır, sıralama yok */
export function NeonCrushFinale({ winner, p1Score, p2Score, onRestart, onExit, opponentName }: Props) {
  const headline =
    winner === 'draw' ? 'BERABERE' : winner === 'p1' ? 'KAZANDIN!' : 'KAYBETTİN'

  return (
    <AnimatePresence>
      <motion.div
        className={`pm-ncrush-result is-${winner}`}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        role="status"
        aria-label="Maç sonucu"
      >
        <div className="pm-ncrush-result__scores">
          <span className="is-p1">
            EMİR <strong>{formatScore(p1Score)}</strong>
          </span>
          <span className="pm-ncrush-result__headline">{headline}</span>
          <span className="is-p2">
            ZEYNEP <strong>{formatScore(p2Score)}</strong>
          </span>
        </div>
        <GameDuelRematchActions
          onRestart={onRestart}
          onExit={onExit}
          opponentName={opponentName}
          primaryClassName="pm-ncrush-result__cta"
        />
      </motion.div>
    </AnimatePresence>
  )
}
