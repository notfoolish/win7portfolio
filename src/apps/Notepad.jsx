import { useMemo, useRef, useState } from 'react'
import './Notepad.css'

const SAMPLE_TEXT = `Welcome to Notepad (Simulation)\n\nThis app behaves like classic Windows text editing:\n- Type freely\n- Toggle Word Wrap\n- Save as .txt\n\nTip: You can paste content here and download it as a text file.`

function getCursorMeta(text, index) {
  const safe = Math.max(0, Math.min(index, text.length))
  const before = text.slice(0, safe)
  const lines = before.split('\n')
  const line = lines.length
  const col = (lines.at(-1)?.length ?? 0) + 1
  return { line, col }
}

function downloadTextFile(content) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  a.href = url
  a.download = `note-${stamp}.txt`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function Notepad() {
  const [text, setText] = useState('')
  const [wordWrap, setWordWrap] = useState(true)
  const [status, setStatus] = useState('Ready')
  const [cursor, setCursor] = useState({ line: 1, col: 1 })
  const [findValue, setFindValue] = useState('')
  const [replaceValue, setReplaceValue] = useState('')
  const editorRef = useRef(null)

  const stats = useMemo(() => {
    const chars = text.length
    const words = text.trim() ? text.trim().split(/\s+/).length : 0
    return { chars, words }
  }, [text])

  const updateCursor = () => {
    const editor = editorRef.current
    if (!editor) return
    const meta = getCursorMeta(text, editor.selectionStart ?? 0)
    setCursor(meta)
  }

  const handleNew = () => {
    setText('')
    setStatus('New document created')
    setTimeout(() => editorRef.current?.focus(), 0)
  }

  const handleOpenSample = () => {
    const base = SAMPLE_TEXT.startsWith('.LOG') ? SAMPLE_TEXT : `.LOG\n${SAMPLE_TEXT}`
    const withStamp = `${base}\n${new Date().toLocaleString('en-US')}`
    setText(withStamp)
    setStatus('Sample text opened')
    setTimeout(() => editorRef.current?.focus(), 0)
  }

  const handleSave = () => {
    downloadTextFile(text)
    setStatus('Saved as .txt')
  }

  const handleSelectAll = () => {
    const editor = editorRef.current
    if (!editor) return
    editor.focus()
    editor.select()
    setStatus('Selected all text')
  }

  const handleInsertDateTime = () => {
    const editor = editorRef.current
    const stamp = new Date().toLocaleString('en-US')
    if (!editor) {
      setText((prev) => prev + stamp)
      return
    }
    const start = editor.selectionStart ?? 0
    const end = editor.selectionEnd ?? 0
    const next = `${text.slice(0, start)}${stamp}${text.slice(end)}`
    setText(next)
    setStatus('Inserted date/time')
    requestAnimationFrame(() => {
      editor.focus()
      const caret = start + stamp.length
      editor.setSelectionRange(caret, caret)
      setCursor(getCursorMeta(next, caret))
    })
  }

  const handleFindNext = () => {
    const editor = editorRef.current
    if (!editor || !findValue.trim()) return
    const q = findValue.toLowerCase()
    const start = (editor.selectionEnd ?? 0)
    const fromCursor = text.toLowerCase().indexOf(q, start)
    const idx = fromCursor >= 0 ? fromCursor : text.toLowerCase().indexOf(q)
    if (idx < 0) {
      setStatus('Text not found')
      return
    }
    editor.focus()
    editor.setSelectionRange(idx, idx + findValue.length)
    setCursor(getCursorMeta(text, idx))
    setStatus(`Found at Ln ${getCursorMeta(text, idx).line}`)
  }

  const handleReplace = () => {
    const editor = editorRef.current
    if (!editor || !findValue) return
    const start = editor.selectionStart ?? 0
    const end = editor.selectionEnd ?? 0
    const selectedText = text.slice(start, end)
    if (selectedText.toLowerCase() === findValue.toLowerCase()) {
      const next = `${text.slice(0, start)}${replaceValue}${text.slice(end)}`
      setText(next)
      const caret = start + replaceValue.length
      requestAnimationFrame(() => {
        editor.focus()
        editor.setSelectionRange(caret, caret)
        setCursor(getCursorMeta(next, caret))
      })
      setStatus('Replaced current match')
      return
    }
    handleFindNext()
  }

  const handleReplaceAll = () => {
    if (!findValue) return
    const escaped = findValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(escaped, 'gi')
    const matches = text.match(regex)?.length ?? 0
    if (!matches) {
      setStatus('No matches to replace')
      return
    }
    setText((prev) => prev.replace(regex, replaceValue))
    setStatus(`Replaced ${matches} occurrence(s)`)
  }

  return (
    <div className="notepad-app">
      <div className="notepad-menubar" role="menubar" aria-label="Notepad menu">
        <div className="notepad-menu-group">
          <button type="button" onClick={handleNew}>File ▾</button>
          <button type="button" onClick={handleSave}>Save</button>
          <button type="button" onClick={handleOpenSample}>Open sample</button>
        </div>
        <div className="notepad-menu-group">
          <button type="button" onClick={handleSelectAll}>Select all</button>
          <button type="button" onClick={handleInsertDateTime}>Time/Date</button>
          <button type="button" onClick={() => setWordWrap((v) => !v)}>
            {wordWrap ? 'Word Wrap ✓' : 'Word Wrap'}
          </button>
        </div>
      </div>

      <div className="notepad-findbar">
        <input
          type="text"
          value={findValue}
          placeholder="Find"
          onChange={(e) => setFindValue(e.target.value)}
          aria-label="Find text"
        />
        <input
          type="text"
          value={replaceValue}
          placeholder="Replace"
          onChange={(e) => setReplaceValue(e.target.value)}
          aria-label="Replace text"
        />
        <button type="button" onClick={handleFindNext}>Find next</button>
        <button type="button" onClick={handleReplace}>Replace</button>
        <button type="button" onClick={handleReplaceAll}>Replace all</button>
      </div>

      <div className="notepad-editor-wrap">
        <textarea
          ref={editorRef}
          className="notepad-editor"
          value={text}
          onChange={(e) => {
            setText(e.target.value)
            setStatus('Editing...')
          }}
          onKeyUp={updateCursor}
          onClick={updateCursor}
          onSelect={updateCursor}
          spellCheck={false}
          style={{ whiteSpace: wordWrap ? 'pre-wrap' : 'pre' }}
          aria-label="Notepad editor"
        />
      </div>

      <div className="notepad-statusbar">
        <span>{status}</span>
        <span>Words: {stats.words}</span>
        <span>Chars: {stats.chars}</span>
        <span>
          Ln {cursor.line}, Col {cursor.col}
        </span>
      </div>
    </div>
  )
}

export default Notepad
