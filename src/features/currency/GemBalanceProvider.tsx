import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

const STORAGE_KEY = 'pm-gem-balance'
const INITIAL = 100

type GemBalanceContextValue = {
  balance: number
  formatBalance: (value?: number) => string
  add: (amount: number) => void
  spend: (amount: number) => boolean
}

const GemBalanceContext = createContext<GemBalanceContextValue | null>(null)

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

export function GemBalanceProvider({ children }: { children: ReactNode }) {
  const [balance, setBalance] = useState(readStored)

  const persist = useCallback((next: number) => {
    try {
      localStorage.setItem(STORAGE_KEY, String(next))
    } catch {
      /* ignore */
    }
  }, [])

  const formatBalance = useCallback((value = balance) => {
    return value.toLocaleString('tr-TR')
  }, [balance])

  const add = useCallback(
    (amount: number) => {
      if (amount <= 0) return
      setBalance((prev) => {
        const next = prev + amount
        persist(next)
        return next
      })
    },
    [persist],
  )

  const spend = useCallback(
    (amount: number) => {
      if (amount <= 0) return true
      let success = false
      setBalance((prev) => {
        if (prev < amount) return prev
        success = true
        const next = prev - amount
        persist(next)
        return next
      })
      return success
    },
    [persist],
  )

  const value = useMemo(
    () => ({ balance, formatBalance, add, spend }),
    [balance, formatBalance, add, spend],
  )

  return <GemBalanceContext.Provider value={value}>{children}</GemBalanceContext.Provider>
}

export function useGemBalance() {
  const ctx = useContext(GemBalanceContext)
  if (!ctx) throw new Error('useGemBalance must be used within GemBalanceProvider')
  return ctx
}
