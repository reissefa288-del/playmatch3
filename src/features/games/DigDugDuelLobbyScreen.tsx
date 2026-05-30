import { motion } from 'framer-motion'
import { useCallback } from 'react'
import { FiArrowLeft, FiZap } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { GameDuelBackdrop } from './components/GameDuelBackdrop'

const RULES = [
  { title: 'İKİ TÜNEL', text: 'Solda senin yer altı sahan, sağda Zeynep — her biri kendi düşmanlarıyla.' },
  { title: 'KAZ & POMPA', text: 'D-pad ile tünel kaz. Düşmana bitişikken POMPA ile şişir; 3 pompa patlatır.' },
  { title: 'LEG', text: '48 sn veya 3600 puana ilk ulaşan leg alır. Kaya düşer — kaç! 3 leg, 2 galibiyet.' },
]

export function DigDugDuelLobbyScreen() {
  const navigate = useNavigate()

  const handleBack = useCallback(() => navigate(-1), [navigate])
  const handleStart = useCallback(() => navigate('/games/dig-dug-duel/play'), [navigate])

  return (
    <div className="pm-app-shell pm-app-shell--game-play pm-app-shell--digdug">
      <div className="pm-artboard">
        <motion.div className="pm-digdug-lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GameDuelBackdrop />

          <button type="button" className="pm-digdug-back" onClick={handleBack} aria-label="Geri dön">
            <FiArrowLeft />
          </button>

          <div className="pm-digdug-lobby__stack">
            <header className="pm-digdug-lobby__hero">
              <p className="pm-digdug-lobby__eyebrow">1v1 DUEL</p>
              <h1 className="pm-digdug-lobby__title">
                <span className="is-orange">DIG DUG</span>
                <span className="is-cyan">DUEL</span>
              </h1>
              <p className="pm-digdug-lobby__sub">KAZ • POMPA • PATLAT</p>
            </header>

            <ul className="pm-digdug-lobby__rules">
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

            <button type="button" className="pm-digdug-lobby__cta" onClick={handleStart}>
              MAÇA BAŞLA
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
