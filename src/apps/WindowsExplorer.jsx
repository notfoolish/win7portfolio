import { useState, useCallback, useMemo } from 'react'
import './WindowsExplorer.css'

// ── Virtual File System ──────────────────────────────────────────────────
const FS = {
  'Computer': { name: 'Computer', type: 'computer', children: ['C:', 'D:'] },

  'C:': { name: 'Local Disk (C:)', type: 'drive', parent: 'Computer', children: ['C:/Program Files', 'C:/Users', 'C:/Windows'] },
  'C:/Program Files': { name: 'Program Files', type: 'folder', parent: 'C:', children: [], modified: '08/01/2026' },
  'C:/Windows':       { name: 'Windows',        type: 'folder', parent: 'C:', children: [], modified: '08/01/2026' },
  'C:/Users':         { name: 'Users',           type: 'folder', parent: 'C:', children: ['C:/Users/User'], modified: '08/01/2026' },

  'C:/Users/User': {
    name: 'User', type: 'folder', parent: 'C:/Users', modified: '08/10/2026',
    children: ['C:/Users/User/Desktop', 'C:/Users/User/Documents', 'C:/Users/User/Music', 'C:/Users/User/Pictures', 'C:/Users/User/Videos'],
  },
  'C:/Users/User/Desktop':   { name: 'Desktop',   type: 'folder', parent: 'C:/Users/User', children: [], modified: '08/24/2026' },
  'C:/Users/User/Documents': { name: 'Documents', type: 'folder', parent: 'C:/Users/User', children: [], modified: '08/22/2026' },
  'C:/Users/User/Videos':    { name: 'Videos',    type: 'folder', parent: 'C:/Users/User', children: [], modified: '08/24/2026' },

  'C:/Users/User/Music': {
    name: 'Music', type: 'folder', parent: 'C:/Users/User', modified: '08/20/2026',
    children: ['C:/Users/User/Music/SleepAway', 'C:/Users/User/Music/Kalimba', 'C:/Users/User/Music/MaidFlaxen'],
  },
  'C:/Users/User/Music/SleepAway':  { name: 'Sleep Away.mp3',                  type: 'audio', parent: 'C:/Users/User/Music', src: '/sounds/songs/Bob_Acri-Sleep_Away.mp3',                             artist: 'Bob Acri',        modified: '08/20/2026', size: '5.1 MB' },
  'C:/Users/User/Music/Kalimba':    { name: 'Kalimba.mp3',                      type: 'audio', parent: 'C:/Users/User/Music', src: '/sounds/songs/Kalimba.mp3',                                        artist: 'Mr. Scruff',      modified: '08/20/2026', size: '7.3 MB' },
  'C:/Users/User/Music/MaidFlaxen': { name: 'Maid with the Flaxen Hair.mp3',    type: 'audio', parent: 'C:/Users/User/Music', src: '/sounds/songs/Maid_with_the_Flaxen_Hair-Richard_Stoltzman.mp3',   artist: 'Richard Stoltzman', modified: '08/20/2026', size: '6.8 MB' },

  'C:/Users/User/Pictures': {
    name: 'Pictures', type: 'folder', parent: 'C:/Users/User', modified: '08/22/2026',
    children: ['C:/Users/User/Pictures/img1','C:/Users/User/Pictures/img2','C:/Users/User/Pictures/img3','C:/Users/User/Pictures/img4','C:/Users/User/Pictures/img5','C:/Users/User/Pictures/img6','C:/Users/User/Pictures/img7','C:/Users/User/Pictures/img8'],
  },
  'C:/Users/User/Pictures/img1': { name: 'Frangipani Flowers.jpg', type: 'image', parent: 'C:/Users/User/Pictures', src: '/image/sample_pictures/3416995839_9624feb2d0_b.jpg', modified: '08/10/2026', size: '3.2 MB' },
  'C:/Users/User/Pictures/img2': { name: 'Garden.jpg',             type: 'image', parent: 'C:/Users/User/Pictures', src: '/image/sample_pictures/3416996653_3af1c5b90c_b.jpg', modified: '08/10/2026', size: '2.8 MB' },
  'C:/Users/User/Pictures/img3': { name: 'Green Sea Turtle.jpg',   type: 'image', parent: 'C:/Users/User/Pictures', src: '/image/sample_pictures/3416998011_c0361ce51c_b.jpg', modified: '08/10/2026', size: '4.1 MB' },
  'C:/Users/User/Pictures/img4': { name: 'Humpback Whale.jpg',     type: 'image', parent: 'C:/Users/User/Pictures', src: '/image/sample_pictures/3416998869_f68bc9df34_b.jpg', modified: '08/10/2026', size: '3.5 MB' },
  'C:/Users/User/Pictures/img5': { name: 'Orca Whales.jpg',        type: 'image', parent: 'C:/Users/User/Pictures', src: '/image/sample_pictures/3417000415_cde41c5b65_b.jpg', modified: '08/10/2026', size: '3.9 MB' },
  'C:/Users/User/Pictures/img6': { name: 'Penguin.jpg',            type: 'image', parent: 'C:/Users/User/Pictures', src: '/image/sample_pictures/3417801308_0a1104d840_c.jpg', modified: '08/11/2026', size: '2.6 MB' },
  'C:/Users/User/Pictures/img7': { name: 'Shoreline.jpg',          type: 'image', parent: 'C:/Users/User/Pictures', src: '/image/sample_pictures/3417802188_201981a6ec_b.jpg', modified: '08/11/2026', size: '5.1 MB' },
  'C:/Users/User/Pictures/img8': { name: 'Tulips.jpg',             type: 'image', parent: 'C:/Users/User/Pictures', src: '/image/sample_pictures/3417804404_2279da5b66_b.jpg', modified: '08/11/2026', size: '4.4 MB' },

  'D:': { name: 'Data (D:)', type: 'drive', parent: 'Computer', children: [] },
}

