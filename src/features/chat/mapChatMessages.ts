import type { ChatMessage } from './data'
import type { FirestoreChatMessage } from './firestoreChat'
import { formatMessageClock } from './chatTime'

export function mapFirestoreMessagesToUi(
  messages: FirestoreChatMessage[],
  viewerUid: string,
): ChatMessage[] {
  if (messages.length === 0) return []

  const ui: ChatMessage[] = []
  let lastDayLabel = ''

  for (const message of messages) {
    const dayLabel = formatMessageClock(message.createdAt)
    const isToday = dayLabel.includes(':')
    const dateLabel = isToday ? 'Bugün' : dayLabel

    if (dateLabel !== lastDayLabel) {
      ui.push({ id: `date-${message.id}`, type: 'date', label: dateLabel })
      lastDayLabel = dateLabel
    }

    const isMe = message.senderUid === viewerUid
    ui.push({
      id: message.id,
      type: 'text',
      sender: isMe ? 'me' : 'them',
      text: message.text,
      time: isToday ? dayLabel : undefined,
      read: isMe ? message.readAt != null : undefined,
    })
  }

  return ui
}
