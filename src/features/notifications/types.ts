export type NotificationKind = 'match' | 'like' | 'game' | 'message' | 'system'

export type AppNotification = {
  id: string
  kind: NotificationKind
  title: string
  body: string
  timeLabel: string
  read: boolean
  avatarInitial?: string
}
