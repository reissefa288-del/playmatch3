import { Navigate, useParams } from 'react-router-dom'
import type { CSSProperties } from 'react'
import { AmbientParticles } from '../home/components/AmbientParticles'
import { Navbar } from '../home/components/Navbar'
import { getChatDetail } from './data'
import { GameActivityCard } from './components/GameActivityCard'
import { MessageHeader } from './components/MessageHeader'
import { MessageInput } from './components/MessageInput'
import { MessageThread } from './components/MessageThread'
import messageReference from '../../reference/message-final.png'
import chatReference from '../../reference/chat-final.png'

export function MessageScreen() {
  const { chatId } = useParams<{ chatId: string }>()
  const chat = chatId ? getChatDetail(chatId) : null

  if (!chat) {
    return <Navigate to="/chat" replace />
  }

  const messageVars = {
    '--pm-message-reference': `url(${messageReference})`,
  } as CSSProperties

  return (
    <div className="pm-app-shell pm-app-shell--message">
      <div className="pm-artboard">
        <AmbientParticles />
        <main className="pm-message" style={messageVars}>
          <Navbar />
          <MessageHeader chat={chat} portraitUrl={chatReference} />
          <GameActivityCard lastGame={chat.lastGame} />
          <MessageThread
            messages={chat.messages}
            portraitUrl={chatReference}
            portraitPosition={chat.portraitPosition}
          />
        </main>
        <MessageInput />
      </div>
    </div>
  )
}
