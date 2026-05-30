import { motion } from 'framer-motion'
import { useCallback } from 'react'
import { FiArrowLeft, FiZap } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { GameDuelBackdrop } from './components/GameDuelBackdrop'

const RULES = [
  { title: 'İKİ KORİDOR', text: 'Solda senin Gradius sahan, sağda Zeynep — aynı dalga, ayrı skor.' },
  { title: 'YATAY ATEŞ', text: '▲▼ veya parmağınla Vic Viper’ı kaydır; ATEŞ sağa lazer. Düşmanlar soldan gelir!' },
  { title: 'GÜÇ P', text: 'Kapsül topla → çift ateş / MAX. 46 sn veya 3800 puan — 3 leg, 2 galibiyet.' },
]

export function GradiusDuelLobbyScreen() {
  const navigate = useNavigate()

  const handleBack = useCallback(() => navigate(-1), [navigate])
  const handleStart = useCallback(() => navigate('/games/gradius-duel/play'), [navigate])

  return (
    <div className="pm-app-shell pm-app-shell--game-play pm-app-shell--gradius">
      <div className="pm-artboard">
        <motion.div className="pm-grd-lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GameDuelBackdrop />

          <button type="button" className="pm-grd-back" onClick={handleBack} aria-label="Geri dön">
            <FiArrowLeft />
          </button>

          <div className="pm-grd-lobby__stack">
            <header className="pm-grd-lobby__hero">
              <p className="pm-grd-lobby__eyebrow">1v1 DUEL</p>
              <h1 className="pm-grd-lobby__title">
                <span className="is-teal">GRADIUS</span>
                <span className="is-violet">DUEL</span>
              </h1>
              <p className="pm-grd-lobby__sub">LAZER • KAPSÜL • DALGA</p>
            </header>

            <ul className="pm-grd-lobby__rules">
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

            <button type="button" className="pm-grd-lobby__cta" onClick={handleStart}>
              MAÇA BAŞLA
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
