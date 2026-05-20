import type { ChatThread } from '../data'
import { ChatListItem } from './ChatListItem'

type ChatListProps = {
  threads: ChatThread[]
}

export function ChatList({ threads }: ChatListProps) {
  return (
    <section className="pm-chat-list" aria-label="Sohbet listesi">
      {threads.map((thread, index) => (
        <ChatListItem key={thread.id} thread={thread} index={index} />
      ))}
    </section>
  )
}
