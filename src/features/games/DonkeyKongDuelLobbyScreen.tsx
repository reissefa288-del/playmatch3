import { motion } from 'framer-motion'
import { useCallback } from 'react'
import { FiArrowLeft, FiZap } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { GameDuelBackdrop } from './components/GameDuelBackdrop'

const RULES = [
  { title: 'İKİ KULE', text: 'Solda senin Donkey Kong sahan, sağda Zeynep — aynı platform ve merdivenler.' },
  { title: 'TIRMAN & KAÇ', text: 'Üste çık 👸 kurtar (+900). Varillerden kaç; merdivende yukarı/aşağı, ZIPLA ile atla.' },
  { title: 'LEG', text: '48 sn veya 3500 puana ilk ulaşan leg alır. 3 leg, 2 galibiyet.' },
]

export function DonkeyKongDuelLobbyScreen() {
  const navigate = useNavigate()

  const handleBack = useCallback(() => navigate(-1), [navigate])
  const handleStart = useCallback(() => navigate('/games/donkey-kong-duel/play'), [navigate])

  return (
    <div className="pm-app-shell pm-app-shell--game-play pm-app-shell--dk">
      <div className="pm-artboard">
        <motion.div className="pm-dk-lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GameDuelBackdrop />

          <button type="button" className="pm-dk-back" onClick={handleBack} aria-label="Geri dön">
            <FiArrowLeft />
          </button>

          <div className="pm-dk-lobby__stack">
            <header className="pm-dk-lobby__hero">
              <p className="pm-dk-lobby__eyebrow">1v1 DUEL</p>
              <h1 className="pm-dk-lobby__title">
                <span className="is-brown">DONKEY</span>
                <span className="is-red">KONG</span>
              </h1>
              <p className="pm-dk-lobby__sub">TIRMAN • VARİL • KURTAR</p>
            </header>

            <ul className="pm-dk-lobby__rules">
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

            <button type="button" className="pm-dk-lobby__cta" onClick={handleStart}>
              MAÇA BAŞLA
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
