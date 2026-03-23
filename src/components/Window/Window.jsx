import { useState, useRef } from 'react'
import { Rnd } from 'react-rnd'
import { motion } from 'framer-motion'
import './Window.css'

function Window({
  title,
  icon,
  children,
  onClose,
  onMinimize,
  onFocus,
  zIndex,
  minimized,
  focused,
  defaultWidth  = 500,
  defaultHeight = 380,
  defaultX      = 120,
  defaultY      = 80,
}) {
  const TASKBAR_HEIGHT = 40

  const clampPos = (nextPos, nextSize = size) => {
    const maxX = Math.max(0, window.innerWidth - Number(nextSize.width))
    const maxY = Math.max(0, window.innerHeight - Number(nextSize.height))
    return {
      x: Math.min(Math.max(0, nextPos.x), maxX),
      y: Math.min(Math.max(0, nextPos.y), maxY),
    }
  }

  const [maximized, setMaximized] = useState(false)
  const [pos,  setPos]  = useState(() => ({
    x: Math.max(0, Math.round((window.innerWidth  - defaultWidth)  / 2)),
    y: Math.max(0, Math.round((window.innerHeight - 40 - defaultHeight) / 2)),
  }))
  const [size, setSize] = useState({ width: defaultWidth, height: defaultHeight })
  const [closing, setClosing] = useState(false)
  const saved    = useRef(null)
  const dragState = useRef(null)

  const handleMaximize = () => {
    if (!maximized) {
      saved.current = { pos: { ...pos }, size: { ...size } }
      setPos({ x: 0, y: 0 })
      setSize({ width: window.innerWidth, height: window.innerHeight - TASKBAR_HEIGHT })
      setMaximized(true)
      window.dispatchEvent(new CustomEvent('win7-window-maximize-changed', {
        detail: { title, maximized: true },
      }))
    } else {
      const restoredSize = saved.current?.size ?? size
      const restoredPos = saved.current?.pos ?? pos
      setSize(restoredSize)
      setPos(clampPos(restoredPos, restoredSize))
      setMaximized(false)
      window.dispatchEvent(new CustomEvent('win7-window-maximize-changed', {
        detail: { title, maximized: false },
      }))
    }
  }

  const handleTitleBarMouseDown = (e) => {
    if (!maximized) return
    if (e.target.closest('.title-bar-controls')) return
    e.preventDefault()

    dragState.current = { startX: e.clientX, startY: e.clientY, restored: false }

    const onMove = (me) => {
      const ds = dragState.current
      if (!ds) return

      if (!ds.restored) {
        if (Math.abs(me.clientX - ds.startX) < 5 && Math.abs(me.clientY - ds.startY) < 5) return

        const rw = saved.current?.size.width ?? 500
        const rh = saved.current?.size.height ?? 380
        const restoredPos = clampPos({
          x: me.clientX - Math.round(rw / 2),
          y: me.clientY - 12,
        }, { width: rw, height: rh })

        ds.restored = true
        ds.restoredSize = { width: rw, height: rh }
        ds.originX = restoredPos.x
        ds.originY = restoredPos.y
        ds.mouseOriginX = me.clientX
        ds.mouseOriginY = me.clientY

        setPos(restoredPos)
        setSize({ ...saved.current.size })
        setMaximized(false)
        return
      }

      setPos(clampPos({
        x: ds.originX + (me.clientX - ds.mouseOriginX),
        y: ds.originY + (me.clientY - ds.mouseOriginY),
      }, ds.restoredSize || size))
    }

    const onUp = () => {
      dragState.current = null
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup',   onUp)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup',   onUp)
  }

  const handleClose = () => {
    setClosing(true)
    setTimeout(() => onClose(), 150)
  }

  const hidden = minimized || closing

  return (
    <Rnd
      position={pos}
      size={size}
      onDragStop={(_, d) => setPos(clampPos({ x: d.x, y: d.y }))}
      onResizeStop={(_, __, ref, ___, position) => {
        const nextSize = { width: ref.offsetWidth, height: ref.offsetHeight }
        setSize(nextSize)
        setPos(clampPos(position, nextSize))
      }}
      minWidth={200}
      minHeight={140}
      bounds="parent"
      dragHandleClassName="title-bar"
      disableDragging={maximized}
      enableResizing={!maximized}
      style={{ zIndex, pointerEvents: hidden ? 'none' : undefined }}
      onMouseDown={onFocus}
      className="win7-rnd"
    >
      <motion.div
        animate={
          hidden
            ? { opacity: 0, scale: 0.88, y: 16, transition: { duration: 0.15, ease: [0.4, 0, 1, 1] } }
            : { opacity: 1, scale: 1,    y: 0,  transition: { duration: 0.2,  ease: [0.2, 0, 0.2, 1] } }
        }
        initial={{ opacity: 0, scale: 0.88, y: 16 }}
        style={{
          width: '100%',
          height: '100%',
          pointerEvents: hidden ? 'none' : 'auto',
          transformOrigin: 'bottom center',
        }}
      >
        <div className="win7 win7-window">
          <div className={`window${focused ? ' active' : ''}`}>

            {/* Title bar */}
            <div className="title-bar" onDoubleClick={handleMaximize} onMouseDown={handleTitleBarMouseDown}>
              <div className="title-bar-text">
                {icon && <img src={icon} alt="" className="win-title-icon" />}
                {title}
              </div>
              <div className="title-bar-controls">
                <button aria-label="Minimize" onClick={onMinimize} />
                <button
                  aria-label={maximized ? 'Restore' : 'Maximize'}
                  onClick={handleMaximize}
                />
                <button aria-label="Close" onClick={handleClose} />
              </div>
            </div>

            {/* Body */}
            <div className="window-body win7-body">
              {children}
            </div>

          </div>
        </div>
      </motion.div>
    </Rnd>
  )
}

export default Window
