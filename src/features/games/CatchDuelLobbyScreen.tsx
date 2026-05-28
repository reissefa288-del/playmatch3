import { motion } from 'framer-motion'
import { useCallback } from 'react'
import { FiArrowLeft, FiZap } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { GameDuelBackdrop } from './components/GameDuelBackdrop'

const RULES = [
  { title: 'İKİ EKRAN', text: 'Solda senin, sağda rakibin şeridi — simgeler yukarıdan düşer.' },
  { title: 'YAKALA', text: 'Simgeler yeşil bölgeye gelince o şeride dokun. Combo puanı artırır.' },
  { title: 'LEG', text: '40 sn veya 2800 puana ilk ulaşan leg alır. 3 leg, 2 galibiyet.' },
]

export function CatchDuelLobbyScreen() {
  const navigate = useNavigate()

  const handleBack = useCallback(() => navigate(-1), [navigate])
  const handleStart = useCallback(() => navigate('/games/catch-duel/play'), [navigate])

  return (
    <div className="pm-app-shell pm-app-shell--game-play pm-app-shell--catch">
      <div className="pm-artboard">
        <motion.div className="pm-catch-lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GameDuelBackdrop />

          <button type="button" className="pm-catch-back" onClick={handleBack} aria-label="Geri dön">
            <FiArrowLeft />
          </button>

          <div className="pm-catch-lobby__stack">
            <header className="pm-catch-lobby__hero">
              <p className="pm-catch-lobby__eyebrow">1v1 DUEL</p>
              <h1 className="pm-catch-lobby__title">
                <span className="is-gold">CATCH</span>
                <span className="is-mint">DUEL</span>
              </h1>
              <p className="pm-catch-lobby__sub">DÜŞEN • YAKALA • KAZAN</p>
            </header>

            <ul className="pm-catch-lobby__rules">
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

            <button type="button" className="pm-catch-lobby__cta" onClick={handleStart}>
              MAÇA BAŞLA
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
