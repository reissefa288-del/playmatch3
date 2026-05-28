import { motion } from 'framer-motion'
import { useCallback } from 'react'
import { FiArrowLeft, FiZap } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { GameDuelBackdrop } from './components/GameDuelBackdrop'

const RULES = [
  { title: 'KONTROL', text: 'Sahaya dokun — sol raket yukarı/aşağı gider.' },
  { title: 'SKOR', text: 'Topu rakip tarafa geçir; 5 sayı roundu kazanır.' },
  { title: 'MAÇ', text: '3 round oynanır; 2 galibiyet maçı alır.' },
]

export function PongDuelLobbyScreen() {
  const navigate = useNavigate()

  const handleBack = useCallback(() => navigate(-1), [navigate])
  const handleStart = useCallback(() => navigate('/games/pong-duel/play'), [navigate])

  return (
    <div className="pm-app-shell pm-app-shell--game-play pm-app-shell--pong">
      <div className="pm-artboard">
        <motion.div className="pm-pong-lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GameDuelBackdrop />

          <button type="button" className="pm-pong-back" onClick={handleBack} aria-label="Geri dön">
            <FiArrowLeft />
          </button>

          <div className="pm-pong-lobby__stack">
            <header className="pm-pong-lobby__hero">
              <p className="pm-pong-lobby__eyebrow">1v1 DUEL</p>
              <h1 className="pm-pong-lobby__title">
                <span className="is-cyan">PONG</span>
                <span className="is-pink">DUEL</span>
              </h1>
              <p className="pm-pong-lobby__sub">RAKETİ SAVUR • TOPU GEÇİR • KAZAN</p>
            </header>

            <ul className="pm-pong-lobby__rules">
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

            <div className="pm-pong-lobby__preview" aria-hidden>
              <span className="is-paddle" />
              <span className="is-ball" />
              <span className="is-paddle is-right" />
            </div>

            <button type="button" className="pm-pong-lobby__cta" onClick={handleStart}>
              MAÇA BAŞLA
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
