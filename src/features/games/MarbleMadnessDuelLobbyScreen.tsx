import { motion } from 'framer-motion'
import { useCallback } from 'react'
import { FiArrowLeft, FiZap } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { GameDuelBackdrop } from './components/GameDuelBackdrop'

const RULES = [
  { title: 'İKİ LABİRENT', text: 'Solda senin Marble Madness sahan, sağda Zeynep — aynı parkur.' },
  { title: 'YUVARLAN & TOPLA', text: 'Üste çık hedefe ulaş (+1100). Mücevherler ve ilerleme puanı. Çukura düşme!' },
  { title: 'LEG', text: '46 sn veya 3300 puana ilk ulaşan leg alır. Avcılardan kaç — 3 leg, 2 galibiyet.' },
]

export function MarbleMadnessDuelLobbyScreen() {
  const navigate = useNavigate()

  const handleBack = useCallback(() => navigate(-1), [navigate])
  const handleStart = useCallback(() => navigate('/games/marble-madness-duel/play'), [navigate])

  return (
    <div className="pm-app-shell pm-app-shell--game-play pm-app-shell--marble">
      <div className="pm-artboard">
        <motion.div className="pm-mm-lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GameDuelBackdrop />

          <button type="button" className="pm-mm-back" onClick={handleBack} aria-label="Geri dön">
            <FiArrowLeft />
          </button>

          <div className="pm-mm-lobby__stack">
            <header className="pm-mm-lobby__hero">
              <p className="pm-mm-lobby__eyebrow">1v1 DUEL</p>
              <h1 className="pm-mm-lobby__title">
                <span className="is-teal">MARBLE</span>
                <span className="is-violet">MADNESS</span>
              </h1>
              <p className="pm-mm-lobby__sub">YUVARLAN • HEDEF • AVCI</p>
            </header>

            <ul className="pm-mm-lobby__rules">
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

            <button type="button" className="pm-mm-lobby__cta" onClick={handleStart}>
              MAÇA BAŞLA
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
