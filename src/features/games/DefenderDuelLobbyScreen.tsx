import { motion } from 'framer-motion'
import { useCallback } from 'react'
import { FiArrowLeft, FiZap } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { GameDuelBackdrop } from './components/GameDuelBackdrop'

const RULES = [
  { title: 'İKİ UFUK', text: 'Solda senin Defender sahan, sağda Zeynep — aynı dalga savunması.' },
  { title: 'SAVUN & KURTAR', text: '▲▼ veya parmağınla gemiyi kaydır; ATEŞ ile düşman vur. İnen lander’lara dikkat!' },
  { title: 'LEG', text: '48 sn veya 3600 puana ilk ulaşan leg alır. İnsanlar kaçırılırsa −puan — 3 leg, 2 galibiyet.' },
]

export function DefenderDuelLobbyScreen() {
  const navigate = useNavigate()

  const handleBack = useCallback(() => navigate(-1), [navigate])
  const handleStart = useCallback(() => navigate('/games/defender-duel/play'), [navigate])

  return (
    <div className="pm-app-shell pm-app-shell--game-play pm-app-shell--defender">
      <div className="pm-artboard">
        <motion.div className="pm-def-lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GameDuelBackdrop />

          <button type="button" className="pm-def-back" onClick={handleBack} aria-label="Geri dön">
            <FiArrowLeft />
          </button>

          <div className="pm-def-lobby__stack">
            <header className="pm-def-lobby__hero">
              <p className="pm-def-lobby__eyebrow">1v1 DUEL</p>
              <h1 className="pm-def-lobby__title">
                <span className="is-lime">DEFENDER</span>
                <span className="is-cyan">DUEL</span>
              </h1>
              <p className="pm-def-lobby__sub">SAVUN • İNSAN • DALGA</p>
            </header>

            <ul className="pm-def-lobby__rules">
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

            <button type="button" className="pm-def-lobby__cta" onClick={handleStart}>
              MAÇA BAŞLA
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
