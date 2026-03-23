import { lazy, Suspense, useState, useRef } from 'react'
import { AnimatePresence } from 'framer-motion'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import './App.css'
import { APPS } from './apps'
import Taskbar   from './components/Taskbar/Taskbar'
import StartMenu from './components/StartMenu/StartMenu'
import Window    from './components/Window/Window'
import DesktopIcons     from './components/DesktopIcons/DesktopIcons'
import DesktopSelection from './components/DesktopSelection/DesktopSelection'

const APP_COMPONENTS = {
  ie:       lazy(() => import('./apps/InternetExplorer')),
  explorer: lazy(() => import('./apps/WindowsExplorer')),
  wmp:      lazy(() => import('./apps/WindowsMediaPlayer')),
  wordpad:  lazy(() => import('./apps/WordPad')),
  paint:    lazy(() => import('./apps/Paint')),
  notepad:  lazy(() => import('./apps/Notepad')),
  cmd:      lazy(() => import('./apps/CommandPrompt')),
  pshell:   lazy(() => import('./apps/PowerShell')),
  docs:     lazy(() => import('./apps/Documents')),
  pics:     lazy(() => import('./apps/Pictures')),
  music:    lazy(() => import('./apps/Music')),
  games:    lazy(() => import('./apps/Games')),
  doom:     lazy(() => import('./apps/Doom')),
  vicecity: lazy(() => import('./apps/ViceCity')),
  computer: lazy(() => import('./apps/Computer')),
  cp:       lazy(() => import('./apps/ControlPanel')),
  devices:  lazy(() => import('./apps/DevicesAndPrinters')),
  defaults: lazy(() => import('./apps/DefaultPrograms')),
  help:     lazy(() => import('./apps/HelpAndSupport')),
  aboutme:  lazy(() => import('./apps/AboutMe')),
  resume:   lazy(() => import('./apps/Resume')),
}

let _nextId = 1
const TASKBAR_HEIGHT = 40

function getSpawnPosition(id, width, height) {
  const off = (id % 10) * 24
  const maxX = Math.max(0, window.innerWidth - width)
  const maxY = Math.max(0, window.innerHeight - TASKBAR_HEIGHT - height)

  return {
    x: Math.min(80 + off, maxX),
    y: Math.min(50 + off, maxY),
  }
}

