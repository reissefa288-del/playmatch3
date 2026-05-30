import { motion } from 'framer-motion'
import { useCallback } from 'react'
import { FiArrowLeft, FiZap } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { GameDuelBackdrop } from './components/GameDuelBackdrop'

const RULES = [
  { title: 'İKİ SOKAK', text: 'Solda senin Paperboy rotan, sağda Zeynep — aynı ilerleyen mahalle.' },
  { title: 'DAĞIT & KAÇ', text: '◀ ▶ ile şerit değiştir; GAZETE ile posta kutularına at. Seri teslimat bonusu.' },
  { title: 'LEG', text: '48 sn veya 3400 puana ilk ulaşan leg alır. Araba/köpekten kaç — 3 leg, 2 galibiyet.' },
]

export function PaperboyDuelLobbyScreen() {
  const navigate = useNavigate()

  const handleBack = useCallback(() => navigate(-1), [navigate])
  const handleStart = useCallback(() => navigate('/games/paperboy-duel/play'), [navigate])

  return (
    <div className="pm-app-shell pm-app-shell--game-play pm-app-shell--paperboy">
      <div className="pm-artboard">
        <motion.div className="pm-pb-lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GameDuelBackdrop />

          <button type="button" className="pm-pb-back" onClick={handleBack} aria-label="Geri dön">
            <FiArrowLeft />
          </button>

          <div className="pm-pb-lobby__stack">
            <header className="pm-pb-lobby__hero">
              <p className="pm-pb-lobby__eyebrow">1v1 DUEL</p>
              <h1 className="pm-pb-lobby__title">
                <span className="is-red">PAPER</span>
                <span className="is-yellow">BOY</span>
              </h1>
              <p className="pm-pb-lobby__sub">BİSİKLET • GAZETE • DAĞITIM</p>
            </header>

            <ul className="pm-pb-lobby__rules">
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

            <button type="button" className="pm-pb-lobby__cta" onClick={handleStart}>
              MAÇA BAŞLA
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
