import type { ReactNode } from 'react'

type TabPanelProps = {
  tabId: string
  isActive: boolean
  children: ReactNode
}

export function TabPanel({ tabId, isActive, children }: TabPanelProps) {
  return (
    <div
      id={`pm-tab-${tabId}`}
      className={`pm-tab-panel${isActive ? ' is-active' : ''}`}
      role="tabpanel"
      aria-hidden={!isActive}
      tabIndex={isActive ? 0 : -1}
      style={{
        pointerEvents: isActive ? 'auto' : 'none',
        zIndex: isActive ? 2 : 1,
      }}
    >
      {children}
    </div>
  )
}
