import { useState, useRef, useEffect, useCallback } from 'react'
import './DesktopSelection.css'

function DesktopSelection({ containerRef, onRectChange, onSelectionEnd }) {
  const [rect, setRect] = useState(null)
  const origin = useRef(null)
  const rectRef = useRef(null)

  const updateRect = useCallback((next) => {
    rectRef.current = next
    setRect(next)
    onRectChange?.(next)
  }, [onRectChange])

  useEffect(() => {
    const el = containerRef?.current
    if (!el) return

    const onMouseDown = (e) => {
      if (e.button !== 0) return
      const target = e.target
      if (!(target instanceof Element)) return
      if (!el.contains(target)) return

      // Ignore interactive UI layers; allow empty desktop area (including #desktop-icons background)
      if (target.closest('.desktop-icon, .win7-rnd, .window, .title-bar, .react-resizable-handle, #taskbar, #start-menu-wrap')) return

      const next = { left: e.clientX, top: e.clientY, width: 0, height: 0 }
      origin.current = { x: e.clientX, y: e.clientY }
      updateRect(next)
    }

    const onMouseMove = (e) => {
      if (!origin.current) return
      const { x: ox, y: oy } = origin.current
      const next = {
        left:   Math.min(ox, e.clientX),
        top:    Math.min(oy, e.clientY),
        width:  Math.abs(e.clientX - ox),
        height: Math.abs(e.clientY - oy),
      }
      updateRect(next)
    }

    const onMouseUp = () => {
      if (!origin.current) return
      const prev = rectRef.current
      const hadSelectionDrag = !!prev && (prev.width >= 3 || prev.height >= 3)
      origin.current = null
      updateRect(null)
      if (hadSelectionDrag) onSelectionEnd?.()
    }

    el.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)

    return () => {
      el.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [containerRef, onSelectionEnd, updateRect])

  if (!rect || (rect.width < 3 && rect.height < 3)) return null

  return (
    <div
      className="desktop-selection"
      style={{
        left:   rect.left,
        top:    rect.top,
        width:  rect.width,
        height: rect.height,
      }}
    />
  )
}

export default DesktopSelection
