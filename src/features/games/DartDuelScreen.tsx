import { motion } from 'framer-motion'
import { useCallback, useState } from 'react'
import { FiArrowLeft, FiClock, FiSettings } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { FAKE_PORTRAIT_FEMALE, FAKE_PORTRAIT_MALE } from '../../shared/fakePortraits'
import { DartBoard } from './components/DartBoard'
import { DartThrowPad } from './components/DartThrowPad'
import { GameDuelBackdrop } from './components/GameDuelBackdrop'
import { GamePlayerPortrait } from './components/GamePlayerPortrait'
import { useDartDuel } from './useDartDuel'

export function DartDuelScreen() {
  const navigate = useNavigate()
  const game = useDartDuel()
  const [aimPreview, setAimPreview] = useState<number | null>(null)

  const handleBack = useCallback(() => navigate('/games/dart-duel'), [navigate])
  const canThrow = game.running && !game.legMessage && game.activePlayer === 'p1' && !game.isThrowing

  const overlayMessage = !game.running
    ? game.winner === 'draw'
      ? 'MAÇ BERABERE'
      : game.winner === 'p1'
        ? 'EMİR KAZANDI'
        : 'ZEYNEP KAZANDI'
    : game.legMessage

  return (
    <div className="pm-app-shell pm-app-shell--game-play pm-app-shell--dart">
      <div className="pm-artboard">
        <motion.div className="pm-dart-screen" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GameDuelBackdrop />

          <button type="button" className="pm-dart-back" onClick={handleBack} aria-label="Geri dön">
            <FiArrowLeft />
          </button>
          <button type="button" className="pm-dart-settings" aria-label="Ayarlar">
            <FiSettings />
          </button>

          <div className="pm-dart-screen__stack">
            <header className="pm-dart-header">
              <h1 className="pm-dart-header__title">
                <span className="is-gold">DART</span>
                <span className="is-orange">DUEL</span>
              </h1>
              <p className="pm-dart-header__sub">301 • SÜRÜKLE &amp; BIRAK • 2 LEG</p>
            </header>

            <section className="pm-dart-hud">
              <div className="pm-dart-hud__side">
                <GamePlayerPortrait src={FAKE_PORTRAIT_MALE} variant="cyan" active={game.activePlayer === 'p1'} />
                <p className="pm-dart-hud__name">EMİR</p>
                <span className="pm-dart-hud__legs">LEG {game.lane1.legPoints}</span>
              </div>

              <div className="pm-dart-hud__center">
                <div className="pm-dart-hud__stat">
                  <FiClock aria-hidden />
                  <span>TUR</span>
                  <strong>{game.turnTimeLeft}s</strong>
                </div>
                <div className="pm-dart-hud__stat">
                  <span>ATIŞ</span>
                  <strong>{game.throwsLeft}/3</strong>
                </div>
                <div className="pm-dart-hud__stat">
                  <span>LEG</span>
                  <strong>
                    {game.legNumber}/{game.matchLegs}
                  </strong>
                </div>
              </div>

              <div className="pm-dart-hud__side is-p2">
                <GamePlayerPortrait src={FAKE_PORTRAIT_FEMALE} variant="pink" active={game.activePlayer === 'p2'} />
                <p className="pm-dart-hud__name">ZEYNEP</p>
                <span className="pm-dart-hud__legs">LEG {game.lane2.legPoints}</span>
              </div>
            </section>

            <section className="pm-dart-arena">
              <div className="pm-dart-arena__p1">
                <DartBoard
                  lane={game.lane1}
                  accent="cyan"
                  lastHit={game.lastHit}
                  flight={game.p1Flight}
                  aimPreview={canThrow ? aimPreview : null}
                />
                <DartThrowPad
                  disabled={!canThrow}
                  onThrow={game.throwP1}
                  onAimChange={setAimPreview}
                />
              </div>

              <span className="pm-dart-vs" aria-hidden>
                VS
              </span>

              <div className="pm-dart-arena__p2">
                <DartBoard lane={game.lane2} accent="pink" lastHit={game.p2LastHit} flight={game.p2Flight} />
              </div>
            </section>

            <p className="pm-dart-hint">
              {game.isThrowing
                ? 'Dart uçuyor…'
                : canThrow
                  ? 'Atış çizgisinden yukarı sürükle — nişan & güç'
                  : game.activePlayer === 'p2'
                    ? 'Rakip atıyor…'
                    : 'Sıra sende…'}
            </p>
          </div>

          {overlayMessage ? (
            <motion.div className="pm-dart-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} role="status">
              <p>{overlayMessage}</p>
              {!game.running ? (
                <button type="button" onClick={game.restartMatch}>
                  Tekrar Oyna
                </button>
              ) : null}
            </motion.div>
          ) : null}
        </motion.div>
      </div>
    </div>
  )
}
