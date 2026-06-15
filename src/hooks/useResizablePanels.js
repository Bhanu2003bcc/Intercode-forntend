import { useCallback, useRef, useState } from 'react'

/**
 * A hook to handle panel resizing via a draggable divider.
 * Returns widths in percentage and a ref/handler for drag events.
 */
export function useResizablePanels(initialSizes = [30, 45, 25]) {
  const [sizes, setSizes] = useState(initialSizes)
  const dragging = useRef(null)
  const containerRef = useRef(null)

  const startDrag = useCallback((handleIndex, e) => {
    e.preventDefault()
    dragging.current = { handleIndex, startX: e.clientX, startSizes: [...sizes] }

    const onMove = (moveEvent) => {
      if (!dragging.current || !containerRef.current) return
      const containerWidth = containerRef.current.getBoundingClientRect().width
      const delta = ((moveEvent.clientX - dragging.current.startX) / containerWidth) * 100
      const { handleIndex: hi, startSizes } = dragging.current

      const newSizes = [...startSizes]
      const minSize = 10 // minimum panel size in %
      newSizes[hi] = Math.max(minSize, startSizes[hi] + delta)
      newSizes[hi + 1] = Math.max(minSize, startSizes[hi + 1] - delta)

      // Clamp to ensure total stays at 100
      const total = newSizes.reduce((a, b) => a + b, 0)
      const diff = total - 100
      newSizes[hi + 1] = Math.max(minSize, newSizes[hi + 1] - diff)

      setSizes([...newSizes])
    }

    const onUp = () => {
      dragging.current = null
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }, [sizes])

  return { sizes, setSizes, containerRef, startDrag }
}
