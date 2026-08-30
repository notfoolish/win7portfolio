import { useEffect, useMemo, useRef, useState } from 'react'
import './CommandPrompt.css'

const VERSION = 'Microsoft Windows [Version 6.1.7601]'

const DIRECTORY_MAP = {
  'C:\\': {
    folders: ['Users', 'Windows', 'Games', 'Temp'],
    files: ['readme.txt'],
  },
  'C:\\Users': {
    folders: ['Guest', 'Public'],
    files: [],
  },
  'C:\\Users\\Guest': {
    folders: ['Documents', 'Desktop', 'Music'],
    files: ['notes.txt', 'todo.txt'],
  },
  'C:\\Users\\Guest\\Documents': {
    folders: [],
    files: ['welcome.txt', 'project-plan.txt'],
  },
  'C:\\Users\\Guest\\Desktop': {
    folders: [],
    files: ['shortcut.url'],
  },
  'C:\\Users\\Guest\\Music': {
    folders: [],
    files: ['midnight-drive.mp3', 'retro-pulse.mp3'],
  },
  'C:\\Windows': {
    folders: ['System32'],
    files: ['explorer.exe'],
  },
  'C:\\Windows\\System32': {
    folders: [],
    files: ['cmd.exe', 'notepad.exe'],
  },
  'C:\\Games': {
    folders: ['DOOM', 'ViceCity'],
    files: [],
  },
  'C:\\Games\\DOOM': {
    folders: [],
    files: ['doom.exe'],
  },
  'C:\\Games\\ViceCity': {
    folders: [],
    files: ['gta-vc.exe'],
  },
  'C:\\Temp': {
    folders: [],
    files: ['cache.tmp'],
  },
}

const FILE_CONTENTS = {
  'C:\\readme.txt': 'This is a Windows 7 style Command Prompt simulation.',
  'C:\\Users\\Guest\\notes.txt': 'Remember: ship Phase 2 apps with simulation-friendly features.',
  'C:\\Users\\Guest\\todo.txt': '- Notepad\n- Explorer\n- Media Player\n- CMD polish',
  'C:\\Users\\Guest\\Documents\\welcome.txt': 'Welcome to your virtual Documents folder.',
  'C:\\Users\\Guest\\Documents\\project-plan.txt': 'Phase 1: Responsive shell\nPhase 2: Functional apps\nPhase 3: polishing',
}

const THEMES = {
  default: { bg: '#0a0a0a', fg: '#d7d7d7' },
  green: { bg: '#06120b', fg: '#72ff98' },
  amber: { bg: '#140d05', fg: '#ffcc75' },
  cyan: { bg: '#061118', fg: '#8cecff' },
}

function normalizePath(input) {
  const cleaned = input.replace(/[\/]+/g, '\\').replace(/\\+$/, '')
  if (/^[a-zA-Z]:$/.test(cleaned)) return `${cleaned}\\`
  return cleaned || 'C:\\'
}

