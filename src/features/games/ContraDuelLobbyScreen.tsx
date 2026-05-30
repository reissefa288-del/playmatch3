import { motion } from 'framer-motion'
import { useCallback } from 'react'
import { FiArrowLeft, FiZap } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { GameDuelBackdrop } from './components/GameDuelBackdrop'

const RULES = [
  { title: 'İKİ CEPHE', text: 'Solda senin Contra sahan, sağda Zeynep — platformlu orman, sağdan düşman akını.' },
  { title: 'KOŞ & ZIPLA', text: '◀▶ hareket, ▲ zıpla. Platformlardan düşme; düşman ve mermiden kaç.' },
  { title: 'ATEŞ ET', text: 'ATEŞ ile vur. 50 sn veya 4000 puan — 3 leg, 2 galibiyet.' },
]

export function ContraDuelLobbyScreen() {
  const navigate = useNavigate()

  const handleBack = useCallback(() => navigate(-1), [navigate])
  const handleStart = useCallback(() => navigate('/games/contra-duel/play'), [navigate])

  return (
    <div className="pm-app-shell pm-app-shell--game-play pm-app-shell--contra">
      <div className="pm-artboard">
        <motion.div className="pm-cx-lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GameDuelBackdrop />

          <button type="button" className="pm-cx-back" onClick={handleBack} aria-label="Geri dön">
            <FiArrowLeft />
          </button>

          <div className="pm-cx-lobby__stack">
            <header className="pm-cx-lobby__hero">
              <p className="pm-cx-lobby__eyebrow">1v1 DUEL</p>
              <h1 className="pm-cx-lobby__title">
                <span className="is-red">CONTRA</span>
                <span className="is-white">DUEL</span>
              </h1>
              <p className="pm-cx-lobby__sub">ATEŞ • ZIPLA • GEÇ</p>
            </header>

            <ul className="pm-cx-lobby__rules">
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

            <button type="button" className="pm-cx-lobby__cta" onClick={handleStart}>
              MAÇA BAŞLA
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
