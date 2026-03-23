import { useState, useRef } from 'react'
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

import InternetExplorer   from './apps/InternetExplorer'
import WindowsExplorer    from './apps/WindowsExplorer'
import WindowsMediaPlayer from './apps/WindowsMediaPlayer'
import WordPad            from './apps/WordPad'
import Paint              from './apps/Paint'
import Notepad            from './apps/Notepad'
import CommandPrompt      from './apps/CommandPrompt'
import PowerShell         from './apps/PowerShell'
import Documents          from './apps/Documents'
import Pictures           from './apps/Pictures'
import Music              from './apps/Music'
import Games              from './apps/Games'
import Doom               from './apps/Doom'
import Computer           from './apps/Computer'
import ControlPanel       from './apps/ControlPanel'
import DevicesAndPrinters from './apps/DevicesAndPrinters'
import DefaultPrograms    from './apps/DefaultPrograms'
import HelpAndSupport     from './apps/HelpAndSupport'
import AboutMe            from './apps/AboutMe'

const APP_COMPONENTS = {
  ie:       InternetExplorer,
  explorer: WindowsExplorer,
  wmp:      WindowsMediaPlayer,
  wordpad:  WordPad,
  paint:    Paint,
  notepad:  Notepad,
  cmd:      CommandPrompt,
  pshell:   PowerShell,
  docs:     Documents,
  pics:     Pictures,
  music:    Music,
  games:    Games,
  doom:     Doom,
  computer: Computer,
  cp:       ControlPanel,
  devices:  DevicesAndPrinters,
  defaults: DefaultPrograms,
  help:     HelpAndSupport,
  aboutme:  AboutMe,
}

let _nextId = 1

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
      const off  = (id % 10) * 24
      return [
        ...ws.map(w => ({ ...w, focused: false })),
        {
          id,
          appId:    app.appId,
          title:    app.title,
          icon:     app.icon,
          minimized: false,
          focused:   true,
          zIndex:    topZ.current,
          x: 80  + off,
          y: 50  + off,
          width:  app.width  || 500,
          height: app.height || 360,
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
            defaultWidth={w.width}
            defaultHeight={w.height}
            defaultX={w.x}
            defaultY={w.y}
            onClose={()    => closeWindow(w.id)}
            onMinimize={()  => minimizeWindow(w.id)}
            onFocus={()    => focusWindow(w.id)}
          >
            {AppComponent && <AppComponent />}
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