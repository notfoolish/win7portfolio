import { useEffect, useMemo, useRef, useState } from 'react'
import './PowerShell.css'

const LOCATIONS = {
  'C:\\': ['Users', 'Windows', 'Games', 'Temp'],
  'C:\\Users': ['Guest', 'Public'],
  'C:\\Users\\Guest': ['Documents', 'Desktop', 'Music'],
  'C:\\Users\\Guest\\Documents': [],
  'C:\\Users\\Guest\\Desktop': [],
  'C:\\Users\\Guest\\Music': [],
  'C:\\Windows': ['System32'],
  'C:\\Games': ['DOOM', 'ViceCity'],
}

const ALIASES = {
  dir: 'Get-ChildItem',
  ls: 'Get-ChildItem',
  pwd: 'Get-Location',
  cd: 'Set-Location',
  cls: 'Clear-Host',
  cat: 'Get-Content',
}

const FILES = {
  'C:\\Users\\Guest\\Documents\\todo.txt': '- Improve responsiveness\n- Fill app placeholders\n- Polish simulation UX',
  'C:\\Users\\Guest\\Documents\\about.txt': 'This is a PowerShell simulation running inside the Win7 desktop project.',
}

function pathExists(path) {
  return Object.prototype.hasOwnProperty.call(LOCATIONS, path)
}

function normalizePath(input) {
  const cleaned = input.replace(/[\/]+/g, '\\').replace(/\\+$/, '')
  if (/^[a-zA-Z]:$/.test(cleaned)) return `${cleaned}\\`
  return cleaned || 'C:\\'
}

