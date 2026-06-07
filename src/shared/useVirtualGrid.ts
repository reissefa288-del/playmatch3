import { useEffect, useState, type RefObject } from 'react'

type VirtualGridOptions = {
  itemCount: number
  columns: number
  rowHeight: number
  overscan?: number
  rootRef: RefObject<HTMLElement | null>
}

function findScrollParent(node: HTMLElement | null): HTMLElement | Window {
  let el = node?.parentElement ?? null
  while (el) {
    const { overflowY } = getComputedStyle(el)
    if (overflowY === 'auto' || overflowY === 'scroll') return el
    el = el.parentElement
  }
  return window
}

export function useVirtualGrid({
  itemCount,
  columns,
  rowHeight,
  overscan = 2,
  rootRef,
}: VirtualGridOptions) {
  const rowCount = Math.max(1, Math.ceil(itemCount / columns))
  const totalHeight = rowCount * rowHeight
  const [visibleRows, setVisibleRows] = useState({ start: 0, end: Math.min(rowCount, 8) })

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const scrollTarget = findScrollParent(root)

    const measure = () => {
      const rect = root.getBoundingClientRect()
      const viewportHeight =
        scrollTarget === window ? window.innerHeight : (scrollTarget as HTMLElement).clientHeight

      let scrollOffset = 0
      if (scrollTarget === window) {
        scrollOffset = Math.max(0, -rect.top)
      } else {
        const parentRect = (scrollTarget as HTMLElement).getBoundingClientRect()
        scrollOffset = Math.max(0, parentRect.top - rect.top)
      }

      const visibleHeight = Math.min(rect.height, viewportHeight - Math.max(0, rect.top))
      const startRow = Math.max(0, Math.floor(scrollOffset / rowHeight) - overscan)
      const endRow = Math.min(
        rowCount,
        Math.ceil((scrollOffset + visibleHeight) / rowHeight) + overscan,
      )

      setVisibleRows((prev) =>
        prev.start === startRow && prev.end === endRow ? prev : { start: startRow, end: endRow },
      )
    }

    measure()
    scrollTarget.addEventListener('scroll', measure, { passive: true })
    window.addEventListener('resize', measure)
    return () => {
      scrollTarget.removeEventListener('scroll', measure)
      window.removeEventListener('resize', measure)
    }
  }, [itemCount, overscan, rootRef, rowCount, rowHeight])

  return { rowCount, totalHeight, visibleRows, columns }
}
