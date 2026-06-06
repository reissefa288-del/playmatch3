import type { ReactNode } from 'react'
import type { PadId, SimonLanePhase, SimonShowBeat } from '../utils/simonDuelEngine'

const PAD_LABELS = ['KIRMIZI', 'MAVİ', 'YEŞİL', 'SARI'] as const

const PAD_SYMBOLS: Record<PadId, ReactNode> = {
  0: (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden>
      <path
        d="M32 6l7.2 22.2H58L40.4 36.8l7 21.6L32 44.8 16.6 58.4l7-21.6L6 28.2h18.8L32 6z"
        fill="url(#simon-s0-fill)"
        stroke="rgba(255,255,255,0.55)"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path
        d="M32 16l4.2 12.9h13.6L38.8 34.5l4.1 12.6L32 39.8l-10.9 7.3 4.1-12.6-10.8-5.6h13.6L32 16z"
        fill="rgba(255,255,255,0.22)"
      />
      <circle cx="32" cy="28" r="3.2" fill="rgba(255,255,255,0.75)" />
      <defs>
        <linearGradient id="simon-s0-fill" x1="32" y1="6" x2="32" y2="58" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fff" stopOpacity="0.95" />
          <stop offset="0.45" stopColor="#ffd0dc" />
          <stop offset="1" stopColor="#ff5570" />
        </linearGradient>
      </defs>
    </svg>
  ),
  1: (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden>
      <circle cx="32" cy="32" r="20" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
      <ellipse
        cx="32"
        cy="32"
        rx="26"
        ry="9"
        stroke="url(#simon-s1-ring)"
        strokeWidth="2.4"
        transform="rotate(-28 32 32)"
      />
      <circle cx="32" cy="32" r="11" fill="url(#simon-s1-core)" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" />
      <circle cx="28" cy="28" r="3.5" fill="rgba(255,255,255,0.65)" />
      <circle cx="38" cy="36" r="1.8" fill="rgba(255,255,255,0.35)" />
      <defs>
        <linearGradient id="simon-s1-core" x1="24" y1="22" x2="40" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#dff0ff" />
          <stop offset="1" stopColor="#3d8bff" />
        </linearGradient>
        <linearGradient id="simon-s1-ring" x1="6" y1="32" x2="58" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="rgba(255,255,255,0.15)" />
          <stop offset="0.5" stopColor="#9fd0ff" />
          <stop offset="1" stopColor="rgba(255,255,255,0.15)" />
        </linearGradient>
      </defs>
    </svg>
  ),
  2: (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden>
      <path
        d="M32 8c-4.2 11.2-13.8 18.2-13.8 32.2 0 9.6 6.2 16.2 13.8 16.2s13.8-6.6 13.8-16.2C45.8 26.2 36.2 19.2 32 8z"
        fill="url(#simon-s2-fill)"
        stroke="rgba(255,255,255,0.45)"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path
        d="M32 22c-1.8 4.8-5.8 7.8-5.8 13.8 0 4.2 2.6 7.2 5.8 7.2s5.8-3 5.8-7.2C37.8 29.8 33.8 26.8 32 22z"
        fill="rgba(255,255,255,0.2)"
      />
      <path d="M32 40v14" stroke="rgba(255,255,255,0.45)" strokeWidth="2.8" strokeLinecap="round" />
      <path d="M24 50h16" stroke="rgba(255,255,255,0.28)" strokeWidth="2" strokeLinecap="round" />
      <defs>
        <linearGradient id="simon-s2-fill" x1="32" y1="8" x2="32" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="#eafff3" />
          <stop offset="0.55" stopColor="#5dffaa" />
          <stop offset="1" stopColor="#1a8a44" />
        </linearGradient>
      </defs>
    </svg>
  ),
  3: (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden>
      <path
        d="M38 4L12 42h20l-3 18 33-44H35L38 4z"
        fill="url(#simon-s3-fill)"
        stroke="rgba(255,255,255,0.5)"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path d="M28 24l-6 12h12l-6-12z" fill="rgba(255,255,255,0.35)" />
      <path
        d="M34 14l4 8M30 30l-3 6M40 26l2 5"
        stroke="rgba(255,255,255,0.55)"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <defs>
        <linearGradient id="simon-s3-fill" x1="22" y1="4" x2="42" y2="60" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fff9d0" />
          <stop offset="0.45" stopColor="#ffe96a" />
          <stop offset="1" stopColor="#c9a020" />
        </linearGradient>
      </defs>
    </svg>
  ),
}

type Props = {
  lanePhase: SimonLanePhase
  showPad: PadId | null
  showBeat?: SimonShowBeat
  showIndex?: number
  lanePad: PadId | null
  variant: 'p1' | 'p2'
  inputIndex: number
  seqLength: number
  lastScoreGain?: number
  replayCount?: number
  wrongFlash?: boolean
  disabled?: boolean
  onTap?: (pad: PadId) => void
}

export function SimonDuelPad({
  lanePhase,
  showPad,
  showBeat = 'lit',
  showIndex = 0,
  lanePad,
  variant,
  inputIndex,
  seqLength,
  lastScoreGain = 0,
  replayCount = 0,
  wrongFlash = false,
  disabled = false,
  onTap,
}: Props) {
  const canInput = lanePhase === 'input' && !disabled && Boolean(onTap)

  return (
    <div
      className={[
        'pm-simon-pad',
        `is-${variant}`,
        `is-${lanePhase}`,
        lanePhase === 'input' ? 'is-touch' : '',
        wrongFlash ? 'is-wrong' : '',
        disabled ? 'is-disabled' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      role="group"
      aria-label={variant === 'p1' ? 'Emir Simon alanı' : 'Zeynep Simon alanı'}
    >
      {([0, 1, 2, 3] as PadId[]).map((pad) => {
        const lit =
          (lanePhase === 'show' && showBeat === 'lit' && showPad === pad) ||
          (lanePhase === 'input' && lanePad === pad) ||
          (wrongFlash && lanePad === pad)
        return (
          <button
            key={lanePhase === 'show' ? `show-${showIndex}-${pad}` : pad}
            type="button"
            className={['pm-simon-pad__btn', `is-pad-${pad}`, lit ? 'is-lit' : ''].filter(Boolean).join(' ')}
            disabled={!canInput}
            onClick={() => onTap?.(pad)}
            aria-label={PAD_LABELS[pad]}
          >
            <span className="pm-simon-pad__btn-glow" aria-hidden />
            <span className="pm-simon-pad__btn-core" aria-hidden />
            <span className="pm-simon-pad__btn-vignette" aria-hidden />
            <span className="pm-simon-pad__btn-symbol">{PAD_SYMBOLS[pad]}</span>
            <span className="pm-simon-pad__btn-shine" aria-hidden />
            <span className="pm-simon-pad__btn-ring" aria-hidden />
            <span className="pm-simon-pad__btn-flare" aria-hidden />
          </button>
        )
      })}
      <p className="pm-simon-pad__hint">
        {lanePhase === 'show'
          ? replayCount > 0
            ? 'YANLIŞ — TEKRAR İZLE'
            : 'DESENİ İZLE'
          : lanePhase === 'input'
            ? 'SIRAYLA DOKUN'
            : lastScoreGain > 0
              ? 'SÜPER!'
              : 'HAZIR'}
      </p>
      <p className="pm-simon-pad__progress">
        {lanePhase === 'ready' ? '—' : `${inputIndex}/${seqLength || '—'}`}
      </p>
    </div>
  )
}
