type Props = {
  secondsLeft: number
  progress: number
}

const R = 18
const C = 2 * Math.PI * R

export function RiftWardTimerRing({ secondsLeft, progress }: Props) {
  const clamped = Math.max(0, Math.min(1, progress))
  const dashOffset = C * (1 - clamped)
  const urgent = secondsLeft <= 10 && secondsLeft > 0

  return (
    <div className={['pm-rw-timer', urgent ? 'is-urgent' : ''].filter(Boolean).join(' ')} aria-label={`Kalan süre ${secondsLeft} saniye`}>
      <svg className="pm-rw-timer__svg" viewBox="0 0 44 44" aria-hidden>
        <circle className="pm-rw-timer__track" cx="22" cy="22" r={R} />
        <circle
          className="pm-rw-timer__arc"
          cx="22"
          cy="22"
          r={R}
          strokeDasharray={C}
          strokeDashoffset={dashOffset}
        />
      </svg>
      <strong className="pm-rw-timer__value">{secondsLeft}s</strong>
    </div>
  )
}