function App() {
  const [startOpen, setStartOpen] = useState(false)
  const [windows,   setWindows]   = useState([])
  const [desktopSelectionRect, setDesktopSelectionRect] = useState(null)
  const [suppressNextDesktopClear, setSuppressNextDesktopClear] = useState(false)
  const topZ       = useRef(100)
  const desktopRef = useRef(null)   // windows live in 100-8999, taskbar 9999, start menu 9998

  // Open or restore/focus an app
  const openApp = (appId) => {
    const app = APPS[appId]
    if (!app) return
    setWindows(ws => {
      // Single-instance: focus/restore existing window
      if (app.single) {
        const existing = ws.find(w => w.appId === appId)
        if (existing) {
          topZ.current += 1
          const z = topZ.current
          return ws.map(w =>
            w.id === existing.id
              ? { ...w, minimized: false, focused: true, zIndex: z }
              : { ...w, focused: false }
          )
        }
      }
      // Spawn new window
      topZ.current += 1
      const id   = _nextId++
      const width = app.width || 500
      const height = app.height || 360
      const pos = getSpawnPosition(id, width, height)
      return [
        ...ws.map(w => ({ ...w, focused: false })),
        {
          id,
          appId:    app.appId,
          title:    app.title,
          icon:     app.icon,
          startMaximized: !!app.startMaximized,
          minimized: false,
          focused:   true,
          zIndex:    topZ.current,
          x: pos.x,
          y: pos.y,
          width,
          height,
        },
      ]
    })
  }

  // Taskbar button: restore+focus if minimized, minimize if active, focus otherwise
  const onWindowTaskbarClick = (id) => {
    setWindows(ws => {
      const win = ws.find(w => w.id === id)
      if (!win) return ws
      if (win.minimized) {
        topZ.current += 1
        const z = topZ.current
        return ws.map(w =>
          w.id === id
            ? { ...w, minimized: false, focused: true, zIndex: z }
            : { ...w, focused: false }
        )
      } else if (win.focused) {
        return ws.map(w =>
          w.id === id ? { ...w, minimized: true, focused: false } : w
        )
      } else {
        topZ.current += 1
        const z = topZ.current
        return ws.map(w =>
          w.id === id
            ? { ...w, focused: true, zIndex: z }
            : { ...w, focused: false }
        )
      }
    })
  }

  // Click on the window itself → bring to front
  const focusWindow = (id) => {
    setWindows(ws => {
      topZ.current += 1
      const z = topZ.current
      return ws.map(w =>
        w.id === id
          ? { ...w, focused: true, zIndex: z }
          : { ...w, focused: false }
      )
    })
  }

  const closeWindow    = (id) => setWindows(ws => ws.filter(w => w.id !== id))
  const minimizeWindow = (id) => setWindows(ws =>
    ws.map(w => w.id === id ? { ...w, minimized: true, focused: false } : w)
  )

  const showDesktop = () => {
    setWindows(ws => {
      const anyVisible = ws.some(w => !w.minimized)
      if (anyVisible) {
        // minimize all
        return ws.map(w => ({ ...w, minimized: true, focused: false }))
      } else {
        // restore all
        topZ.current += 1
        return ws.map((w, i) => ({ ...w, minimized: false, zIndex: topZ.current + i }))
      }
    })
  }

  return (
    <DndProvider backend={HTML5Backend}>
    <div ref={desktopRef} className="win7-desktop" onClick={() => setStartOpen(false)}>

      {/* ── Desktop selection box ── */}
      <DesktopSelection
        containerRef={desktopRef}
        onRectChange={setDesktopSelectionRect}
        onSelectionEnd={() => setSuppressNextDesktopClear(true)}
      />

      {/* ── Desktop icons ── */}
      <DesktopIcons
        onAppOpen={openApp}
        selectionRect={desktopSelectionRect}
        suppressNextClear={suppressNextDesktopClear}
        onConsumeSuppressClear={() => setSuppressNextDesktopClear(false)}
      />
      {windows.map(w => {
        const AppComponent = APP_COMPONENTS[w.appId]
        return (
          <Window
            key={w.id}
            title={w.title}
            icon={w.icon}
            zIndex={w.zIndex}
            minimized={w.minimized}
            focused={w.focused}
            startMaximized={w.startMaximized}
            defaultWidth={w.width}
            defaultHeight={w.height}
            defaultX={w.x}
            defaultY={w.y}
            onClose={()    => closeWindow(w.id)}
            onMinimize={()  => minimizeWindow(w.id)}
            onFocus={()    => focusWindow(w.id)}
          >
            {AppComponent && (
              <Suspense fallback={<div className="window-loading">Loading...</div>}>
                <AppComponent />
              </Suspense>
            )}
          </Window>
        )
      })}

      {/* ── Start menu ── */}
      <AnimatePresence>
        {startOpen && (
          <StartMenu
            onClose={() => setStartOpen(false)}
            onAppOpen={(appId) => { openApp(appId); setStartOpen(false) }}
          />
        )}
      </AnimatePresence>

      {/* ── Taskbar (always on top at z 9999) ── */}
      <Taskbar
        startOpen={startOpen}
        onStartClick={(e) => { e.stopPropagation(); setStartOpen(v => !v) }}
        windows={windows}
        onAppOpen={openApp}
        onWindowTaskbarClick={onWindowTaskbarClick}
        onShowDesktop={showDesktop}
      />
    </div>
    </DndProvider>
  )
}

export default App