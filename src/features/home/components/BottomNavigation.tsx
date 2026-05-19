import { motion } from 'framer-motion'
import { NavLink, useLocation } from 'react-router-dom'
import type { BottomNavItem } from '../types'
import type { TabId } from '../../../navigation/tabConfig'

type BottomNavigationProps = {
  items: BottomNavItem[]
  activeTabId?: TabId
}

function isItemActive(item: BottomNavItem, pathname: string, activeTabId?: TabId): boolean {
  if (activeTabId && item.id === activeTabId) {
    return true
  }
  if (!item.to) return false
  if (item.to === '/') {
    return pathname === '/' || pathname === ''
  }
  if (item.id === 'chat') {
    return pathname === '/chat' || /^\/chat\/[^/]+$/.test(pathname)
  }
  return pathname === item.to || pathname.startsWith(`${item.to}/`)
}

export function BottomNavigation({ items, activeTabId }: BottomNavigationProps) {
  const { pathname } = useLocation()

  return (
    <nav className="pm-bottom-nav" aria-label="Alt Menü">
      {items.map((item) => {
        const labelClass = `pm-bottom-nav__label ${item.variant === 'premium' ? 'is-premium-label' : ''}`
        const active = isItemActive(item, pathname, activeTabId)

        const inner = (
          <>
            {active ? (
              <motion.span
                layoutId="pm-nav-active-indicator"
                className="pm-bottom-nav__indicator"
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                aria-hidden
              />
            ) : null}
            <span className="pm-bottom-nav__icon">
              <item.icon />
              {item.badge ? <em>{item.badge}</em> : null}
            </span>
            <span className={labelClass}>{item.label}</span>
          </>
        )

        const baseItemClass = [
          'pm-bottom-nav__item',
          item.variant === 'premium' ? 'is-premium' : '',
          active ? 'is-active' : '',
        ]
          .filter(Boolean)
          .join(' ')

        if (item.to) {
          return (
            <NavLink
              key={item.id}
              to={item.to}
              end={item.to === '/'}
              className={baseItemClass}
              aria-current={active ? 'page' : undefined}
            >
              {inner}
            </NavLink>
          )
        }

        return (
          <button key={item.id} type="button" className={baseItemClass}>
            {inner}
          </button>
        )
      })}
    </nav>
  )
}
