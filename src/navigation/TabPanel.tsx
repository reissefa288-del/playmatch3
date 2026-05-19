import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { TAB_TRANSITION } from './transitions'

type TabPanelProps = {
  tabId: string
  isActive: boolean
  direction: number
  children: ReactNode
}

export function TabPanel({ tabId, isActive, direction, children }: TabPanelProps) {
  const enterX = direction === 0 ? 0 : direction > 0 ? 22 : -22

  return (
    <motion.div
      id={`pm-tab-${tabId}`}
      className={`pm-tab-panel${isActive ? ' is-active' : ''}`}
      role="tabpanel"
      aria-hidden={!isActive}
      tabIndex={isActive ? 0 : -1}
      initial={false}
      animate={{
        opacity: isActive ? 1 : 0,
        x: isActive ? 0 : enterX * 0.35,
        scale: isActive ? 1 : 0.992,
      }}
      transition={TAB_TRANSITION}
      style={{
        pointerEvents: isActive ? 'auto' : 'none',
        zIndex: isActive ? 2 : 1,
      }}
    >
      {children}
    </motion.div>
  )
}
