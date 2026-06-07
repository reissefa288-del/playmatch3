import '../../styles/xox-game.css'
import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import { FiArrowLeft } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { useProfileLevelActions } from '../profile/ProfileLevelProvider'
import { GameDuelBackdrop } from './components/GameDuelBackdrop'
import { XoxGameBoard } from './components/XoxGameBoard'
import { GamePlayerPortrait } from './components/GamePlayerPortrait'
import { useXoxRealtime } from './useXoxRealtime'
import { useOpponentLikeProps } from './useGameOpponent'
import { playXoxSound, unlockXoxAudio } from './utils/xoxSounds'
import { FAKE_PORTRAIT_MALE } from '../../shared/fakePortraits'

type SessionScores = { x: number; o: number }

export function XoxGameScreen() {
  const { opponent, likeProps } = useOpponentLikeProps()
  const navigate = useNavigate()
  const { addXp } = useProfileLevelActions()
  const [scores, setScores] = useState<SessionScores>({ x: 0, o: 0 })
  const scoredRoomRef = useRef<string | null>(null)
  const prevWinnerRef = useRef<null | 'X' | 'O' | 'draw'>(null)
  const prevPhaseRef = useRef<string>('idle')

  const xox = useXoxRealtime({
    onMatchXp: ({ result, xpAward }) => {
      if (result === 'win' || result === 'draw') addXp(xpAward)
    },
  })

  useEffect(() => {
    void xox.open()
    return () => xox.close()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount/unmount only
  }, [])

  useEffect(() => {
    if (xox.phase !== 'ended' || !xox.room.roomId || !xox.room.winner) return
    if (xox.room.winner === 'draw') return
    if (scoredRoomRef.current === xox.room.roomId) return
    scoredRoomRef.current = xox.room.roomId
    setScores((current) => ({
      ...current,
      [xox.room.winner === 'X' ? 'x' : 'o']: current[xox.room.winner === 'X' ? 'x' : 'o'] + 1,
    }))
  }, [xox.phase, xox.room.roomId, xox.room.winner])

  const handleBack = useCallback(() => {
    xox.close()
    navigate(-1)
  }, [navigate, xox.close])

  const handleRematch = useCallback(() => {
    unlockXoxAudio()
    scoredRoomRef.current = null
    prevWinnerRef.current = null
    xox.close()
    window.setTimeout(() => {
      void xox.open()
    }, 120)
  }, [xox.close, xox.open])

  const handleSymbolPlaced = useCallback((symbol: 'X' | 'O', _index: number) => {
    unlockXoxAudio()
    playXoxSound(symbol === 'X' ? 'moveX' : 'moveO')
  }, [])

  const handleMove = useCallback(
    (index: number) => {
      unlockXoxAudio()
      xox.submitMove(index)
    },
    [xox],
  )

  useEffect(() => {
    if (xox.phase === 'matched' && prevPhaseRef.current !== 'matched') {
      unlockXoxAudio()
      playXoxSound('start')
    }
    prevPhaseRef.current = xox.phase
  }, [xox.phase])

  useEffect(() => {
    const winner = xox.room.winner
    if (!winner || winner === prevWinnerRef.current) return
    prevWinnerRef.current = winner

    if (winner === 'draw') {
      playXoxSound('draw')
      return
    }

    const mySymbol = xox.transport === 'local' ? 'X' : xox.identity?.mySymbol
    if (mySymbol && winner === mySymbol) playXoxSound('win')
    else playXoxSound('lose')
  }, [xox.identity?.mySymbol, xox.room.winner, xox.transport])

  const mySymbol = xox.identity?.mySymbol
  const interactive =
    xox.phase === 'matched' &&
    !xox.room.winner &&
    (xox.transport === 'local' ? xox.room.turn === 'X' : Boolean(mySymbol && xox.room.turn === mySymbol))

  const turnLabel = getTurnLabel(xox.phase, xox.room.turn, xox.room.winner)
  const activeTurnSide: 'x' | 'o' | 'neutral' =
    xox.room.winner && xox.room.winner !== 'draw'
      ? xox.room.winner === 'X'
        ? 'x'
        : 'o'
      : xox.room.turn === 'X'
        ? 'x'
        : 'o'

  const hoverSymbol = interactive
    ? xox.transport === 'local'
      ? 'X'
      : mySymbol && xox.room.turn === mySymbol
        ? mySymbol
        : xox.room.turn
    : null

  const showHud = xox.phase !== 'idle' && xox.phase !== 'error'

  return (
    <div className="pm-app-shell pm-app-shell--game-play pm-app-shell--xox">
      <div className="pm-artboard">
        <motion.div
          className="pm-xox-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.34 }}
        >
          <GameDuelBackdrop />

          <button type="button" className="pm-xox-back" onClick={handleBack} aria-label="Geri dön">
            <FiArrowLeft />
          </button>

          <header className="pm-xox-header">
            <h1 className="pm-xox-header__title" aria-label="Tic Tac Toe">
              <span className="pm-xox-header__word is-tic">TIC</span>
              <span className="pm-xox-header__word is-tac">TAC</span>
              <span className="pm-xox-header__word is-toe">TOE</span>
            </h1>
            <div className="pm-xox-vs" aria-hidden>
              <span className="pm-xox-vs__line pm-xox-vs__line--pink" />
              <span className="pm-xox-vs__text">VS</span>
              <span className="pm-xox-vs__line pm-xox-vs__line--blue" />
            </div>
          </header>

          {showHud ? (
            <section className="pm-xox-hud" aria-label="Oyuncu bilgileri">
              <article className={`pm-xox-hud__side is-p1 ${activeTurnSide === 'x' && interactive ? 'is-active' : ''}`}>
                <GamePlayerPortrait
                  src={FAKE_PORTRAIT_MALE}
                  variant="cyan"
                  active={activeTurnSide === 'x' && interactive}
                />
                <p className="pm-xox-hud__label">OYUNCU 1</p>
                <div className="pm-xox-score-pill is-pink">
                  <span className="pm-xox-score-pill__symbol">X</span>
                  <strong>{scores.x}</strong>
                </div>
              </article>

              <article className={`pm-xox-hud__side is-p2 ${activeTurnSide === 'o' && interactive ? 'is-active' : ''}`}>
                <GamePlayerPortrait
                  src={opponent.portrait}
                  variant="pink"
                  active={activeTurnSide === 'o' && interactive} {...likeProps}/>
                <p className="pm-xox-hud__label">OYUNCU 2</p>
                <div className="pm-xox-score-pill is-blue">
                  <strong>{scores.o}</strong>
                  <span className="pm-xox-score-pill__symbol">O</span>
                </div>
              </article>
            </section>
          ) : null}

          {showHud ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={`${turnLabel}-${xox.phase}`}
                className={`pm-xox-turn-pill is-${xox.phase === 'queueing' || xox.phase === 'authenticating' ? 'neutral' : activeTurnSide}`}
                initial={{ opacity: 0, y: 6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.97 }}
                transition={{ duration: 0.22 }}
              >
                <span className="pm-xox-turn-pill__dot pm-xox-turn-pill__dot--pink" />
                <span className="pm-xox-turn-pill__label">{turnLabel}</span>
                <span className="pm-xox-turn-pill__dot pm-xox-turn-pill__dot--blue" />
              </motion.div>
            </AnimatePresence>
          ) : null}

          <div className="pm-xox-board-stage">
            <XoxGameBoard
              board={xox.room.board}
              interactive={interactive}
              hoverSymbol={hoverSymbol}
              onMove={handleMove}
              onSymbolPlaced={handleSymbolPlaced}
            />
          </div>

          <AnimatePresence>
            {xox.phase === 'ended' || xox.room.winner ? (
              <motion.footer
                className="pm-xox-footer"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
              >
                {xox.room.winner ? (
                  <p className="pm-xox-footer__result">
                    {xox.room.winner === 'draw'
                      ? 'BERABERE'
                      : xox.room.winner === mySymbol
                        ? 'KAZANDIN'
                        : 'KAYBETTİN'}
                  </p>
                ) : null}
                <div className="pm-xox-footer__actions">
                  <button type="button" className="pm-xox-btn pm-xox-btn--ghost" onClick={handleBack}>
                    ÇIK
                  </button>
                  <button type="button" className="pm-xox-btn pm-xox-btn--primary" onClick={handleRematch}>
                    RÖVANŞ
                  </button>
                </div>
              </motion.footer>
            ) : null}
          </AnimatePresence>

          {xox.phase === 'queueing' || xox.phase === 'authenticating' ? (
            <div className="pm-xox-loader" aria-live="polite">
              <span className="pm-xox-loader__ring" />
              <span>Bot hazırlanıyor</span>
            </div>
          ) : null}

          {xox.phase === 'error' ? (
            <div className="pm-xox-loader pm-xox-loader--error" role="alert">
              <p>{xox.message}</p>
              <button type="button" className="pm-xox-btn pm-xox-btn--primary" onClick={() => void xox.open()}>
                TEKRAR DENE
              </button>
            </div>
          ) : null}
        </motion.div>
      </div>
    </div>
  )
}

function getTurnLabel(
  phase: 'idle' | 'authenticating' | 'queueing' | 'matched' | 'ended' | 'error',
  turn: 'X' | 'O',
  winner: null | 'X' | 'O' | 'draw',
) {
  if (winner === 'draw') return 'BERABERE'
  if (winner === 'X') return 'OYUNCU 1 KAZANDI'
  if (winner === 'O') return 'OYUNCU 2 KAZANDI'
  if (phase === 'queueing' || phase === 'authenticating') return 'Eşleşme hazırlanıyor'
  if (phase === 'error') return 'BAĞLANTI HATASI'
  return turn === 'X' ? 'Oyuncu 1 sırası' : 'Oyuncu 2 sırası'
}
