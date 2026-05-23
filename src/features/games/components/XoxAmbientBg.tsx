import { motion } from 'framer-motion'

const PARTICLE_COUNT = 16

export function XoxAmbientBg() {
  return (
    <div className="pm-xox-ambient" aria-hidden>
      <motion.div
        className="pm-xox-ambient__base"
        animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
        transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="pm-xox-ambient__aurora pm-xox-ambient__aurora--a"
        animate={{ x: ['-4%', '4%', '-4%'], y: ['0%', '3%', '0%'], opacity: [0.55, 0.85, 0.55] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="pm-xox-ambient__aurora pm-xox-ambient__aurora--b"
        animate={{ x: ['3%', '-3%', '3%'], y: ['2%', '-2%', '2%'], opacity: [0.45, 0.75, 0.45] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <span className="pm-xox-ambient__orb pm-xox-ambient__orb--pink" />
      <span className="pm-xox-ambient__orb pm-xox-ambient__orb--blue" />
      <span className="pm-xox-ambient__orb pm-xox-ambient__orb--violet" />
      <motion.div
        className="pm-xox-ambient__grid"
        animate={{ opacity: [0.35, 0.55, 0.35] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="pm-xox-ambient__beam pm-xox-ambient__beam--a"
        animate={{ opacity: [0.15, 0.45, 0.15], scaleX: [0.92, 1.08, 0.92] }}
        transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="pm-xox-ambient__beam pm-xox-ambient__beam--b"
        animate={{ opacity: [0.12, 0.38, 0.12], scaleX: [1.04, 0.9, 1.04] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
      />
      <motion.div
        className="pm-xox-ambient__beam pm-xox-ambient__beam--c"
        animate={{ opacity: [0.1, 0.32, 0.1], rotate: [0, 2, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
      />
      <div className="pm-xox-ambient__particles">
        {Array.from({ length: PARTICLE_COUNT }, (_, i) => (
          <motion.span
            key={i}
            className="pm-xox-ambient__particle"
            style={{ left: `${8 + ((i * 17) % 84)}%`, top: `${6 + ((i * 23) % 88)}%` }}
            animate={{
              y: [0, -18 - (i % 4) * 6, 0],
              opacity: [0.15, 0.75, 0.15],
              scale: [0.6, 1.1, 0.6],
            }}
            transition={{
              duration: 3.2 + (i % 5) * 0.8,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.22,
            }}
          />
        ))}
      </div>
      <span className="pm-xox-ambient__vignette" />
      <span className="pm-xox-ambient__scanlines" />
    </div>
  )
}
