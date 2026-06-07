import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  getLevelSnapshot,
  loadStoredTotalXp,
  saveTotalXp,
  type LevelSnapshot,
} from './profileLevel'

type ProfileLevelState = LevelSnapshot & {
  lastGain: number | null
}

type ProfileLevelActions = {
  addXp: (amount: number) => void
}

const ProfileLevelStateContext = createContext<ProfileLevelState | null>(null)
const ProfileLevelActionsContext = createContext<ProfileLevelActions | null>(null)

export function ProfileLevelProvider({ children }: { children: ReactNode }) {
  const [totalXp, setTotalXp] = useState(loadStoredTotalXp)
  const [lastGain, setLastGain] = useState<number | null>(null)
  const gainTimerRef = useRef<number | null>(null)

  const snapshot = useMemo(() => getLevelSnapshot(totalXp), [totalXp])

  const addXp = useCallback((amount: number) => {
    if (amount <= 0) return
    setTotalXp((prev) => {
      const next = prev + amount
      saveTotalXp(next)
      return next
    })
    setLastGain(amount)
    if (gainTimerRef.current != null) {
      window.clearTimeout(gainTimerRef.current)
    }
    gainTimerRef.current = window.setTimeout(() => {
      gainTimerRef.current = null
      setLastGain(null)
    }, 2200)
  }, [])

  useEffect(
    () => () => {
      if (gainTimerRef.current != null) {
        window.clearTimeout(gainTimerRef.current)
      }
    },
    [],
  )

  const stateValue = useMemo(
    () => ({
      ...snapshot,
      lastGain,
    }),
    [snapshot, lastGain],
  )

  const actionsValue = useMemo(() => ({ addXp }), [addXp])

  return (
    <ProfileLevelActionsContext.Provider value={actionsValue}>
      <ProfileLevelStateContext.Provider value={stateValue}>{children}</ProfileLevelStateContext.Provider>
    </ProfileLevelActionsContext.Provider>
  )
}

export function useProfileLevelState() {
  const ctx = useContext(ProfileLevelStateContext)
  if (!ctx) {
    throw new Error('useProfileLevelState must be used within ProfileLevelProvider')
  }
  return ctx
}

export function useProfileLevelActions() {
  const ctx = useContext(ProfileLevelActionsContext)
  if (!ctx) {
    throw new Error('useProfileLevelActions must be used within ProfileLevelProvider')
  }
  return ctx
}

export function useProfileLevel() {
  const state = useProfileLevelState()
  const { addXp } = useProfileLevelActions()
  return { ...state, addXp }
}
