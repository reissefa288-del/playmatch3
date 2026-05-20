import { useMemo, useState } from 'react'
import { AmbientParticles } from '../home/components/AmbientParticles'
import { Navbar } from '../home/components/Navbar'
import { chatThreads, onlineUsers, type ChatTabId } from './data'
import { ChatFilterTabs } from './components/ChatFilterTabs'
import { ChatHeader } from './components/ChatHeader'
import { ChatList } from './components/ChatList'
import { ChatSearch } from './components/ChatSearch'
import { OnlineUsersRow } from './components/OnlineUsersRow'

export function ChatScreen() {
  const [tab, setTab] = useState<ChatTabId>('all')

  const filteredThreads = useMemo(() => {
    switch (tab) {
      case 'online':
        return chatThreads.filter((t) => t.isOnline)
      case 'groups':
        return chatThreads.filter((t) => t.isGroup)
      case 'invites':
        return chatThreads.filter((t) => t.id.includes('group') || t.lastMessage.includes('davet'))
      default:
        return chatThreads
    }
  }, [tab])

  return (
    <div className="pm-app-shell pm-app-shell--chat">
      <div className="pm-artboard">
        <AmbientParticles />
        <main className="pm-chat">
          <Navbar />
          <ChatHeader />
          <ChatSearch />
          <OnlineUsersRow users={onlineUsers} />
          <ChatFilterTabs active={tab} onChange={setTab} />
          <ChatList threads={filteredThreads} />
        </main>
      </div>
    </div>
  )
}

