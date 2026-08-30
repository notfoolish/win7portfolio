import { useMemo, useState } from 'react'
import './Documents.css'

const DOC_ICON = '/win7icons/Libraries/imageres_1002.ico'
const TEXT_ICON = '/win7icons/Filetypes, Devices, Miscellaneous/imageres_102.ico'

const DOCS = [
  { title: 'Project Proposal.doc', type: 'Word Document', modified: '08/22/2026', size: '148 KB', text: 'Initial project scope, milestones, and target outcomes.' },
  { title: 'Meeting Notes.txt', type: 'Text Document', modified: '08/24/2026', size: '6 KB', text: 'Action items:\n- Finalize responsive behavior\n- Populate placeholder applications\n- QA pass' },
  { title: 'Budget Q3.xlsx', type: 'Spreadsheet', modified: '08/17/2026', size: '91 KB', text: 'Revenue, costs, and projection summary for Q3.' },
  { title: 'Release Checklist.pdf', type: 'PDF Document', modified: '08/20/2026', size: '220 KB', text: 'Pre-release checks, approvals, and deployment notes.' },
  { title: 'Design Review.md', type: 'Markdown', modified: '08/19/2026', size: '14 KB', text: 'Component consistency, spacing scale, and typography audit.' },
]

function Documents() {
  const [docs, setDocs] = useState(DOCS)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('modified')
  const [selected, setSelected] = useState(DOCS[0])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const list = q
      ? docs.filter((doc) => doc.title.toLowerCase().includes(q) || doc.type.toLowerCase().includes(q))
      : [...docs]

    if (sortBy === 'name') list.sort((a, b) => a.title.localeCompare(b.title))
    if (sortBy === 'size') list.sort((a, b) => parseFloat(a.size) - parseFloat(b.size))
    if (sortBy === 'modified') list.sort((a, b) => b.modified.localeCompare(a.modified))
    return list
  }, [docs, search, sortBy])

  const createDoc = () => {
    const next = {
      title: `New Document ${docs.length + 1}.txt`,
      type: 'Text Document',
      modified: new Date().toLocaleDateString('en-US'),
      size: '1 KB',
      text: 'New document created in simulation mode.',
    }
    setDocs((prev) => [next, ...prev])
    setSelected(next)
  }

  const removeDoc = () => {
    if (!selected) return
    setDocs((prev) => prev.filter((d) => d.title !== selected.title))
    setSelected(null)
  }

  return (
    <div className="docs-app">
      <div className="docs-toolbar">
        <button type="button" onClick={createDoc}>New document</button>
        <button type="button" onClick={removeDoc} disabled={!selected}>Delete</button>
        <input
          className="docs-search"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search documents"
        />
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} aria-label="Sort documents">
          <option value="modified">Sort by modified</option>
          <option value="name">Sort by name</option>
          <option value="size">Sort by size</option>
        </select>
      </div>

      <div className="docs-body">
        <div className="docs-list" role="list">
          {filtered.map((doc) => (
            <button
              key={doc.title}
              type="button"
              role="listitem"
              className={`docs-row${selected?.title === doc.title ? ' active' : ''}`}
              onClick={() => setSelected(doc)}
            >
              <span className="docs-title"><img src={TEXT_ICON} alt="" /> {doc.title}</span>
              <span>{doc.modified}</span>
              <span>{doc.size}</span>
            </button>
          ))}
          {filtered.length === 0 && <div className="docs-empty">No documents found.</div>}
        </div>

        <aside className="docs-preview">
          {selected ? (
            <>
              <h3><img src={DOC_ICON} alt="" /> {selected.title}</h3>
              <p><strong>Type:</strong> {selected.type}</p>
              <p><strong>Modified:</strong> {selected.modified}</p>
              <p><strong>Size:</strong> {selected.size}</p>
              <div className="docs-preview-text">{selected.text}</div>
            </>
          ) : (
            <p>Select a document to preview.</p>
          )}
        </aside>
      </div>
    </div>
  )
}

export default Documents
