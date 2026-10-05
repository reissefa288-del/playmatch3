import '../../styles/defender-duel.css'
import { useCallback, useEffect, useRef, useState } from 'react'
import { FiArrowLeft } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { DefenderDuelArena } from './components/DefenderDuelArena'
import { GameDuelBackdrop } from './components/GameDuelBackdrop'
import { GameOpponentLikeButton } from './components/GameOpponentLikeButton'
import { GameDuelRematchActions } from './components/GameDuelRematchActions'
import { useDefenderDuel } from './useDefenderDuel'
import { useGameOpponent } from './useGameOpponent'

function LivesHeart({
  filled,
  accent,
  critical,
}: {
  filled: boolean
  accent: 'cyan' | 'pink'
  critical?: boolean
}) {
  return (
    <span
      className={[
        'pm-def-life-heart',
        `is-${accent}`,
        filled ? 'is-full' : 'is-empty',
        critical && filled ? 'is-critical' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-hidden
    >
      <span className="pm-def-life-heart__ring" />
      <span className="pm-def-life-heart__core" />
    </span>
  )
}

function LivesRow({
  lives,
  max,
  accent,
  sideLost,
}: {
  lives: number
  max: number
  accent: 'cyan' | 'pink'
  sideLost?: boolean
}) {
  return (
    <div
      className={['pm-def-lives-row', `is-${accent}`, sideLost ? 'is-side-lost' : ''].filter(Boolean).join(' ')}
      aria-label={`${lives} can`}
    >
      {Array.from({ length: max }, (_, index) => (
        <LivesHeart
          key={index}
          filled={index < lives}
          accent={accent}
          critical={lives === 1 && index === 0}
        />
      ))}
    </div>
  )
}

const OVERLAY_SUB: Record<'win' | 'lose' | 'draw', string> = {
  win: 'Savunma hattını korudun — rakip saf dışı!',
  lose: 'Tüm canların bitti. Bir tur daha dene.',
  draw: 'İki taraf da aynı anda düştü.',
}

export function DefenderDuelScreen() {
  const navigate = useNavigate()
  const duel = useDefenderDuel()
  const opponent = useGameOpponent()
  const canPlay = duel.running && !duel.winner
  const maxLives = 3

  const prevP1Lives = useRef(duel.game.p1.lives)
  const prevP2Lives = useRef(duel.game.p2.lives)
  const [p1HitFlash, setP1HitFlash] = useState(false)
  const [p2HitFlash, setP2HitFlash] = useState(false)

  useEffect(() => {
    if (duel.game.p1.lives < prevP1Lives.current) {
      setP1HitFlash(true)
      const timer = window.setTimeout(() => setP1HitFlash(false), 420)
      prevP1Lives.current = duel.game.p1.lives
      return () => window.clearTimeout(timer)
    }
    prevP1Lives.current = duel.game.p1.lives
  }, [duel.game.p1.lives])

  useEffect(() => {
    if (duel.game.p2.lives < prevP2Lives.current) {
      setP2HitFlash(true)
      const timer = window.setTimeout(() => setP2HitFlash(false), 420)
      prevP2Lives.current = duel.game.p2.lives
      return () => window.clearTimeout(timer)
    }
    prevP2Lives.current = duel.game.p2.lives
  }, [duel.game.p2.lives])

  const handleBack = useCallback(() => navigate('/games'), [navigate])

  const resultVariant = duel.winner
    ? duel.winner === 'draw'
      ? 'draw'
      : duel.winner === 'p1'
        ? 'win'
        : 'lose'
    : null

  const overlayMessage = resultVariant
    ? resultVariant === 'draw'
      ? 'BERABERE'
      : resultVariant === 'win'
        ? 'KAZANDIN!'
        : 'KAYBETTİN'
    : null

  return (
    <div className="pm-app-shell pm-app-shell--game-play pm-app-shell--defender">
      <div className="pm-artboard">
        <div className="pm-def-screen-wrap">
          <GameDuelBackdrop />

          <button type="button" className="pm-def-back" onClick={handleBack} aria-label="Geri dön">
            <FiArrowLeft />
          </button>

          <div className="pm-def-play__stack">
            <header className="pm-def-header pm-def-header--compact">
              <p className="pm-def-header__eyebrow">1v1 ARCADE DUEL</p>
              <h1 className="pm-def-header__title">
                <span className="is-lime">DEFENDER</span>
                <span className="is-cyan">DUEL</span>
              </h1>
              <span className="pm-def-header__line" aria-hidden />
            </header>

            <section className="pm-def-lives-hud" aria-label="Can durumu">
              <div
                className={[
                  'pm-def-lives-hud__panel',
                  'is-p1',
                  duel.game.p1.lives === 1 ? 'is-critical' : '',
                  p1HitFlash ? 'is-hit' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <span className="pm-def-lives-hud__panel-glow" aria-hidden />
                <span className="pm-def-lives-hud__tag">SEN</span>
                <LivesRow lives={duel.game.p1.lives} max={maxLives} accent="cyan" />
              </div>

              <div className="pm-def-lives-hud__core" aria-hidden>
                <span className="pm-def-lives-hud__core-ring" />
                <span className="pm-def-lives-hud__vs">VS</span>
              </div>

              <div
                className={[
                  'pm-def-lives-hud__panel',
                  'is-p2',
                  duel.game.p2.lives === 1 ? 'is-critical' : '',
                  p2HitFlash ? 'is-hit' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <span className="pm-def-lives-hud__panel-glow" aria-hidden />
                <span className="pm-def-lives-hud__tag">RAKİP</span>
                <LivesRow
                  lives={duel.game.p2.lives}
                  max={maxLives}
                  accent="pink"
                  sideLost={duel.game.p2.lives === 0}
                />
                <GameOpponentLikeButton
                  className="is-panel"
                  playerId={opponent.id}
                  playerName={opponent.name}
                />
              </div>
            </section>

            <DefenderDuelArena
              p1={duel.game.p1}
              p2={duel.game.p2}
              now={duel.now}
              fxP1={duel.fxP1}
              fxP2={duel.fxP2}
              shakeP1Until={duel.shakeP1Until}
              muzzleP1Until={duel.muzzleP1Until}
              disabled={!canPlay}
              onPointerShip={duel.pointerShipP1}
            />
          </div>

          <>
            {overlayMessage && resultVariant ? (
              <div
                className={['pm-def-overlay', `is-${resultVariant}`].join(' ')}
               
               
               
                role="status"
              >
                {resultVariant === 'win' ? (
                  <div className="pm-def-overlay__confetti" aria-hidden>
                    {Array.from({ length: 18 }, (_, i) => (
                      <span key={i} style={{ '--i': i } as React.CSSProperties} />
                    ))}
                  </div>
                ) : null}

                <div
                  className="pm-def-result-card"
                 
                 
                 
                >
                  <span className="pm-def-result-card__badge" aria-hidden />
                  <p className="pm-def-result-card__eyebrow">MAÇ SONUCU</p>
                  <p className="pm-def-result-card__title">{overlayMessage}</p>
                  <p className="pm-def-result-card__sub">{OVERLAY_SUB[resultVariant]}</p>

                  <div className="pm-def-lives-row is-summary" aria-label="Final can durumu">
                    <LivesRow lives={duel.game.p1.lives} max={maxLives} accent="cyan" />
                    <span className="pm-def-result-card__divider">·</span>
                    <LivesRow lives={duel.game.p2.lives} max={maxLives} accent="pink" />
                  </div>

                  <GameDuelRematchActions
                    onRestart={duel.restartMatch}
                    onExit={handleBack}
                    opponentName={opponent.name}
                    className="pm-def-result-card__actions"
                    primaryClassName="is-primary"
                    ghostClassName="is-ghost"
                  />
                </div>
              </div>
            ) : null}
          </>
        </div>
      </div>
    </div>
  )
}
