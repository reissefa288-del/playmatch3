import { useCallback } from 'react'
import { FiArrowLeft, FiZap } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { GameDuelBackdrop } from './components/GameDuelBackdrop'

const RULES = [
  { title: 'İKİ GÖKYÜZÜ', text: 'Solda senin Sky Ace sahan, sağda rakip — aynı dalga, ayrı skor.' },
  { title: 'UÇ & OTOMATİK ATEŞ', text: 'Parmağınla uçağı kaydır; ateş otomatik. Dalış yapan düşmanlara dikkat!' },
  { title: 'LEG', text: '44 sn veya 4000 puana ilk ulaşan leg alır. 3 leg, 2 galibiyet.' },
]

export function Game1942DuelLobbyScreen() {
  const navigate = useNavigate()

  const handleBack = useCallback(() => navigate(-1), [navigate])
  const handleStart = useCallback(() => navigate('/games/1942-duel/play'), [navigate])

  return (
    <div className="pm-app-shell pm-app-shell--game-play pm-app-shell--1942">
      <div className="pm-artboard">
        <div className="pm-y42-lobby">
          <GameDuelBackdrop />

          <button type="button" className="pm-y42-back" onClick={handleBack} aria-label="Geri dön">
            <FiArrowLeft />
          </button>

          <div className="pm-y42-lobby__stack">
            <header className="pm-y42-lobby__hero">
              <p className="pm-y42-lobby__eyebrow">1v1 DUEL</p>
              <h1 className="pm-y42-lobby__title">
                <span className="is-sky">SKY ACE</span>
                <span className="is-gold">DUEL</span>
              </h1>
              <p className="pm-y42-lobby__sub">DALGA • FORM • OTOMATİK ATEŞ</p>
            </header>

            <ul className="pm-y42-lobby__rules">
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

            <button type="button" className="pm-y42-lobby__cta" onClick={handleStart}>
              MAÇA BAŞLA
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
