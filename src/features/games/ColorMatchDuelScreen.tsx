import '../../styles/color-match.css'
import { useCallback } from 'react'
import { FiArrowLeft, FiClock } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { FAKE_PORTRAIT_MALE } from '../../shared/fakePortraits'
import { ColorMatchGrid } from './components/ColorMatchGrid'
import { GameDuelBackdrop } from './components/GameDuelBackdrop'
import { GameDuelRematchActions } from './components/GameDuelRematchActions'
import { GamePlayerPortrait } from './components/GamePlayerPortrait'
import { useColorMatchDuel } from './useColorMatchDuel'
import { useOpponentLikeProps } from './useGameOpponent'

function formatTime(sec: number) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function formatScore(n: number) {
  return n.toLocaleString('tr-TR')
}

function RoundDots({ wins, max, variant }: { wins: number; max: number; variant: 'cyan' | 'pink' }) {
  return (
    <span className={`pm-cmatch-round-dots is-${variant}`} aria-label={`${wins} round galibiyeti`}>
      {Array.from({ length: max }, (_, i) => (
        <i key={i} className={i < wins ? 'is-won' : ''} />
      ))}
    </span>
  )
}

export function ColorMatchDuelScreen() {
  const { opponent, likeProps } = useOpponentLikeProps()
  const navigate = useNavigate()
  const game = useColorMatchDuel()

  const handleBack = useCallback(() => navigate('/games'), [navigate])
  const canPlay = game.running && !game.roundMessage

  const overlayMessage = !game.running
    ? game.winner === 'draw'
      ? 'MAÇ BERABERE'
      : game.winner === 'p1'
        ? 'EMİR KAZANDI'
        : 'ZEYNEP KAZANDI'
    : game.roundMessage

  return (
    <div className="pm-app-shell pm-app-shell--game-play pm-app-shell--cmatch">
      <div className="pm-artboard">
        <div className="pm-cmatch-screen">
          <GameDuelBackdrop />

          <button type="button" className="pm-cmatch-back" onClick={handleBack} aria-label="Geri dön">
            <FiArrowLeft />
          </button>
          <div className="pm-cmatch-screen__stack">
            <header className="pm-cmatch-header">
              <h1 className="pm-cmatch-header__title">
                <span className="is-violet">COLOR</span>
                <span className="is-gold">MATCH</span>
              </h1>
              <p className="pm-cmatch-header__sub">HEDEF RENKLERE DOKUN • HEPSİNİ EŞLEŞTİR</p>
            </header>

            <section className="pm-cmatch-hud">
              <div className="pm-cmatch-hud__side">
                <GamePlayerPortrait src={FAKE_PORTRAIT_MALE} variant="cyan" active={game.running} />
                <p className="pm-cmatch-hud__name">EMİR</p>
                <strong className="pm-cmatch-hud__score">{formatScore(game.lane1.score)}</strong>
                <span className="pm-cmatch-hud__combo">x{game.lane1.comboMult.toFixed(1)}</span>
              </div>

              <div className="pm-cmatch-hud__center">
                <div className="pm-cmatch-hud__stat">
                  <FiClock aria-hidden />
                  <span>SÜRE</span>
                  <strong>{formatTime(game.roundTimeLeft)}</strong>
                </div>
                <div className="pm-cmatch-hud__stat">
                  <span>ROUND</span>
                  <strong>
                    {game.roundNumber}/{game.matchRounds}
                  </strong>
                </div>
              </div>

              <div className="pm-cmatch-hud__side is-p2">
                <GamePlayerPortrait src={opponent.portrait} variant="pink" active={game.running} {...likeProps}/>
                <p className="pm-cmatch-hud__name">ZEYNEP</p>
                <strong className="pm-cmatch-hud__score">{formatScore(game.lane2.score)}</strong>
                <span className="pm-cmatch-hud__combo">x{game.lane2.comboMult.toFixed(1)}</span>
              </div>
            </section>

            <section className="pm-cmatch-arena" aria-label="Oyun alanı">
              <ColorMatchGrid
                lane={game.lane1}
                accent="cyan"
                interactive={canPlay}
                onTap={game.tapP1}
              />
              <ColorMatchGrid lane={game.lane2} accent="pink" />
            </section>

            <footer className="pm-cmatch-footer">
              <div className="pm-cmatch-footer__side is-cyan">
                <span className="pm-cmatch-footer__label">SEN</span>
                <RoundDots wins={game.lane1.matchPoints} max={game.winRounds} variant="cyan" />
                <span className="pm-cmatch-footer__hint">Hedef renkleri bul</span>
              </div>
              <div className="pm-cmatch-footer__center">
                <p className="pm-cmatch-footer__vs">VS</p>
                <p className="pm-cmatch-footer__goal">
                  İlk <strong>{game.winRounds}</strong> roundu alan maçı kazanır
                </p>
              </div>
              <div className="pm-cmatch-footer__side is-pink">
                <span className="pm-cmatch-footer__label">RAKİP</span>
                <RoundDots wins={game.lane2.matchPoints} max={game.winRounds} variant="pink" />
                <span className="pm-cmatch-footer__hint">Kendi hedefi</span>
              </div>
            </footer>
          </div>

          {overlayMessage ? (
            <div className="pm-cmatch-overlay" role="status">
              <p>{overlayMessage}</p>
              {!game.running ? (
                <GameDuelRematchActions
                  onRestart={game.restartMatch}
                  onExit={handleBack}
                  opponentName={opponent.name}
                />
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
