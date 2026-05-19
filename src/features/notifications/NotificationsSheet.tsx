import { FiCheck, FiHeart, FiMessageCircle, FiTrash2, FiX } from 'react-icons/fi'
import { LuGamepad2 } from 'react-icons/lu'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import type { AppNotification, NotificationKind } from './types'

const kindIcon: Record<NotificationKind, typeof FiHeart> = {
  match: FiHeart,
  like: FiHeart,
  game: LuGamepad2,
  message: FiMessageCircle,
  system: FiCheck,
}

type NotificationsSheetProps = {
  open: boolean
  items: AppNotification[]
  onClose: () => void
  onMarkAllRead: () => void
  onDismiss: (id: string) => void
  onItemAction: (item: AppNotification) => void
}

export function NotificationsSheet({
  open,
  items,
  onClose,
  onMarkAllRead,
  onDismiss,
  onItemAction,
}: NotificationsSheetProps) {
  const reduceMotion = useReducedMotion()

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            className="pm-notifications__backdrop"
            aria-label="Bildirimleri kapat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.section
            className="pm-notifications"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pm-notifications-title"
            style={{ x: '-50%', y: '-50%' }}
            initial={reduceMotion ? false : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
            exit={reduceMotion ? undefined : { opacity: 0, scale: 0.92, x: '-50%', y: '-50%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
          >
            <header className="pm-notifications__head">
              <h2 id="pm-notifications-title">Bildirimler</h2>
              <div className="pm-notifications__head-actions">
                {items.some((n) => !n.read) ? (
                  <button type="button" onClick={onMarkAllRead}>
                    Tümünü okundu işaretle
                  </button>
                ) : null}
                <button type="button" className="pm-notifications__close" onClick={onClose} aria-label="Kapat">
                  <FiX />
                </button>
              </div>
            </header>

            <ul className="pm-notifications__list">
              {items.length === 0 ? (
                <li className="pm-notifications__empty">Yeni bildirim yok</li>
              ) : (
                items.map((item) => {
                  const Icon = kindIcon[item.kind]
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        className={`pm-notifications__item${item.read ? '' : ' is-unread'}`}
                        onClick={() => onItemAction(item)}
                      >
                        <span className="pm-notifications__avatar" data-kind={item.kind}>
                          {item.avatarInitial ?? <Icon aria-hidden />}
                        </span>
                        <span className="pm-notifications__copy">
                          <strong>{item.title}</strong>
                          <span>{item.body}</span>
                          <small>{item.timeLabel}</small>
                        </span>
                      </button>
                      <button
                        type="button"
                        className="pm-notifications__dismiss"
                        aria-label="Kaldır"
                        onClick={() => onDismiss(item.id)}
                      >
                        <FiTrash2 />
                      </button>
                    </li>
                  )
                })
              )}
            </ul>
          </motion.section>
        </>
      ) : null}
    </AnimatePresence>
  )
}
