import { motion } from 'framer-motion'
import { useCallback } from 'react'
import { FiArrowLeft, FiZap } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { GameDuelBackdrop } from './components/GameDuelBackdrop'

const RULES = [
  { title: 'METAL SLUG', text: 'Solda senin cephe, sağda Zeynep — run-and-gun, SV-001 Slug tankına bin!' },
  { title: 'ATEŞ & BOMBA', text: '◀▶ hareket, ▲ zıpla. ATEŞ üçlü mermi; BOMBA alan hasarı. Tank 2 vuruş.' },
  { title: 'SKOR', text: 'Slug kutusunu topla. 50 sn veya 4200 puan — 3 leg, 2 galibiyet.' },
]

export function MetalSlugDuelLobbyScreen() {
  const navigate = useNavigate()

  const handleBack = useCallback(() => navigate(-1), [navigate])
  const handleStart = useCallback(() => navigate('/games/metal-slug-duel/play'), [navigate])

  return (
    <div className="pm-app-shell pm-app-shell--game-play pm-app-shell--metal-slug">
      <div className="pm-artboard">
        <motion.div className="pm-ms-lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GameDuelBackdrop />

          <button type="button" className="pm-ms-back" onClick={handleBack} aria-label="Geri dön">
            <FiArrowLeft />
          </button>

          <div className="pm-ms-lobby__stack">
            <header className="pm-ms-lobby__hero">
              <p className="pm-ms-lobby__eyebrow">1v1 DUEL</p>
              <h1 className="pm-ms-lobby__title">
                <span className="is-orange">METAL</span>
                <span className="is-silver">SLUG</span>
                <span className="is-white">DUEL</span>
              </h1>
              <p className="pm-ms-lobby__sub">SLUG • BOMBA • ATEŞ</p>
            </header>

            <ul className="pm-ms-lobby__rules">
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

            <button type="button" className="pm-ms-lobby__cta" onClick={handleStart}>
              MAÇA BAŞLA
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
