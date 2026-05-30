import { motion } from 'framer-motion'
import { useCallback } from 'react'
import { FiArrowLeft, FiZap } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { GameDuelBackdrop } from './components/GameDuelBackdrop'

const RULES = [
  { title: 'İKİ TÜNEL', text: 'Solda senin Gyruss sahan, sağda Zeynep — merkezden dışa dalga, ayrı skor.' },
  { title: 'YÖRÜNGE', text: '↺↻ veya parmağınla çemberde dön; ATEŞ merkeze doğru. Düşmanlar çekirdekten yayılır!' },
  { title: 'LEG', text: '46 sn veya 4000 puana ilk ulaşan leg alır. 3 leg, 2 galibiyet.' },
]

export function GyrussDuelLobbyScreen() {
  const navigate = useNavigate()

  const handleBack = useCallback(() => navigate(-1), [navigate])
  const handleStart = useCallback(() => navigate('/games/gyruss-duel/play'), [navigate])

  return (
    <div className="pm-app-shell pm-app-shell--game-play pm-app-shell--gyruss">
      <div className="pm-artboard">
        <motion.div className="pm-gyr-lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GameDuelBackdrop />

          <button type="button" className="pm-gyr-back" onClick={handleBack} aria-label="Geri dön">
            <FiArrowLeft />
          </button>

          <div className="pm-gyr-lobby__stack">
            <header className="pm-gyr-lobby__hero">
              <p className="pm-gyr-lobby__eyebrow">1v1 DUEL</p>
              <h1 className="pm-gyr-lobby__title">
                <span className="is-gold">GYRUSS</span>
                <span className="is-blue">DUEL</span>
              </h1>
              <p className="pm-gyr-lobby__sub">YÖRÜNGE • MERKEZ • TÜNEL</p>
            </header>

            <ul className="pm-gyr-lobby__rules">
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

            <button type="button" className="pm-gyr-lobby__cta" onClick={handleStart}>
              MAÇA BAŞLA
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
