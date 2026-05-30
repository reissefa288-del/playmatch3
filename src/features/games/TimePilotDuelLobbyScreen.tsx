import { motion } from 'framer-motion'
import { useCallback } from 'react'
import { FiArrowLeft, FiZap } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { GameDuelBackdrop } from './components/GameDuelBackdrop'

const RULES = [
  { title: 'İKİ ZAMAN', text: 'Solda senin Time Pilot sahan, sağda Zeynep — aynı çağlar, ayrı skor.' },
  { title: 'UÇ & ZAMANLA', text: 'D-pad veya parmağınla uçağı kaydır; ATEŞ son yöne. 1910→1940→1970→1982 döngüsü!' },
  { title: 'LEG', text: '46 sn veya 3900 puana ilk ulaşan leg alır. 3 leg, 2 galibiyet.' },
]

export function TimePilotDuelLobbyScreen() {
  const navigate = useNavigate()

  const handleBack = useCallback(() => navigate(-1), [navigate])
  const handleStart = useCallback(() => navigate('/games/time-pilot-duel/play'), [navigate])

  return (
    <div className="pm-app-shell pm-app-shell--game-play pm-app-shell--time-pilot">
      <div className="pm-artboard">
        <motion.div className="pm-tp-lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GameDuelBackdrop />

          <button type="button" className="pm-tp-back" onClick={handleBack} aria-label="Geri dön">
            <FiArrowLeft />
          </button>

          <div className="pm-tp-lobby__stack">
            <header className="pm-tp-lobby__hero">
              <p className="pm-tp-lobby__eyebrow">1v1 DUEL</p>
              <h1 className="pm-tp-lobby__title">
                <span className="is-amber">TIME</span>
                <span className="is-sky">PILOT</span>
                <span className="is-white">DUEL</span>
              </h1>
              <p className="pm-tp-lobby__sub">ÇAĞ • DÜŞMAN • LOOP</p>
            </header>

            <ul className="pm-tp-lobby__rules">
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

            <button type="button" className="pm-tp-lobby__cta" onClick={handleStart}>
              MAÇA BAŞLA
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
