import { Suspense, useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { prefetchTabRoutes } from './prefetchRoutes'
import { TabActivityProvider } from './TabActivityContext'
import { TabPanel } from './TabPanel'
import { MAIN_TABS, PREMIUM_TAB, resolveTabId, type TabId } from './tabConfig'

const MAX_MOUNTED_TABS = 3

function trimMountedTabs(order: TabId[], activeTabId: TabId) {
  if (order.length <= MAX_MOUNTED_TABS) return order
  const next = [...order]
  while (next.length > MAX_MOUNTED_TABS) {
    const evictIndex = next.findIndex((id) => id !== activeTabId)
    if (evictIndex < 0) break
    next.splice(evictIndex, 1)
  }
  return next
}

export function MainTabLayout() {
  const location = useLocation()
  const activeTabId = resolveTabId(location.pathname)
  const [mountedTabOrder, setMountedTabOrder] = useState<TabId[]>(() =>
    activeTabId ? [activeTabId] : ['home'],
  )

  useEffect(() => {
    if (!activeTabId) return
    setMountedTabOrder((current) => {
      const withoutActive = current.filter((id) => id !== activeTabId)
      const next = [...withoutActive, activeTabId]
      return trimMountedTabs(next, activeTabId)
    })
  }, [activeTabId])

  useEffect(() => {
    if (!activeTabId) return
    prefetchTabRoutes(activeTabId)
  }, [activeTabId])

  if (!activeTabId) {
    return <Navigate to="/" replace />
  }

  const mountedTabs = new Set(mountedTabOrder)

  return (
    <TabActivityProvider activeTabId={activeTabId}>
      <div className="pm-main-layout">
        <div className="pm-tab-viewport" role="presentation">
          {[...MAIN_TABS, PREMIUM_TAB].map((tab) => {
            if (!mountedTabs.has(tab.id)) return null
            const isActive = tab.id === activeTabId
            const { Component } = tab

            return (
              <TabPanel key={tab.id} tabId={tab.id} isActive={isActive}>
                <Suspense fallback={null}>
                  <Component />
                </Suspense>
              </TabPanel>
            )
          })}
        </div>
      </div>
    </TabActivityProvider>
  )
}
