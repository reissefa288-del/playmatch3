import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import type { ChatThread } from '../data'
import { ChatListItem } from './ChatListItem'

const ROW_HEIGHT = 88
const ROW_GAP = 12
const STRIDE = ROW_HEIGHT + ROW_GAP
const OVERSCAN = 3
const VIRTUALIZE_MIN = 8

type VirtualChatListProps = {
  threads: ChatThread[]
}

export function VirtualChatList({ threads }: VirtualChatListProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = useState(0)
  const [viewportHeight, setViewportHeight] = useState(0)

  const measure = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setViewportHeight(el.clientHeight)
  }, [])

  useLayoutEffect(() => {
    measure()
    const el = scrollRef.current
    if (!el) return
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [measure, threads.length])

  if (threads.length < VIRTUALIZE_MIN) {
    return (
      <section className="pm-chat-list" aria-label="Sohbet listesi">
        {threads.map((thread, index) => (
          <ChatListItem key={thread.id} thread={thread} index={index} />
        ))}
      </section>
    )
  }

  const totalHeight = threads.length * STRIDE - ROW_GAP
  const startIndex = Math.max(0, Math.floor(scrollTop / STRIDE) - OVERSCAN)
  const endIndex = Math.min(
    threads.length,
    Math.ceil((scrollTop + viewportHeight) / STRIDE) + OVERSCAN,
  )
  const visible = threads.slice(startIndex, endIndex)

  return (
    <section
      ref={scrollRef}
      className="pm-chat-list is-virtual"
      aria-label="Sohbet listesi"
      onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
    >
      <div className="pm-chat-list__window" style={{ height: totalHeight }}>
        {visible.map((thread, offset) => {
          const index = startIndex + offset
          return (
            <div
              key={thread.id}
              className="pm-chat-list__row"
              style={{ transform: `translateY(${index * STRIDE}px)` }}
            >
              <ChatListItem thread={thread} index={index} />
            </div>
          )
        })}
      </div>
    </section>
  )
}
