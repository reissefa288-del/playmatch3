import { useCallback, useRef } from 'react'
import { unlockNeonCrushAudio } from './utils/neonCrushSounds'
import { FiArrowLeft, FiClock, FiSettings, FiZap } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { FAKE_PORTRAIT_FEMALE, FAKE_PORTRAIT_MALE } from '../../shared/fakePortraits'
import { NeonCrushGrid } from './components/NeonCrushGrid'
import { GameDuelBackdrop } from './components/GameDuelBackdrop'
import { GamePlayerPortrait } from './components/GamePlayerPortrait'
import { useNeonCrushDuel } from './useNeonCrushDuel'

function formatTime(sec: number) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function formatScore(n: number) {
  return n.toLocaleString('tr-TR')
}

export function NeonCrushDuelScreen() {
  const navigate = useNavigate()
  const game = useNeonCrushDuel()
  const audioUnlockedRef = useRef(false)

  const handleBack = useCallback(() => navigate('/games'), [navigate])
  const canPlay = game.running && !game.matchMessage

  const ensureAudio = useCallback(() => {
    if (audioUnlockedRef.current) return
    audioUnlockedRef.current = true
    unlockNeonCrushAudio()
  }, [])

  const handleTapCell = useCallback(
    (index: number) => {
      ensureAudio()
      game.tapCell(index)
    },
    [ensureAudio, game.tapCell],
  )

  const overlayMessage = !game.running
    ? game.winner === 'draw'
      ? 'MAÇ BERABERE'
      : game.winner === 'p1'
        ? 'EMİR KAZANDI'
        : 'ZEYNEP KAZANDI'
    : game.matchMessage

  return (
    <div className="pm-app-shell pm-app-shell--game-play pm-app-shell--ncrush">
      <div className="pm-artboard">
        <div className="pm-ncrush-screen">
          <GameDuelBackdrop />

          <button type="button" className="pm-ncrush-back" onClick={handleBack} aria-label="Geri dön">
            <FiArrowLeft />
          </button>
          <button type="button" className="pm-ncrush-settings" aria-label="Ayarlar">
            <FiSettings />
          </button>

          <div className="pm-ncrush-screen__stack">
            <header className="pm-ncrush-header">
              <h1 className="pm-ncrush-header__title">
                <span className="is-cyan">NEON</span>
                <span className="is-pink">CRUSH</span>
              </h1>
              <p className="pm-ncrush-header__sub">1:30 • EN YÜKSEK SKOR</p>
            </header>

            <section className="pm-ncrush-hud">
              <div className="pm-ncrush-hud__side">
                <GamePlayerPortrait src={FAKE_PORTRAIT_MALE} variant="cyan" active={game.running} />
                <p className="pm-ncrush-hud__name">EMİR</p>
                <strong className="pm-ncrush-hud__score">{formatScore(game.lane1.roundScore)}</strong>
              </div>

              <div className="pm-ncrush-hud__center">
                <div className="pm-ncrush-hud__stat is-timer">
                  <FiClock aria-hidden />
                  <span>SÜRE</span>
                  <strong>{formatTime(game.timeLeft)}</strong>
                </div>
                <div className="pm-ncrush-hud__stat">
                  <FiZap aria-hidden />
                  <span>KURAL</span>
                  <strong>1:30 SKOR</strong>
                </div>
              </div>

              <div className="pm-ncrush-hud__side is-p2">
                <GamePlayerPortrait src={FAKE_PORTRAIT_FEMALE} variant="pink" active={game.running} />
                <p className="pm-ncrush-hud__name">ZEYNEP</p>
                <strong className="pm-ncrush-hud__score">{formatScore(game.lane2.roundScore)}</strong>
              </div>
            </section>

            <section className="pm-ncrush-arena" key={game.boardKey} onPointerDown={ensureAudio}>
              <div className="pm-ncrush-arena__lane">
                <NeonCrushGrid
                  lane={game.lane1}
                  accent="cyan"
                  interactive={canPlay}
                  selected={game.selected}
                  onTap={handleTapCell}
                />
              </div>
              <div className="pm-ncrush-arena__lane">
                <NeonCrushGrid lane={game.lane2} accent="pink" />
              </div>
            </section>

            <footer className="pm-ncrush-footer">
              <div className="pm-ncrush-footer__side is-cyan">
                <span className="pm-ncrush-footer__label">SEN</span>
                <span className="pm-ncrush-footer__hint">Komşu taşları kaydır</span>
              </div>
              <p className="pm-ncrush-footer__center">3+ eşleştir • a4/a5 özel FX • süre bitince skor</p>
              <div className="pm-ncrush-footer__side is-pink">
                <span className="pm-ncrush-footer__label">RAKİP</span>
                <span className="pm-ncrush-footer__hint">En yüksek puan</span>
              </div>
            </footer>
          </div>

          {overlayMessage ? (
            <div className="pm-ncrush-overlay" role="status">
              <p>{overlayMessage}</p>
              {!game.running ? (
                <button type="button" onClick={game.restartMatch}>
                  Tekrar Oyna
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
