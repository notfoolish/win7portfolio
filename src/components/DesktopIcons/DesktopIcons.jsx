import { useState, useCallback, useEffect, useRef } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import './DesktopIcons.css'

const CELL_W = 80   // grid cell width
const CELL_H = 90   // grid cell height
const PADDING = 10  // desktop edge padding
const TASKBAR_H = 40

const ICONS_DEF = [
  { id: 'aboutme',  label: 'About Me',           icon: '/win7icons/Special Folders/imageres_129.ico',     appId: 'aboutme' },
  { id: 'resume',   label: 'Resume',             icon: '/win7icons/Libraries/imageres_1002.ico',          appId: 'resume' },
  { id: 'computer', label: 'Computer',           icon: '/win7icons/Shell32.dll/shell32_16.ico',            appId: 'computer' },
  { id: 'ie',       label: 'Internet Explorer',  icon: '/win7icons/Internet Explorer/iexplore_32528.ico', appId: 'ie' },
  { id: 'vicecity', label: 'GTA: Vice City',     icon: '/games/reVCDOS-main/dist/cover.jpg',                appId: 'vicecity' },
  { id: 'doom',     label: 'DOOM',               icon: '/games/game_icons/doom.png',                        appId: 'doom' },
]

/* clamp to grid so the full icon stays on screen */
function snapToGrid(x, y, maxCols, maxRows) {
  let col = Math.round(x / CELL_W)
  let row = Math.round(y / CELL_H)
  col = Math.max(0, Math.min(col, maxCols - 1))
  row = Math.max(0, Math.min(row, maxRows - 1))
  return { col, row }
}

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
      onClick={e => { e.stopPropagation(); onSelect(icon.id, e) }}
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

  const moveIcons = useCallback((ids, dCol, dRow) => {
    if (!ids.length) return

    const movingSet = new Set(ids)
    const selectedPos = ids
      .map(id => ({ id, pos: positions[id] }))
      .filter(entry => entry.pos)

    if (!selectedPos.length) return

    const cols = selectedPos.map(entry => entry.pos.col)
    const rows = selectedPos.map(entry => entry.pos.row)
    const minCol = Math.min(...cols)
    const maxCol = Math.max(...cols)
    const minRow = Math.min(...rows)
    const maxRow = Math.max(...rows)

    const boundedDCol = Math.max(-minCol, Math.min(dCol, (gridSize.cols - 1) - maxCol))
    const boundedDRow = Math.max(-minRow, Math.min(dRow, (gridSize.rows - 1) - maxRow))

    const targets = {}
    for (const { id, pos } of selectedPos) {
      targets[id] = { col: pos.col + boundedDCol, row: pos.row + boundedDRow }
    }

    const collides = Object.entries(targets).some(([id, target]) =>
      Object.entries(positions).some(([otherId, otherPos]) =>
        !movingSet.has(otherId) &&
        otherPos.col === target.col &&
        otherPos.row === target.row &&
        otherId !== id
      )
    )
    if (collides) return

    setPositions(prev => {
      const next = { ...prev }
      for (const [id, target] of Object.entries(targets)) {
        next[id] = target
      }
      return next
    })
  }, [gridSize.cols, gridSize.rows, positions])

  const [, dropRef] = useDrop({
    accept: 'DESKTOP_ICON',
    drop: (item, monitor) => {
      const delta = monitor.getDifferenceFromInitialOffset()
      if (!delta) return
      const prev = positions[item.id]
      if (!prev) return

      const movingIds = selectedIds.includes(item.id) ? selectedIds : [item.id]
      const rawX = prev.col * CELL_W + delta.x
      const rawY = prev.row * CELL_H + delta.y

      const snapped = snapToGrid(rawX, rawY, gridSize.cols, gridSize.rows)
      const dCol = snapped.col - prev.col
      const dRow = snapped.row - prev.row

      if (movingIds.length > 1) {
        moveIcons(movingIds, dCol, dRow)
      } else {
        const { col, row } = snapped
        const occupied = Object.entries(positions).some(
          ([id, p]) => id !== item.id && p.col === col && p.row === row
        )
        if (occupied) return
        moveIcon(item.id, col, row)
      }
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
              onSelect={(id, event) => {
                const multi = event?.ctrlKey || event?.metaKey
                if (multi) {
                  setSelectedIds(prev =>
                    prev.includes(id)
                      ? prev.filter(x => x !== id)
                      : [...prev, id]
                  )
                  return
                }
                setSelectedIds([id])
              }}
              onOpen={handleOpen}
            />
          </div>
        )
      })}
    </div>
  )
}

export default DesktopIcons
