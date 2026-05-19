import type { ChatThread } from '../data'
import { ChatListItem } from './ChatListItem'

type ChatListProps = {
  threads: ChatThread[]
  portraitUrl: string
}

export function ChatList({ threads, portraitUrl }: ChatListProps) {
  return (
    <section className="pm-chat-list" aria-label="Sohbet listesi">
      {threads.map((thread, index) => (
        <ChatListItem key={thread.id} thread={thread} portraitUrl={portraitUrl} index={index} />
      ))}
    </section>
  )
}
