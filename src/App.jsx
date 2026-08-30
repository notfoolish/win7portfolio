import { lazy, Suspense, useState, useRef, useMemo, useCallback, useEffect } from 'react'
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
import BootScreen from './components/BootScreen/BootScreen'

const SOUND = {
  BOOT_FADE_END: '/sounds/Windows Logon Sound.wav',
  START_MENU: '/sounds/Windows Menu Command.wav',
  APP_OPEN: '/sounds/Windows Navigation Start.wav',
  MINIMIZE: '/sounds/Windows Minimize.wav',
  RESTORE: '/sounds/Windows Restore.wav',
  CLOSE: '/sounds/Windows Menu Command.wav',
  SHOW_DESKTOP_MIN: '/sounds/Windows Minimize.wav',
  SHOW_DESKTOP_RESTORE: '/sounds/Windows Restore.wav',
  LOGOFF: '/sounds/Windows Logoff Sound.wav',
}

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
  const [bootDone, setBootDone] = useState(false)
  const [startOpen, setStartOpen] = useState(false)
  const [windows,   setWindows]   = useState([])
  const [desktopSelectionRect, setDesktopSelectionRect] = useState(null)
  const [suppressNextDesktopClear, setSuppressNextDesktopClear] = useState(false)
  const topZ       = useRef(100)
  const desktopRef = useRef(null)   // windows live in 100-8999, taskbar 9999, start menu 9998
  const soundCacheRef = useRef(new Map())
  const soundUnlockedRef = useRef(false)
  const pendingSoundsRef = useRef([])

  const preloadSounds = useMemo(() => Object.values(SOUND), [])

  useEffect(() => {
    preloadSounds.forEach((src) => {
      const audio = new Audio(src)
      audio.preload = 'auto'
      soundCacheRef.current.set(src, audio)
    })
  }, [preloadSounds])

  useEffect(() => {
    const unlockAudio = () => {
      if (soundUnlockedRef.current) return
      soundUnlockedRef.current = true

      const pending = [...pendingSoundsRef.current]
      pendingSoundsRef.current = []
      pending.forEach(({ src, volume }) => {
        const cached = soundCacheRef.current.get(src) || new Audio(src)
        const instance = cached.cloneNode(true)
        instance.volume = volume
        instance.play().catch(() => {})
      })
    }

    window.addEventListener('pointerdown', unlockAudio, { once: true })
    window.addEventListener('touchstart', unlockAudio, { once: true })
    window.addEventListener('keydown', unlockAudio, { once: true })

    return () => {
      window.removeEventListener('pointerdown', unlockAudio)
      window.removeEventListener('touchstart', unlockAudio)
      window.removeEventListener('keydown', unlockAudio)
    }
  }, [])

  const playSound = useCallback((src, volume = 0.7) => {
    if (!src) return
    try {
      if (!soundUnlockedRef.current) {
        pendingSoundsRef.current.push({ src, volume })
        return
      }
      const cached = soundCacheRef.current.get(src) || new Audio(src)
      const instance = cached.cloneNode(true)
      instance.volume = volume
      instance.play().catch(() => {})
    } catch {
      // no-op: audio may be blocked by autoplay policies
    }
  }, [])

  const playSoundNow = useCallback((src, volume = 0.7) => {
    if (!src) return
    try {
      const cached = soundCacheRef.current.get(src) || new Audio(src)
      const instance = cached.cloneNode(true)
      instance.volume = volume
      instance.play().catch(() => {})
    } catch {
      // no-op: audio may be blocked by autoplay policies
    }
  }, [])

  // Open or restore/focus an app
  const openApp = (appId, extraProps = {}) => {
    const app = APPS[appId]
    if (!app) return
    playSound(SOUND.APP_OPEN, 0.55)
    setWindows(ws => {
      // Single-instance: focus/restore existing window
      if (app.single) {
        const existing = ws.find(w => w.appId === appId)
        if (existing) {
          topZ.current += 1
          const z = topZ.current
          return ws.map(w =>
            w.id === existing.id
              ? { ...w, minimized: false, focused: true, zIndex: z, extraProps }
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
          extraProps,
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
        playSound(SOUND.RESTORE, 0.5)
        topZ.current += 1
        const z = topZ.current
        return ws.map(w =>
          w.id === id
            ? { ...w, minimized: false, focused: true, zIndex: z }
            : { ...w, focused: false }
        )
      } else if (win.focused) {
        playSound(SOUND.MINIMIZE, 0.5)
        return ws.map(w =>
          w.id === id ? { ...w, minimized: true, focused: false } : w
        )
      } else {
        playSound(SOUND.RESTORE, 0.45)
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

  const closeWindow    = (id) => {
    playSound(SOUND.CLOSE, 0.5)
    setWindows(ws => ws.filter(w => w.id !== id))
  }
  const minimizeWindow = (id) => {
    playSound(SOUND.MINIMIZE, 0.5)
    setWindows(ws => ws.map(w => w.id === id ? { ...w, minimized: true, focused: false } : w))
  }

  const showDesktop = () => {
    setWindows(ws => {
      const anyVisible = ws.some(w => !w.minimized)
      if (anyVisible) {
        playSound(SOUND.SHOW_DESKTOP_MIN, 0.5)
        // minimize all
        return ws.map(w => ({ ...w, minimized: true, focused: false }))
      } else {
        playSound(SOUND.SHOW_DESKTOP_RESTORE, 0.5)
        // restore all
        topZ.current += 1
        return ws.map((w, i) => ({ ...w, minimized: false, zIndex: topZ.current + i }))
      }
    })
  }

  const handleBootDone = () => {
    setBootDone(true)
    // Startup sound is embedded in the boot video; only play logon here.
    playSoundNow(SOUND.BOOT_FADE_END, 0.85)
  }

  const handleStartClick = (e) => {
    e.stopPropagation()
    playSound(SOUND.START_MENU, 0.5)
    setStartOpen(v => !v)
  }

  const handleRestart = () => {
    playSound(SOUND.LOGOFF, 0.9)
    setTimeout(() => window.location.reload(), 900)
  }

  return (
    <DndProvider backend={HTML5Backend}>
    {!bootDone && <BootScreen onDone={handleBootDone} />}
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
                <AppComponent onAppOpen={openApp} {...(w.extraProps || {})} />
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
            onRestart={handleRestart}
            onPlaySound={() => playSound(SOUND.START_MENU, 0.5)}
          />
        )}
      </AnimatePresence>

      {/* ── Taskbar (always on top at z 9999) ── */}
      <Taskbar
        startOpen={startOpen}
        onStartClick={handleStartClick}
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