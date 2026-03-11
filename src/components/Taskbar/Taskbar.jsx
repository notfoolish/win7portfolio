import { useState, useEffect } from 'react'
import './Taskbar.css'
import { APPS, TASKBAR_PINNED_IDS } from '../../apps'

const PINNED_APPS = TASKBAR_PINNED_IDS.map(id => APPS[id])
const PINNED_SET  = new Set(TASKBAR_PINNED_IDS)

function Taskbar({ startOpen, onStartClick, windows = [], onAppOpen, onWindowTaskbarClick, onShowDesktop }) {
  const [startHover,  setStartHover]  = useState(false)
  const [startActive, setStartActive] = useState(false)
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const fmt12 = (d) => {
    let h = d.getHours()
    const m = d.getMinutes().toString().padStart(2, '0')
    const ap = h >= 12 ? 'PM' : 'AM'
    h = h % 12 || 12
    return `${h}:${m} ${ap}`
  }

  const fmtDate = (d) => {
    const mo = (d.getMonth() + 1).toString().padStart(2, '0')
    const dy = d.getDate().toString().padStart(2, '0')
    return `${mo}/${dy}/${d.getFullYear()}`
  }

  const startImg = (startActive || startOpen)
    ? '/win7icons/StartButton/windowstaskbaractiveicon.png'
    : startHover
    ? '/win7icons/StartButton/windowstaskbarhovericon.png'
    : '/win7icons/StartButton/windowstaskbaricon.png'

  // Group open windows by appId
  const byAppId = {}
  windows.forEach(w => {
    if (!byAppId[w.appId]) byAppId[w.appId] = []
    byAppId[w.appId].push(w)
  })

  // Running non-pinned windows (show as labelled task buttons)
  const nonPinned = windows.filter(w => !PINNED_SET.has(w.appId))

  const handlePinnedClick = (appId) => {
    const wins = byAppId[appId] || []
    if (wins.length > 0) {
      onWindowTaskbarClick(wins[0].id)
    } else {
      onAppOpen(appId)
    }
  }

  return (
    <div id="task-bar">
      <div id="blur-overlay" />

      {/* Start orb */}
      <div
        id="menu-button"
        style={{ backgroundImage: `url('${startImg}')` }}
        onMouseEnter={() => setStartHover(true)}
        onMouseLeave={() => { setStartHover(false); setStartActive(false) }}
        onMouseDown={() => setStartActive(true)}
        onMouseUp={() => setStartActive(false)}
        onClick={onStartClick}
      />

      {/* Task buttons: pinned always visible + running non-pinned */}
      <div id="pined-items">
        {PINNED_APPS.map(app => {
          const wins      = byAppId[app.appId] || []
          const isRunning = wins.length > 0
          if (!isRunning) return null
          const isActive    = wins.some(w => w.focused && !w.minimized)
          const isMinimized = !isActive
          return (
            <div
              key={app.appId}
              className={`pined-icon${isActive ? ' tb-active' : ''}${isMinimized ? ' tb-minimized' : ''}`}
              onClick={() => handlePinnedClick(app.appId)}
            >
              <img src={app.icon} alt={app.title} className="pined-icon-img" />
            </div>
          )
        })}

        {/* Non-pinned running windows */}
        {nonPinned.map(w => (
          <div
            key={w.id}
            className={`task-btn${w.focused && !w.minimized ? ' tb-active' : ''}${w.minimized ? ' tb-minimized' : ''}`}
            onClick={() => onWindowTaskbarClick(w.id)}
          >
            <img src={w.icon} alt="" className="task-btn-icon" />
          </div>
        ))}
      </div>

      {/* System tray */}
      <div id="tray-area">
        <img src="/win7icons/Network and Sharing Center/netcenter_19.ico" className="tray-icon" alt="" />
        <img src="/win7icons/Action Center/ActionCenter_5.ico"           className="tray-icon" alt="" />
      </div>

      {/* Clock */}
      <div id="datetime">
        <span>{fmt12(time)}</span>
        <span>{fmtDate(time)}</span>
      </div>

      {/* Show desktop */}
      <div id="show-desktop" onClick={onShowDesktop} />
    </div>
  )
}

export default Taskbar
