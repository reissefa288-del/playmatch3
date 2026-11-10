import '../../../styles/neon-brick.css'
import { useCallback, useEffect, useState, type PointerEvent } from 'react'
import { FiArrowLeft } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { GameDuelBackdrop } from '../components/GameDuelBackdrop'
import { NeonBrickCanvas } from './NeonBrickCanvas'
import { useNeonBrickMatch, type NeonEvent, type NeonLaneView, type NeonSide } from './useNeonBrickMatch'

export function NeonBrickScreen() {
  const navigate = useNavigate()
  const match = useNeonBrickMatch()
  const [joinCode, setJoinCode] = useState('')
  const state = match.state
  const p1Events = state?.events.filter((event) => event.side === 'p1') ?? []
  const p2Events = state?.events.filter((event) => event.side === 'p2') ?? []

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (match.phase !== 'play') return
      if (event.key === 'ArrowLeft') match.setPaddle(0.18)
      if (event.key === 'ArrowRight') match.setPaddle(0.82)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [match])

  const pointLane = useCallback(
    (event: React.PointerEvent<HTMLDivElement>, lane: NeonSide) => {
      if (match.side !== lane || match.phase !== 'play') return
      const rect = event.currentTarget.getBoundingClientRect()
      match.setPaddle((event.clientX - rect.left) / rect.width)
    },
    [match],
  )

  const wave = Math.max(state?.p1.wave ?? 1, state?.p2.wave ?? 1)
  const speed = Math.round((wave - 1) * 7)
  const verdict =
    state?.winner === 'draw'
      ? 'BERABERE'
      : state?.winner && match.side && state.winner === match.side
        ? 'KAZANDIN'
        : 'RAKİP KAZANDI'

  return (
    <div className="pm-app-shell pm-app-shell--game-play pm-neon-shell">
      <GameDuelBackdrop />
      <button type="button" className="pm-neon-back" onClick={() => navigate('/games')} aria-label="Geri dön">
        <FiArrowLeft />
      </button>

      <header className="pm-neon-hud">
        <PlayerPlate
          name={match.side === 'p2' ? match.opponentName || 'Oyuncu 1' : match.youName}
          score={state?.p1.score ?? 0}
          lives={state?.p1.lives ?? 3}
          accent="cyan"
          self={match.side === 'p1'}
        />
        <div className="pm-neon-center">
          <span>SÜRE</span>
          <strong>{formatTime(state?.timeLeft ?? 90)}</strong>
          <span>DALGA</span>
          <strong>{wave}</strong>
          <span>HIZ</span>
          <strong className="is-speed">+{speed}%</strong>
        </div>
        <PlayerPlate
          name={match.side === 'p1' ? match.opponentName || 'Oyuncu 2' : match.youName}
          score={state?.p2.score ?? 0}
          lives={state?.p2.lives ?? 3}
          accent="pink"
          self={match.side === 'p2'}
        />
      </header>

      <div className="pm-neon-split">
        <Lane
          lane={state?.p1}
          accent="#62cfff"
          tint="cyan"
          events={p1Events}
          active={match.phase === 'play'}
          onPointer={pointLane}
          side="p1"
        />
        <Lane
          lane={state?.p2}
          accent="#ff2d8f"
          tint="pink"
          events={p2Events}
          active={match.phase === 'play'}
          onPointer={pointLane}
          side="p2"
        />
      </div>

      {match.phase !== 'play' ? (
        <div className="pm-neon-panel">
          {match.phase === 'ended' ? (
            <>
              <h1>{verdict}</h1>
              <p>
                {String(state?.p1.score ?? 0).padStart(4, '0')} · {String(state?.p2.score ?? 0).padStart(4, '0')}
              </p>
              <button type="button" onClick={match.leave}>
                Yeni oda
              </button>
            </>
          ) : match.phase === 'waiting' ? (
            <>
              <h1>{match.code.toUpperCase()}</h1>
              <p>{match.message}</p>
              <p>Diğer telefon Oyunlar içinden Neon Brick açıp bu kodu yazsın.</p>
            </>
          ) : (
            <>
              <h1>Neon Brick</h1>
              <p>{match.message}</p>
              <button type="button" onClick={() => void match.createRoom()}>
                Oda kur
              </button>
              <form
                onSubmit={(event) => {
                  event.preventDefault()
                  void match.joinRoom(joinCode)
                }}
              >
                <input
                  value={joinCode}
                  onChange={(event) => setJoinCode(event.target.value.toUpperCase())}
                  maxLength={4}
                  placeholder="KOD"
                  aria-label="Oda kodu"
                />
                <button type="submit">Katıl</button>
              </form>
            </>
          )}
        </div>
      ) : null}
    </div>
  )
}

function Lane({
  lane,
  accent,
  tint,
  events,
  active,
  side,
  onPointer,
}: {
  lane?: NeonLaneView
  accent: string
  tint: 'cyan' | 'pink'
  events: NeonEvent[]
  active: boolean
  side: NeonSide
  onPointer: (event: PointerEvent<HTMLDivElement>, side: NeonSide) => void
}) {
  if (!lane) return <div className={`pm-neon-lane is-${tint}`} />
  return (
    <div
      className={`pm-neon-lane is-${tint}`}
      onPointerDown={(event) => onPointer(event, side)}
      onPointerMove={(event) => {
        if (event.buttons === 0 && event.pointerType === 'mouse') return
        onPointer(event, side)
      }}
    >
      <NeonBrickCanvas lane={lane} accent={accent} events={events} active={active} />
    </div>
  )
}

function PlayerPlate({
  name,
  score,
  lives,
  accent,
  self,
}: {
  name: string
  score: number
  lives: number
  accent: 'cyan' | 'pink'
  self: boolean
}) {
  const label = name.trim() || (accent === 'cyan' ? 'Oyuncu 1' : 'Oyuncu 2')
  return (
    <div className={`pm-neon-plate is-${accent}`}>
      <div className="pm-neon-avatar" aria-hidden>
        {label.slice(0, 2).toUpperCase()}
      </div>
      <strong>{self ? 'SEN' : label}</strong>
      <span>{String(score).padStart(4, '0')}</span>
      <div className="pm-neon-lives">
        {Array.from({ length: 3 }, (_, index) => (
          <i key={index} className={index < lives ? 'is-on' : ''} />
        ))}
      </div>
    </div>
  )
}

function formatTime(total: number) {
  const minutes = Math.floor(total / 60)
  const seconds = total % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}
