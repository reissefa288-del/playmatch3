import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { formatGemBalance } from '../../shared/formatGemBalance'

const STORAGE_KEY = 'pm-gem-balance'
const INITIAL = 100

type GemBalanceState = {
  balance: number
}

type GemBalanceActions = {
  add: (amount: number) => void
  spend: (amount: number) => boolean
}

const GemBalanceStateContext = createContext<GemBalanceState | null>(null)
const GemBalanceActionsContext = createContext<GemBalanceActions | null>(null)

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

  const stateValue = useMemo(() => ({ balance }), [balance])
  const actionsValue = useMemo(() => ({ add, spend }), [add, spend])

  return (
    <GemBalanceActionsContext.Provider value={actionsValue}>
      <GemBalanceStateContext.Provider value={stateValue}>{children}</GemBalanceStateContext.Provider>
    </GemBalanceActionsContext.Provider>
  )
}

export function useGemBalanceState() {
  const ctx = useContext(GemBalanceStateContext)
  if (!ctx) throw new Error('useGemBalanceState must be used within GemBalanceProvider')
  return ctx
}

export function useGemBalanceActions() {
  const ctx = useContext(GemBalanceActionsContext)
  if (!ctx) throw new Error('useGemBalanceActions must be used within GemBalanceProvider')
  return ctx
}

/** @deprecated Prefer useGemBalanceState / useGemBalanceActions for fewer rerenders. */
export function useGemBalance() {
  const { balance } = useGemBalanceState()
  const { add, spend } = useGemBalanceActions()
  return {
    balance,
    formatBalance: formatGemBalance,
    add,
    spend,
  }
}

export { formatGemBalance as formatBalance }