function resolvePath(cwd, target) {
  if (!target || target === '.') return cwd
  if (/^[a-zA-Z]:\\/.test(target)) return normalizePath(target)
  const cwdParts = normalizePath(cwd).replace(/\\$/, '').split('\\')
  const segs = target.replace(/\//g, '\\').split('\\').filter(Boolean)
  for (const seg of segs) {
    if (seg === '..') {
      if (cwdParts.length > 1) cwdParts.pop()
      continue
    }
    if (seg !== '.') cwdParts.push(seg)
  }
  return normalizePath(cwdParts.join('\\'))
}

function psPrompt(cwd) {
  return `PS ${cwd}>`
}

function PowerShell() {
  const [cwd, setCwd] = useState('C:\\Users\\Guest')
  const [input, setInput] = useState('')
  const [entries, setEntries] = useState([
    { type: 'system', text: 'Windows PowerShell' },
    { type: 'system', text: 'Copyright (C) Microsoft Corporation. All rights reserved.' },
    { type: 'system', text: 'Type Get-Help for command help.' },
  ])
  const [history, setHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const outRef = useRef(null)

  const prompt = useMemo(() => psPrompt(cwd), [cwd])

  useEffect(() => {
    outRef.current?.scrollTo({ top: outRef.current.scrollHeight })
  }, [entries])

  const push = (...lines) => setEntries((prev) => [...prev, ...lines])

  const runCommand = (raw) => {
    push({ type: 'command', text: `${prompt} ${raw}` })
    const parts = raw.trim().split(/\s+/)
    if (!parts[0]) return
    const name = ALIASES[parts[0].toLowerCase()] ?? parts[0]
    const args = parts.slice(1)
    const lowerName = name.toLowerCase()

    if (lowerName === 'clear-host') {
      setEntries([])
      return
    }

    if (lowerName === 'get-help') {
      push(
        { type: 'system', text: 'Available commands:' },
        { type: 'system', text: 'Get-Help, Get-ChildItem, Get-Location, Set-Location, Get-Date, Get-Random, Get-Process, Get-Content, New-Note, Invoke-Tip, Clear-Host' },
      )
      return
    }

    if (lowerName === 'get-location') {
      push({ type: 'table', text: `Path\n----\n${cwd}` })
      return
    }

    if (lowerName === 'set-location') {
      const target = args.join(' ')
      const next = resolvePath(cwd, target || 'C:\\')
      if (!pathExists(next)) {
        push({ type: 'error', text: `Set-Location : Cannot find path '${target}' because it does not exist.` })
        return
      }
      setCwd(next)
      return
    }

    if (lowerName === 'get-childitem') {
      const items = LOCATIONS[cwd] ?? []
      push({ type: 'table', text: 'Mode   LastWriteTime       Length Name\n----   -------------       ------ ----' })
      items.forEach((item) => push({ type: 'table', text: `d----- 8/24/2026  10:00 AM        ${item}` }))
      if (cwd === 'C:\\Users\\Guest\\Documents') {
        push({ type: 'table', text: 'a----  8/24/2026  10:01 AM     120 todo.txt' })
        push({ type: 'table', text: 'a----  8/24/2026  10:01 AM      98 about.txt' })
      }
      return
    }

    if (lowerName === 'get-date') {
      push({ type: 'system', text: new Date().toString() })
      return
    }

    if (lowerName === 'get-random') {
      const max = Number(args[args.indexOf('-Maximum') + 1])
      const min = Number(args[args.indexOf('-Minimum') + 1])
      const lo = Number.isFinite(min) ? min : 0
      const hi = Number.isFinite(max) ? max : 100
      const value = Math.floor(Math.random() * (hi - lo)) + lo
      push({ type: 'system', text: String(value) })
      return
    }

    if (lowerName === 'get-process') {
      push(
        { type: 'table', text: 'Handles NPM(K) PM(M) WS(M) CPU(s)   Id ProcessName' },
        { type: 'table', text: '-----   ------ ----- ----- ------   -- -----------' },
        { type: 'table', text: '  112      18   42    61   1.20  1224 explorer' },
        { type: 'table', text: '   74      12   28    39   0.44  2048 powershell' },
        { type: 'table', text: '   89      15   36    52   0.93  3312 chrome' },
      )
      return
    }

    if (lowerName === 'get-content') {
      const fileArg = args.join(' ')
      if (!fileArg) {
        push({ type: 'error', text: 'Get-Content : Missing file path.' })
        return
      }
      const full = normalizePath(resolvePath(cwd, fileArg))
      const content = FILES[full]
      if (!content) {
        push({ type: 'error', text: `Get-Content : Cannot find path '${fileArg}' because it does not exist.` })
        return
      }
      content.split('\n').forEach((line) => push({ type: 'system', text: line }))
      return
    }

    if (lowerName === 'new-note') {
      const msg = args.join(' ') || 'Quick note created.'
      push({ type: 'system', text: `Note saved: ${msg}` })
      return
    }

    if (lowerName === 'invoke-tip') {
      const tips = [
        'Use Set-Location .. to go up one folder.',
        'Try Get-ChildItem to inspect a folder.',
        'Use aliases: dir, ls, cd, cls.',
      ]
      push({ type: 'system', text: tips[Math.floor(Math.random() * tips.length)] })
      return
    }

    push({ type: 'error', text: `${name} : The term '${name}' is not recognized as the name of a cmdlet.` })
  }

  const onSubmit = (e) => {
    e.preventDefault()
    runCommand(input)
    if (input.trim()) setHistory((prev) => [input, ...prev])
    setInput('')
    setHistoryIndex(-1)
  }

  const onKeyDown = (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      const next = Math.min(historyIndex + 1, history.length - 1)
      if (next >= 0) {
        setHistoryIndex(next)
        setInput(history[next])
      }
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      const next = historyIndex - 1
      if (next < 0) {
        setHistoryIndex(-1)
        setInput('')
      } else {
        setHistoryIndex(next)
        setInput(history[next])
      }
    }
  }

  return (
    <div className="pshell-app">
      <div className="pshell-output" ref={outRef}>
        {entries.map((entry, idx) => (
          <div key={`${entry.text}-${idx}`} className={`pshell-line ${entry.type}`}>
            {entry.text}
          </div>
        ))}

        <form onSubmit={onSubmit} className="pshell-input-row">
          <span className="pshell-prompt">{prompt}</span>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            className="pshell-input"
            spellCheck={false}
            autoFocus
            aria-label="PowerShell input"
          />
        </form>
      </div>
    </div>
  )
}

export default PowerShell
