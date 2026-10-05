import { useMemo, useSyncExternalStore, type ReactNode } from 'react'
import { formatGemBalance } from '../../shared/formatGemBalance'
import {
  addGems,
  getGemBalanceSnapshot,
  spendGems,
  subscribeGemBalance,
} from './gemBalanceStore'

export function GemBalanceProvider({ children }: { children: ReactNode }) {
  return children
}

export function useGemBalanceState() {
  const balance = useSyncExternalStore(
    subscribeGemBalance,
    getGemBalanceSnapshot,
    getGemBalanceSnapshot,
  )
  return useMemo(() => ({ balance }), [balance])
}

export function useGemBalanceActions() {
  return useMemo(
    () => ({
      add: addGems,
      spend: spendGems,
    }),
    [],
  )
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
