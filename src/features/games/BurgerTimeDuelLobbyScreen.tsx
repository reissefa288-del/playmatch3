import { motion } from 'framer-motion'
import { useCallback } from 'react'
import { FiArrowLeft, FiZap } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { GameDuelBackdrop } from './components/GameDuelBackdrop'

const RULES = [
  { title: 'İKİ MUTFAK', text: 'Solda senin BurgerTime sahan, sağda Zeynep — aynı platform ve burger düzeni.' },
  { title: 'EZ & KAÇ', text: 'Malzemenin üstünden yürü, katman düşsün. Merdivende yukarı/aşağı, düşmanlardan kaç.' },
  { title: 'LEG', text: '48 sn veya 3400 puana ilk ulaşan leg alır. Tam burger +450 bonus. 3 leg, 2 galibiyet.' },
]

export function BurgerTimeDuelLobbyScreen() {
  const navigate = useNavigate()

  const handleBack = useCallback(() => navigate(-1), [navigate])
  const handleStart = useCallback(() => navigate('/games/burger-time-duel/play'), [navigate])

  return (
    <div className="pm-app-shell pm-app-shell--game-play pm-app-shell--burger">
      <div className="pm-artboard">
        <motion.div className="pm-burger-lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GameDuelBackdrop />

          <button type="button" className="pm-burger-back" onClick={handleBack} aria-label="Geri dön">
            <FiArrowLeft />
          </button>

          <div className="pm-burger-lobby__stack">
            <header className="pm-burger-lobby__hero">
              <p className="pm-burger-lobby__eyebrow">1v1 DUEL</p>
              <h1 className="pm-burger-lobby__title">
                <span className="is-red">BURGER</span>
                <span className="is-yellow">TIME</span>
              </h1>
              <p className="pm-burger-lobby__sub">EZ • MERDİVEN • KAÇ</p>
            </header>

            <ul className="pm-burger-lobby__rules">
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

            <button type="button" className="pm-burger-lobby__cta" onClick={handleStart}>
              MAÇA BAŞLA
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
