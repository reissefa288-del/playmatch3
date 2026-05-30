import { motion } from 'framer-motion'
import { useCallback } from 'react'
import { FiArrowLeft, FiZap } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { GameDuelBackdrop } from './components/GameDuelBackdrop'

const RULES = [
  { title: 'İKİ EKRAN', text: 'Solda senin labirentin, sağda Zeynep — her biri kendi noktalarını yer.' },
  { title: 'YOLLA', text: 'D-pad ile dolaş, nokta ye. Büyük nokta (güç) ile hayaletleri ye (+200).' },
  { title: 'LEG', text: '50 sn veya 3500 puana ilk ulaşan leg alır. 3 leg, 2 galibiyet.' },
]

export function PacDotDuelLobbyScreen() {
  const navigate = useNavigate()

  const handleBack = useCallback(() => navigate(-1), [navigate])
  const handleStart = useCallback(() => navigate('/games/pac-dot-duel/play'), [navigate])

  return (
    <div className="pm-app-shell pm-app-shell--game-play pm-app-shell--pacdot">
      <div className="pm-artboard">
        <motion.div className="pm-pacdot-lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GameDuelBackdrop />

          <button type="button" className="pm-pacdot-back" onClick={handleBack} aria-label="Geri dön">
            <FiArrowLeft />
          </button>

          <div className="pm-pacdot-lobby__stack">
            <header className="pm-pacdot-lobby__hero">
              <p className="pm-pacdot-lobby__eyebrow">1v1 DUEL</p>
              <h1 className="pm-pacdot-lobby__title">
                <span className="is-yellow">PAC-DOT</span>
                <span className="is-blue">DUEL</span>
              </h1>
              <p className="pm-pacdot-lobby__sub">YE • KAÇ • KAZAN</p>
            </header>

            <ul className="pm-pacdot-lobby__rules">
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

            <button type="button" className="pm-pacdot-lobby__cta" onClick={handleStart}>
              MAÇA BAŞLA
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
