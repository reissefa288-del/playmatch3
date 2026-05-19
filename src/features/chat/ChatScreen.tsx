import { useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { AmbientParticles } from '../home/components/AmbientParticles'
import { Navbar } from '../home/components/Navbar'
import { chatThreads, onlineUsers, type ChatTabId } from './data'
import { ChatFilterTabs } from './components/ChatFilterTabs'
import { ChatHeader } from './components/ChatHeader'
import { ChatList } from './components/ChatList'
import { ChatSearch } from './components/ChatSearch'
import { OnlineUsersRow } from './components/OnlineUsersRow'
import chatReference from '../../reference/chat-final.png'

export function ChatScreen() {
  const [tab, setTab] = useState<ChatTabId>('all')

  const chatVars = {
    '--pm-chat-reference': `url(${chatReference})`,
  } as CSSProperties

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
        <main className="pm-chat" style={chatVars}>
          <Navbar />
          <ChatHeader />
          <ChatSearch />
          <OnlineUsersRow users={onlineUsers} portraitUrl={chatReference} />
          <ChatFilterTabs active={tab} onChange={setTab} />
          <ChatList threads={filteredThreads} portraitUrl={chatReference} />
        </main>
      </div>
    </div>
  )
}

