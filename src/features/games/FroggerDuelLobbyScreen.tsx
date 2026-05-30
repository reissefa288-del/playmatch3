import { motion } from 'framer-motion'
import { useCallback } from 'react'
import { FiArrowLeft, FiZap } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { GameDuelBackdrop } from './components/GameDuelBackdrop'

const RULES = [
  { title: 'İKİ EKRAN', text: 'Solda senin geçiş alanın, sağda Zeynep — her biri kendi yol ve nehri.' },
  { title: 'GEÇ', text: 'D-pad ile kurbağayı hareket ettir: yolu geç, kütükte kal, 5 eve ulaş.' },
  { title: 'LEG', text: '48 sn veya 3200 puana ilk ulaşan leg alır. 3 leg, 2 galibiyet.' },
]

export function FroggerDuelLobbyScreen() {
  const navigate = useNavigate()

  const handleBack = useCallback(() => navigate(-1), [navigate])
  const handleStart = useCallback(() => navigate('/games/frogger-duel/play'), [navigate])

  return (
    <div className="pm-app-shell pm-app-shell--game-play pm-app-shell--frogger">
      <div className="pm-artboard">
        <motion.div className="pm-frogger-lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GameDuelBackdrop />

          <button type="button" className="pm-frogger-back" onClick={handleBack} aria-label="Geri dön">
            <FiArrowLeft />
          </button>

          <div className="pm-frogger-lobby__stack">
            <header className="pm-frogger-lobby__hero">
              <p className="pm-frogger-lobby__eyebrow">1v1 DUEL</p>
              <h1 className="pm-frogger-lobby__title">
                <span className="is-green">FROGGER</span>
                <span className="is-lime">DUEL</span>
              </h1>
              <p className="pm-frogger-lobby__sub">YOL • NEHİR • EV</p>
            </header>

            <ul className="pm-frogger-lobby__rules">
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

            <button type="button" className="pm-frogger-lobby__cta" onClick={handleStart}>
              MAÇA BAŞLA
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
