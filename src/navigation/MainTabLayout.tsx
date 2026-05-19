import { useEffect, useRef, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { TabPanel } from './TabPanel'
import { getTabDirection, MAIN_TABS, PREMIUM_TAB, resolveTabId, type TabId } from './tabConfig'

export function MainTabLayout() {
  const location = useLocation()
  const activeTabId = resolveTabId(location.pathname)
  const [mountedTabs, setMountedTabs] = useState<Set<TabId>>(() =>
    activeTabId ? new Set([activeTabId]) : new Set(['home']),
  )

  const previousTabRef = useRef<TabId>(activeTabId ?? 'home')
  const direction =
    activeTabId && previousTabRef.current
      ? getTabDirection(previousTabRef.current, activeTabId)
      : 0

  useEffect(() => {
    if (!activeTabId) return
    setMountedTabs((current) => {
      if (current.has(activeTabId)) return current
      const next = new Set(current)
      next.add(activeTabId)
      return next
    })
  }, [activeTabId])

  useEffect(() => {
    if (activeTabId) {
      previousTabRef.current = activeTabId
    }
  }, [activeTabId])

  if (!activeTabId) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="pm-main-layout">
      <div className="pm-tab-viewport" role="presentation">
        {[...MAIN_TABS, PREMIUM_TAB].map((tab) => {
          if (!mountedTabs.has(tab.id)) return null
          const isActive = tab.id === activeTabId
          const { Component } = tab

          return (
            <TabPanel
              key={tab.id}
              tabId={tab.id}
              isActive={isActive}
              direction={isActive ? direction : 0}
            >
              <Component />
            </TabPanel>
          )
        })}
      </div>
    </div>
  )
}
