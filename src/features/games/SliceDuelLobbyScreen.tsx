import { motion } from 'framer-motion'
import { useCallback } from 'react'
import { FiArrowLeft, FiZap } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { GameDuelBackdrop } from './components/GameDuelBackdrop'

const RULES = [
  { title: 'KES', text: 'Yukarı fırlayan meyve simgelerini parmağınla kaydırarak kes — puan kazan.' },
  { title: 'BOMBA', text: '💣 simgesine dokunma — kesersen puan kaybedersin, combo sıfırlanır.' },
  { title: 'LEG', text: '42 sn veya 3200 puana ilk ulaşan leg alır. 3 leg, 2 galibiyet.' },
]

export function SliceDuelLobbyScreen() {
  const navigate = useNavigate()

  const handleBack = useCallback(() => navigate(-1), [navigate])
  const handleStart = useCallback(() => navigate('/games/slice-duel/play'), [navigate])

  return (
    <div className="pm-app-shell pm-app-shell--game-play pm-app-shell--slice">
      <div className="pm-artboard">
        <motion.div className="pm-slice-lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GameDuelBackdrop />

          <button type="button" className="pm-slice-back" onClick={handleBack} aria-label="Geri dön">
            <FiArrowLeft />
          </button>

          <div className="pm-slice-lobby__stack">
            <header className="pm-slice-lobby__hero">
              <p className="pm-slice-lobby__eyebrow">1v1 DUEL</p>
              <h1 className="pm-slice-lobby__title">
                <span className="is-orange">SLICE</span>
                <span className="is-lime">DUEL</span>
              </h1>
              <p className="pm-slice-lobby__sub">KES • KAÇIN • KAZAN</p>
            </header>

            <ul className="pm-slice-lobby__rules">
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

            <button type="button" className="pm-slice-lobby__cta" onClick={handleStart}>
              MAÇA BAŞLA
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
