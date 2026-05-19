import { useCallback, useMemo, useState } from 'react'
import { initialNotifications } from './notificationData'
import type { AppNotification } from './types'

export function useNotifications() {
  const [items, setItems] = useState<AppNotification[]>(initialNotifications)
  const [open, setOpen] = useState(false)

  const unreadCount = useMemo(() => items.filter((n) => !n.read).length, [items])

  const openPanel = useCallback(() => setOpen(true), [])
  const closePanel = useCallback(() => setOpen(false), [])

  const markRead = useCallback((id: string) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }, [])

  const markAllRead = useCallback(() => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [])

  const dismiss = useCallback((id: string) => {
    setItems((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const onItemAction = useCallback(
    (item: AppNotification) => {
      markRead(item.id)
    },
    [markRead],
  )

  return {
    items,
    open,
    unreadCount,
    openPanel,
    closePanel,
    markRead,
    markAllRead,
    dismiss,
    onItemAction,
  }
}
