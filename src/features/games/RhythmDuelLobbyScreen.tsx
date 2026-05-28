import { motion } from 'framer-motion'
import { useCallback } from 'react'
import { FiArrowLeft, FiZap } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { GameDuelBackdrop } from './components/GameDuelBackdrop'

const RULES = [
  { title: '4 ŞERİT', text: 'Düşen notalar çizgiye gelince doğru renkli şeride dokun.' },
  { title: 'PUAN', text: 'Perfect +150, Good +70 — combo çarpanı artar. Miss combo sıfırlar.' },
  { title: 'LEG', text: '45 sn veya 3500 puana ilk ulaşan leg alır. 3 leg, 2 galibiyet.' },
]

export function RhythmDuelLobbyScreen() {
  const navigate = useNavigate()

  const handleBack = useCallback(() => navigate(-1), [navigate])
  const handleStart = useCallback(() => navigate('/games/rhythm-duel/play'), [navigate])

  return (
    <div className="pm-app-shell pm-app-shell--game-play pm-app-shell--rhythm">
      <div className="pm-artboard">
        <motion.div className="pm-rhythm-lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GameDuelBackdrop />

          <button type="button" className="pm-rhythm-back" onClick={handleBack} aria-label="Geri dön">
            <FiArrowLeft />
          </button>

          <div className="pm-rhythm-lobby__stack">
            <header className="pm-rhythm-lobby__hero">
              <p className="pm-rhythm-lobby__eyebrow">1v1 DUEL</p>
              <h1 className="pm-rhythm-lobby__title">
                <span className="is-pink">RHYTHM</span>
                <span className="is-electric">DUEL</span>
              </h1>
              <p className="pm-rhythm-lobby__sub">VURUŞ ÇİZGİSİ • COMBO • KAZAN</p>
            </header>

            <ul className="pm-rhythm-lobby__rules">
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

            <button type="button" className="pm-rhythm-lobby__cta" onClick={handleStart}>
              MAÇA BAŞLA
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
