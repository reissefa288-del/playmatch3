import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { BottomNavigation } from '../features/home/components/BottomNavigation'
import { bottomNavigation } from '../features/home/data'
import { TabPanel } from './TabPanel'
import { getTabDirection, MAIN_TABS, PREMIUM_TAB, resolveTabId, type TabId } from './tabConfig'

type MainTabLayoutProps = {
  hideDock?: boolean
}

export function MainTabLayout({ hideDock = false }: MainTabLayoutProps) {
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

  const navContextClass =
    activeTabId === 'home' ? 'pm-nav-dock' : `pm-nav-dock pm-app-shell--${activeTabId}`

  return (
    <motion.div className="pm-main-layout" layout>
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

      {!hideDock ? (
        <motion.div className={navContextClass} layout="position">
          <BottomNavigation items={bottomNavigation} activeTabId={activeTabId} />
        </motion.div>
      ) : null}
    </motion.div>
  )
}
