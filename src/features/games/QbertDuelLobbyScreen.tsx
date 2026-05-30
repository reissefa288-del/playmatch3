import { motion } from 'framer-motion'
import { useCallback } from 'react'
import { FiArrowLeft, FiZap } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { GameDuelBackdrop } from './components/GameDuelBackdrop'

const RULES = [
  { title: 'İKİ PİRAMİT', text: 'Solda senin Q*bert sahan, sağda Zeynep — aynı 7 katlı piramit.' },
  { title: 'ZIPLA & BOYAT', text: 'Çapraz zıpla; karelere iki kez basınca hedef renk (+puan). Tüm piramit = bonus.' },
  { title: 'LEG', text: '45 sn veya 3200 puana ilk ulaşan leg alır. Coily’den kaç — 3 leg, 2 galibiyet.' },
]

export function QbertDuelLobbyScreen() {
  const navigate = useNavigate()

  const handleBack = useCallback(() => navigate(-1), [navigate])
  const handleStart = useCallback(() => navigate('/games/qbert-duel/play'), [navigate])

  return (
    <div className="pm-app-shell pm-app-shell--game-play pm-app-shell--qb">
      <div className="pm-artboard">
        <motion.div className="pm-qb-lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GameDuelBackdrop />

          <button type="button" className="pm-qb-back" onClick={handleBack} aria-label="Geri dön">
            <FiArrowLeft />
          </button>

          <div className="pm-qb-lobby__stack">
            <header className="pm-qb-lobby__hero">
              <p className="pm-qb-lobby__eyebrow">1v1 DUEL</p>
              <h1 className="pm-qb-lobby__title">
                <span className="is-orange">Q*</span>
                <span className="is-purple">BERT</span>
              </h1>
              <p className="pm-qb-lobby__sub">ZIPLA • BOYAT • COILY</p>
            </header>

            <ul className="pm-qb-lobby__rules">
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

            <button type="button" className="pm-qb-lobby__cta" onClick={handleStart}>
              MAÇA BAŞLA
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
