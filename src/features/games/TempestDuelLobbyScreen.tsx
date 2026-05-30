import { motion } from 'framer-motion'
import { useCallback } from 'react'
import { FiArrowLeft, FiZap } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { GameDuelBackdrop } from './components/GameDuelBackdrop'

const RULES = [
  { title: 'İKİ KUYU', text: 'Solda senin tüp sahan, sağda Zeynep — her biri kendi düşman dalgasıyla.' },
  { title: 'DÖN & VUR', text: '◀ ▶ ile şerit değiştir, ATEŞ ile merkeze doğru ışın gönder. Düşmanlar sana yaklaşır.' },
  { title: 'LEG', text: '46 sn veya 3800 puana ilk ulaşan leg alır. 3 leg, 2 galibiyet.' },
]

export function TempestDuelLobbyScreen() {
  const navigate = useNavigate()

  const handleBack = useCallback(() => navigate(-1), [navigate])
  const handleStart = useCallback(() => navigate('/games/tempest-duel/play'), [navigate])

  return (
    <div className="pm-app-shell pm-app-shell--game-play pm-app-shell--tempest">
      <div className="pm-artboard">
        <motion.div className="pm-tempest-lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GameDuelBackdrop />

          <button type="button" className="pm-tempest-back" onClick={handleBack} aria-label="Geri dön">
            <FiArrowLeft />
          </button>

          <div className="pm-tempest-lobby__stack">
            <header className="pm-tempest-lobby__hero">
              <p className="pm-tempest-lobby__eyebrow">1v1 DUEL</p>
              <h1 className="pm-tempest-lobby__title">
                <span className="is-magenta">TEMPEST</span>
                <span className="is-cyan">DUEL</span>
              </h1>
              <p className="pm-tempest-lobby__sub">TÜP • ŞERİT • IŞIN</p>
            </header>

            <ul className="pm-tempest-lobby__rules">
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

            <button type="button" className="pm-tempest-lobby__cta" onClick={handleStart}>
              MAÇA BAŞLA
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
