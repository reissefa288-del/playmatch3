import { motion } from 'framer-motion'
import { useCallback } from 'react'
import { FiArrowLeft, FiZap } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { GameDuelBackdrop } from './components/GameDuelBackdrop'

const RULES = [
  { title: 'İKİ EKRAN', text: 'Solda senin uzay şeridin, sağda Zeynep — aynı anda iki Galaga arenası.' },
  { title: 'SÜR & ATEŞ', text: 'Parmağınla gemiyi kaydır, ATEŞ ile düşmanları vur. Dalış yapanlar ateş eder.' },
  { title: 'LEG', text: '42 sn veya 4200 puana ilk ulaşan leg alır. 3 leg, 2 galibiyet maçı kazanır.' },
]

export function GalagaDuelLobbyScreen() {
  const navigate = useNavigate()

  const handleBack = useCallback(() => navigate(-1), [navigate])
  const handleStart = useCallback(() => navigate('/games/galaga-duel/play'), [navigate])

  return (
    <div className="pm-app-shell pm-app-shell--game-play pm-app-shell--galaga">
      <div className="pm-artboard">
        <motion.div className="pm-galaga-lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GameDuelBackdrop />

          <button type="button" className="pm-galaga-back" onClick={handleBack} aria-label="Geri dön">
            <FiArrowLeft />
          </button>

          <div className="pm-galaga-lobby__stack">
            <header className="pm-galaga-lobby__hero">
              <p className="pm-galaga-lobby__eyebrow">1v1 DUEL</p>
              <h1 className="pm-galaga-lobby__title">
                <span className="is-neon">GALAGA</span>
                <span className="is-star">DUEL</span>
              </h1>
              <p className="pm-galaga-lobby__sub">UZAY • ATEŞ • KAZAN</p>
            </header>

            <ul className="pm-galaga-lobby__rules">
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

            <button type="button" className="pm-galaga-lobby__cta" onClick={handleStart}>
              MAÇA BAŞLA
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
