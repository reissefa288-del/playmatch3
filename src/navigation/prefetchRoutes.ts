import type { TabId } from './tabConfig'

/** Kept for API compatibility — tabs are eager in app-shell. */
export function prefetchTabRoutes(_activeTab: TabId) {}

export function prefetchAllTabRoutes() {}
