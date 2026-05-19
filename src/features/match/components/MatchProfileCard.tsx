import { useCallback, useRef } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { FiHeart, FiMapPin } from 'react-icons/fi'
import { LuGamepad2, LuTarget, LuTrophy } from 'react-icons/lu'
import { MdVerified } from 'react-icons/md'
import { motion, useReducedMotion } from 'framer-motion'
import type { MatchGameChip, MatchStyleTag } from '../data'
import { matchProfile } from '../data'

const tagIcons = {
  gamepad: LuGamepad2,
  target: LuTarget,
  trophy: LuTrophy,
} as const

function TagIcon({ tag }: { tag: MatchStyleTag }) {
  const Icon = tagIcons[tag.icon]
  return <Icon className="text-[0.875rem]" aria-hidden />
}

type MatchProfileCardProps = {
  portraitUrl: string
}

export function MatchProfileCard({ portraitUrl }: MatchProfileCardProps) {
  const reduceMotion = useReducedMotion()
  const cardRef = useRef<HTMLElement | null>(null)

  const resetTilt = useCallback(() => {
    const el = cardRef.current
    if (!el) return
    el.style.setProperty('--pm-match-rx', '0deg')
    el.style.setProperty('--pm-match-ry', '0deg')
  }, [])

  const onPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      if (reduceMotion) return
      const el = cardRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const px = (e.clientX - r.left) / r.width - 0.5
      const py = (e.clientY - r.top) / r.height - 0.5
      const max = 6
      el.style.setProperty('--pm-match-ry', `${(px * max * 2).toFixed(2)}deg`)
      el.style.setProperty('--pm-match-rx', `${(-py * max * 2).toFixed(2)}deg`)
    },
    [reduceMotion],
  )

  const p = matchProfile

  return (
    <motion.div
      className="pm-match-card-wrap relative mx-auto w-full max-w-[382px]"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        className="pm-match-card-stack pm-match-card-stack--a pointer-events-none absolute left-[3%] top-4 -z-20 h-[min(580px,76vh)] w-[94%] rounded-[1.5rem] border border-white/12 bg-[rgba(12,8,28,0.55)] opacity-55 shadow-[0_16px_40px_rgba(0,0,0,0.4)]"
        aria-hidden
      />
      <motion.div
        className="pm-match-card-stack pm-match-card-stack--b pointer-events-none absolute left-[1.5%] top-7 -z-10 h-[min(568px,74vh)] w-[97%] rounded-[1.45rem] border border-[rgba(120,150,255,0.28)] bg-[rgba(10,12,40,0.5)] opacity-75 shadow-[0_0_50px_rgba(80,100,255,0.16)]"
        aria-hidden
        animate={reduceMotion ? undefined : { y: [0, -2, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />

      <article
        ref={cardRef}
        className="pm-match-hero-card relative isolate overflow-hidden rounded-[1.5rem] border border-transparent shadow-[0_24px_60px_rgba(0,0,0,0.5),0_0_80px_rgba(255,60,160,0.18),0_0_50px_rgba(60,160,255,0.14)]"
        style={{
          transform: reduceMotion
            ? undefined
            : 'perspective(920px) rotateX(var(--pm-match-rx, 0deg)) rotateY(var(--pm-match-ry, 0deg)) translateZ(0)',
        }}
        onPointerMove={onPointerMove}
        onPointerLeave={resetTilt}
        onPointerCancel={resetTilt}
      >
        <motion.div
          className="pm-match-hero-card__glow"
          aria-hidden
          animate={reduceMotion ? undefined : { opacity: [0.7, 0.95, 0.7] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div
          className="pm-match-hero-card__ring pointer-events-none absolute inset-0 z-[2] rounded-[1.5rem]"
          aria-hidden
        />

        <div className="pm-match-portrait-stage relative aspect-[3/4] min-h-[min(468px,64vh)] w-full overflow-hidden bg-[#050818]">
          <img
            src={portraitUrl}
            alt=""
            className="pm-match-portrait-img absolute inset-0 h-full w-full object-cover"
            draggable={false}
          />
          <motion.div
            className="pm-match-portrait-bloom"
            aria-hidden
            animate={reduceMotion ? undefined : { opacity: [0.55, 0.85, 0.55] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className="pm-match-portrait-vignette pointer-events-none absolute inset-0 z-[1]" aria-hidden />
          <motion.div
            className="pointer-events-none absolute inset-0 z-[2] bg-[linear-gradient(180deg,rgba(2,4,18,0.2)_0%,transparent_32%,transparent_44%,rgba(4,6,22,0.78)_70%,rgba(2,3,14,0.97)_100%)]"
            aria-hidden
            animate={reduceMotion ? undefined : { opacity: [0.92, 1, 0.92] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />

          <motion.div
            className="absolute left-4 top-4 z-[3] flex items-center gap-2.5 rounded-full border border-[rgba(0,255,180,0.45)] bg-[rgba(4,18,14,0.82)] px-3 py-1.5 text-[0.75rem] font-semibold text-[#c8ffee] shadow-[0_0_22px_rgba(0,255,180,0.28)] backdrop-blur-lg"
            whileHover={reduceMotion ? undefined : { scale: 1.03 }}
          >
            <span className="pm-match-online-dot h-2.5 w-2.5 rounded-full bg-[#00f1a4]" />
            Online
          </motion.div>

          <motion.div
            className="absolute right-4 top-4 z-[3] flex items-center gap-2 rounded-full border border-[rgba(255,120,200,0.55)] bg-[rgba(28,8,40,0.85)] px-3 py-2 text-[0.75rem] font-bold text-[#ffe8f8] shadow-[0_0_28px_rgba(255,80,180,0.35)] backdrop-blur-lg"
            whileHover={reduceMotion ? undefined : { scale: 1.03 }}
          >
            <FiHeart className="text-base text-[#ff4db8] drop-shadow-[0_0_8px_rgba(255,77,184,0.6)]" />
            {p.compatibility}% Uyumluluk
          </motion.div>

          <motion.button
            type="button"
            className="absolute bottom-6 left-1/2 z-[3] w-[calc(100%-2rem)] max-w-[280px] -translate-x-1/2 rounded-2xl border border-white/20 bg-[rgba(8,12,38,0.55)] px-4 py-3 text-center text-[0.8125rem] font-semibold tracking-wide text-white backdrop-blur-xl"
            whileHover={reduceMotion ? undefined : { scale: 1.02 }}
            whileTap={reduceMotion ? undefined : { scale: 0.98 }}
          >
            FOTOĞRAFLARI GÖR
          </motion.button>
        </div>

        <motion.div
          className="relative z-[3] -mt-1 flex flex-col gap-4 px-4 pb-5 pt-2"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06, duration: 0.4 }}
        >
          <div>
            <motion.div
              className="flex flex-wrap items-center gap-2.5"
              whileHover={reduceMotion ? undefined : { x: 2 }}
            >
              <h2 className="text-[2.125rem] font-bold leading-[0.98] tracking-[-0.04em] text-white drop-shadow-[0_2px_20px_rgba(255,80,190,0.35)]">
                {p.name}
              </h2>
              {p.verified ? (
                <MdVerified
                  className="text-[1.75rem] text-[#b366ff] drop-shadow-[0_0_16px_rgba(168,85,247,0.65)]"
                  aria-label="Doğrulanmış"
                />
              ) : null}
              <span className="rounded-xl border border-white/18 bg-white/[0.08] px-2.5 py-1 text-[0.9375rem] font-semibold text-[#eef1ff] shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                {p.age}
              </span>
            </motion.div>
            <p className="mt-3 flex items-start gap-2 text-[0.9375rem] leading-snug text-[#c0cff5]">
              <FiMapPin className="mt-0.5 shrink-0 text-lg text-[#7eb8ff] drop-shadow-[0_0_10px_rgba(126,184,255,0.4)]" />
              {p.locationLine}
            </p>
          </div>

          <motion.div className="flex flex-wrap gap-2.5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
            {p.tags.map((tag) => (
              <span
                key={tag.id}
                className="pm-match-tag-chip inline-flex items-center gap-2 rounded-full border border-[rgba(150,175,255,0.48)] bg-[linear-gradient(180deg,rgba(255,255,255,0.06),transparent),rgba(8,12,42,0.72)] px-3.5 py-1.5 text-[0.8125rem] font-semibold text-[#eef2ff] shadow-[0_0_20px_rgba(100,140,255,0.18),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-lg"
              >
                <TagIcon tag={tag} />
                {tag.label}
              </span>
            ))}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12, duration: 0.4 }}>
            <p className="mb-3 text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-[#8a9bcf]">
              Favori oyunlar
            </p>
            <motion.div className="flex flex-wrap gap-2.5">
              {p.favoriteGames.map((g: MatchGameChip) => (
                <motion.span
                  key={g.id}
                  whileHover={{ y: -3, scale: 1.05 }}
                  whileTap={{ scale: 0.96 }}
                  className={`pm-match-game-chip inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-[0.875rem] border bg-[linear-gradient(160deg,rgba(255,255,255,0.08),transparent),rgba(10,14,40,0.82)] px-2.5 text-[1.0625rem] shadow-[0_0_22px_rgba(255,90,180,0.12),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-lg ${
                    g.more
                      ? 'border-[rgba(255,200,120,0.45)] text-[#ffe8c0] shadow-[0_0_20px_rgba(255,180,100,0.2)]'
                      : 'border-[rgba(255,110,200,0.42)]'
                  }`}
                >
                  <span className="sr-only">{g.label}</span>
                  <span aria-hidden>{g.emoji}</span>
                </motion.span>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            className="pm-match-bio rounded-[1.125rem] border border-[rgba(140,170,255,0.35)] bg-[rgba(6,10,36,0.62)] p-4 text-[0.9375rem] leading-[1.55] text-[#dce6ff] backdrop-blur-xl"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16, duration: 0.4 }}
            whileHover={reduceMotion ? undefined : { borderColor: 'rgba(160, 190, 255, 0.45)' }}
          >
            {p.bio}
          </motion.div>
        </motion.div>
      </article>
    </motion.div>
  )
}
