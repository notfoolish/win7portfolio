import { useState, useCallback, useEffect, useRef } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import './DesktopIcons.css'

const CELL_W = 80   // grid cell width
const CELL_H = 90   // grid cell height
const PADDING = 10  // desktop edge padding
const TASKBAR_H = 40

const ICONS_DEF = [
    { id: 'recycle',  label: 'Recycle Bin',   icon: '/win7icons/Shell32.dll/imageres_55.ico', appId: 'recycle' },
    { id: 'computer', label: 'Computer',     icon: '/win7icons/Shell32.dll/shell32_16.ico', appId: 'computer' },
    { id: 'ie',       label: 'Internet Explorer', icon: '/win7icons/Internet Explorer/iexplore_32528.ico', appId: 'ie' },
]

/* clamp to grid so the full icon stays on screen */
function snapToGrid(x, y, maxCols, maxRows) {
  let col = Math.round(x / CELL_W)
  let row = Math.round(y / CELL_H)
  col = Math.max(0, Math.min(col, maxCols - 1))
  row = Math.max(0, Math.min(row, maxRows - 1))
  return { col, row }
}

/* ─── Single draggable icon ─── */
function DeskIcon({ icon, selected, onSelect, onOpen }) {
  const [{ isDragging }, dragRef] = useDrag({
    type: 'DESKTOP_ICON',
    item: { id: icon.id },
    collect: m => ({ isDragging: m.isDragging() }),
  })

  const cls = `desktop-icon${selected ? ' selected' : ''}${isDragging ? ' dragging' : ''}`

  return (
    <div
      ref={dragRef}
      className={cls}
      onClick={e => { e.stopPropagation(); onSelect(icon.id) }}
      onDoubleClick={() => onOpen(icon)}
    >
      <div className="desktop-icon-img-wrap">
        <img src={icon.icon} alt={icon.label} className="desktop-icon-img" />
      </div>
      <span className="desktop-icon-label">{icon.label}</span>
    </div>
  )
}

/* ─── Desktop drop surface ─── */
function DesktopIcons({ onAppOpen, selectionRect, suppressNextClear, onConsumeSuppressClear }) {
  const [selectedIds, setSelectedIds] = useState([])
  const [positions, setPositions] = useState(() => {
    const map = {}
    ICONS_DEF.forEach((ic, i) => { map[ic.id] = { col: 0, row: i } })
    return map
  })
  const containerRef = useRef(null)
  const [gridSize, setGridSize] = useState({ cols: 1, rows: 1 })

  useEffect(() => {
    if (!selectionRect || selectionRect.width < 3 || selectionRect.height < 3) return
    const host = containerRef.current
    if (!host) return

    const hostRect = host.getBoundingClientRect()
    const sel = {
      left: selectionRect.left,
      top: selectionRect.top,
      right: selectionRect.left + selectionRect.width,
      bottom: selectionRect.top + selectionRect.height,
    }

    const hits = ICONS_DEF
      .filter(icon => {
        const pos = positions[icon.id]
        const left = hostRect.left + PADDING + pos.col * CELL_W
        const top = hostRect.top + PADDING + pos.row * CELL_H
        const right = left + CELL_W
        const bottom = top + CELL_H
        return !(right < sel.left || left > sel.right || bottom < sel.top || top > sel.bottom)
      })
      .map(icon => icon.id)

    setSelectedIds(hits)
  }, [selectionRect, positions])

  /* recalc available grid on resize */
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth  - PADDING * 2
      const h = window.innerHeight - PADDING * 2 - TASKBAR_H
      setGridSize({
        cols: Math.max(1, Math.floor(w / CELL_W)),
        rows: Math.max(1, Math.floor(h / CELL_H)),
      })
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const moveIcon = useCallback((id, col, row) => {
    setPositions(prev => ({ ...prev, [id]: { col, row } }))
  }, [])

  const [, dropRef] = useDrop({
    accept: 'DESKTOP_ICON',
    drop: (item, monitor) => {
      const delta = monitor.getDifferenceFromInitialOffset()
      if (!delta) return
      const prev = positions[item.id]
      const rawX = prev.col * CELL_W + delta.x
      const rawY = prev.row * CELL_H + delta.y
      const { col, row } = snapToGrid(rawX, rawY, gridSize.cols, gridSize.rows)
      // prevent stacking — check if another icon already occupies this cell
      const occupied = Object.entries(positions).some(
        ([id, p]) => id !== item.id && p.col === col && p.row === row
      )
      if (occupied) return  // cancel drop, icon stays where it was
      moveIcon(item.id, col, row)
    },
  })

  const handleOpen = (icon) => {
    if (icon.appId && onAppOpen) onAppOpen(icon.appId)
  }

  return (
    <div
      id="desktop-icons"
      ref={node => { dropRef(node); containerRef.current = node }}
      onClick={() => {
        if (suppressNextClear) {
          onConsumeSuppressClear?.()
          return
        }
        setSelectedIds([])
      }}
    >
      {ICONS_DEF.map(icon => {
        const pos = positions[icon.id]
        return (
          <div
            key={icon.id}
            className="desktop-icon-slot"
            style={{
              position: 'absolute',
              left: PADDING + pos.col * CELL_W,
              top:  PADDING + pos.row * CELL_H,
              width: CELL_W,
              height: CELL_H,
            }}
          >
            <DeskIcon
              icon={icon}
              selected={selectedIds.includes(icon.id)}
              onSelect={(id) => setSelectedIds([id])}
              onOpen={handleOpen}
            />
          </div>
        )
      })}
    </div>
  )
}

export default DesktopIcons
