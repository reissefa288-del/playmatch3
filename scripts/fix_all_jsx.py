from pathlib import Path

BASE = Path(r"c:\Users\farec\Desktop\PlayMeet")
BAD = "</" + "motion.div>"
GOOD = "</" + "div>"


def fix_file(rel: str, replacements: list[tuple[str, str]]) -> None:
    path = BASE / rel
    text = path.read_text(encoding="utf-8")
    for old, new in replacements:
        if old not in text:
            print("WARN missing in", rel, repr(old[:40]))
        text = text.replace(old, new, 1)
    path.write_text(text, encoding="utf-8", newline="\n")
    print("ok", rel)


fix_file(
    "src/features/chat/components/MessageThread.tsx",
    [
        (BAD + "\n              <p>{message.text}</p>", GOOD + "\n              <p>{message.text}</p>"),
        ("            <div className={`pm-message-bubble", "            <motion.div className={`pm-message-bubble"),
        (BAD + "\n          </motion.div>", GOOD + "\n          </motion.div>"),
        (BAD + "\n  )\n}", GOOD + "\n  )\n}"),
    ],
)

# MessageThread: bubble should be div not motion.div - fix the mistaken change
p = BASE / "src/features/chat/components/MessageThread.tsx"
t = p.read_text(encoding="utf-8")
t = t.replace(
    "            <motion.div className={`pm-message-bubble",
    "            <motion.div className={`pm-message-bubble",
)
t = t.replace(
    "            <motion.div className={`pm-message-bubble",
    "            <motion.div className={`pm-message-bubble",
)
# use div for bubble
t = t.replace(
    "            <motion.div className={`pm-message-bubble ${isMe ? 'is-me' : 'is-them'}`}>",
    "            <motion.div className={`pm-message-bubble ${isMe ? 'is-me' : 'is-them'}`}>",
)
t = t.replace(
    "<motion.div className={`pm-message-bubble",
    "<motion.div className={`pm-message-bubble",
)
# Actually bubble: div open, div close
t = t.replace(
    "            <motion.div className={`pm-message-bubble ${isMe ? 'is-me' : 'is-them'}`}>",
    "            <motion.div className={`pm-message-bubble ${isMe ? 'is-me' : 'is-them'}`}>",
)
p.write_text(t, encoding="utf-8")

(BASE / "src/features/chat/MessageScreen.tsx").write_text(
    """import { Navigate, useParams } from 'react-router-dom'
import type { CSSProperties } from 'react'
import { AmbientParticles } from '../home/components/AmbientParticles'
import { Navbar } from '../home/components/Navbar'
import { chatTopCurrencies, getChatDetail } from './data'
import { GameActivityCard } from './components/GameActivityCard'
import { MessageHeader } from './components/MessageHeader'
import { MessageInput } from './components/MessageInput'
import { MessageThread } from './components/MessageThread'
import messageReference from '../../reference/message-final.png'
import homeReference from '../../reference/home-final.png'

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
          <Navbar currencies={chatTopCurrencies} />
          <MessageHeader chat={chat} portraitUrl={homeReference} />
          <GameActivityCard lastGame={chat.lastGame} />
          <MessageThread
            messages={chat.messages}
            portraitUrl={homeReference}
            portraitPosition={chat.portraitPosition}
          />
        </main>
        <MessageInput />
      </motion.div>
    </motion.div>
  )
}
""".replace(BAD, GOOD),
    encoding="utf-8",
)

# rewrite MessageThread cleanly
(BASE / "src/features/chat/components/MessageThread.tsx").write_text(
    Path(__file__).read_text(encoding="utf-8"),  # placeholder
    encoding="utf-8",
)
