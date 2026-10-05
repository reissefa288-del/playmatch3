import type { IconType } from 'react-icons'
import { FiUsers } from 'react-icons/fi'
import { LuGamepad2 } from 'react-icons/lu'

export type ChatTabId = 'all' | 'online' | 'groups' | 'invites'

export type OnlineUser = {
  id: string
  name: string
  portraitPosition: string
  ring: 'pink' | 'cyan'
  portraitSrc?: string
}

export type ChatThread = {
  id: string
  matchId: string
  name: string
  lastMessage: string
  time: string
  unread?: number
  isOnline?: boolean
  lastSeen?: string
  verified?: boolean
  isGroup?: boolean
  groupEmoji?: string
  highlighted?: boolean
  portraitPosition?: string
  portraitSrc?: string
}

export type ChatMessage =
  | {
      id: string
      type: 'text'
      sender: 'me' | 'them'
      text: string
      time?: string
      read?: boolean
    }
  | {
      id: string
      type: 'invite'
      sender: 'them' | 'me'
      gameTitle: string
      gameEmoji: string
    }
  | { id: string; type: 'date'; label: string }

export type ChatDetail = {
  id: string
  matchId: string
  name: string
  verified?: boolean
  isOnline?: boolean
  portraitSrc: string
  portraitPosition: string
  lastGame: {
    title: string
    emoji: string
    playedAgo: string
  }
  messages: ChatMessage[]
}

export const chatTabs: { id: ChatTabId; label: string; badge?: number; icon?: IconType }[] = [
  { id: 'all', label: 'Tümü' },
  { id: 'online', label: 'Çevrimiçi' },
  { id: 'groups', label: 'Grup Sohbetleri', icon: FiUsers },
  { id: 'invites', label: 'Oyuncu Davetleri', icon: LuGamepad2 },
]
