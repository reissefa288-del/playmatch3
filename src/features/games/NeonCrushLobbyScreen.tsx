import { motion } from 'framer-motion'
import { useCallback } from 'react'
import { FiArrowLeft, FiZap } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { GameDuelBackdrop } from './components/GameDuelBackdrop'

const RULES = [
  { title: 'EŞLEŞTİR', text: 'Komşu taşları kaydır, 3 veya daha fazla aynı sembolü patlat.' },
  { title: 'HEDEF', text: '80 saniyede 5000 puana ilk ulaşan roundu alır.' },
  { title: 'MAÇ', text: '3 round oynanır; 2 galibiyet maçı kazanır.' },
]

const PREVIEW_GEMS = ['heart', 'diamond', 'star', 'club', 'flame', 'moon'] as const

export function NeonCrushLobbyScreen() {
  const navigate = useNavigate()

  const handleBack = useCallback(() => navigate(-1), [navigate])
  const handleStart = useCallback(() => navigate('/games/neon-crush/play'), [navigate])

  return (
    <div className="pm-app-shell pm-app-shell--game-play pm-app-shell--ncrush">
      <div className="pm-artboard">
        <motion.div className="pm-ncrush-lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GameDuelBackdrop />

          <button type="button" className="pm-ncrush-back" onClick={handleBack} aria-label="Geri dön">
            <FiArrowLeft />
          </button>

          <div className="pm-ncrush-lobby__stack">
            <header className="pm-ncrush-lobby__hero">
              <p className="pm-ncrush-lobby__eyebrow">1v1 DUEL</p>
              <h1 className="pm-ncrush-lobby__title">
                <span className="is-cyan">NEON</span>
                <span className="is-pink">CRUSH</span>
              </h1>
              <p className="pm-ncrush-lobby__sub">EŞLEŞTİR • KOMBO YAP • SKORU UÇUR</p>
            </header>

            <ul className="pm-ncrush-lobby__rules">
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

            <div className="pm-ncrush-lobby__preview" aria-hidden>
              {PREVIEW_GEMS.map((gem) => (
                <span key={gem} className={`is-${gem}`} />
              ))}
            </div>

            <button type="button" className="pm-ncrush-lobby__cta" onClick={handleStart}>
              MAÇA BAŞLA
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
