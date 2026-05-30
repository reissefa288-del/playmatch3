import { motion } from 'framer-motion'
import { useCallback } from 'react'
import { FiArrowLeft, FiZap } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { GameDuelBackdrop } from './components/GameDuelBackdrop'

const RULES = [
  { title: 'İKİ YOL', text: 'Solda senin Out Run sahan, sağda Zeynep — aynı günbatımı, ayrı skor.' },
  { title: 'SÜR & SOLLA', text: '◀▶ ile şerit değiştir; trafiği sollayıp puan topla. Çarpışma = can kaybı!' },
  { title: 'NİTRO', text: 'NİTRO ile hızlan. 48 sn veya 4200 puan — 3 leg, 2 galibiyet.' },
]

export function OutRunDuelLobbyScreen() {
  const navigate = useNavigate()

  const handleBack = useCallback(() => navigate(-1), [navigate])
  const handleStart = useCallback(() => navigate('/games/outrun-duel/play'), [navigate])

  return (
    <div className="pm-app-shell pm-app-shell--game-play pm-app-shell--outrun">
      <div className="pm-artboard">
        <motion.div className="pm-or-lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GameDuelBackdrop />

          <button type="button" className="pm-or-back" onClick={handleBack} aria-label="Geri dön">
            <FiArrowLeft />
          </button>

          <div className="pm-or-lobby__stack">
            <header className="pm-or-lobby__hero">
              <p className="pm-or-lobby__eyebrow">1v1 DUEL</p>
              <h1 className="pm-or-lobby__title">
                <span className="is-sunset">OUT</span>
                <span className="is-coral">RUN</span>
                <span className="is-white">DUEL</span>
              </h1>
              <p className="pm-or-lobby__sub">YOL • SOLLAMA • NİTRO</p>
            </header>

            <ul className="pm-or-lobby__rules">
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

            <button type="button" className="pm-or-lobby__cta" onClick={handleStart}>
              MAÇA BAŞLA
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
