import { motion } from 'framer-motion'
import { useCallback } from 'react'
import { FiArrowLeft, FiZap } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { GameDuelBackdrop } from './components/GameDuelBackdrop'

const RULES = [
  { title: 'KUNG-FU', text: 'Solda senin dojo, sağda Zeynep — rakibin ↑ ÜST, ↓ ALT, ⇢ DAL saldırılarını oku.' },
  { title: 'BLOK & KONTRA', text: '↑ üst blok, ↓ alt blok, ← geri kaç. Doğru blok sonrası YUMRUK / TEKME / AVUÇ vur.' },
  { title: 'COMBO', text: 'Ardışık kontra combo bonusu. 55 sn veya 3800 puan — 3 leg, 2 galibiyet.' },
]

export function KungFuDuelLobbyScreen() {
  const navigate = useNavigate()

  const handleBack = useCallback(() => navigate(-1), [navigate])
  const handleStart = useCallback(() => navigate('/games/kung-fu-duel/play'), [navigate])

  return (
    <div className="pm-app-shell pm-app-shell--game-play pm-app-shell--kung-fu">
      <div className="pm-artboard">
        <motion.div className="pm-kf-lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GameDuelBackdrop />

          <button type="button" className="pm-kf-back" onClick={handleBack} aria-label="Geri dön">
            <FiArrowLeft />
          </button>

          <div className="pm-kf-lobby__stack">
            <header className="pm-kf-lobby__hero">
              <p className="pm-kf-lobby__eyebrow">1v1 DUEL</p>
              <h1 className="pm-kf-lobby__title">
                <span className="is-gold">KUNG</span>
                <span className="is-red">FU</span>
                <span className="is-white">DUEL</span>
              </h1>
              <p className="pm-kf-lobby__sub">BLOK • KONTRA • COMBO</p>
            </header>

            <ul className="pm-kf-lobby__rules">
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

            <button type="button" className="pm-kf-lobby__cta" onClick={handleStart}>
              MAÇA BAŞLA
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
