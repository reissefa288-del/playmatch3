import { motion } from 'framer-motion'
import { useCallback } from 'react'
import { FiArrowLeft, FiZap } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { GameDuelBackdrop } from './components/GameDuelBackdrop'

const RULES = [
  { title: 'İKİ ARENA', text: 'Solda senin Robotron sahan, sağda Zeynep — her biri kendi robot dalgasıyla.' },
  { title: 'ÇİFT STİCK', text: 'D-pad ile hareket, son yön ateş yönü. ATEŞ ile robotları vur, 👤 insanları kurtar.' },
  { title: 'LEG', text: '46 sn veya 4000 puana ilk ulaşan leg alır. 3 leg, 2 galibiyet.' },
]

export function RobotronDuelLobbyScreen() {
  const navigate = useNavigate()

  const handleBack = useCallback(() => navigate(-1), [navigate])
  const handleStart = useCallback(() => navigate('/games/robotron-duel/play'), [navigate])

  return (
    <div className="pm-app-shell pm-app-shell--game-play pm-app-shell--robotron">
      <div className="pm-artboard">
        <motion.div className="pm-robotron-lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GameDuelBackdrop />

          <button type="button" className="pm-robotron-back" onClick={handleBack} aria-label="Geri dön">
            <FiArrowLeft />
          </button>

          <div className="pm-robotron-lobby__stack">
            <header className="pm-robotron-lobby__hero">
              <p className="pm-robotron-lobby__eyebrow">1v1 DUEL</p>
              <h1 className="pm-robotron-lobby__title">
                <span className="is-yellow">ROBOTRON</span>
                <span className="is-cyan">DUEL</span>
              </h1>
              <p className="pm-robotron-lobby__sub">ROBOT • İNSAN • IŞIN</p>
            </header>

            <ul className="pm-robotron-lobby__rules">
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

            <button type="button" className="pm-robotron-lobby__cta" onClick={handleStart}>
              MAÇA BAŞLA
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
