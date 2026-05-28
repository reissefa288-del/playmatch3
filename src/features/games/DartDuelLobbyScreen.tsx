import { motion } from 'framer-motion'
import { useCallback } from 'react'
import { FiArrowLeft, FiZap } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { GameDuelBackdrop } from './components/GameDuelBackdrop'

const RULES = [
  { title: 'ATIŞ', text: 'Atış alanından yukarı sürükle ve bırak — nişan ve güç belirler.' },
  { title: 'TUR', text: 'Her turda 3 atış hakkın var; sonra sıra rakibe geçer.' },
  { title: 'MAÇ', text: '3 leg oynanır; 2 leg kazanan maçı alır.' },
]

export function DartDuelLobbyScreen() {
  const navigate = useNavigate()

  const handleBack = useCallback(() => navigate(-1), [navigate])
  const handleStart = useCallback(() => navigate('/games/dart-duel/play'), [navigate])

  return (
    <div className="pm-app-shell pm-app-shell--game-play pm-app-shell--dart">
      <div className="pm-artboard">
        <motion.div className="pm-dart-lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GameDuelBackdrop />

          <button type="button" className="pm-dart-back" onClick={handleBack} aria-label="Geri dön">
            <FiArrowLeft />
          </button>

          <div className="pm-dart-lobby__stack">
            <header className="pm-dart-lobby__hero">
              <p className="pm-dart-lobby__eyebrow">1v1 DUEL</p>
              <h1 className="pm-dart-lobby__title">
                <span className="is-gold">DART</span>
                <span className="is-orange">DUEL</span>
              </h1>
              <p className="pm-dart-lobby__sub">NiŞAN AL • AT • SKORU DÜŞÜR</p>
            </header>

            <ul className="pm-dart-lobby__rules">
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

            <div className="pm-dart-lobby__preview" aria-hidden>
              <span className="pm-dart-lobby__board" />
            </div>

            <button type="button" className="pm-dart-lobby__cta" onClick={handleStart}>
              MAÇA BAŞLA
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
