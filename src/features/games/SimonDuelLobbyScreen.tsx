import { motion } from 'framer-motion'
import { useCallback } from 'react'
import { FiArrowLeft, FiZap } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { GameDuelBackdrop } from './components/GameDuelBackdrop'

const RULES = [
  { title: 'İZLE', text: 'Dört renk sırayla yanar — deseni aklında tut.' },
  { title: 'TEKRARLA', text: 'Aynı sırayla padlere dokun. Yanlış pad rakibe puan verir.' },
  { title: 'LEG', text: '5 puana ilk ulaşan leg alır. 3 leg, 2 galibiyet maçı kazanır.' },
]

export function SimonDuelLobbyScreen() {
  const navigate = useNavigate()

  const handleBack = useCallback(() => navigate(-1), [navigate])
  const handleStart = useCallback(() => navigate('/games/simon-duel/play'), [navigate])

  return (
    <div className="pm-app-shell pm-app-shell--game-play pm-app-shell--simon">
      <div className="pm-artboard">
        <motion.div className="pm-simon-lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GameDuelBackdrop />

          <button type="button" className="pm-simon-back" onClick={handleBack} aria-label="Geri dön">
            <FiArrowLeft />
          </button>

          <div className="pm-simon-lobby__stack">
            <header className="pm-simon-lobby__hero">
              <p className="pm-simon-lobby__eyebrow">1v1 DUEL</p>
              <h1 className="pm-simon-lobby__title">
                <span className="is-magenta">SIMON</span>
                <span className="is-lime">DUEL</span>
              </h1>
              <p className="pm-simon-lobby__sub">İZLE • TEKRARLA • KAZAN</p>
            </header>

            <ul className="pm-simon-lobby__rules">
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

            <button type="button" className="pm-simon-lobby__cta" onClick={handleStart}>
              MAÇA BAŞLA
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
