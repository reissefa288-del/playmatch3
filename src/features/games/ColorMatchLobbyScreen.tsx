import { motion } from 'framer-motion'
import { useCallback } from 'react'
import { FiArrowLeft, FiZap } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { GameDuelBackdrop } from './components/GameDuelBackdrop'

const RULES = [
  { title: 'HEDEF', text: 'Ortadaki renk hangi karede ise ona dokun.' },
  { title: 'KOMBO', text: 'Arka arkaya doğru dokunuş kombo ve ekstra puan verir.' },
  { title: 'ROUND', text: '60 saniyede en yüksek skor. 3 round, 2 galibiyet kazanır.' },
]

export function ColorMatchLobbyScreen() {
  const navigate = useNavigate()

  const handleBack = useCallback(() => navigate(-1), [navigate])
  const handleStart = useCallback(() => navigate('/games/color-match/play'), [navigate])

  return (
    <div className="pm-app-shell pm-app-shell--game-play pm-app-shell--cmatch">
      <div className="pm-artboard">
        <motion.div className="pm-cmatch-lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GameDuelBackdrop />

          <button type="button" className="pm-cmatch-back" onClick={handleBack} aria-label="Geri dön">
            <FiArrowLeft />
          </button>

          <div className="pm-cmatch-lobby__stack">
            <header className="pm-cmatch-lobby__hero">
              <p className="pm-cmatch-lobby__eyebrow">1v1 DUEL</p>
              <h1 className="pm-cmatch-lobby__title">
                <span className="is-violet">COLOR</span>
                <span className="is-gold">MATCH</span>
              </h1>
              <p className="pm-cmatch-lobby__sub">RENK YAKALA • KOMBO YAP • SKORU UÇUR</p>
            </header>

            <ul className="pm-cmatch-lobby__rules">
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

            <div className="pm-cmatch-lobby__preview" aria-hidden>
              <span className="is-violet" />
              <span className="is-gold" />
              <span className="is-cyan" />
              <span className="is-pink" />
            </div>

            <button type="button" className="pm-cmatch-lobby__cta" onClick={handleStart}>
              MAÇA BAŞLA
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
