import { useMemo, useState } from 'react'
import './HelpAndSupport.css'

const ARTICLES = [
  {
    id: 'start-menu',
    category: 'Getting Started',
    title: 'Use the Start menu efficiently',
    body: 'Open Start, use Search Programs, and pin frequently used applications to your taskbar for faster access.',
  },
  {
    id: 'windows',
    category: 'Desktop',
    title: 'Manage open windows',
    body: 'Click taskbar items to minimize/restore. Use Show Desktop to quickly hide all windows.',
  },
  {
    id: 'cmd',
    category: 'Apps',
    title: 'Command Prompt simulation commands',
    body: 'Try HELP, DIR, TREE, TYPE, COLOR and CALC for useful terminal-style functionality.',
  },
  {
    id: 'media',
    category: 'Apps',
    title: 'Play media in Windows Media Player',
    body: 'Switch between Now Playing and Library tabs, then use the transport controls at the bottom.',
  },
  {
    id: 'responsive',
    category: 'Troubleshooting',
    title: 'Layout on small screens',
    body: 'On mobile widths, windows maximize automatically and the Start menu expands to fill available height.',
  },
]

function HelpAndSupport() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [activeId, setActiveId] = useState(ARTICLES[0].id)

  const categories = ['All', ...new Set(ARTICLES.map((a) => a.category))]

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    return ARTICLES.filter((a) => {
      const catOk = category === 'All' || a.category === category
      const qOk = !q || a.title.toLowerCase().includes(q) || a.body.toLowerCase().includes(q)
      return catOk && qOk
    })
  }, [query, category])

  const active = ARTICLES.find((a) => a.id === activeId) || results[0] || null

  return (
    <div className="help-app">
      <div className="help-top">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Help"
          aria-label="Search Help"
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="help-layout">
        <div className="help-list" role="list">
          {results.map((article) => (
            <button
              key={article.id}
              type="button"
              role="listitem"
              className={active?.id === article.id ? 'active' : ''}
              onClick={() => setActiveId(article.id)}
            >
              <strong>{article.title}</strong>
              <span>{article.category}</span>
            </button>
          ))}
          {results.length === 0 && <div className="help-empty">No matching topics.</div>}
        </div>

        <article className="help-article">
          {active ? (
            <>
              <h3>{active.title}</h3>
              <small>{active.category}</small>
              <p>{active.body}</p>
            </>
          ) : (
            <p>Select a topic to view details.</p>
          )}
        </article>
      </div>
    </div>
  )
}

export default HelpAndSupport
