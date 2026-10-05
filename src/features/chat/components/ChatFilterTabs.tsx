import type { ChatTabId } from '../data'
import { chatTabs } from '../data'

type ChatFilterTabsProps = {
  active: ChatTabId
  onChange: (id: ChatTabId) => void
}

export function ChatFilterTabs({ active, onChange }: ChatFilterTabsProps) {
  return (
    <div
      className="pm-chat-tabs"
      role="tablist"
      aria-label="Sohbet filtreleri"
     
     
     
    >
      {chatTabs.map((tab) => {
        const isActive = tab.id === active
        const Icon = tab.icon
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`pm-chat-tabs__item ${isActive ? 'is-active' : ''}`}
           
          >
            {isActive ? (
              <span
               
                className="pm-chat-tabs__glow"
               
              />
            ) : null}
            {Icon ? <Icon className="pm-chat-tabs__icon" aria-hidden /> : null}
            <span>{tab.label}</span>
            {tab.badge != null ? <em>{tab.badge}</em> : null}
          </button>
        )
      })}
    </div>
  )
}
