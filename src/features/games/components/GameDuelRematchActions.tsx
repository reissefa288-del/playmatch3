import { motion } from 'framer-motion'
import { FiLoader } from 'react-icons/fi'
import { useGameOpponent } from '../useGameOpponent'
import { useDuelRematch } from '../useDuelRematch'

type GameDuelRematchActionsProps = {
  onRestart: () => void
  onExit: () => void
  opponentName?: string
  className?: string
  primaryClassName?: string
  ghostClassName?: string
}

export function GameDuelRematchActions({
  onRestart,
  onExit,
  opponentName,
  className = '',
  primaryClassName = '',
  ghostClassName = '',
}: GameDuelRematchActionsProps) {
  const fallbackOpponent = useGameOpponent()
  const name = opponentName ?? fallbackOpponent.name
  const rematch = useDuelRematch({ onRestart })

  const primaryClass = ['pm-duel-rematch__btn', 'is-primary', primaryClassName].filter(Boolean).join(' ')
  const ghostClass = ['pm-duel-rematch__btn', 'is-ghost', ghostClassName].filter(Boolean).join(' ')

  const handleExit = () => {
    rematch.cancelWaiting()
    onExit()
  }

  if (rematch.isWaiting) {
    return (
      <div className={['pm-duel-rematch', 'is-waiting', className].filter(Boolean).join(' ')} role="status">
        <div className="pm-duel-rematch__status">
          <span className="pm-duel-rematch__spinner" aria-hidden>
            <FiLoader />
          </span>
          <p className="pm-duel-rematch__title">Rakip onayı bekleniyor</p>
          <p className="pm-duel-rematch__sub">
            Sen tekrar oynamayı kabul ettin. <strong>{name}</strong> yanıt veriyor…
          </p>
        </div>
        <div className="pm-duel-rematch__actions">
          <button type="button" className={ghostClass} onClick={handleExit}>
            Çıkış
          </button>
        </div>
      </div>
    )
  }

  if (rematch.isDeclined) {
    return (
      <div className={['pm-duel-rematch', 'is-declined', className].filter(Boolean).join(' ')} role="status">
        <motion.div
          className="pm-duel-rematch__status"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="pm-duel-rematch__title">Rakip kabul etmedi</p>
          <p className="pm-duel-rematch__sub">
            <strong>{name}</strong> rematch isteğini reddetti. Yeni maç başlatılmadı.
          </p>
        </motion.div>
        <div className="pm-duel-rematch__actions">
          <button type="button" className={ghostClass} onClick={handleExit}>
            Çıkış
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={['pm-duel-rematch', className].filter(Boolean).join(' ')}>
      <div className="pm-duel-rematch__actions">
        <button type="button" className={primaryClass} onClick={rematch.requestRematch}>
          Tekrar Oyna
        </button>
        <button type="button" className={ghostClass} onClick={handleExit}>
          Oyunlara Dön
        </button>
      </div>
    </div>
  )
}
