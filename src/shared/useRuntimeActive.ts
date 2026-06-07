import { useTabActive } from '../navigation/TabActivityContext'
import type { TabId } from '../navigation/tabConfig'
import { useDocumentVisible } from './useDocumentVisible'

/** Document visible and the given tab is active — use to pause background timers. */
export function useRuntimeActive(tabId: TabId) {
  const documentVisible = useDocumentVisible()
  const tabActive = useTabActive(tabId)
  return documentVisible && tabActive
}
