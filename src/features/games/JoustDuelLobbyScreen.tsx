import { motion } from 'framer-motion'
import { useCallback } from 'react'
import { FiArrowLeft, FiZap } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { GameDuelBackdrop } from './components/GameDuelBackdrop'

const RULES = [
  { title: 'İKİ ARENA', text: 'Solda senin Joust sahan, sağda Zeynep — lav ve platformlar aynı düzen.' },
  { title: 'YUKARIDAN VUR', text: '◀ ▶ ile süzül, ÇIRP ile yüksel. Rakipten yüksekken çarpışırsan puan alırsın.' },
  { title: 'LEG', text: '48 sn veya 3600 puana ilk ulaşan leg alır. Lavaya düşme! 3 leg, 2 galibiyet.' },
]

export function JoustDuelLobbyScreen() {
  const navigate = useNavigate()

  const handleBack = useCallback(() => navigate(-1), [navigate])
  const handleStart = useCallback(() => navigate('/games/joust-duel/play'), [navigate])

  return (
    <div className="pm-app-shell pm-app-shell--game-play pm-app-shell--joust">
      <div className="pm-artboard">
        <motion.div className="pm-joust-lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GameDuelBackdrop />

          <button type="button" className="pm-joust-back" onClick={handleBack} aria-label="Geri dön">
            <FiArrowLeft />
          </button>

          <div className="pm-joust-lobby__stack">
            <header className="pm-joust-lobby__hero">
              <p className="pm-joust-lobby__eyebrow">1v1 DUEL</p>
              <h1 className="pm-joust-lobby__title">
                <span className="is-gold">JOUST</span>
                <span className="is-cyan">DUEL</span>
              </h1>
              <p className="pm-joust-lobby__sub">ÇIRP • YÜKSEK • VUR</p>
            </header>

            <ul className="pm-joust-lobby__rules">
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

            <button type="button" className="pm-joust-lobby__cta" onClick={handleStart}>
              MAÇA BAŞLA
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
