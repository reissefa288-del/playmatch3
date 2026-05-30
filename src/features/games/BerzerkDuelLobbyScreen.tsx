import { motion } from 'framer-motion'
import { useCallback } from 'react'
import { FiArrowLeft, FiZap } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { GameDuelBackdrop } from './components/GameDuelBackdrop'

const RULES = [
  { title: 'İKİ LABİRENT', text: 'Solda senin Berzerk arenan, sağda Zeynep — aynı robot dalgası, ayrı skor.' },
  { title: 'KOŞ & ATEŞ', text: 'D-pad ile koridorlarda gez; ATEŞ son baktığın yöne lazer. Duvarlara çarpma!' },
  { title: 'OTTO', text: 'Çok beklenirsen ☺ Otto gelir — kaç veya vur. 46 sn / 3800 puan, 3 leg, 2 galibiyet.' },
]

export function BerzerkDuelLobbyScreen() {
  const navigate = useNavigate()

  const handleBack = useCallback(() => navigate(-1), [navigate])
  const handleStart = useCallback(() => navigate('/games/berzerk-duel/play'), [navigate])

  return (
    <div className="pm-app-shell pm-app-shell--game-play pm-app-shell--berzerk">
      <div className="pm-artboard">
        <motion.div className="pm-bz-lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GameDuelBackdrop />

          <button type="button" className="pm-bz-back" onClick={handleBack} aria-label="Geri dön">
            <FiArrowLeft />
          </button>

          <div className="pm-bz-lobby__stack">
            <header className="pm-bz-lobby__hero">
              <p className="pm-bz-lobby__eyebrow">1v1 DUEL</p>
              <h1 className="pm-bz-lobby__title">
                <span className="is-orange">BERZERK</span>
                <span className="is-red">DUEL</span>
              </h1>
              <p className="pm-bz-lobby__sub">ROBOT • LAZER • OTTO</p>
            </header>

            <ul className="pm-bz-lobby__rules">
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

            <button type="button" className="pm-bz-lobby__cta" onClick={handleStart}>
              MAÇA BAŞLA
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
