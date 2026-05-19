import { motion } from 'framer-motion'
import type { ChatTabId } from '../data'
import { chatTabs } from '../data'

type ChatFilterTabsProps = {
  active: ChatTabId
  onChange: (id: ChatTabId) => void
}

export function ChatFilterTabs({ active, onChange }: ChatFilterTabsProps) {
  return (
    <motion.div
      className="pm-chat-tabs"
      role="tablist"
      aria-label="Sohbet filtreleri"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.4 }}
    >
      {chatTabs.map((tab) => {
        const isActive = tab.id === active
        const Icon = tab.icon
        return (
          <motion.button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`pm-chat-tabs__item ${isActive ? 'is-active' : ''}`}
            whileTap={{ scale: 0.98 }}
          >
            {isActive ? (
              <motion.span
                layoutId="chat-tab-glow"
                className="pm-chat-tabs__glow"
                transition={{ type: 'spring', stiffness: 380, damping: 34 }}
              />
            ) : null}
            {Icon ? <Icon className="pm-chat-tabs__icon" aria-hidden /> : null}
            <span>{tab.label}</span>
            {tab.badge != null ? <em>{tab.badge}</em> : null}
          </motion.button>
        )
      })}
    </motion.div>
  )
}
