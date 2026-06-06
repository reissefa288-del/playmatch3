import { motion } from 'framer-motion'
import { useCallback } from 'react'
import { FiArrowLeft, FiZap } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { GameDuelBackdrop } from './components/GameDuelBackdrop'

const RULES = [
  { title: 'İKİ ARENA', text: 'Solda senin uzay şeridin, sağda Zeynep — paralel dalga savaşı.' },
  { title: 'OTOMATİK ATEŞ', text: 'Sadece gemiyi kaydır; çift lazer sürekli ateş eder. Dalga bitince yeni düşmanlar gelir.' },
  { title: 'LEG', text: '42 sn veya 4200 puana ilk ulaşan leg alır. 3 leg, 2 galibiyet maçı kazanır.' },
]

export function SpaceDuelLobbyScreen() {
  const navigate = useNavigate()

  const handleBack = useCallback(() => navigate(-1), [navigate])
  const handleStart = useCallback(() => navigate('/games/space-duel/play'), [navigate])

  return (
    <div className="pm-app-shell pm-app-shell--game-play pm-app-shell--space">
      <div className="pm-artboard">
        <motion.div className="pm-space-lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GameDuelBackdrop />

          <button type="button" className="pm-space-back" onClick={handleBack} aria-label="Geri dön">
            <FiArrowLeft />
          </button>

          <div className="pm-space-lobby__stack">
            <header className="pm-space-lobby__hero">
              <p className="pm-space-lobby__eyebrow">1v1 DUEL</p>
              <h1 className="pm-space-lobby__title">
                <span className="is-neon">SPACE</span>
                <span className="is-star">DUEL</span>
              </h1>
              <p className="pm-space-lobby__sub">DALGA • LAZER • KAZAN</p>
            </header>

            <ul className="pm-space-lobby__rules">
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

            <button type="button" className="pm-space-lobby__cta" onClick={handleStart}>
              MAÇA BAŞLA
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
