import { motion } from 'framer-motion'
import { useCallback } from 'react'
import { FiArrowLeft, FiZap } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { GameDuelBackdrop } from './components/GameDuelBackdrop'

const RULES = [
  { title: 'HAMLE', text: 'Taşı seç, gideceği kareye dokun. Beyaz sensin (Emir), siyah Zeynep.' },
  { title: 'ŞAH / MAT', text: 'Rakibin şahını tehdit et; kaçacak hamle yoksa mat — leg senin.' },
  { title: 'MAÇ', text: 'Her leg bir tam oyun. 3 leg, 2 galibiyet maçı kazanır.' },
]

export function ChessDuelLobbyScreen() {
  const navigate = useNavigate()

  const handleBack = useCallback(() => navigate(-1), [navigate])
  const handleStart = useCallback(() => navigate('/games/chess-duel/play'), [navigate])

  return (
    <div className="pm-app-shell pm-app-shell--game-play pm-app-shell--chess">
      <div className="pm-artboard">
        <motion.div className="pm-chess-lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GameDuelBackdrop />

          <button type="button" className="pm-chess-back" onClick={handleBack} aria-label="Geri dön">
            <FiArrowLeft />
          </button>

          <div className="pm-chess-lobby__stack">
            <header className="pm-chess-lobby__hero">
              <p className="pm-chess-lobby__eyebrow">1v1 DUEL</p>
              <h1 className="pm-chess-lobby__title">
                <span className="is-ivory">SATRANÇ</span>
                <span className="is-gold">DUEL</span>
              </h1>
              <p className="pm-chess-lobby__sub">Strateji • Mat • Kazan</p>
            </header>

            <ul className="pm-chess-lobby__rules">
              {RULES.map((rule) => (
                <li key={rule.title}>
                  <strong>{rule.title}</strong>
                  <span>{rule.text}</span>
                </li>
              ))}
            </ul>

            <button type="button" className="pm-chess-lobby__cta" onClick={handleStart}>
              <FiZap aria-hidden />
              MAÇA BAŞLA
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
