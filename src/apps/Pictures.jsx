import { useMemo, useState } from 'react'
import './Pictures.css'

const PICTURES = [
  { id: 1, name: 'Hydrangea',           tag: 'Nature',    date: '08/10/2026', src: '/image/sample_pictures/3416995839_9624feb2d0_b.jpg' },
  { id: 2, name: 'Jellyfish',           tag: 'Wildlife',  date: '08/10/2026', src: '/image/sample_pictures/3416996653_3af1c5b90c_b.jpg' },
  { id: 3, name: 'Lighthouse',          tag: 'Landscape', date: '08/10/2026', src: '/image/sample_pictures/3416998011_c0361ce51c_b.jpg' },
  { id: 4, name: 'Emperor Penguins',    tag: 'Wildlife',  date: '08/10/2026', src: '/image/sample_pictures/3416998869_f68bc9df34_b.jpg' },
  { id: 5, name: 'Tulips',             tag: 'Nature',    date: '08/10/2026', src: '/image/sample_pictures/3417000415_cde41c5b65_b.jpg' },
  { id: 6, name: 'Chrysanthemum',       tag: 'Nature',    date: '08/11/2026', src: '/image/sample_pictures/3417801308_0a1104d840_c.jpg' },
  { id: 7, name: 'Monument Valley',     tag: 'Landscape', date: '08/11/2026', src: '/image/sample_pictures/3417802188_201981a6ec_b.jpg' },
  { id: 8, name: 'Koala',              tag: 'Wildlife',  date: '08/11/2026', src: '/image/sample_pictures/3417804404_2279da5b66_b.jpg' },
]

function Pictures({ initialImageSrc }) {
  const [query, setQuery] = useState('')
  const [tag, setTag] = useState('All')
  const startPic = initialImageSrc ? PICTURES.find(p => p.src === initialImageSrc) : null
  const [activeId, setActiveId] = useState(startPic?.id ?? null)
  const [view, setView] = useState('thumbnails')

  const tags = ['All', ...new Set(PICTURES.map((p) => p.tag))]

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return PICTURES.filter((p) => {
      const matchesTag = tag === 'All' || p.tag === tag
      const matchesQ = !q || p.name.toLowerCase().includes(q) || p.tag.toLowerCase().includes(q)
      return matchesTag && matchesQ
    })
  }, [query, tag])

  const active = PICTURES.find((p) => p.id === activeId) ?? null

  return (
    <div className="pics-app">
      <div className="pics-toolbar">
        <input
          type="text"
          placeholder="Search pictures"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select value={view} onChange={(e) => setView(e.target.value)} aria-label="View mode">
          <option value="thumbnails">Thumbnails</option>
          <option value="details">Details</option>
        </select>
        <div className="pics-tags">
          {tags.map((t) => (
            <button
              key={t}
              type="button"
              className={tag === t ? 'active' : ''}
              onClick={() => setTag(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className={`pics-grid ${view === 'details' ? 'details' : ''}`} role="list">
        {filtered.map((pic) => (
          <button key={pic.id} type="button" role="listitem" className="pics-card" onClick={() => setActiveId(pic.id)}>
            <div className="pics-thumb">
              <img src={pic.src} alt={pic.name} className="pics-thumb-img" />
            </div>
            <div className="pics-meta">
              <strong>{pic.name}</strong>
              <span>{pic.tag} · {pic.date}</span>
            </div>
          </button>
        ))}
      </div>

      {active && (
        <div className="pics-lightbox" role="dialog" aria-label="Picture preview" onClick={() => setActiveId(null)}>
          <div className="pics-lightbox-card" onClick={(e) => e.stopPropagation()}>
            <div className="pics-lightbox-image">
              <img src={active.src} alt={active.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <h3>{active.name}</h3>
            <p>{active.tag} · {active.date}</p>
            <button type="button" onClick={() => setActiveId(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Pictures
