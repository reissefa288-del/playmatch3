import { motion } from 'framer-motion'
import type { MatchTabId } from '../data'
import { matchTabs } from '../data'

type MatchTabsProps = {
  active: MatchTabId
  onChange: (id: MatchTabId) => void
}

export function MatchTabs({ active, onChange }: MatchTabsProps) {
  return (
    <div
      className="flex rounded-[1.25rem] border border-[rgba(255,255,255,0.12)] bg-[rgba(6,10,32,0.7)] p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_32px_rgba(80,100,200,0.08)] backdrop-blur-xl"
      role="tablist"
      aria-label="Eşleşme sekmeleri"
    >
      {matchTabs.map((tab) => {
        const isActive = tab.id === active
        return (
          <motion.button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`relative flex min-h-[46px] min-w-0 flex-1 items-center justify-center gap-2 rounded-[0.9375rem] px-2.5 text-[0.75rem] font-semibold transition-colors ${
              isActive ? 'text-[#ffe9fb]' : 'text-[#9aa6d4] hover:text-[#d0dcff]'
            }`}
            whileTap={{ scale: 0.98 }}
            whileHover={!isActive ? { color: '#d0dcff' } : undefined}
          >
            {isActive ? (
              <motion.span
                layoutId="match-tab-glow"
                className="absolute inset-0 rounded-[0.9375rem] border border-[rgba(255,120,210,0.62)] bg-[linear-gradient(180deg,rgba(255,75,185,0.28),rgba(90,60,180,0.14))] shadow-[0_0_32px_rgba(255,80,190,0.42),inset_0_1px_0_rgba(255,255,255,0.14)]"
                transition={{ type: 'spring', stiffness: 380, damping: 34 }}
              />
            ) : null}
            <span className="relative z-[1] truncate">{tab.label}</span>
            {tab.badge != null ? (
              <span className="relative z-[1] flex h-5 min-w-5 items-center justify-center rounded-full bg-[#ff3b5c] px-1 text-[0.625rem] font-bold text-white shadow-[0_0_14px_rgba(255,59,92,0.6)]">
                {tab.badge}
              </span>
            ) : null}
          </motion.button>
        )
      })}
    </div>
  )
}
