import { useState, useCallback, useEffect, useRef } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import './DesktopIcons.css'

const CELL_W = 80   // grid cell width
const CELL_H = 90   // grid cell height
const PADDING = 10  // desktop edge padding

function getTaskbarH() {
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--taskbar-height').trim()
  return parseInt(raw, 10) || 40
}
function getCellDims() {
  const style = getComputedStyle(document.documentElement)
  const cw = parseInt(style.getPropertyValue('--desktop-cell-w').trim(), 10) || CELL_W
  const ch = parseInt(style.getPropertyValue('--desktop-cell-h').trim(), 10) || CELL_H
  return { cw, ch }
}

const ICONS_DEF = [
  { id: 'aboutme',  label: 'About Me',           icon: '/win7icons/Special Folders/imageres_129.ico',     appId: 'aboutme' },
  { id: 'resume',   label: 'Resume',             icon: '/win7icons/Libraries/imageres_1002.ico',          appId: 'resume' },
  { id: 'computer', label: 'Computer',           icon: '/win7icons/Shell32.dll/shell32_16.ico',            appId: 'computer' },
  { id: 'ie',       label: 'Internet Explorer',  icon: '/win7icons/Internet Explorer/iexplore_32528.ico', appId: 'ie' },
  { id: 'vicecity', label: 'GTA: Vice City',     icon: '/games/reVCDOS-main/dist/cover.jpg',                appId: 'vicecity' },
  { id: 'doom',     label: 'DOOM',               icon: '/games/game_icons/doom.png',                        appId: 'doom' },
]

/* clamp to grid so the full icon stays on screen */
function snapToGrid(x, y, maxCols, maxRows, cw = CELL_W, ch = CELL_H) {
  let col = Math.round(x / cw)
  let row = Math.round(y / ch)
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
  const [cellDims, setCellDims] = useState({ cw: CELL_W, ch: CELL_H })

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
        const left = hostRect.left + PADDING + pos.col * cellDims.cw
        const top = hostRect.top + PADDING + pos.row * cellDims.ch
        const right = left + cellDims.cw
        const bottom = top + cellDims.ch
        return !(right < sel.left || left > sel.right || bottom < sel.top || top > sel.bottom)
      })
      .map(icon => icon.id)

    setSelectedIds(hits)
  }, [selectionRect, positions])

  /* recalc available grid on resize — also re-pack icons that fall outside */
  useEffect(() => {
    const update = () => {
      const taskbarH = getTaskbarH()
      const { cw, ch } = getCellDims()
      const w = window.innerWidth  - PADDING * 2
      const h = window.innerHeight - PADDING * 2 - taskbarH
      const cols = Math.max(1, Math.floor(w / cw))
      const rows = Math.max(1, Math.floor(h / ch))
      setCellDims({ cw, ch })
      setGridSize({ cols, rows })

      // Clamp / re-pack any icons that are now out of bounds
      setPositions(prev => {
        const next = { ...prev }
        const occupied = new Set(
          Object.entries(next).map(([, p]) => `${p.col},${p.row}`)
        )

        for (const ic of ICONS_DEF) {
          const p = next[ic.id]
          if (!p) continue
          // Already in bounds → nothing to do
          if (p.col < cols && p.row < rows) continue

          // Remove current occupancy
          occupied.delete(`${p.col},${p.row}`)

          // Find first free cell scanning column-first (top-to-bottom, left-to-right)
          let placed = false
          outer: for (let c = 0; c < cols; c++) {
            for (let r = 0; r < rows; r++) {
              if (!occupied.has(`${c},${r}`)) {
                next[ic.id] = { col: c, row: r }
                occupied.add(`${c},${r}`)
                placed = true
                break outer
              }
            }
          }
          // Fallback: squeeze into last cell if grid is fully packed
          if (!placed) {
            next[ic.id] = { col: cols - 1, row: rows - 1 }
          }
        }

        return next
      })
    }

    update()
    window.addEventListener('resize', update)
    window.addEventListener('orientationchange', () => setTimeout(update, 200))
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('orientationchange', update)
    }
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
      const rawX = prev.col * cellDims.cw + delta.x
      const rawY = prev.row * cellDims.ch + delta.y

      const snapped = snapToGrid(rawX, rawY, gridSize.cols, gridSize.rows, cellDims.cw, cellDims.ch)
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
              left: PADDING + pos.col * cellDims.cw,
              top:  PADDING + pos.row * cellDims.ch,
              width: cellDims.cw,
              height: cellDims.ch,
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
