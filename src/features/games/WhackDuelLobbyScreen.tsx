import { motion } from 'framer-motion'
import { useCallback } from 'react'
import { FiArrowLeft, FiZap } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { GameDuelBackdrop } from './components/GameDuelBackdrop'

const RULES = [
  { title: 'VUR', text: '3×3 delikten çıkan kafaya hızlıca dokun — her isabet +1 puan.' },
  { title: 'KAÇIRMA', text: 'Kafa kaybolmadan vuramazsan rakip fırsat yakalar.' },
  { title: 'LEG', text: '10 puana ilk ulaşan leg alır. 3 leg, 2 galibiyet maçı kazanır.' },
]

export function WhackDuelLobbyScreen() {
  const navigate = useNavigate()

  const handleBack = useCallback(() => navigate(-1), [navigate])
  const handleStart = useCallback(() => navigate('/games/whack-duel/play'), [navigate])

  return (
    <div className="pm-app-shell pm-app-shell--game-play pm-app-shell--whack">
      <div className="pm-artboard">
        <motion.div className="pm-whack-lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GameDuelBackdrop />

          <button type="button" className="pm-whack-back" onClick={handleBack} aria-label="Geri dön">
            <FiArrowLeft />
          </button>

          <div className="pm-whack-lobby__stack">
            <header className="pm-whack-lobby__hero">
              <p className="pm-whack-lobby__eyebrow">1v1 DUEL</p>
              <h1 className="pm-whack-lobby__title">
                <span className="is-amber">WHACK</span>
                <span className="is-teal">DUEL</span>
              </h1>
              <p className="pm-whack-lobby__sub">GÖR • VUR • KAZAN</p>
            </header>

            <ul className="pm-whack-lobby__rules">
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

            <button type="button" className="pm-whack-lobby__cta" onClick={handleStart}>
              MAÇA BAŞLA
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
