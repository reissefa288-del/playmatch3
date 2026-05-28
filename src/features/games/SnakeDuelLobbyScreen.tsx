import { motion } from 'framer-motion'
import { useCallback } from 'react'
import { FiArrowLeft, FiZap } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { GameDuelBackdrop } from './components/GameDuelBackdrop'

const RULES = [
  { title: 'KONTROL', text: 'Ok tuşlarıyla yılanını yönlendir, yemleri topla.' },
  { title: 'PUAN', text: 'Her yem +10 puan ve yılanın uzar. Duvara veya kendine çarpma!' },
  { title: 'ROUND', text: '60 saniyede en yüksek skor. 3 round, 2 galibiyet.' },
]

export function SnakeDuelLobbyScreen() {
  const navigate = useNavigate()

  const handleBack = useCallback(() => navigate(-1), [navigate])
  const handleStart = useCallback(() => navigate('/games/snake-duel/play'), [navigate])

  return (
    <div className="pm-app-shell pm-app-shell--game-play pm-app-shell--snake">
      <div className="pm-artboard">
        <motion.div className="pm-snake-lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GameDuelBackdrop />

          <button type="button" className="pm-snake-back" onClick={handleBack} aria-label="Geri dön">
            <FiArrowLeft />
          </button>

          <div className="pm-snake-lobby__stack">
            <header className="pm-snake-lobby__hero">
              <p className="pm-snake-lobby__eyebrow">1v1 DUEL</p>
              <h1 className="pm-snake-lobby__title">
                <span className="is-cyan">SNAKE</span>
                <span className="is-green">DUEL</span>
              </h1>
              <p className="pm-snake-lobby__sub">YE • BÜYÜ • RAKİBİ GEÇ</p>
            </header>

            <ul className="pm-snake-lobby__rules">
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

            <div className="pm-snake-lobby__preview" aria-hidden>
              <span />
              <span />
              <span className="is-food" />
            </div>

            <button type="button" className="pm-snake-lobby__cta" onClick={handleStart}>
              MAÇA BAŞLA
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
