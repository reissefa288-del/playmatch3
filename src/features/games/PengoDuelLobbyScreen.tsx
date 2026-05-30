import { motion } from 'framer-motion'
import { useCallback } from 'react'
import { FiArrowLeft, FiZap } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { GameDuelBackdrop } from './components/GameDuelBackdrop'

const RULES = [
  { title: 'PENGO', text: 'Solda senin buz labirenti, sağda Zeynep — penguen olarak buz bloklarını it!' },
  { title: 'İT & EZ', text: '◀▶▲▼ ile gez. Buz bloğuna yürüyünce itersin. Bloğu arının üstüne it = ezme puanı!' },
  { title: 'SKOR', text: 'Ezme + dalga bonusu. Arı temas = can kaybı. 50 sn veya 3800 puan — 3 leg, 2 galibiyet.' },
]

export function PengoDuelLobbyScreen() {
  const navigate = useNavigate()

  const handleBack = useCallback(() => navigate(-1), [navigate])
  const handleStart = useCallback(() => navigate('/games/pengo-duel/play'), [navigate])

  return (
    <div className="pm-app-shell pm-app-shell--game-play pm-app-shell--pengo">
      <div className="pm-artboard">
        <motion.div className="pm-pg-lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GameDuelBackdrop />

          <button type="button" className="pm-pg-back" onClick={handleBack} aria-label="Geri dön">
            <FiArrowLeft />
          </button>

          <div className="pm-pg-lobby__stack">
            <header className="pm-pg-lobby__hero">
              <p className="pm-pg-lobby__eyebrow">1v1 DUEL</p>
              <h1 className="pm-pg-lobby__title">
                <span className="is-white">PEN</span>
                <span className="is-ice">GO</span>
                <span className="is-white">DUEL</span>
              </h1>
              <p className="pm-pg-lobby__sub">BUZ • İT • EZ</p>
            </header>

            <ul className="pm-pg-lobby__rules">
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

            <button type="button" className="pm-pg-lobby__cta" onClick={handleStart}>
              MAÇA BAŞLA
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
