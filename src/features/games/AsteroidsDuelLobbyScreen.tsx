import { motion } from 'framer-motion'
import { useCallback } from 'react'
import { FiArrowLeft, FiZap } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { GameDuelBackdrop } from './components/GameDuelBackdrop'

const RULES = [
  { title: 'İKİ EKRAN', text: 'Solda senin, sağda rakibin uzay alanı — klasik Asteroids düellosu.' },
  { title: 'SÜR & VUR', text: 'Ekrana dokunarak yön ver, İT ile hızlan, ATEŞ ile kayaları parçala.' },
  { title: 'LEG', text: '45 sn veya 3800 puana ilk ulaşan leg alır. 3 leg, 2 galibiyet.' },
]

export function AsteroidsDuelLobbyScreen() {
  const navigate = useNavigate()

  const handleBack = useCallback(() => navigate(-1), [navigate])
  const handleStart = useCallback(() => navigate('/games/asteroids-duel/play'), [navigate])

  return (
    <div className="pm-app-shell pm-app-shell--game-play pm-app-shell--asteroids">
      <div className="pm-artboard">
        <motion.div className="pm-asteroids-lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GameDuelBackdrop />

          <button type="button" className="pm-asteroids-back" onClick={handleBack} aria-label="Geri dön">
            <FiArrowLeft />
          </button>

          <div className="pm-asteroids-lobby__stack">
            <header className="pm-asteroids-lobby__hero">
              <p className="pm-asteroids-lobby__eyebrow">1v1 DUEL</p>
              <h1 className="pm-asteroids-lobby__title">
                <span className="is-ice">ASTEROIDS</span>
                <span className="is-rock">DUEL</span>
              </h1>
              <p className="pm-asteroids-lobby__sub">UZAY • PARÇALA • KAZAN</p>
            </header>

            <ul className="pm-asteroids-lobby__rules">
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

            <button type="button" className="pm-asteroids-lobby__cta" onClick={handleStart}>
              MAÇA BAŞLA
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
