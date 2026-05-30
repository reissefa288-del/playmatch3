import { motion } from 'framer-motion'
import { useCallback } from 'react'
import { FiArrowLeft, FiZap } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { GameDuelBackdrop } from './components/GameDuelBackdrop'

const RULES = [
  { title: 'İKİ ALAN', text: 'Solda senin tuğla duvarın, sağda Zeynep — her biri kendi topuyla kırar.' },
  { title: 'RAKET', text: 'Parmağınla raketi kaydır; topu duvardan sektir, tuğlaları ez.' },
  { title: 'LEG', text: '45 sn veya 3200 puana ilk ulaşan leg alır. Tüm duvar +400 bonus. 3 leg, 2 galibiyet.' },
]

export function BreakoutDuelLobbyScreen() {
  const navigate = useNavigate()

  const handleBack = useCallback(() => navigate(-1), [navigate])
  const handleStart = useCallback(() => navigate('/games/breakout-duel/play'), [navigate])

  return (
    <div className="pm-app-shell pm-app-shell--game-play pm-app-shell--breakout">
      <div className="pm-artboard">
        <motion.div className="pm-breakout-lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GameDuelBackdrop />

          <button type="button" className="pm-breakout-back" onClick={handleBack} aria-label="Geri dön">
            <FiArrowLeft />
          </button>

          <div className="pm-breakout-lobby__stack">
            <header className="pm-breakout-lobby__hero">
              <p className="pm-breakout-lobby__eyebrow">1v1 DUEL</p>
              <h1 className="pm-breakout-lobby__title">
                <span className="is-neon">BREAKOUT</span>
                <span className="is-cyan">DUEL</span>
              </h1>
              <p className="pm-breakout-lobby__sub">TOP • RAKET • TUĞLA</p>
            </header>

            <ul className="pm-breakout-lobby__rules">
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

            <button type="button" className="pm-breakout-lobby__cta" onClick={handleStart}>
              MAÇA BAŞLA
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
