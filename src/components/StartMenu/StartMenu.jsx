import { Fragment, useState } from 'react'
import './StartMenu.css'

const PINNED = [
  { id: 'aboutme',   label: 'About Me',             icon: '/win7icons/Special Folders/imageres_129.ico' },
  { id: 'resume',    label: 'Resume',               icon: '/win7icons/Libraries/imageres_1002.ico' },
  { id: 'ie',        label: 'Internet Explorer',   icon: '/win7icons/Internet Explorer/iexplore_32528.ico' },
  { id: 'wmp',       label: 'Windows Media Player', icon: '/win7icons/WMP12 Icons/WMP 12 1.ico' },
  { id: 'wordpad',   label: 'WordPad',              icon: '/win7icons/Wordpad/wordpad_128.ico' },
  { id: 'paint',     label: 'Paint',                icon: '/win7icons/Default Programs/mspaint_2.ico' },
  { id: 'vicecity',  label: 'GTA: Vice City',       icon: '/games/reVCDOS-main/dist/cover.jpg' },
  { id: 'doom',      label: 'DOOM',                 icon: '/games/game_icons/doom.png' },
  { id: 'notepad',   label: 'Notepad',              icon: '/win7icons/Default Programs/notepad_2.ico' },
  { id: 'cmd',       label: 'Command Prompt',       icon: '/win7icons/Default Programs/cmd_IDI_APPICON.ico' },
  { id: 'pshell',    label: 'Windows PowerShell',   icon: '/win7icons/Windows PowerShell/powershell_MSH_MAIN.ico' },
]

const RIGHT_LINKS = [
  { id: 'docs',     label: 'Documents',           icon: '/win7icons/Libraries/imageres_1002.ico' },
  { id: 'pics',     label: 'Pictures',            icon: '/win7icons/Libraries/imageres_1003.ico' },
  { id: 'music',    label: 'Music',               icon: '/win7icons/Libraries/imageres_1004.ico' },
  { id: 'games',    label: 'Games',               icon: '/win7icons/Games/Solitaire_108.ico' },
  { id: 'computer', label: 'Computer',            icon: '/win7icons/Accessibility/accessibilitycpl_321.ico' },
  { id: 'cp',       label: 'Control Panel',       icon: '/win7icons/Control Panel/imageres_27.ico' },
  { id: 'devices',  label: 'Devices and Printers',icon: '/win7icons/Control Panel/imageres_78.ico' },
  { id: 'defaults', label: 'Default Programs',    icon: '/win7icons/Default Programs/cmd_IDI_APPICON.ico' },
  { id: 'help',     label: 'Help and Support',    icon: '/win7icons/Special Folders/imageres_8.ico' },
]

function StartMenu({ onClose, onAppOpen }) {
  const [search, setSearch] = useState('')

  const visible = PINNED.filter(p =>
    p.label.toLowerCase().includes(search.toLowerCase())
  )

  const launch = (appId) => {
    onAppOpen(appId)
    onClose()
  }

  return (
    <div
      id="start-menu-wrap"
      onClick={e => e.stopPropagation()}
    >
      {/* Blur overlay for the glass border frame */}
      <div id="sm-border-blur" />

      <div id="start-menu">
        {/* ── Left white panel ── */}
        <div id="sm-left">
        {/* Pinned / search results */}
        <div id="sm-apps">
          {visible.map(app => (
            <div key={app.id} className="sm-app-item" onClick={() => launch(app.id)}>
              <img src={app.icon} alt={app.label} className="sm-app-icon" />
              <span>{app.label}</span>
            </div>
          ))}
        </div>

        {/* All Programs */}
        <div id="sm-all-programs">
          <span>▶ All Programs</span>
        </div>

        {/* Search box */}
        <div id="sm-search-wrap">
          <input
            id="sm-search"
            type="text"
            placeholder="Search Programs"
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
          />
          <span id="sm-search-icon">🔍</span>
        </div>
      </div>

      {/* ── Right Aero glass panel ── */}
      <div id="sm-right">
        {/* User avatar embedded at top */}
        <div id="sm-avatar">
          <img src="/win7icons/User/guest.bmp" alt="User" />
        </div>

        <div id="sm-right-links">
          {RIGHT_LINKS.map((link) => (
            <Fragment key={link.id}>
              {link.id === 'cp'   && <div className="sm-right-divider" />}
              {link.id === 'help' && <div className="sm-right-divider" />}
              <div className="sm-right-item" onClick={() => launch(link.id)}>
                <span>{link.label}</span>
              </div>
            </Fragment>
          ))}
        </div>

        {/* Restart strip */}
        <div id="sm-restart-bar">
          <button id="sm-restart-btn" onClick={() => window.location.reload(true)}>Restart</button>
        </div>
      </div>
      </div>
    </div>
  )
}

export default StartMenu
