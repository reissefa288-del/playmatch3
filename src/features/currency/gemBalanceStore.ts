const STORAGE_KEY = 'pm-gem-balance'
const INITIAL = 0

const listeners = new Set<() => void>()

function readStored(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return INITIAL
    const n = Number(raw)
    return Number.isFinite(n) ? n : INITIAL
  } catch {
    return INITIAL
  }
}

function persist(next: number) {
  try {
    localStorage.setItem(STORAGE_KEY, String(next))
  } catch {
    /* ignore */
  }
}

let balance = readStored()

function emit() {
  listeners.forEach((listener) => listener())
}

export function subscribeGemBalance(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getGemBalanceSnapshot() {
  return balance
}

export function setGemBalance(next: number) {
  balance = Math.max(0, Math.floor(next))
  persist(balance)
  emit()
}

export function addGems(amount: number) {
  if (amount <= 0) return
  balance += amount
  persist(balance)
  emit()
}

export function spendGems(amount: number) {
  if (amount <= 0) return true
  if (balance < amount) return false
  balance -= amount
  persist(balance)
  emit()
  return true
}