const SIDEBAR_TREE = [
  { label: 'Favorites', items: [
    { label: 'Desktop',     path: 'C:/Users/User/Desktop' },
    { label: 'User Folder', path: 'C:/Users/User' },
  ]},
  { label: 'Libraries', items: [
    { label: 'Documents', path: 'C:/Users/User/Documents' },
    { label: 'Music',     path: 'C:/Users/User/Music' },
    { label: 'Pictures',  path: 'C:/Users/User/Pictures' },
    { label: 'Videos',    path: 'C:/Users/User/Videos' },
  ]},
  { label: 'Computer', items: [
    { label: 'Local Disk (C:)', path: 'C:' },
    { label: 'Data (D:)',       path: 'D:' },
  ]},
]

const TYPE_ICON  = {
  computer: '/win7icons/Shell32.dll/explorer_ICO_MYCOMPUTER.ico',
  drive:    '/win7icons/Shell32.dll/shell32_16.ico',
  folder:   '/win7icons/Standard Folders/imageres_3.ico',
  audio:    '/win7icons/WMP12 Icons/WMP 12 16.ico',
  image:    '/win7icons/Libraries/imageres_1003.ico',
}
const TYPE_LABEL = { computer: 'Computer', drive: 'Local Disk', folder: 'File folder', audio: 'MP3 Audio', image: 'JPEG Image' }

function buildBreadcrumb(path) {
  const crumbs = [{ label: 'Computer', path: 'Computer' }]
  if (path === 'Computer') return crumbs
  const parts = path.split('/')
  let cur = ''
  for (const seg of parts) {
    cur = cur ? cur + '/' + seg : seg
    const n = FS[cur]
    if (n) crumbs.push({ label: n.name, path: cur })
  }
  return crumbs
}

