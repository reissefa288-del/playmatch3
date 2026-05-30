import { motion } from 'framer-motion'
import { useCallback } from 'react'
import { FiArrowLeft, FiZap } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { GameDuelBackdrop } from './components/GameDuelBackdrop'

const RULES = [
  { title: 'ENDURO YOLU', text: 'Solda senin motosiklet sahan, sağda Zeynep — toprak patikada kal, çimen = yavaşlama!' },
  { title: 'SUR & GEÇ', text: '◀▶ ile şerit değiştir; diğer sürücüleri geç, taş ve su birikintisinden kaç.' },
  { title: 'HAVA & SPRINT', text: 'Gündüz→gece→sis döngüsü. SPRINT ile hızlan. 52 sn veya 3800 puan — 3 leg, 2 galibiyet.' },
]

export function EnduroDuelLobbyScreen() {
  const navigate = useNavigate()

  const handleBack = useCallback(() => navigate(-1), [navigate])
  const handleStart = useCallback(() => navigate('/games/enduro-duel/play'), [navigate])

  return (
    <div className="pm-app-shell pm-app-shell--game-play pm-app-shell--enduro">
      <div className="pm-artboard">
        <motion.div className="pm-en-lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GameDuelBackdrop />

          <button type="button" className="pm-en-back" onClick={handleBack} aria-label="Geri dön">
            <FiArrowLeft />
          </button>

          <div className="pm-en-lobby__stack">
            <header className="pm-en-lobby__hero">
              <p className="pm-en-lobby__eyebrow">1v1 DUEL</p>
              <h1 className="pm-en-lobby__title">
                <span className="is-amber">ENDURO</span>
                <span className="is-white">DUEL</span>
              </h1>
              <p className="pm-en-lobby__sub">PATİKA • HAVA • SPRINT</p>
            </header>

            <ul className="pm-en-lobby__rules">
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

            <button type="button" className="pm-en-lobby__cta" onClick={handleStart}>
              MAÇA BAŞLA
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
