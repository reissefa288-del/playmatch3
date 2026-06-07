import { useSyncExternalStore } from 'react'

function subscribe(onStoreChange: () => void) {
  document.addEventListener('visibilitychange', onStoreChange)
  return () => document.removeEventListener('visibilitychange', onStoreChange)
}

function getSnapshot() {
  return document.visibilityState === 'visible'
}

function getServerSnapshot() {
  return true
}

/** True when the document tab is visible — use to pause background timers. */
export function useDocumentVisible() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
