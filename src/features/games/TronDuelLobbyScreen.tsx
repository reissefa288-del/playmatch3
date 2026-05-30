import { motion } from 'framer-motion'
import { useCallback } from 'react'
import { FiArrowLeft, FiZap } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { GameDuelBackdrop } from './components/GameDuelBackdrop'

const RULES = [
  { title: 'TRON', text: 'Solda senin grid, sağda Zeynep — light cycle iz bırakır, duvara veya izine çarpma!' },
  { title: 'YÖN', text: '◀▶▲▼ ile dön. Geri dönemezsin. İz kalıcıdır; ne kadar uzun süre hayatta kalırsan o kadar puan.' },
  { title: 'SKOR', text: 'Her adım + uzunluk bonusu. Çarpışma ceza. 50 sn veya 3600 puan — 3 leg, 2 galibiyet.' },
]

export function TronDuelLobbyScreen() {
  const navigate = useNavigate()

  const handleBack = useCallback(() => navigate(-1), [navigate])
  const handleStart = useCallback(() => navigate('/games/tron-duel/play'), [navigate])

  return (
    <div className="pm-app-shell pm-app-shell--game-play pm-app-shell--tron">
      <div className="pm-artboard">
        <motion.div className="pm-tr-lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GameDuelBackdrop />

          <button type="button" className="pm-tr-back" onClick={handleBack} aria-label="Geri dön">
            <FiArrowLeft />
          </button>

          <div className="pm-tr-lobby__stack">
            <header className="pm-tr-lobby__hero">
              <p className="pm-tr-lobby__eyebrow">1v1 DUEL</p>
              <h1 className="pm-tr-lobby__title">
                <span className="is-cyan">TRON</span>
                <span className="is-white">DUEL</span>
              </h1>
              <p className="pm-tr-lobby__sub">IZ • NEON • HAYATTA KAL</p>
            </header>

            <ul className="pm-tr-lobby__rules">
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

            <button type="button" className="pm-tr-lobby__cta" onClick={handleStart}>
              MAÇA BAŞLA
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
