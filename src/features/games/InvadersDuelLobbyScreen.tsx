import { motion } from 'framer-motion'
import { useCallback } from 'react'
import { FiArrowLeft, FiZap } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { GameDuelBackdrop } from './components/GameDuelBackdrop'

const RULES = [
  { title: 'İKİ EKRAN', text: 'Solda senin uzay sahan, sağda Zeynep — her biri kendi istilacı dalgası.' },
  { title: 'SAVUN', text: 'Parmağınla gemiyi kaydır, ATEŞ ile vur. Kalkanları ve istilacıları yok et.' },
  { title: 'LEG', text: '45 sn veya 4000 puana ilk ulaşan leg alır. 3 leg, 2 galibiyet.' },
]

export function InvadersDuelLobbyScreen() {
  const navigate = useNavigate()

  const handleBack = useCallback(() => navigate(-1), [navigate])
  const handleStart = useCallback(() => navigate('/games/invaders-duel/play'), [navigate])

  return (
    <div className="pm-app-shell pm-app-shell--game-play pm-app-shell--invaders">
      <div className="pm-artboard">
        <motion.div className="pm-invaders-lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GameDuelBackdrop />

          <button type="button" className="pm-invaders-back" onClick={handleBack} aria-label="Geri dön">
            <FiArrowLeft />
          </button>

          <div className="pm-invaders-lobby__stack">
            <header className="pm-invaders-lobby__hero">
              <p className="pm-invaders-lobby__eyebrow">1v1 DUEL</p>
              <h1 className="pm-invaders-lobby__title">
                <span className="is-lime">INVADERS</span>
                <span className="is-cyan">DUEL</span>
              </h1>
              <p className="pm-invaders-lobby__sub">İSTİLA • KALKAN • KAZAN</p>
            </header>

            <ul className="pm-invaders-lobby__rules">
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

            <button type="button" className="pm-invaders-lobby__cta" onClick={handleStart}>
              MAÇA BAŞLA
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
