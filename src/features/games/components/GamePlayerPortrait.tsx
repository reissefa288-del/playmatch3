import { motion } from 'framer-motion'

type GamePlayerPortraitProps = {
  src: string
  variant: 'cyan' | 'pink'
  active?: boolean
  crown?: boolean
  label?: string
}

export function GamePlayerPortrait({ src, variant, active = false, crown = false, label }: GamePlayerPortraitProps) {
  return (
    <motion.div
      className={`pm-game-portrait is-${variant} ${active ? 'is-active' : ''}`}
      layout
    >
      {crown ? <span className="pm-game-portrait__crown" aria-hidden>♛</span> : null}
      <img src={src} alt="" className="pm-game-portrait__photo" />
      <span className="pm-game-portrait__bracket pm-game-portrait__bracket--tl" aria-hidden />
      <span className="pm-game-portrait__bracket pm-game-portrait__bracket--tr" aria-hidden />
      <span className="pm-game-portrait__bracket pm-game-portrait__bracket--bl" aria-hidden />
      <span className="pm-game-portrait__bracket pm-game-portrait__bracket--br" aria-hidden />
      {label ? <span className="pm-game-portrait__label">{label}</span> : null}
    </motion.div>
  )
}
