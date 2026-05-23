import { motion } from 'framer-motion'

export function BrickAmbientBg() {
  return (
    <div className="pm-brick-ambient" aria-hidden>
      <div className="pm-brick-ambient__base" />
      <motion.div
        className="pm-brick-ambient__beam pm-brick-ambient__beam--cyan"
        animate={{ opacity: [0.2, 0.5, 0.2], x: ['-2%', '2%', '-2%'] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="pm-brick-ambient__beam pm-brick-ambient__beam--pink"
        animate={{ opacity: [0.18, 0.45, 0.18], x: ['2%', '-2%', '2%'] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
      />
      <span className="pm-brick-ambient__grid" />
      <span className="pm-brick-ambient__vignette" />
    </div>
  )
}
