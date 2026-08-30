import { useRef, useState } from 'react'
import './WordPad.css'

const TEMPLATES = {
  blank: '',
  letter: `<h2>Letter Template</h2><p><strong>Date:</strong> ${new Date().toLocaleDateString('en-US')}</p><p>Dear Name,</p><p>Thank you for your time. This is a sample WordPad-style letter inside the simulation.</p><p>Sincerely,<br/>Your Name</p>`,
  notes: '<h2>Meeting Notes</h2><ul><li>Agenda</li><li>Decisions</li><li>Action items</li></ul>',
}

function download(content, ext, mime) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `wordpad-${Date.now()}.${ext}`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function WordPad() {
  const editorRef = useRef(null)
  const [fontSize, setFontSize] = useState('3')
  const [fontFamily, setFontFamily] = useState('Calibri')
  const [fontColor, setFontColor] = useState('#1d1d1d')
  const [status, setStatus] = useState('Ready')

  const exec = (command, value = null) => {
    editorRef.current?.focus()
    document.execCommand(command, false, value)
    setStatus(`Applied: ${command}`)
  }

  const setTemplate = (key) => {
    if (!editorRef.current) return
    editorRef.current.innerHTML = TEMPLATES[key]
    setStatus(`Loaded template: ${key}`)
  }

  const saveHtml = () => {
    const html = editorRef.current?.innerHTML ?? ''
    download(html, 'html', 'text/html;charset=utf-8')
    setStatus('Saved as HTML')
  }

  const saveText = () => {
    const text = editorRef.current?.innerText ?? ''
    download(text, 'txt', 'text/plain;charset=utf-8')
    setStatus('Saved as TXT')
  }

  return (
    <div className="wordpad-app">
      <div className="wordpad-ribbon">
        <div className="wordpad-group">
          <button type="button" onClick={() => setTemplate('blank')}>New</button>
          <button type="button" onClick={() => setTemplate('letter')}>Letter</button>
          <button type="button" onClick={() => setTemplate('notes')}>Notes</button>
          <button type="button" onClick={saveHtml}>Save HTML</button>
          <button type="button" onClick={saveText}>Save TXT</button>
        </div>

        <div className="wordpad-group">
          <button type="button" onClick={() => exec('bold')}><strong>B</strong></button>
          <button type="button" onClick={() => exec('italic')}><em>I</em></button>
          <button type="button" onClick={() => exec('underline')}><u>U</u></button>
          <button type="button" onClick={() => exec('insertUnorderedList')}>• List</button>
          <button type="button" onClick={() => exec('insertOrderedList')}>1. List</button>
          <button type="button" onClick={() => exec('justifyLeft')}>Left</button>
          <button type="button" onClick={() => exec('justifyCenter')}>Center</button>
          <button type="button" onClick={() => exec('justifyRight')}>Right</button>
          <button type="button" onClick={() => exec('removeFormat')}>Clear format</button>
          <button type="button" onClick={() => exec('undo')}>Undo</button>
          <button type="button" onClick={() => exec('redo')}>Redo</button>
          <select
            value={fontSize}
            onChange={(e) => {
              setFontSize(e.target.value)
              exec('fontSize', e.target.value)
            }}
            aria-label="Font size"
          >
            <option value="2">Small</option>
            <option value="3">Normal</option>
            <option value="4">Large</option>
            <option value="5">XL</option>
          </select>
          <select
            value={fontFamily}
            onChange={(e) => {
              setFontFamily(e.target.value)
              exec('fontName', e.target.value)
            }}
            aria-label="Font family"
          >
            <option value="Calibri">Calibri</option>
            <option value="Arial">Arial</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Consolas">Consolas</option>
          </select>
          <label className="wordpad-color-picker">
            Text color
            <input
              type="color"
              value={fontColor}
              onChange={(e) => {
                setFontColor(e.target.value)
                exec('foreColor', e.target.value)
              }}
              aria-label="Text color"
            />
          </label>
        </div>
      </div>

      <div className="wordpad-page-wrap">
        <article
          ref={editorRef}
          className="wordpad-page"
          contentEditable
          suppressContentEditableWarning
          spellCheck={false}
        />
      </div>

      <div className="wordpad-status">{status}</div>
    </div>
  )
}

export default WordPad
