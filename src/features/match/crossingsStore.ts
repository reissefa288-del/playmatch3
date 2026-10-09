import { useSyncExternalStore } from 'react'
import type { MatchProfile } from './data'

export type Crossing = {
  profile: MatchProfile
  count: number
  lastAt: number
  liked: boolean
}

const STORAGE_KEY = 'pm-crossings'
const REPEAT_GAP_MS = 45_000

type Stored = {
  day: string
  people: Crossing[]
}

let day = ''
let people: Crossing[] = []
const listeners = new Set<() => void>()

function todayKey() {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const date = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${date}`
}

function isCrossing(value: unknown): value is Crossing {
  if (!value || typeof value !== 'object') return false
  const row = value as Crossing
  return Boolean(row.profile && typeof row.profile.id === 'string')
}

function readStored(): Stored {
  const today = todayKey()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { day: today, people: [] }
    const parsed = JSON.parse(raw) as Stored
    if (parsed.day !== today || !Array.isArray(parsed.people)) {
      return { day: today, people: [] }
    }
    const valid = parsed.people.filter(isCrossing).slice(0, 1)
    return { day: today, people: valid }
  } catch {
    return { day: today, people: [] }
  }
}

function emit() {
  listeners.forEach((listener) => listener())
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ day, people }))
  emit()
}

const loaded = readStored()
day = loaded.day
people = loaded.people

export function refreshCrossingsDay() {
  const today = todayKey()
  if (day === today) return
  day = today
  people = []
  persist()
}

export function noteCrossing(profile: MatchProfile) {
  refreshCrossingsDay()
  const now = Date.now()
  const current = people[0]
  if (current?.profile.id === profile.id) {
    if (now - current.lastAt < REPEAT_GAP_MS) return
    people = [{ ...current, profile, count: current.count + 1, lastAt: now }]
    persist()
    return
  }
  people = [{ profile, count: 1, lastAt: now, liked: false }]
  persist()
}

export function markCrossingLiked(id: string) {
  const current = people[0]
  if (!current || current.profile.id !== id || current.liked) return
  people = [{ ...current, liked: true }]
  persist()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function snapshot() {
  return people
}

const EMPTY: Crossing[] = []

export function useCrossings(): Crossing[] {
  return useSyncExternalStore(subscribe, snapshot, () => EMPTY)
}
