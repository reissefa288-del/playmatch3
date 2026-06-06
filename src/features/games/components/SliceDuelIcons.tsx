import type { ReactNode } from 'react'
import type { SliceIcon } from '../utils/sliceDuelEngine'

export function SliceDuelIcon({ icon }: { icon: SliceIcon }) {
  const icons: Record<SliceIcon, ReactNode> = {
    apple: (
      <svg viewBox="0 0 64 64" fill="none" aria-hidden>
        <path
          d="M32 10c-8 0-14 6-14 14 0 10 6 18 14 26 8-8 14-16 14-26 0-8-6-14-14-14z"
          fill="url(#slice-apple)"
          stroke="rgba(255,255,255,0.45)"
          strokeWidth="1.2"
        />
        <path d="M32 10V4" stroke="#6ecf4a" strokeWidth="2.5" strokeLinecap="round" />
        <ellipse cx="38" cy="8" rx="5" ry="3" fill="#7adf52" opacity="0.85" />
        <ellipse cx="26" cy="24" rx="4" ry="6" fill="rgba(255,255,255,0.22)" />
        <defs>
          <linearGradient id="slice-apple" x1="32" y1="10" x2="32" y2="50" gradientUnits="userSpaceOnUse">
            <stop stopColor="#ff8a96" />
            <stop offset="0.55" stopColor="#ff3d55" />
            <stop offset="1" stopColor="#a81828" />
          </linearGradient>
        </defs>
      </svg>
    ),
    orange: (
      <svg viewBox="0 0 64 64" fill="none" aria-hidden>
        <circle cx="32" cy="34" r="20" fill="url(#slice-orange)" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" />
        <path d="M32 14v-6" stroke="#7adf52" strokeWidth="2.5" strokeLinecap="round" />
        <ellipse cx="24" cy="28" rx="5" ry="7" fill="rgba(255,255,255,0.2)" />
        <circle cx="32" cy="34" r="16" stroke="rgba(255,180,80,0.25)" strokeWidth="1" strokeDasharray="3 4" />
        <defs>
          <radialGradient id="slice-orange" cx="0.35" cy="0.3" r="0.75">
            <stop stopColor="#ffd080" />
            <stop offset="0.55" stopColor="#ff9f43" />
            <stop offset="1" stopColor="#c85a10" />
          </radialGradient>
        </defs>
      </svg>
    ),
    melon: (
      <svg viewBox="0 0 64 64" fill="none" aria-hidden>
        <circle cx="32" cy="34" r="21" fill="url(#slice-melon-rind)" stroke="rgba(255,255,255,0.35)" strokeWidth="1.2" />
        <circle cx="32" cy="34" r="15" fill="url(#slice-melon-flesh)" />
        <path d="M32 19v30M22 34h20M26 24l12 20M38 24L26 44" stroke="rgba(255,120,140,0.35)" strokeWidth="1.2" />
        <ellipse cx="24" cy="28" rx="4" ry="6" fill="rgba(255,255,255,0.18)" />
        <defs>
          <radialGradient id="slice-melon-rind" cx="0.5" cy="0.5" r="0.5">
            <stop stopColor="#6ecf4a" />
            <stop offset="1" stopColor="#2d7a22" />
          </radialGradient>
          <radialGradient id="slice-melon-flesh" cx="0.4" cy="0.35" r="0.65">
            <stop stopColor="#ffb8c8" />
            <stop offset="1" stopColor="#ff5a78" />
          </radialGradient>
        </defs>
      </svg>
    ),
    star: (
      <svg viewBox="0 0 64 64" fill="none" aria-hidden>
        <path
          d="M32 6l6.8 20.8H60L42.4 35.2l6.4 19.6L32 45.6 15.2 54.8l6.4-19.6L4 26.8h21.2L32 6z"
          fill="url(#slice-star)"
          stroke="rgba(255,255,255,0.55)"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        <path
          d="M32 16l3.6 11h11.6L37.2 32l3.4 10.4L32 38.4l-8.6 3.8 3.4-10.4-9.2-5h11.6L32 16z"
          fill="rgba(255,255,255,0.28)"
        />
        <defs>
          <linearGradient id="slice-star" x1="32" y1="6" x2="32" y2="55" gradientUnits="userSpaceOnUse">
            <stop stopColor="#fff9c0" />
            <stop offset="0.5" stopColor="#ffd54a" />
            <stop offset="1" stopColor="#e6a800" />
          </linearGradient>
        </defs>
      </svg>
    ),
    bomb: (
      <svg viewBox="0 0 64 64" fill="none" aria-hidden>
        <circle cx="30" cy="36" r="18" fill="url(#slice-bomb)" stroke="rgba(255,255,255,0.35)" strokeWidth="1.2" />
        <path d="M38 20l8-8 4 4-8 8" stroke="#ddd" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M44 12l4-4" stroke="#ff6b6b" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="44" cy="12" r="3" fill="#ff9f43" />
        <ellipse cx="24" cy="30" rx="5" ry="7" fill="rgba(255,255,255,0.15)" />
        <path d="M22 36h16" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeLinecap="round" />
        <defs>
          <radialGradient id="slice-bomb" cx="0.35" cy="0.3" r="0.75">
            <stop stopColor="#555" />
            <stop offset="0.6" stopColor="#2a2a2a" />
            <stop offset="1" stopColor="#111" />
          </radialGradient>
        </defs>
      </svg>
    ),
  }

  return <span className="pm-slice-obj__icon">{icons[icon]}</span>
}
