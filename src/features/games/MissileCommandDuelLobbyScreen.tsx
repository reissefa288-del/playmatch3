import { motion } from 'framer-motion'
import { useCallback } from 'react'
import { FiArrowLeft, FiZap } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { GameDuelBackdrop } from './components/GameDuelBackdrop'

const RULES = [
  { title: 'İKİ EKRAN', text: 'Solda senin savunma hattın, sağda Zeynep — her biri kendi şehrini korur.' },
  { title: 'DOKUN', text: 'Gökyüzünde patlatmak istediğin noktaya dokun; karşı füze oraya gider ve patlar.' },
  { title: 'LEG', text: '45 sn veya 3600 puana ilk ulaşan leg alır. Şehir düşerse −400 puan. 3 leg, 2 galibiyet.' },
]

export function MissileCommandDuelLobbyScreen() {
  const navigate = useNavigate()

  const handleBack = useCallback(() => navigate(-1), [navigate])
  const handleStart = useCallback(() => navigate('/games/missile-command-duel/play'), [navigate])

  return (
    <div className="pm-app-shell pm-app-shell--game-play pm-app-shell--missile">
      <div className="pm-artboard">
        <motion.div className="pm-missile-lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GameDuelBackdrop />

          <button type="button" className="pm-missile-back" onClick={handleBack} aria-label="Geri dön">
            <FiArrowLeft />
          </button>

          <div className="pm-missile-lobby__stack">
            <header className="pm-missile-lobby__hero">
              <p className="pm-missile-lobby__eyebrow">1v1 DUEL</p>
              <h1 className="pm-missile-lobby__title">
                <span className="is-flash">MISSILE</span>
                <span className="is-base">COMMAND</span>
              </h1>
              <p className="pm-missile-lobby__sub">SAVUN • PATLAT • KAZAN</p>
            </header>

            <ul className="pm-missile-lobby__rules">
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

            <button type="button" className="pm-missile-lobby__cta" onClick={handleStart}>
              MAÇA BAŞLA
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
