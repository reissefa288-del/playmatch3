import { motion } from 'framer-motion'
import { useCallback } from 'react'
import { FiArrowLeft, FiZap } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { GameDuelBackdrop } from './components/GameDuelBackdrop'

const RULES = [
  { title: 'PUNCH-OUT', text: 'Solda senin ring, sağda Zeynep — rakibin telegraph okunu oku, doğru kaç!' },
  { title: 'KAÇ & VUR', text: '← SOL, → SAĞ, ↓ ALT saldırılarına göre kaç. Açılınca JAB / HOOK / ALT vur.' },
  { title: 'KNOCKOUT', text: 'Kontra bonusu + nakavt puanı. 55 sn veya 3600 puan — 3 leg, 2 galibiyet.' },
]

export function PunchOutDuelLobbyScreen() {
  const navigate = useNavigate()

  const handleBack = useCallback(() => navigate(-1), [navigate])
  const handleStart = useCallback(() => navigate('/games/punch-out-duel/play'), [navigate])

  return (
    <div className="pm-app-shell pm-app-shell--game-play pm-app-shell--punch-out">
      <div className="pm-artboard">
        <motion.div className="pm-po-lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GameDuelBackdrop />

          <button type="button" className="pm-po-back" onClick={handleBack} aria-label="Geri dön">
            <FiArrowLeft />
          </button>

          <div className="pm-po-lobby__stack">
            <header className="pm-po-lobby__hero">
              <p className="pm-po-lobby__eyebrow">1v1 DUEL</p>
              <h1 className="pm-po-lobby__title">
                <span className="is-gold">PUNCH</span>
                <span className="is-red">OUT</span>
                <span className="is-white">DUEL</span>
              </h1>
              <p className="pm-po-lobby__sub">TELEGRAPH • KAÇ • VUR</p>
            </header>

            <ul className="pm-po-lobby__rules">
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

            <button type="button" className="pm-po-lobby__cta" onClick={handleStart}>
              MAÇA BAŞLA
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
