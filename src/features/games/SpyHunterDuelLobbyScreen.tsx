import { motion } from 'framer-motion'
import { useCallback } from 'react'
import { FiArrowLeft, FiZap } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { GameDuelBackdrop } from './components/GameDuelBackdrop'

const RULES = [
  { title: 'İKİ OTOYOL', text: 'Solda senin Spy Hunter sahan, sağda Zeynep — aynı ilerleyen otoyol.' },
  { title: 'SÜR & VUR', text: '◀ ▶ şerit değiştir; ATEŞ ile düşman araçları vur. Kamyon 2 vuruş.' },
  { title: 'LEG', text: '48 sn veya 3600 puana ilk ulaşan leg alır. Yağ lekelerinden kaç — 3 leg, 2 galibiyet.' },
]

export function SpyHunterDuelLobbyScreen() {
  const navigate = useNavigate()

  const handleBack = useCallback(() => navigate(-1), [navigate])
  const handleStart = useCallback(() => navigate('/games/spy-hunter-duel/play'), [navigate])

  return (
    <div className="pm-app-shell pm-app-shell--game-play pm-app-shell--spy-hunter">
      <div className="pm-artboard">
        <motion.div className="pm-sh-lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GameDuelBackdrop />

          <button type="button" className="pm-sh-back" onClick={handleBack} aria-label="Geri dön">
            <FiArrowLeft />
          </button>

          <div className="pm-sh-lobby__stack">
            <header className="pm-sh-lobby__hero">
              <p className="pm-sh-lobby__eyebrow">1v1 DUEL</p>
              <h1 className="pm-sh-lobby__title">
                <span className="is-silver">SPY</span>
                <span className="is-red">HUNTER</span>
              </h1>
              <p className="pm-sh-lobby__sub">OTOYOL • ATEŞ • DÜŞMAN</p>
            </header>

            <ul className="pm-sh-lobby__rules">
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

            <button type="button" className="pm-sh-lobby__cta" onClick={handleStart}>
              MAÇA BAŞLA
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
