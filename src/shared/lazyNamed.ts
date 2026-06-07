import { lazy, type ComponentType, type LazyExoticComponent } from 'react'

export function lazyNamed<M extends Record<string, ComponentType<unknown>>, K extends keyof M & string>(
  factory: () => Promise<M>,
  exportName: K,
): LazyExoticComponent<M[K]> {
  return lazy(() => factory().then((module) => ({ default: module[exportName] })))
}
