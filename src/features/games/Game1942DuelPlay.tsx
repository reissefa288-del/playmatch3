import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import { FiArrowLeft } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { Game1942DuelArena } from './components/Game1942DuelArena'
import { GameDuelBackdrop } from './components/GameDuelBackdrop'
import { GameOpponentLikeButton } from './components/GameOpponentLikeButton'
import { GameDuelRematchActions } from './components/GameDuelRematchActions'
import { START_LIVES } from './utils/game1942DuelConstants'
import { useGame1942Duel } from './useGame1942Duel'
import { useGameOpponent } from './useGameOpponent'
import { GameRouteFallback } from './components/GameRouteFallback'

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
        'pm-y42-life-heart',
        `is-${accent}`,
        filled ? 'is-full' : 'is-empty',
        critical && filled ? 'is-critical' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-hidden
    >
      <span className="pm-y42-life-heart__ring" />
      <span className="pm-y42-life-heart__core" />
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
      className={['pm-y42-lives-row', `is-${accent}`, sideLost ? 'is-side-lost' : ''].filter(Boolean).join(' ')}
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
  win: 'Gökyüzünün hakimi sensin — rakip saf dışı!',
  lose: 'Tüm canların bitti. Bir tur daha dene.',
  draw: 'İki pilot da aynı anda düştü.',
}

export function Game1942DuelPlay() {
  const navigate = useNavigate()
  const duel = useGame1942Duel()
  const opponent = useGameOpponent()
  const game = duel.game
  const enemyGlyph = duel.enemyGlyph
  const canPlay = duel.running && !duel.winner && Boolean(game)
  const maxLives = START_LIVES

  const prevP1Lives = useRef(game?.p1.lives ?? maxLives)
  const prevP2Lives = useRef(game?.p2.lives ?? maxLives)
  const [p1HitFlash, setP1HitFlash] = useState(false)
  const [p2HitFlash, setP2HitFlash] = useState(false)

  useEffect(() => {
    if (!game) return
    if (game.p1.lives < prevP1Lives.current) {
      setP1HitFlash(true)
      const timer = window.setTimeout(() => setP1HitFlash(false), 420)
      prevP1Lives.current = game.p1.lives
      return () => window.clearTimeout(timer)
    }
    prevP1Lives.current = game.p1.lives
  }, [game])

  useEffect(() => {
    if (!game) return
    if (game.p2.lives < prevP2Lives.current) {
      setP2HitFlash(true)
      const timer = window.setTimeout(() => setP2HitFlash(false), 420)
      prevP2Lives.current = game.p2.lives
      return () => window.clearTimeout(timer)
    }
    prevP2Lives.current = game.p2.lives
  }, [game])

  const handleBack = useCallback(() => navigate('/games'), [navigate])

  if (!duel.engineReady || !game || !enemyGlyph) {
    return (
      <div className="pm-app-shell pm-app-shell--game-play pm-app-shell--1942">
        <GameRouteFallback />
      </div>
    )
  }

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
    <div className="pm-app-shell pm-app-shell--game-play pm-app-shell--1942">
      <div className="pm-artboard">
        <motion.div className="pm-y42-screen-wrap" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GameDuelBackdrop />

          <button type="button" className="pm-y42-back" onClick={handleBack} aria-label="Geri dön">
            <FiArrowLeft />
          </button>

          <div className="pm-y42-play__stack">
            <header className="pm-y42-header pm-y42-header--compact">
              <p className="pm-y42-header__eyebrow">1v1 ARCADE DUEL</p>
              <h1 className="pm-y42-header__title">
                <span className="is-sky">SKY ACE</span>
                <span className="is-gold">DUEL</span>
              </h1>
              <span className="pm-y42-header__line" aria-hidden />
              <p className="pm-y42-header__sub">3 CAN • OTOMATİK ATEŞ</p>
            </header>

            <section className="pm-y42-lives-hud" aria-label="Can durumu">
              <div
                className={[
                  'pm-y42-lives-hud__panel',
                  'is-p1',
                  game.p1.lives === 1 ? 'is-critical' : '',
                  p1HitFlash ? 'is-hit' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <span className="pm-y42-lives-hud__panel-glow" aria-hidden />
                <span className="pm-y42-lives-hud__tag">SEN</span>
                <LivesRow lives={game.p1.lives} max={maxLives} accent="cyan" />
              </div>

              <div className="pm-y42-lives-hud__core" aria-hidden>
                <span className="pm-y42-lives-hud__core-ring" />
                <span className="pm-y42-lives-hud__vs">VS</span>
              </div>

              <div
                className={[
                  'pm-y42-lives-hud__panel',
                  'is-p2',
                  game.p2.lives === 1 ? 'is-critical' : '',
                  p2HitFlash ? 'is-hit' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <span className="pm-y42-lives-hud__panel-glow" aria-hidden />
                <span className="pm-y42-lives-hud__tag">RAKİP</span>
                <LivesRow
                  lives={game.p2.lives}
                  max={maxLives}
                  accent="pink"
                  sideLost={game.p2.lives === 0}
                />
                <GameOpponentLikeButton
                  className="is-panel"
                  playerId={opponent.id}
                  playerName={opponent.name}
                />
              </div>
            </section>

            <Game1942DuelArena
              p1={game.p1}
              p2={game.p2}
              now={duel.now}
              fxP1={duel.fxP1}
              fxP2={duel.fxP2}
              shakeP1Until={duel.shakeP1Until}
              muzzleP1Until={duel.muzzleP1Until}
              disabled={!canPlay}
              onShipX={duel.setShipX}
              enemyGlyph={enemyGlyph}
            />
          </div>

          <AnimatePresence>
            {overlayMessage && resultVariant ? (
              <motion.div
                className={['pm-y42-overlay', `is-${resultVariant}`, 'is-match-end'].join(' ')}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                role="status"
              >
                {resultVariant === 'win' ? (
                  <div className="pm-y42-overlay__confetti" aria-hidden>
                    {Array.from({ length: 18 }, (_, i) => (
                      <span key={i} style={{ '--i': i } as React.CSSProperties} />
                    ))}
                  </div>
                ) : null}

                <motion.div
                  className="pm-y42-result-card"
                  initial={{ opacity: 0, scale: 0.88, y: 18 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 340, damping: 26 }}
                >
                  <span className="pm-y42-result-card__badge" aria-hidden />
                  <p className="pm-y42-result-card__eyebrow">MAÇ SONUCU</p>
                  <p className="pm-y42-result-card__title">{overlayMessage}</p>
                  <p className="pm-y42-result-card__sub">{OVERLAY_SUB[resultVariant]}</p>

                  <div className="pm-y42-lives-row is-summary" aria-label="Final can durumu">
                    <LivesRow lives={game.p1.lives} max={maxLives} accent="cyan" />
                    <span className="pm-y42-result-card__divider">·</span>
                    <LivesRow lives={game.p2.lives} max={maxLives} accent="pink" />
                  </div>

                  <GameDuelRematchActions
                    onRestart={duel.restartMatch}
                    onExit={handleBack}
                    opponentName={opponent.name}
                    className="pm-y42-result-card__actions"
                    primaryClassName="is-primary"
                    ghostClassName="is-ghost"
                  />
                </motion.div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}