function resolvePath(cwd, targetRaw) {
  const target = targetRaw.trim()
  if (!target) return cwd
  if (target === '\\') return 'C:\\'
  if (/^[a-zA-Z]:\\/.test(target)) return normalizePath(target)

  const cwdParts = normalizePath(cwd).replace(/\\$/, '').split('\\')
  const segs = target.replace(/\//g, '\\').split('\\').filter(Boolean)
  for (const seg of segs) {
    if (seg === '.') continue
    if (seg === '..') {
      if (cwdParts.length > 1) cwdParts.pop()
      continue
    }
    cwdParts.push(seg)
  }
  return normalizePath(cwdParts.join('\\'))
}

function directoryExists(path) {
  return Object.prototype.hasOwnProperty.call(DIRECTORY_MAP, normalizePath(path))
}

function getPrompt(cwd) {
  return `${cwd}>`
}

function CommandPrompt() {
  const [cwd, setCwd] = useState('C:\\Users\\Guest')
  const [input, setInput] = useState('')
  const [history, setHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [lines, setLines] = useState([
    { type: 'system', text: VERSION },
    { type: 'system', text: '(c) Microsoft Corporation. All rights reserved.' },
    { type: 'system', text: '' },
    { type: 'system', text: 'Type HELP for available commands.' },
  ])
  const [theme, setTheme] = useState('default')
  const outRef = useRef(null)

  useEffect(() => {
    outRef.current?.scrollTo({ top: outRef.current.scrollHeight })
  }, [lines])

  const prompt = useMemo(() => getPrompt(cwd), [cwd])

  const pushOutput = (...newLines) => {
    setLines((prev) => [...prev, ...newLines])
  }

  const execute = (raw) => {
    const commandLine = raw.trim()
    pushOutput({ type: 'command', text: `${prompt} ${raw}` })
    if (!commandLine) return

    const [cmdRaw, ...args] = commandLine.split(' ')
    const cmd = cmdRaw.toLowerCase()
    const argText = args.join(' ').trim()

    if (cmd === 'cls') {
      setLines([])
      return
    }

    if (cmd === 'help') {
      pushOutput(
        { type: 'system', text: 'Available commands:' },
        { type: 'system', text: 'HELP  CLS  VER  DATE  TIME  ECHO  DIR  TREE  CD  TYPE  COLOR  CALC  SYSTEMINFO  WHOAMI  JOKE  ABOUT  LAUNCH' },
      )
      return
    }

    if (cmd === 'ver') {
      pushOutput({ type: 'system', text: VERSION })
      return
    }

    if (cmd === 'date') {
      pushOutput({ type: 'system', text: `Current date is ${new Date().toLocaleDateString('en-US')}` })
      return
    }

    if (cmd === 'time') {
      pushOutput({ type: 'system', text: `Current time is ${new Date().toLocaleTimeString('en-US')}` })
      return
    }

    if (cmd === 'echo') {
      pushOutput({ type: 'system', text: argText })
      return
    }

    if (cmd === 'whoami') {
      pushOutput({ type: 'system', text: 'win7os\\guest' })
      return
    }

    if (cmd === 'about') {
      pushOutput({ type: 'system', text: 'Windows 7 desktop simulation terminal. Not connected to your real system.' })
      return
    }

    if (cmd === 'joke') {
      pushOutput({ type: 'system', text: 'Why do developers confuse Halloween and Christmas? Because OCT 31 == DEC 25.' })
      return
    }

    if (cmd === 'systeminfo') {
      pushOutput(
        { type: 'system', text: 'Host Name:                 WIN7OS-SIM' },
        { type: 'system', text: 'OS Name:                   Microsoft Windows 7 Ultimate (Simulated)' },
        { type: 'system', text: 'OS Version:                6.1 Build 7601 Service Pack 1' },
        { type: 'system', text: 'System Type:               x64-based PC' },
      )
      return
    }

    if (cmd === 'color') {
      const key = (argText || 'default').toLowerCase()
      if (!THEMES[key]) {
        pushOutput({ type: 'error', text: `Theme "${key}" not found. Use: default, green, amber, cyan` })
        return
      }
      setTheme(key)
      pushOutput({ type: 'system', text: `Theme switched to ${key}.` })
      return
    }

    if (cmd === 'calc') {
      if (!argText) {
        pushOutput({ type: 'error', text: 'Usage: CALC <expression>' })
        return
      }
      if (!/^[0-9+\-*/().%\s]+$/.test(argText)) {
        pushOutput({ type: 'error', text: 'Only numeric expressions are allowed.' })
        return
      }
      try {
        const result = Function(`"use strict"; return (${argText})`)()
        pushOutput({ type: 'system', text: String(result) })
      } catch {
        pushOutput({ type: 'error', text: 'Invalid expression.' })
      }
      return
    }

    if (cmd === 'cd') {
      const nextPath = resolvePath(cwd, argText)
      if (!directoryExists(nextPath)) {
        pushOutput({ type: 'error', text: 'The system cannot find the path specified.' })
        return
      }
      setCwd(normalizePath(nextPath))
      return
    }

    if (cmd === 'dir' || cmd === 'ls') {
      const node = DIRECTORY_MAP[normalizePath(cwd)]
      if (!node) {
        pushOutput({ type: 'error', text: 'Directory not found.' })
        return
      }
      pushOutput({ type: 'system', text: ` Directory of ${cwd}` }, { type: 'system', text: '' })
      node.folders.forEach((folder) => pushOutput({ type: 'system', text: `08/24/2026  10:00 AM    <DIR>          ${folder}` }))
      node.files.forEach((file) => pushOutput({ type: 'system', text: `08/24/2026  10:00 AM                 ${file}` }))
      pushOutput({ type: 'system', text: '' }, { type: 'system', text: `               ${node.files.length} File(s)` }, { type: 'system', text: `               ${node.folders.length} Dir(s)` })
      return
    }

    if (cmd === 'tree') {
      const root = normalizePath(cwd)
      pushOutput({ type: 'system', text: `Folder PATH listing for ${root}` })
      const walk = (basePath, indent = '') => {
        const node = DIRECTORY_MAP[basePath]
        if (!node) return
        node.folders.forEach((folder, idx) => {
          const connector = idx === node.folders.length - 1 ? '└──' : '├──'
          pushOutput({ type: 'system', text: `${indent}${connector} ${folder}` })
          const next = normalizePath(`${basePath}\\${folder}`)
          walk(next, `${indent}${idx === node.folders.length - 1 ? '    ' : '│   '}`)
        })
      }
      walk(root)
      return
    }

    if (cmd === 'type') {
      if (!argText) {
        pushOutput({ type: 'error', text: 'Usage: TYPE <file>' })
        return
      }
      const full = normalizePath(resolvePath(cwd, argText))
      const content = FILE_CONTENTS[full]
      if (!content) {
        pushOutput({ type: 'error', text: 'The system cannot find the file specified.' })
        return
      }
      content.split('\n').forEach((line) => pushOutput({ type: 'system', text: line }))
      return
    }

    if (cmd === 'launch') {
      const target = argText.toLowerCase()
      const accepted = ['notepad', 'paint', 'explorer', 'wmp', 'doom', 'vicecity']
      if (!accepted.includes(target)) {
        pushOutput({ type: 'error', text: `Cannot launch "${argText}". Allowed: ${accepted.join(', ')}` })
        return
      }
      pushOutput({ type: 'system', text: `Launching ${target}... (simulation only)` })
      return
    }

    pushOutput({ type: 'error', text: `'${cmdRaw}' is not recognized as an internal or external command.` })
  }

  const onSubmit = (e) => {
    e.preventDefault()
    execute(input)
    if (input.trim()) {
      setHistory((prev) => [input, ...prev])
    }
    setHistoryIndex(-1)
    setInput('')
  }

  const onInputKeyDown = (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      const next = Math.min(historyIndex + 1, history.length - 1)
      if (next >= 0) {
        setHistoryIndex(next)
        setInput(history[next])
      }
      return
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
    <div className="cmd-app" style={{ '--cmd-bg': THEMES[theme].bg, '--cmd-fg': THEMES[theme].fg }}>
      <div className="cmd-output" ref={outRef}>
        {lines.map((line, i) => (
          <div key={`${line.text}-${i}`} className={`cmd-line ${line.type}`}>
            {line.text}
          </div>
        ))}
        <form onSubmit={onSubmit} className="cmd-input-row">
          <span className="cmd-prompt">{prompt}</span>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onInputKeyDown}
            className="cmd-input"
            autoFocus
            spellCheck={false}
            aria-label="Command Prompt input"
          />
        </form>
      </div>
    </div>
  )
}

export default CommandPrompt
