import { Navigate, useLocation } from 'react-router-dom'
import { TabActivityProvider } from './TabActivityContext'
import { TabPanel } from './TabPanel'
import { MAIN_TABS, PREMIUM_TAB, resolveTabId } from './tabConfig'

/** All dock tabs stay mounted — zero remount / lazy cost on tab switch */
export function MainTabLayout() {
  const location = useLocation()
  const activeTabId = resolveTabId(location.pathname)

  if (!activeTabId) {
    return <Navigate to="/" replace />
  }

  return (
    <TabActivityProvider activeTabId={activeTabId}>
      <div className="pm-main-layout">
        <div className="pm-tab-viewport" role="presentation">
          {[...MAIN_TABS, PREMIUM_TAB].map((tab) => {
            const isActive = tab.id === activeTabId
            const { Component } = tab

            return (
              <TabPanel key={tab.id} tabId={tab.id} isActive={isActive}>
                <Component />
              </TabPanel>
            )
          })}
        </div>
      </div>
    </TabActivityProvider>
  )
}