export default function WindowsExplorer({ onAppOpen }) {
  const [history, setHistory]   = useState(['Computer'])
  const [histIdx, setHistIdx]   = useState(0)
  const [selected, setSelected] = useState(null)
  const [lightbox, setLightbox] = useState(null)

  const currentPath = history[histIdx]
  const node = FS[currentPath]

  const navigate = useCallback((path) => {
    if (!FS[path]) return
    setHistory(h => [...h.slice(0, histIdx + 1), path])
    setHistIdx(i => i + 1)
    setSelected(null)
  }, [histIdx])

  const goBack    = () => { if (histIdx > 0) { setHistIdx(i => i - 1); setSelected(null) } }
  const goForward = () => { if (histIdx < history.length - 1) { setHistIdx(i => i + 1); setSelected(null) } }
  const goUp      = () => { if (node?.parent) navigate(node.parent) }

  const crumbs   = useMemo(() => buildBreadcrumb(currentPath), [currentPath])
  const children = useMemo(() => node?.children?.map(p => ({ path: p, ...FS[p] })).filter(c => c.name) ?? [], [node])
  const isFile   = node?.type === 'audio' || node?.type === 'image'

  return (
    <div className="explorer-app">
      {/* Toolbar – back / forward / up / breadcrumb */}
      <div className="explorer-toolbar">
        <button type="button" className="explorer-navbtn" disabled={histIdx === 0}                        onClick={goBack}    title="Back">&#8592;</button>
        <button type="button" className="explorer-navbtn" disabled={histIdx >= history.length - 1}        onClick={goForward} title="Forward">&#8594;</button>
        <button type="button" className="explorer-navbtn" disabled={!node?.parent}                        onClick={goUp}      title="Up one level">&#8593;</button>

        <nav className="explorer-address" aria-label="Address bar">
          {crumbs.map((c, i) => (
            <span key={c.path} className="explorer-crumb-wrap">
              {i > 0 && <span className="explorer-sep">›</span>}
              <button type="button" className="explorer-crumb" onClick={() => navigate(c.path)}>{c.label}</button>
            </span>
          ))}
        </nav>
      </div>

      <div className="explorer-body">
        {/* Sidebar */}
        <aside className="explorer-sidebar">
          {SIDEBAR_TREE.map(g => (
            <section key={g.label} className="explorer-group">
              <h4>{g.label}</h4>
              <ul>
                {g.items.map(item => (
                  <li key={item.path}>
                    <button type="button" className={currentPath === item.path ? 'active' : ''} onClick={() => navigate(item.path)}>
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </aside>

        {/* Main pane */}
        <main className="explorer-content">
          <div className="explorer-columns">
            <span>Name</span>
            <span>Date modified</span>
            <span>Type</span>
            <span>Size</span>
          </div>

          <div className="explorer-list" role="list">
            {isFile ? (
              /* File preview inside explorer */
              <div className="explorer-file-preview">
                {node.type === 'image' && (
                  <>
                    <img src={node.src} alt={node.name} className="explorer-preview-img" onClick={() => setLightbox(node)} />
                    <p className="explorer-preview-label">{node.name}</p>
                    <p className="explorer-preview-sub">{node.size}</p>
                  </>
                )}
                {node.type === 'audio' && (
                  <>
                    <img src="/win7icons/WMP12 Icons/WMP 12 1.ico" alt="" className="explorer-audio-icon" />
                    <p className="explorer-preview-label">{node.name}</p>
                    <p className="explorer-preview-sub">{node.artist} · {node.size}</p>
                    <audio controls src={node.src} className="explorer-audio-ctrl" />
                  </>
                )}
              </div>
            ) : children.length === 0 ? (
              <p className="explorer-empty">This folder is empty.</p>
            ) : (
              children.map(child => (
                <div
                  key={child.path}
                  className={`explorer-row${selected === child.path ? ' selected' : ''}`}
                  role="listitem"
                  onClick={() => setSelected(child.path)}
                  onDoubleClick={() => {
                    if (child.type === 'image') {
                      if (onAppOpen) onAppOpen('pics', { initialImageSrc: child.src })
                      else navigate(child.path)
                    } else if (child.type === 'audio') {
                      if (onAppOpen) onAppOpen('wmp', { initialTrackSrc: child.src })
                      else navigate(child.path)
                    } else {
                      navigate(child.path)
                    }
                  }}
                >
                  <span className="name">
                    <img src={TYPE_ICON[child.type] ?? TYPE_ICON.folder} alt="" className="explorer-row-icon" />
                    {child.name}
                  </span>
                  <span>{child.modified ?? ''}</span>
                  <span>{TYPE_LABEL[child.type] ?? ''}</span>
                  <span>{child.size ?? ''}</span>
                </div>
              ))
            )}
          </div>
        </main>
      </div>

      <div className="explorer-statusbar">
        <span>{isFile ? node.name : `${children.length} item(s)`}</span>
        {selected && !isFile && <span>{FS[selected]?.name}</span>}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="explorer-lightbox" onClick={() => setLightbox(null)}>
          <div className="explorer-lightbox-inner" onClick={e => e.stopPropagation()}>
            <img src={lightbox.src} alt={lightbox.name} />
            <div className="explorer-lightbox-bar">
              <span>{lightbox.name}</span>
              <button type="button" onClick={() => setLightbox(null)}>✕ Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
