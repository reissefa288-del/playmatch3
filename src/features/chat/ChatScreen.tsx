import '../../styles/chat-bundle.css'
import { useCallback, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { AmbientParticles } from '../home/components/AmbientParticles'
import { Navbar } from '../home/components/Navbar'
import type { ChatThread } from './data'
import { useChatThreads } from './useChatThreads'
import { ChatHeader } from './components/ChatHeader'
import { ChatList } from './components/ChatList'
import { ChatSearch } from './components/ChatSearch'
import { NewChatSheet } from './components/NewChatSheet'
import { OnlineUsersRow } from './components/OnlineUsersRow'

function normalizeQuery(value: string) {
  return value.trim().toLocaleLowerCase('tr-TR')
}

function filterThreads(threads: ChatThread[], query: string) {
  const normalized = normalizeQuery(query)
  if (!normalized) return threads

  return threads.filter(
    (thread) =>
      thread.name.toLocaleLowerCase('tr-TR').includes(normalized) ||
      thread.lastMessage.toLocaleLowerCase('tr-TR').includes(normalized),
  )
}

export function ChatScreen() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [newChatOpen, setNewChatOpen] = useState(false)
  const { threads } = useChatThreads()

  const filteredThreads = useMemo(
    () => filterThreads(threads, searchQuery),
    [threads, searchQuery],
  )

  const onlineUsers = useMemo(
    () =>
      threads
        .filter((thread) => thread.isOnline && thread.portraitPosition)
        .slice(0, 4)
        .map((thread, index) => ({
          id: thread.id,
          name: thread.name,
          portraitPosition: thread.portraitPosition!,
          portraitSrc: thread.portraitSrc,
          ring: index % 2 === 0 ? ('pink' as const) : ('cyan' as const),
        })),
    [threads],
  )

  const openNewChat = useCallback(() => {
    setNewChatOpen(true)
  }, [])

  const closeNewChat = useCallback(() => {
    setNewChatOpen(false)
  }, [])

  const openChat = useCallback(
    (chatId: string) => {
      navigate(`/chat/${chatId}`)
    },
    [navigate],
  )

  const newChatPortal =
    typeof document !== 'undefined'
      ? createPortal(<NewChatSheet open={newChatOpen} onClose={closeNewChat} />, document.body)
      : null

  return (
    <>
      <div className="pm-app-shell pm-app-shell--chat">
        <div className="pm-artboard">
          <AmbientParticles />
          <main className="pm-chat">
            <Navbar />
            <ChatHeader />
            <ChatSearch value={searchQuery} onChange={setSearchQuery} />
            <OnlineUsersRow users={onlineUsers} onNewChat={openNewChat} onUserClick={openChat} />
            {filteredThreads.length > 0 ? (
              <ChatList threads={filteredThreads} />
            ) : (
              <p className="pm-chat-list__empty">
                {searchQuery.trim()
                  ? 'Aramanla eşleşen sohbet bulunamadı'
                  : 'Henüz sohbet yok. Eşleştiğin kişilerle konuşmaya başla.'}
              </p>
            )}
          </main>
        </div>
      </div>
      {newChatPortal}
    </>
  )
}
