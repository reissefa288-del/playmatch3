import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  getLevelSnapshot,
  loadStoredTotalXp,
  saveTotalXp,
  type LevelSnapshot,
} from './profileLevel'

type ProfileLevelContextValue = LevelSnapshot & {
  addXp: (amount: number) => void
  lastGain: number | null
}

const ProfileLevelContext = createContext<ProfileLevelContextValue | null>(null)

export function ProfileLevelProvider({ children }: { children: ReactNode }) {
  const [totalXp, setTotalXp] = useState(loadStoredTotalXp)
  const [lastGain, setLastGain] = useState<number | null>(null)

  const snapshot = useMemo(() => getLevelSnapshot(totalXp), [totalXp])

  const addXp = useCallback((amount: number) => {
    if (amount <= 0) return
    setTotalXp((prev) => {
      const next = prev + amount
      saveTotalXp(next)
      return next
    })
    setLastGain(amount)
    window.setTimeout(() => setLastGain(null), 2200)
  }, [])

  const value = useMemo(
    () => ({
      ...snapshot,
      addXp,
      lastGain,
    }),
    [snapshot, addXp, lastGain],
  )

  return <ProfileLevelContext.Provider value={value}>{children}</ProfileLevelContext.Provider>
}

export function useProfileLevel() {
  const ctx = useContext(ProfileLevelContext)
  if (!ctx) {
    throw new Error('useProfileLevel must be used within ProfileLevelProvider')
  }
  return ctx
}
