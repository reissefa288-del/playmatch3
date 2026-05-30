import { motion } from 'framer-motion'
import { useCallback } from 'react'
import { FiArrowLeft, FiZap } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { GameDuelBackdrop } from './components/GameDuelBackdrop'

const RULES = [
  { title: 'LODE RUNNER', text: 'Solda senin maden, sağda Zeynep — altın topla, düşmanları çukura düşür!' },
  { title: 'KAZ & TIRMAN', text: '◀▶▲▼ ile gez, merdivenden çık. ◖ KAZ / KAZ ▗ ile yanındaki tuğlayı kaz.' },
  { title: 'SKOR', text: 'Altın + tuzak bonusu. Düşman teması = can kaybı. 52 sn veya 4000 puan — 3 leg, 2 galibiyet.' },
]

export function LodeRunnerDuelLobbyScreen() {
  const navigate = useNavigate()

  const handleBack = useCallback(() => navigate(-1), [navigate])
  const handleStart = useCallback(() => navigate('/games/lode-runner-duel/play'), [navigate])

  return (
    <div className="pm-app-shell pm-app-shell--game-play pm-app-shell--lode-runner">
      <div className="pm-artboard">
        <motion.div className="pm-lr-lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GameDuelBackdrop />

          <button type="button" className="pm-lr-back" onClick={handleBack} aria-label="Geri dön">
            <FiArrowLeft />
          </button>

          <div className="pm-lr-lobby__stack">
            <header className="pm-lr-lobby__hero">
              <p className="pm-lr-lobby__eyebrow">1v1 DUEL</p>
              <h1 className="pm-lr-lobby__title">
                <span className="is-gold">LODE</span>
                <span className="is-white">RUNNER</span>
                <span className="is-gold">DUEL</span>
              </h1>
              <p className="pm-lr-lobby__sub">ALTIN • KAZ • TUZAK</p>
            </header>

            <ul className="pm-lr-lobby__rules">
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

            <button type="button" className="pm-lr-lobby__cta" onClick={handleStart}>
              MAÇA BAŞLA
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
