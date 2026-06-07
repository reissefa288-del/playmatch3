import { useCallback, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { AmbientParticles } from '../home/components/AmbientParticles'
import { Navbar } from '../home/components/Navbar'
import { chatThreads } from './data'
import { ChatHeader } from './components/ChatHeader'
import { ChatList } from './components/ChatList'
import { ChatSearch } from './components/ChatSearch'
import { NewChatSheet } from './components/NewChatSheet'
import { OnlineUsersRow } from './components/OnlineUsersRow'

function normalizeQuery(value: string) {
  return value.trim().toLocaleLowerCase('tr-TR')
}

function filterThreads(query: string) {
  const normalized = normalizeQuery(query)
  if (!normalized) return chatThreads

  return chatThreads.filter(
    (thread) =>
      thread.name.toLocaleLowerCase('tr-TR').includes(normalized) ||
      thread.lastMessage.toLocaleLowerCase('tr-TR').includes(normalized),
  )
}

export function ChatScreen() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [newChatOpen, setNewChatOpen] = useState(false)

  const filteredThreads = useMemo(() => filterThreads(searchQuery), [searchQuery])

  const onlineUsers = useMemo(
    () =>
      chatThreads
        .filter((thread) => thread.isOnline && thread.portraitPosition)
        .slice(0, 4)
        .map((thread) => ({
          id: thread.id,
          name: thread.name,
          portraitPosition: thread.portraitPosition!,
          ring: thread.id === 'zeynep' || thread.id === 'damla' ? ('pink' as const) : ('cyan' as const),
        })),
    [],
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
              <p className="pm-chat-list__empty">Aramanla eşleşen sohbet bulunamadı</p>
            )}
          </main>
        </div>
      </div>
      {newChatPortal}
    </>
  )
}
