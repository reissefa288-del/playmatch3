import type { ReactNode } from 'react'
import { FiHeart, FiStar, FiX } from 'react-icons/fi'
import { LuGamepad2, LuRotateCcw } from 'react-icons/lu'
import { motion } from 'framer-motion'

const spring = { type: 'spring' as const, stiffness: 400, damping: 20 }

export function MatchActionRow() {
  return (
    <motion.div
      className="pm-match-actions grid w-full grid-cols-5 items-end gap-2.5 px-1"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <ActionCircle
        label="Geri Al"
        variant="muted"
        badge={1}
        icon={<LuRotateCcw className="text-xl text-[#c4c0e4]" />}
      />
      <ActionCircle label="Geç" variant="pass" icon={<FiX className="text-[1.65rem] text-[#e8d8ff]" />} />
      <ActionCircle
        label="Eşleşme"
        variant="match"
        icon={<FiHeart className="text-[2.15rem] text-[#ff3db8] drop-shadow-[0_0_12px_rgba(255,61,184,0.7)]" />}
        large
      />
      <ActionCircle
        label="Oyuna davet"
        variant="invite"
        icon={<LuGamepad2 className="text-[1.65rem] text-[#7ed4ff] drop-shadow-[0_0_10px_rgba(100,200,255,0.55)]" />}
      />
      <ActionCircle
        label="Süper beğeni"
        variant="muted"
        badge={1}
        icon={<FiStar className="text-xl text-[#ddd0ff]" />}
      />
    </motion.div>
  )
}

type ActionCircleProps = {
  label: string
  icon: ReactNode
  variant: 'muted' | 'pass' | 'match' | 'invite'
  badge?: number
  large?: boolean
}

function ActionCircle({ label, icon, variant, badge, large }: ActionCircleProps) {
  const base =
    'relative flex flex-col items-center justify-center rounded-full border transition-[box-shadow,filter] duration-300'

  const size = large
    ? 'h-[5.25rem] w-[5.25rem] -mt-2'
    : 'h-[3.75rem] w-[3.75rem]'

  const styles = {
    muted:
      'border-[rgba(130,110,190,0.42)] bg-[linear-gradient(165deg,rgba(30,20,55,0.95),rgba(12,8,32,0.92))] shadow-[0_10px_28px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.08)]',
    pass:
      'border-[rgba(190,150,255,0.52)] bg-[linear-gradient(165deg,rgba(50,28,80,0.95),rgba(18,10,42,0.92))] shadow-[0_0_32px_rgba(160,100,255,0.35),0_12px_28px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.1)]',
    match:
      'pm-match-action-btn--match border-[rgba(255,100,200,0.85)] bg-[linear-gradient(165deg,rgba(255,70,170,0.45),rgba(35,12,55,0.95))] shadow-[0_0_48px_rgba(255,60,170,0.6),0_0_90px_rgba(255,80,190,0.25),inset_0_1px_0_rgba(255,255,255,0.22)]',
    invite:
      'pm-match-action-btn--invite border-[rgba(90,190,255,0.65)] bg-[linear-gradient(165deg,rgba(50,140,255,0.38),rgba(8,14,42,0.95))] shadow-[0_0_40px_rgba(60,170,255,0.5),0_12px_28px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.12)]',
  }[variant]

  return (
    <motion.button
      type="button"
      aria-label={label}
      className={`${base} ${size} ${styles} col-span-1 mx-auto`}
      whileHover={{ scale: large ? 1.08 : 1.07, y: large ? -4 : -3, filter: 'brightness(1.1)' }}
      whileTap={{ scale: 0.9 }}
      transition={spring}
    >
      {badge != null ? (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#ff3355] px-1 text-[0.625rem] font-bold text-white shadow-[0_0_14px_rgba(255,51,85,0.65)]">
          {badge}
        </span>
      ) : null}
      {icon}
      <span className="sr-only">{label}</span>
    </motion.button>
  )
}
