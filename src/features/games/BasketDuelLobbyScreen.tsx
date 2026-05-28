import { motion } from 'framer-motion'
import { useCallback } from 'react'
import { FiArrowLeft, FiZap } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { GameDuelBackdrop } from './components/GameDuelBackdrop'

const RULES = [
  { title: 'ŞUT', text: 'Güç çubuğunda ibre yeşile gelince ŞUT’a bas — mükemmel atış +3 puan.' },
  { title: 'SIRA', text: 'Sen ve rakip sırayla atış yapar. İyi (+2) ve giriş (+1) de sayılır.' },
  { title: 'LEG', text: '11 puana ilk ulaşan leg alır. 3 leg, 2 galibiyet maçı kazanır.' },
]

export function BasketDuelLobbyScreen() {
  const navigate = useNavigate()

  const handleBack = useCallback(() => navigate(-1), [navigate])
  const handleStart = useCallback(() => navigate('/games/basket-duel/play'), [navigate])

  return (
    <div className="pm-app-shell pm-app-shell--game-play pm-app-shell--basket">
      <div className="pm-artboard">
        <motion.div className="pm-basket-lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GameDuelBackdrop />

          <button type="button" className="pm-basket-back" onClick={handleBack} aria-label="Geri dön">
            <FiArrowLeft />
          </button>

          <div className="pm-basket-lobby__stack">
            <header className="pm-basket-lobby__hero">
              <p className="pm-basket-lobby__eyebrow">1v1 DUEL</p>
              <h1 className="pm-basket-lobby__title">
                <span className="is-orange">BASKET</span>
                <span className="is-court">DUEL</span>
              </h1>
              <p className="pm-basket-lobby__sub">Nişan • Şut • Kazan</p>
            </header>

            <ul className="pm-basket-lobby__rules">
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

            <button type="button" className="pm-basket-lobby__cta" onClick={handleStart}>
              MAÇA BAŞLA
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
