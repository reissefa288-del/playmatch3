import { useEffect } from 'react'
import { FiBell, FiTrash2, FiX } from 'react-icons/fi'
import { usePrefersReducedMotion } from '../../shared/usePrefersReducedMotion'
import { ShopGlassShader } from '../currency/ShopGlassShader'
import type { AppNotification } from './types'

type NotificationsSheetProps = {
  open: boolean
  items: AppNotification[]
  unreadCount: number
  onClose: () => void
  onDismiss: (id: string) => void
  onItemAction: (item: AppNotification) => void
}

export function NotificationsSheet({
  open,
  items,
  unreadCount,
  onClose,
  onDismiss,
  onItemAction,
}: NotificationsSheetProps) {
  const reduceMotion = usePrefersReducedMotion()

  useEffect(() => {
    if (open) void import('../../styles/notifications.css')
  }, [open])

  if (!open) return null

  return (
    <>
      <button
        type="button"
        className="pm-notifications__backdrop pm-sheet-backdrop-enter"
        aria-label="Bildirimleri kapat"
        onClick={onClose}
      />
      <section
        className={`pm-notifications${reduceMotion ? '' : ' pm-sheet-modal-enter--notif'}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pm-notifications-title"
        style={{ transform: 'translate(-50%, -50%)' }}
      >
        <ShopGlassShader tone="violet" />
        <header className="pm-notifications__head">
          <div className="pm-notifications__head-brand">
            <span className="pm-notifications__bell" aria-hidden>
              <FiBell />
            </span>
            <div className="pm-notifications__head-title">
              <h2 id="pm-notifications-title">Bildirimler</h2>
              {unreadCount > 0 ? (
                <p className="pm-notifications__sub">{unreadCount} okunmamış</p>
              ) : items.length > 0 ? (
                <p className="pm-notifications__sub">Tümü okundu</p>
              ) : null}
            </div>
          </div>
          <button type="button" className="pm-notifications__close" onClick={onClose} aria-label="Kapat">
            <FiX />
          </button>
        </header>

        <ul className="pm-notifications__list">
          {items.length === 0 ? (
            <li className="pm-notifications__empty">
              <span className="pm-notifications__empty-icon" aria-hidden>
                <FiBell />
              </span>
              <strong>Bildirim yok</strong>
              <p>Eşleşme, beğeni ve davet burada durur.</p>
            </li>
          ) : (
            items.map((item) => (
                <li
                  key={item.id}
                  className={`pm-notifications__card${item.read ? '' : ' is-unread'}`}
                  data-kind={item.kind}
                >
                  <button type="button" className="pm-notifications__item" onClick={() => onItemAction(item)}>
                    <span className="pm-notifications__accent" aria-hidden />
                    <span className="pm-notifications__avatar">
                      {item.avatarSrc ? (
                        <img
                          className="pm-notifications__photo"
                          src={item.avatarSrc}
                          alt=""
                          style={{ objectPosition: item.avatarPosition ?? '50% 20%' }}
                        />
                      ) : (
                        <span className="pm-notifications__initial">{item.avatarInitial ?? '•'}</span>
                      )}
                    </span>
                    <span className="pm-notifications__copy">
                      <span className="pm-notifications__meta">
                        <strong>{item.title}</strong>
                        <small>{item.timeLabel}</small>
                      </span>
                      <span className="pm-notifications__body">{item.body}</span>
                    </span>
                  </button>
                  <button
                    type="button"
                    className="pm-notifications__dismiss"
                    aria-label="Bildirimi kaldır"
                    onClick={() => onDismiss(item.id)}
                  >
                    <FiTrash2 aria-hidden />
                  </button>
                </li>
            ))
          )}
        </ul>
      </section>
    </>
  )
}
