import { useState, useRef, useEffect } from 'react'
import './DesktopSelection.css'

function DesktopSelection({ containerRef }) {
  const [rect, setRect] = useState(null)
  const origin = useRef(null)

  useEffect(() => {
    const el = containerRef?.current
    if (!el) return

    const onMouseDown = (e) => {
      // Only fire on bare desktop background (not on icons, windows, taskbar, etc.)
      if (e.target !== el) return
      if (e.button !== 0) return
      origin.current = { x: e.clientX, y: e.clientY }
      setRect(null)
    }

    const onMouseMove = (e) => {
      if (!origin.current) return
      const { x: ox, y: oy } = origin.current
      setRect({
        left:   Math.min(ox, e.clientX),
        top:    Math.min(oy, e.clientY),
        width:  Math.abs(e.clientX - ox),
        height: Math.abs(e.clientY - oy),
      })
    }

    const onMouseUp = () => {
      if (!origin.current) return
      origin.current = null
      setRect(null)
    }

    el.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)

    return () => {
      el.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [containerRef])

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
