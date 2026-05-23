import { AmbientParticles } from '../home/components/AmbientParticles'
import { Navbar } from '../home/components/Navbar'
import { chatThreads, onlineUsers } from './data'
import { ChatHeader } from './components/ChatHeader'
import { ChatList } from './components/ChatList'
import { ChatSearch } from './components/ChatSearch'
import { OnlineUsersRow } from './components/OnlineUsersRow'

export function ChatScreen() {
  return (
    <div className="pm-app-shell pm-app-shell--chat">
      <div className="pm-artboard">
        <AmbientParticles />
        <main className="pm-chat">
          <Navbar />
          <ChatHeader />
          <ChatSearch />
          <OnlineUsersRow users={onlineUsers} />
          <ChatList threads={chatThreads} />
        </main>
      </div>
    </div>
  )
}

