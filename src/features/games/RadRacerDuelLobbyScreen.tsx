import { motion } from 'framer-motion'
import { useCallback } from 'react'
import { FiArrowLeft, FiZap } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { GameDuelBackdrop } from './components/GameDuelBackdrop'

const RULES = [
  { title: 'VİRAJLI YOL', text: 'Solda senin Rad Racer sahan, sağda Zeynep — virajları takip et, çimen = yavaşlama!' },
  { title: 'SÜR & SOLLAMA', text: '◀▶ ile şerit değiştir; trafiği sollayıp puan topla. Çarpışma = can kaybı.' },
  { title: 'TURBO', text: 'TURBO ile hızlan. 50 sn veya 4000 puan — 3 leg, 2 galibiyet.' },
]

export function RadRacerDuelLobbyScreen() {
  const navigate = useNavigate()

  const handleBack = useCallback(() => navigate(-1), [navigate])
  const handleStart = useCallback(() => navigate('/games/rad-racer-duel/play'), [navigate])

  return (
    <div className="pm-app-shell pm-app-shell--game-play pm-app-shell--rad-racer">
      <div className="pm-artboard">
        <motion.div className="pm-rr-lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GameDuelBackdrop />

          <button type="button" className="pm-rr-back" onClick={handleBack} aria-label="Geri dön">
            <FiArrowLeft />
          </button>

          <div className="pm-rr-lobby__stack">
            <header className="pm-rr-lobby__hero">
              <p className="pm-rr-lobby__eyebrow">1v1 DUEL</p>
              <h1 className="pm-rr-lobby__title">
                <span className="is-red">RAD</span>
                <span className="is-blue">RACER</span>
                <span className="is-white">DUEL</span>
              </h1>
              <p className="pm-rr-lobby__sub">VİRAJ • SOLLAMA • TURBO</p>
            </header>

            <ul className="pm-rr-lobby__rules">
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

            <button type="button" className="pm-rr-lobby__cta" onClick={handleStart}>
              MAÇA BAŞLA
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
