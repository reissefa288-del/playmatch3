import { motion } from 'framer-motion'
import { useCallback } from 'react'
import { FiArrowLeft, FiZap } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { GameDuelBackdrop } from './components/GameDuelBackdrop'

const RULES = [
  { title: 'SPACE HARRIER', text: 'Solda senin 3D tünel, sağda Zeynep — uçan kahramanla düşman dalgalarını vur!' },
  { title: 'UÇ & ATEŞ', text: 'Parmağınla uç. ATEŞ ile mermi gönder. Düşmanlar ufaktan büyüyerek yaklaşır — kaç!' },
  { title: 'SKOR', text: 'Vuruş + dalga bonusu. 48 sn veya 4000 puan — 3 leg, 2 galibiyet.' },
]

export function SpaceHarrierDuelLobbyScreen() {
  const navigate = useNavigate()

  const handleBack = useCallback(() => navigate(-1), [navigate])
  const handleStart = useCallback(() => navigate('/games/space-harrier-duel/play'), [navigate])

  return (
    <div className="pm-app-shell pm-app-shell--game-play pm-app-shell--space-harrier">
      <div className="pm-artboard">
        <motion.div className="pm-sh-lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GameDuelBackdrop />

          <button type="button" className="pm-sh-back" onClick={handleBack} aria-label="Geri dön">
            <FiArrowLeft />
          </button>

          <div className="pm-sh-lobby__stack">
            <header className="pm-sh-lobby__hero">
              <p className="pm-sh-lobby__eyebrow">1v1 DUEL</p>
              <h1 className="pm-sh-lobby__title">
                <span className="is-magenta">SPACE</span>
                <span className="is-cyan">HARRIER</span>
                <span className="is-white">DUEL</span>
              </h1>
              <p className="pm-sh-lobby__sub">3D TÜNEL • UÇUŞ • ATEŞ</p>
            </header>

            <ul className="pm-sh-lobby__rules">
              {RULES.map((rule) => (
                <li key={rule.title}>
                  <FiZap aria-hidden />
                  <div>
                    <strong>{rule.title}</strong>
                    <span>{rule.text}</span>
                  </div>
                </li>
              ))}
            </ul>

            <button type="button" className="pm-sh-lobby__cta" onClick={handleStart}>
              MAÇA BAŞLA
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
