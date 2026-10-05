import { GameDuelRematchActions } from './GameDuelRematchActions'
import { useGameOpponent } from '../useGameOpponent'

type Props = {
  open: boolean
  isMatchEnd: boolean
  message: string
  roundNumber: number
  matchRounds: number
  scoreP1: number
  scoreP2: number
  setP1: number
  setP2: number
  onRestart?: () => void
  onExit?: () => void
}

export function SnakeDuelCinematicOverlay({
  open,
  isMatchEnd,
  message,
  roundNumber,
  matchRounds,
  scoreP1,
  scoreP2,
  setP1,
  setP2,
  onRestart,
  onExit,
}: Props) {
  const opponent = useGameOpponent()
  const winnerTone =
    message.includes('KAZANDIN') || message === 'EMİR KAZANDI'
      ? 'win'
      : message.includes('KAYBET') || message === 'ZEYNEP KAZANDI'
        ? 'lose'
        : 'draw'

  return (
    <>
      {open ? (
        <div
          className={`pm-snake-cinematic ${isMatchEnd ? 'is-match-end' : 'is-round-break'} is-${winnerTone}`}
         
         
         
         
          role="status"
        >
          <div className="pm-snake-cinematic__vignette" aria-hidden />
          <div className="pm-snake-cinematic__scan" aria-hidden />
          <div className="pm-snake-cinematic__grid" aria-hidden />

          <div
            className="pm-snake-cinematic__panel"
           
           
           
           
          >
            {!isMatchEnd ? (
              <p className="pm-snake-cinematic__eyebrow">ROUND {Math.min(roundNumber, matchRounds)} BİTTİ</p>
            ) : (
              <p className="pm-snake-cinematic__eyebrow">MAÇ SONUCU</p>
            )}

            <h2
              className="pm-snake-cinematic__title"
             
             
             
            >
              {message}
            </h2>

            <div className="pm-snake-cinematic__scores">
              <div
                className="pm-snake-cinematic__score is-p1"
               
               
               
              >
                <span>EMİR</span>
                <strong>{scoreP1}</strong>
                <small>SET {setP1}</small>
              </div>

              <span className="pm-snake-cinematic__vs">VS</span>

              <div
                className="pm-snake-cinematic__score is-p2"
               
               
               
              >
                <span>ZEYNEP</span>
                <strong>{scoreP2}</strong>
                <small>SET {setP2}</small>
              </div>
            </div>

            {!isMatchEnd ? (
              <div className="pm-snake-cinematic__progress" aria-hidden>
                <span
                  className="pm-snake-cinematic__progress-bar"
                 
                 
                 
                />
              </div>
            ) : onRestart && onExit ? (
              <GameDuelRematchActions
                onRestart={onRestart}
                onExit={onExit}
                opponentName={opponent.name}
                className="pm-snake-cinematic__rematch"
                primaryClassName="pm-snake-cinematic__btn"
              />
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  )
}
