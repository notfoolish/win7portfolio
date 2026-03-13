import { useEffect, useMemo, useState } from 'react'
import './InternetExplorer.css'

const HOME_URL = '/about-me.html'

function toUrl(input) {
  const raw = input.trim()
  if (!raw) return HOME_URL

  if (raw.startsWith('/')) return raw

  if (/^https?:\/\//i.test(raw)) return raw

  if (/^[\w-]+(\.[\w-]+)+(\/.*)?$/i.test(raw)) return `https://${raw}`

  return `https://www.bing.com/search?q=${encodeURIComponent(raw)}`
}

function InternetExplorer() {
  const [history, setHistory] = useState([HOME_URL])
  const [index, setIndex] = useState(0)
  const [input, setInput] = useState(HOME_URL)
  const [loading, setLoading] = useState(true)
  const [reloadTick, setReloadTick] = useState(0)
  const [embedBlockedHint, setEmbedBlockedHint] = useState(false)

  const currentUrl = useMemo(() => history[index] || HOME_URL, [history, index])

  useEffect(() => {
    if (!loading) return
    setEmbedBlockedHint(false)
    const t = setTimeout(() => setEmbedBlockedHint(true), 3500)
    return () => clearTimeout(t)
  }, [loading, currentUrl, reloadTick])

  const navigate = (nextRaw) => {
    const next = toUrl(nextRaw)
    
    if (history[index] === next) {
      setInput(next)
      return
    }

    setLoading(true)
    setEmbedBlockedHint(false)
    const cut = history.slice(0, index + 1)
    const nextHistory = [...cut, next]
    setHistory(nextHistory)
    setIndex(nextHistory.length - 1)
    setInput(next)
  }

  const goBack = () => {
    if (index <= 0) return
    setLoading(true)
    setEmbedBlockedHint(false)
    setIndex(i => i - 1)
    setInput(history[index - 1])
  }

  const goForward = () => {
    if (index >= history.length - 1) return
    setLoading(true)
    setEmbedBlockedHint(false)
    setIndex(i => i + 1)
    setInput(history[index + 1])
  }

  const refresh = () => {
    setLoading(true)
    setEmbedBlockedHint(false)
    setReloadTick(v => v + 1)
  }

  const goHome = () => navigate(HOME_URL)

  return (
    <div className="ie-app">
      <div className="ie-toolbar">
        <button className="ie-btn" onClick={goBack} disabled={index <= 0}>◀</button>
        <button className="ie-btn" onClick={goForward} disabled={index >= history.length - 1}>▶</button>
        <button className="ie-btn" onClick={refresh}>↻</button>
        <button className="ie-btn" onClick={goHome}>Home</button>

        <form
          className="ie-address-form"
          onSubmit={(e) => {
            e.preventDefault()
            navigate(input)
          }}
        >
          <span className="ie-address-label">Address</span>
          <input
            className="ie-address-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a URL or search term"
          />
          <button className="ie-go-btn" type="submit">Go</button>
        </form>
      </div>

      <div className="ie-status">{loading ? 'Loading...' : currentUrl}</div>

      <div className="ie-view">
        <iframe
          key={`${currentUrl}__${reloadTick}`}
          title="Internet Explorer"
          src={currentUrl}
          className="ie-iframe"
          onLoad={() => {
            setLoading(false)
            setEmbedBlockedHint(false)
            setInput(currentUrl)
          }}
        />
        {embedBlockedHint && (
          <div className="ie-fallback">
            <div className="ie-fallback-title">This site may block in-app viewing.</div>
            <div className="ie-fallback-actions">
              <button
                className="ie-go-btn"
                onClick={() => window.open(currentUrl, '_blank', 'noopener,noreferrer')}
              >
                Open in New Tab
              </button>
              <button
                className="ie-go-btn"
                onClick={() => {
                  setEmbedBlockedHint(false)
                  setLoading(true)
                  setReloadTick(v => v + 1)
                }}
              >
                Retry Here
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="ie-note">
        Tip: pages blocked by iframe policies can still be opened with “Open in New Tab”.
      </div>
    </div>
  )
}

export default InternetExplorer
