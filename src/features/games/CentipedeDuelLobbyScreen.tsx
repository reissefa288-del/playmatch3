import { motion } from 'framer-motion'
import { useCallback } from 'react'
import { FiArrowLeft, FiZap } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { GameDuelBackdrop } from './components/GameDuelBackdrop'

const RULES = [
  { title: 'İKİ EKRAN', text: 'Solda senin, sağda rakibin tünel — her biri kendi kırkayak ve mantarlarıyla.' },
  { title: 'SÜR & ATEŞ', text: 'Parmağınla blaster’ı kaydır, ATEŞ ile yukarı vur. Kırkayak zigzag iner.' },
  { title: 'LEG', text: '45 sn veya 4000 puana ilk ulaşan leg alır. 3 leg, 2 galibiyet maçı kazanır.' },
]

export function CentipedeDuelLobbyScreen() {
  const navigate = useNavigate()

  const handleBack = useCallback(() => navigate(-1), [navigate])
  const handleStart = useCallback(() => navigate('/games/centipede-duel/play'), [navigate])

  return (
    <div className="pm-app-shell pm-app-shell--game-play pm-app-shell--centipede">
      <div className="pm-artboard">
        <motion.div className="pm-centipede-lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GameDuelBackdrop />

          <button type="button" className="pm-centipede-back" onClick={handleBack} aria-label="Geri dön">
            <FiArrowLeft />
          </button>

          <div className="pm-centipede-lobby__stack">
            <header className="pm-centipede-lobby__hero">
              <p className="pm-centipede-lobby__eyebrow">1v1 DUEL</p>
              <h1 className="pm-centipede-lobby__title">
                <span className="is-violet">CENTIPEDE</span>
                <span className="is-lime">DUEL</span>
              </h1>
              <p className="pm-centipede-lobby__sub">MANTAR • KIRKAYAK • KAZAN</p>
            </header>

            <ul className="pm-centipede-lobby__rules">
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

            <button type="button" className="pm-centipede-lobby__cta" onClick={handleStart}>
              MAÇA BAŞLA
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
