import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './Paint.css'

const TOOLS = {
  pencil: 'pencil',
  brush: 'brush',
  eraser: 'eraser',
  fill: 'fill',
  line: 'line',
  rectangle: 'rectangle',
  ellipse: 'ellipse',
}

const PALETTE = [
  '#000000', '#7f7f7f', '#880015', '#ed1c24', '#ff7f27', '#fff200', '#22b14c', '#00a2e8',
  '#3f48cc', '#a349a4', '#ffffff', '#c3c3c3', '#b97a57', '#ffaec9', '#ffc90e', '#efe4b0',
  '#b5e61d', '#99d9ea', '#7092be', '#c8bfe7',
]

const SIZE_OPTIONS = [1, 2, 4, 6, 10, 16]
const HISTORY_LIMIT = 30
const TOOL_ITEMS = [
  { key: TOOLS.pencil, label: 'Pencil' },
  { key: TOOLS.brush, label: 'Brush' },
  { key: TOOLS.eraser, label: 'Eraser' },
  { key: TOOLS.fill, label: 'Fill' },
  { key: TOOLS.line, label: 'Line' },
  { key: TOOLS.rectangle, label: 'Rect' },
  { key: TOOLS.ellipse, label: 'Ellipse' },
]

function Paint() {
  const canvasRef = useRef(null)
  const surfaceRef = useRef(null)
  const drawingRef = useRef(false)
  const startPointRef = useRef({ x: 0, y: 0 })
  const lastPointRef = useRef({ x: 0, y: 0 })
  const drawColorRef = useRef('#000000')
  const previewSnapshotRef = useRef(null)
  const canvasReadyRef = useRef(false)
  const historyRef = useRef([])
  const historyIndexRef = useRef(-1)

  const [tool, setTool] = useState(TOOLS.brush)
  const [primaryColor, setPrimaryColor] = useState('#000000')
  const [secondaryColor, setSecondaryColor] = useState('#ffffff')
  const [activeColorSlot, setActiveColorSlot] = useState('primary')
  const [size, setSize] = useState(4)
  const [fillShapes, setFillShapes] = useState(false)
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const [status, setStatus] = useState('Ready')
  const [pointerLabel, setPointerLabel] = useState('0, 0 px')

  const activeColor = activeColorSlot === 'primary' ? primaryColor : secondaryColor

  const toolButtons = useMemo(() => TOOL_ITEMS, [])

  const updateHistoryState = useCallback(() => {
    setCanUndo(historyIndexRef.current > 0)
    setCanRedo(historyIndexRef.current >= 0 && historyIndexRef.current < historyRef.current.length - 1)
  }, [])

  const getCanvasContext = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return null

    const context = canvas.getContext('2d', { willReadFrequently: true })
    if (!context) return null

    context.lineCap = 'round'
    context.lineJoin = 'round'
    return context
  }, [])

  const fillCanvasWhite = useCallback((context) => {
    if (!context) return
    context.save()
    context.globalCompositeOperation = 'source-over'
    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, context.canvas.width, context.canvas.height)
    context.restore()
  }, [])

  const pushHistorySnapshot = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const nextHistory = historyRef.current.slice(0, historyIndexRef.current + 1)
    nextHistory.push(canvas.toDataURL('image/png'))

    if (nextHistory.length > HISTORY_LIMIT) {
      nextHistory.shift()
    }

    historyRef.current = nextHistory
    historyIndexRef.current = nextHistory.length - 1
    updateHistoryState()
  }, [updateHistoryState])

  const restoreSnapshot = useCallback((dataUrl) => {
    const canvas = canvasRef.current
    const context = getCanvasContext()
    if (!canvas || !context || !dataUrl) return

    const image = new Image()
    image.onload = () => {
      fillCanvasWhite(context)
      context.drawImage(image, 0, 0, canvas.width, canvas.height)
    }
    image.src = dataUrl
  }, [fillCanvasWhite, getCanvasContext])

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current
    const surface = surfaceRef.current
    if (!canvas || !surface) return

    const nextWidth = Math.max(320, Math.floor(surface.clientWidth - 2))
    const nextHeight = Math.max(220, Math.floor(surface.clientHeight - 2))
    if (canvas.width === nextWidth && canvas.height === nextHeight) return

    const previousData = canvasReadyRef.current ? canvas.toDataURL('image/png') : null
    canvas.width = nextWidth
    canvas.height = nextHeight

    const context = getCanvasContext()
    if (!context) return

    fillCanvasWhite(context)

    if (previousData) {
      const image = new Image()
      image.onload = () => {
        context.drawImage(image, 0, 0, nextWidth, nextHeight)
      }
      image.src = previousData
    } else {
      pushHistorySnapshot()
      canvasReadyRef.current = true
    }
  }, [fillCanvasWhite, getCanvasContext, pushHistorySnapshot])

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      resizeCanvas()
    })

    const surface = surfaceRef.current
    if (!surface) {
      window.cancelAnimationFrame(frame)
      return undefined
    }

    const observer = new ResizeObserver(() => {
      resizeCanvas()
    })

    observer.observe(surface)
    return () => {
      window.cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [resizeCanvas])

  const getPointerPosition = useCallback((event) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    return {
      x: Math.max(0, Math.min(canvas.width - 1, Math.round((event.clientX - rect.left) * scaleX))),
      y: Math.max(0, Math.min(canvas.height - 1, Math.round((event.clientY - rect.top) * scaleY))),
    }
  }, [])

  const applyStrokeStyle = useCallback((context, activeTool = tool, colorOverride = primaryColor) => {
    context.lineWidth = activeTool === TOOLS.pencil ? 1 : size
    context.strokeStyle = activeTool === TOOLS.eraser ? '#ffffff' : colorOverride
    context.fillStyle = activeTool === TOOLS.eraser ? '#ffffff' : colorOverride
    context.globalCompositeOperation = 'source-over'
  }, [primaryColor, size, tool])

  const drawFreehandSegment = useCallback((from, to, activeTool = tool, colorOverride = primaryColor) => {
    const context = getCanvasContext()
    if (!context) return

    applyStrokeStyle(context, activeTool, colorOverride)
    context.beginPath()
    context.moveTo(from.x, from.y)
    context.lineTo(to.x, to.y)
    context.stroke()
  }, [applyStrokeStyle, getCanvasContext, primaryColor, tool])

  const restorePreviewSnapshot = useCallback(() => {
    const context = getCanvasContext()
    if (!context || !previewSnapshotRef.current) return
    context.putImageData(previewSnapshotRef.current, 0, 0)
  }, [getCanvasContext])

  const drawShape = useCallback((shapeTool, start, current, colorOverride = primaryColor) => {
    const context = getCanvasContext()
    if (!context) return

    restorePreviewSnapshot()
    applyStrokeStyle(context, shapeTool, colorOverride)

    const width = current.x - start.x
    const height = current.y - start.y

    context.beginPath()

    if (shapeTool === TOOLS.line) {
      context.moveTo(start.x, start.y)
      context.lineTo(current.x, current.y)
      context.stroke()
      return
    }

    if (shapeTool === TOOLS.rectangle) {
      if (fillShapes) {
        context.fillRect(start.x, start.y, width, height)
      }
      context.strokeRect(start.x, start.y, width, height)
      return
    }

    const centerX = start.x + width / 2
    const centerY = start.y + height / 2
    const radiusX = Math.abs(width / 2)
    const radiusY = Math.abs(height / 2)

    context.ellipse(centerX, centerY, Math.max(1, radiusX), Math.max(1, radiusY), 0, 0, Math.PI * 2)
    if (fillShapes) {
      context.fill()
    }
    context.stroke()
  }, [applyStrokeStyle, fillShapes, getCanvasContext, primaryColor, restorePreviewSnapshot])

  const floodFill = useCallback((x, y, fillColor = primaryColor) => {
    const context = getCanvasContext()
    const canvas = canvasRef.current
    if (!context || !canvas) return

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
    const { data, width, height } = imageData
    const startIndex = (y * width + x) * 4
    const targetColor = [
      data[startIndex],
      data[startIndex + 1],
      data[startIndex + 2],
      data[startIndex + 3],
    ]

    const hex = fillColor.replace('#', '')
    const replacementColor = [
      Number.parseInt(hex.slice(0, 2), 16),
      Number.parseInt(hex.slice(2, 4), 16),
      Number.parseInt(hex.slice(4, 6), 16),
      255,
    ]

    if (targetColor.every((channel, index) => channel === replacementColor[index])) return

    const stack = [[x, y]]
    while (stack.length > 0) {
      const point = stack.pop()
      if (!point) continue

      const [currentX, currentY] = point
      if (currentX < 0 || currentY < 0 || currentX >= width || currentY >= height) continue

      const index = (currentY * width + currentX) * 4
      const matches =
        data[index] === targetColor[0] &&
        data[index + 1] === targetColor[1] &&
        data[index + 2] === targetColor[2] &&
        data[index + 3] === targetColor[3]

      if (!matches) continue

      data[index] = replacementColor[0]
      data[index + 1] = replacementColor[1]
      data[index + 2] = replacementColor[2]
      data[index + 3] = replacementColor[3]

      stack.push([currentX + 1, currentY])
      stack.push([currentX - 1, currentY])
      stack.push([currentX, currentY + 1])
      stack.push([currentX, currentY - 1])
    }

    context.putImageData(imageData, 0, 0)
  }, [getCanvasContext, primaryColor])

  const assignColor = useCallback((value, slot = activeColorSlot) => {
    if (slot === 'secondary') {
      setSecondaryColor(value)
      return
    }
    setPrimaryColor(value)
  }, [activeColorSlot])

  const finishDrawAction = useCallback((nextStatus = 'Ready') => {
    drawingRef.current = false
    previewSnapshotRef.current = null
    pushHistorySnapshot()
    setStatus(nextStatus)
  }, [pushHistorySnapshot])

  const handlePointerDown = useCallback((event) => {
    if (event.button !== 0 && event.button !== 2) return

    const canvas = canvasRef.current
    const context = getCanvasContext()
    if (!canvas || !context) return

    const point = getPointerPosition(event)
    const colorForAction = event.button === 2 ? secondaryColor : primaryColor
    drawColorRef.current = colorForAction

    if (event.button === 2) {
      setActiveColorSlot('secondary')
    } else {
      setActiveColorSlot('primary')
    }

    canvas.setPointerCapture(event.pointerId)
    setPointerLabel(`${point.x}, ${point.y} px`)

    if (tool === TOOLS.fill) {
      floodFill(point.x, point.y, colorForAction)
      pushHistorySnapshot()
      setStatus('Area filled')
      return
    }

    drawingRef.current = true
    startPointRef.current = point
    lastPointRef.current = point
    previewSnapshotRef.current = context.getImageData(0, 0, canvas.width, canvas.height)
    setStatus(`Drawing with ${tool}`)

    if (tool === TOOLS.pencil || tool === TOOLS.brush || tool === TOOLS.eraser) {
      drawFreehandSegment(point, point, tool, colorForAction)
    }
  }, [drawFreehandSegment, floodFill, getCanvasContext, getPointerPosition, primaryColor, pushHistorySnapshot, secondaryColor, tool])

  const handlePointerMove = useCallback((event) => {
    const point = getPointerPosition(event)
    setPointerLabel(`${point.x}, ${point.y} px`)

    if (!drawingRef.current) return

    if (tool === TOOLS.pencil || tool === TOOLS.brush || tool === TOOLS.eraser) {
      drawFreehandSegment(lastPointRef.current, point, tool, drawColorRef.current)
      lastPointRef.current = point
      return
    }

    drawShape(tool, startPointRef.current, point, drawColorRef.current)
  }, [drawFreehandSegment, drawShape, getPointerPosition, tool])

  const handlePointerUp = useCallback((event) => {
    if (!drawingRef.current) return

    const point = getPointerPosition(event)
    if (tool === TOOLS.line || tool === TOOLS.rectangle || tool === TOOLS.ellipse) {
      drawShape(tool, startPointRef.current, point, drawColorRef.current)
    }

    finishDrawAction('Ready')
  }, [drawShape, finishDrawAction, getPointerPosition, tool])

  const handlePointerLeave = useCallback(() => {
    if (!drawingRef.current) {
      setStatus('Ready')
    }
  }, [])

  const handleUndo = useCallback(() => {
    if (historyIndexRef.current <= 0) return

    historyIndexRef.current -= 1
    restoreSnapshot(historyRef.current[historyIndexRef.current])
    updateHistoryState()
    setStatus('Undo')
  }, [restoreSnapshot, updateHistoryState])

  const handleRedo = useCallback(() => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return

    historyIndexRef.current += 1
    restoreSnapshot(historyRef.current[historyIndexRef.current])
    updateHistoryState()
    setStatus('Redo')
  }, [restoreSnapshot, updateHistoryState])

  const handleNewCanvas = useCallback(() => {
    const context = getCanvasContext()
    if (!context) return

    fillCanvasWhite(context)
    pushHistorySnapshot()
    setStatus('New canvas')
  }, [fillCanvasWhite, getCanvasContext, pushHistorySnapshot])

  const handleSave = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement('a')
    link.download = 'portfolio-painting.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
    setStatus('Saved as PNG')
  }, [])

  useEffect(() => {
    const handleWindowPointerUp = () => {
      if (!drawingRef.current) return
      finishDrawAction('Ready')
    }

    window.addEventListener('pointerup', handleWindowPointerUp)
    return () => window.removeEventListener('pointerup', handleWindowPointerUp)
  }, [finishDrawAction])

  return (
    <div className="paint-app">
      <div className="paint-menubar" role="menubar" aria-label="Paint menu">
        <button type="button" className="paint-menu-item" onClick={handleNewCanvas}>File</button>
        <button type="button" className="paint-menu-item" onClick={handleUndo} disabled={!canUndo}>Edit</button>
        <button type="button" className="paint-menu-item">View</button>
        <button type="button" className="paint-menu-item">Image</button>
        <button type="button" className="paint-menu-item" onClick={() => setActiveColorSlot('primary')}>Colors</button>
        <button type="button" className="paint-menu-item" onClick={handleSave}>Help</button>
      </div>

      <div className="paint-workspace">
        <aside className="paint-toolbox" aria-label="Toolbox">
          <div className="paint-tool-grid">
            {toolButtons.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                className={`paint-tool-btn ${tool === key ? 'active' : ''}`}
                onClick={() => setTool(key)}
                title={label}
                aria-label={label}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="paint-tool-options">
            <label>
              Size
              <select value={size} onChange={(event) => setSize(Number(event.target.value))}>
                {SIZE_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option}px</option>
                ))}
              </select>
            </label>
            <label className="paint-fill-toggle">
              <input
                type="checkbox"
                checked={fillShapes}
                onChange={(event) => setFillShapes(event.target.checked)}
              />
              Fill
            </label>
          </div>

          <div className="paint-tool-actions">
            <button type="button" onClick={handleNewCanvas}>New</button>
            <button type="button" onClick={handleUndo} disabled={!canUndo}>Undo</button>
            <button type="button" onClick={handleRedo} disabled={!canRedo}>Redo</button>
            <button type="button" onClick={handleSave}>Save</button>
          </div>

          <div className="paint-color-slot-stack">
            <button
              type="button"
              className={`paint-color-slot ${activeColorSlot === 'primary' ? 'active' : ''}`}
              onClick={() => setActiveColorSlot('primary')}
              aria-label="Color 1"
              title="Primary color"
            >
              <span style={{ backgroundColor: primaryColor }} />
              <em>Color 1</em>
            </button>
            <button
              type="button"
              className={`paint-color-slot paint-color-slot-secondary ${activeColorSlot === 'secondary' ? 'active' : ''}`}
              onClick={() => setActiveColorSlot('secondary')}
              aria-label="Color 2"
              title="Secondary color"
            >
              <span style={{ backgroundColor: secondaryColor }} />
              <em>Color 2</em>
            </button>
          </div>
        </aside>

        <div className="paint-surface-shell">
          <div className="paint-canvas-frame" ref={surfaceRef}>
            <canvas
              ref={canvasRef}
              className="paint-canvas"
              onContextMenu={(event) => event.preventDefault()}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerLeave}
            />
          </div>
        </div>
      </div>

      <div className="paint-colorbar" role="radiogroup" aria-label="Color palette">
        <div className="paint-colorbar-active">
          <span style={{ backgroundColor: primaryColor }} title="Color 1" />
          <span style={{ backgroundColor: secondaryColor }} title="Color 2" />
        </div>
        <div className="paint-palette">
          {PALETTE.map((swatch) => (
            <button
              key={swatch}
              type="button"
              className={activeColor === swatch ? 'selected' : ''}
              style={{ backgroundColor: swatch }}
              onClick={() => assignColor(swatch)}
              onContextMenu={(event) => {
                event.preventDefault()
                assignColor(swatch, 'secondary')
              }}
              aria-label={`Choose ${swatch}`}
              title="Left click: Color 1 • Right click: Color 2"
            >
              <span className="paint-visually-hidden">{swatch}</span>
            </button>
          ))}
        </div>

        <label className="paint-custom-color">
          Edit
          <input
            type="color"
            value={activeColor}
            onChange={(event) => assignColor(event.target.value)}
            aria-label="Edit active color"
          />
        </label>
      </div>

      <div className="paint-statusbar">
        <span>{status}</span>
        <span>{tool}</span>
        <span>{pointerLabel}</span>
      </div>
    </div>
  )
}

export default Paint
