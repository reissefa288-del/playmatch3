import { motion } from 'framer-motion'
import { useCallback } from 'react'
import { FiArrowLeft, FiZap } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { GameDuelBackdrop } from './components/GameDuelBackdrop'

const RULES = [
  { title: 'BEKLE', text: 'Ekran kırmızıyken sakın dokunma — erken basış puan kaybettirir.' },
  { title: 'DOKUN', text: 'Yeşil “DOKUN!” görününce mümkün olan en hızlı tepki ver.' },
  { title: 'LEG', text: '5 sayıya ilk ulaşan leg kazanır. 3 leg, 2 galibiyet maçı alır.' },
]

export function ReflexDuelLobbyScreen() {
  const navigate = useNavigate()

  const handleBack = useCallback(() => navigate(-1), [navigate])
  const handleStart = useCallback(() => navigate('/games/reflex-duel/play'), [navigate])

  return (
    <div className="pm-app-shell pm-app-shell--game-play pm-app-shell--reflex">
      <div className="pm-artboard">
        <motion.div className="pm-reflex-lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GameDuelBackdrop />

          <button type="button" className="pm-reflex-back" onClick={handleBack} aria-label="Geri dön">
            <FiArrowLeft />
          </button>

          <div className="pm-reflex-lobby__stack">
            <header className="pm-reflex-lobby__hero">
              <p className="pm-reflex-lobby__eyebrow">1v1 DUEL</p>
              <h1 className="pm-reflex-lobby__title">
                <span className="is-gold">REFLEX</span>
                <span className="is-cyan">DUEL</span>
              </h1>
              <p className="pm-reflex-lobby__sub">BEKLE • DOKUN • KAZAN</p>
            </header>

            <ul className="pm-reflex-lobby__rules">
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

            <button type="button" className="pm-reflex-lobby__cta" onClick={handleStart}>
              MAÇA BAŞLA
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
