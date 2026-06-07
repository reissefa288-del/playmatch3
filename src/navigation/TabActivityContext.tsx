import { createContext, useContext, useMemo, type ReactNode } from 'react'
import type { TabId } from './tabConfig'

type TabActivityValue = {
  activeTabId: TabId | null
}

const TabActivityContext = createContext<TabActivityValue>({ activeTabId: null })

type TabActivityProviderProps = {
  activeTabId: TabId | null
  children: ReactNode
}

export function TabActivityProvider({ activeTabId, children }: TabActivityProviderProps) {
  const value = useMemo(() => ({ activeTabId }), [activeTabId])
  return <TabActivityContext.Provider value={value}>{children}</TabActivityContext.Provider>
}

/** True when the given tab is the active main-tab route. */
export function useTabActive(tabId: TabId) {
  const { activeTabId } = useContext(TabActivityContext)
  return activeTabId === tabId
}
