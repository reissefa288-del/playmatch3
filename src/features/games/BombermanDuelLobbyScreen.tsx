import { motion } from 'framer-motion'
import { useCallback } from 'react'
import { FiArrowLeft, FiZap } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { GameDuelBackdrop } from './components/GameDuelBackdrop'

const RULES = [
  { title: 'BOMBERMAN', text: 'Solda senin labirent, sağda Zeynep — kutuları patlat, düşman balonları yok et!' },
  { title: 'BOMBA', text: '◀▶▲▼ ile gridde gez. BOMBA koy; çapraz patlama duvarları kırar. Kendi patlamandan kaç!' },
  { title: 'SKOR', text: 'Kutu + düşman puanı. Tüm kutular = bonus. 52 sn veya 4000 puan — 3 leg, 2 galibiyet.' },
]

export function BombermanDuelLobbyScreen() {
  const navigate = useNavigate()

  const handleBack = useCallback(() => navigate(-1), [navigate])
  const handleStart = useCallback(() => navigate('/games/bomberman-duel/play'), [navigate])

  return (
    <div className="pm-app-shell pm-app-shell--game-play pm-app-shell--bomberman">
      <div className="pm-artboard">
        <motion.div className="pm-bm-lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GameDuelBackdrop />

          <button type="button" className="pm-bm-back" onClick={handleBack} aria-label="Geri dön">
            <FiArrowLeft />
          </button>

          <div className="pm-bm-lobby__stack">
            <header className="pm-bm-lobby__hero">
              <p className="pm-bm-lobby__eyebrow">1v1 DUEL</p>
              <h1 className="pm-bm-lobby__title">
                <span className="is-white">BOMBER</span>
                <span className="is-blue">MAN</span>
                <span className="is-white">DUEL</span>
              </h1>
              <p className="pm-bm-lobby__sub">BOMBA • PATLAMA • PUAN</p>
            </header>

            <ul className="pm-bm-lobby__rules">
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

            <button type="button" className="pm-bm-lobby__cta" onClick={handleStart}>
              MAÇA BAŞLA
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
