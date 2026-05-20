import { useMemo } from 'react'
import { createPortal } from 'react-dom'
import { FiBell } from 'react-icons/fi'
import logo from '../../../reference/logo.png'
import { CurrencyNavPills } from '../../currency/CurrencyNavPills'
import { NotificationsSheet } from '../../notifications/NotificationsSheet'
import { useNotifications } from '../../notifications/useNotifications'

type NavbarProps = {
  currencyVariant?: 'default' | 'match'
}

export function Navbar({ currencyVariant = 'default' }: NavbarProps) {
  const {
    items,
    open,
    unreadCount,
    openPanel,
    closePanel,
    markAllRead,
    dismiss,
    onItemAction,
  } = useNotifications()

  const sheet = useMemo(
    () =>
      open && typeof document !== 'undefined'
        ? createPortal(
            <NotificationsSheet
              open={open}
              items={items}
              onClose={closePanel}
              onMarkAllRead={markAllRead}
              onDismiss={dismiss}
              onItemAction={onItemAction}
            />,
            document.body,
          )
        : null,
    [open, items, closePanel, markAllRead, dismiss, onItemAction],
  )

  return (
    <>
      <header className="pm-navbar">
        <div className="pm-brand pm-brand--aaa">
          <span className="pm-brand__backdrop" aria-hidden />
          <div className="pm-brand__mark">
            <span className="pm-brand__logo-wrap" aria-hidden>
              <img src={logo} alt="" className="pm-brand__logo" />
            </span>
            <span className="pm-brand__wordmark">PlayMeet</span>
          </div>
        </div>

        <div className="pm-navbar__right">
          <CurrencyNavPills variant={currencyVariant} />

          <button
            className={`pm-icon-button pm-icon-button--bell${open ? ' is-open' : ''}`}
            type="button"
            aria-label="Bildirimler"
            aria-expanded={open}
            onClick={open ? closePanel : openPanel}
          >
            <FiBell />
            {unreadCount > 0 ? <span className="pm-badge">{unreadCount}</span> : null}
          </button>
        </div>
      </header>
      {sheet}
    </>
  )
}
