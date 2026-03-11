import { useState, useRef } from 'react'
import { Rnd } from 'react-rnd'
import { motion, AnimatePresence } from 'framer-motion'
import './Window.css'

const ANIM = {
  initial:  { opacity: 0, scale: 0.85, y: 20 },
  animate:  { opacity: 1, scale: 1,    y: 0,  transition: { duration: 0.18, ease: [0.2, 0, 0.2, 1] } },
  exit:     { opacity: 0, scale: 0.85, y: 20, transition: { duration: 0.14, ease: [0.4, 0, 1, 1]   } },
}

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
  const [maximized, setMaximized] = useState(false)
  const [pos,  setPos]  = useState({ x: defaultX, y: defaultY })
  const [size, setSize] = useState({ width: defaultWidth, height: defaultHeight })
  const saved = useRef(null)

  const handleMaximize = () => {
    if (!maximized) {
      saved.current = { pos: { ...pos }, size: { ...size } }
      setPos({ x: 0, y: 0 })
      setSize({ width: window.innerWidth, height: window.innerHeight - 40 })
      setMaximized(true)
    } else {
      setPos(saved.current.pos)
      setSize(saved.current.size)
      setMaximized(false)
    }
  }

  return (
    <AnimatePresence>
      {!minimized && (
        <Rnd
          position={pos}
          size={size}
          onDragStop={(_, d) => setPos({ x: d.x, y: d.y })}
          onResizeStop={(_, __, ref, ___, position) => {
            setSize({ width: ref.offsetWidth, height: ref.offsetHeight })
            setPos(position)
          }}
          minWidth={200}
          minHeight={140}
          bounds="parent"
          dragHandleClassName="title-bar"
          disableDragging={maximized}
          enableResizing={!maximized}
          style={{ zIndex }}
          onMouseDown={onFocus}
          className="win7-rnd"
          // forward motion props via the Rnd wrapper element
          as={motion.div}
          {...ANIM}
        >
          <div className="win7 win7-window">
            <div className={`window${focused ? ' active' : ''}`}>

              {/* Title bar */}
              <div className="title-bar" onDoubleClick={handleMaximize}>
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
                  <button aria-label="Close" onClick={onClose} />
                </div>
              </div>

              {/* Body */}
              <div className="window-body win7-body">
                {children}
              </div>

            </div>
          </div>
        </Rnd>
      )}
    </AnimatePresence>
  )
}

export default Window
