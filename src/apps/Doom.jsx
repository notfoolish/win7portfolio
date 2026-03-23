import { useEffect, useRef, useState } from 'react'
import './Doom.css'

const DOOM_ZIP_URL = '/games/doom.jsdos'

function Doom() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const dosboxHostRef = useRef(null)
  const playerRef = useRef(null)

  useEffect(() => {
    const boot = async () => {
      setLoading(true)
      setError('')

      try {
        const root = dosboxHostRef.current
        if (!root) return
        if (!window.Dos) {
          throw new Error('js-dos runtime is missing. Check /public/js-dos files.')
        }

        if (window.emulators) {
          window.emulators.pathPrefix = '/js-dos/emulators/'
        }

        const player = window.Dos(root, {
          url: DOOM_ZIP_URL,
          pathPrefix: '/js-dos/emulators/',
          autoStart: true,
          kiosk: true,
        })
        playerRef.current = player
        setLoading(false)
      } catch (e) {
        const msg = e?.message || 'Unable to start DOOM in-app.'
        setError(`${msg} This zip must be a js-dos bundle.`)
        setLoading(false)
      }
    }

    boot()

    return () => {
      try {
        playerRef.current?.stop?.()
      } catch {
        // noop
      }

      if (dosboxHostRef.current) {
        dosboxHostRef.current.innerHTML = ''
      }
    }
  }, [])

  useEffect(() => {
    const onMaximizeChanged = (event) => {
      const detail = event?.detail
      if (!detail || detail.title !== 'DOOM') return
      playerRef.current?.setFullScreen?.(Boolean(detail.maximized))
    }

    window.addEventListener('win7-window-maximize-changed', onMaximizeChanged)
    return () => window.removeEventListener('win7-window-maximize-changed', onMaximizeChanged)
  }, [])

  return (
    <div className="doom-app">
      <div className="doom-stage">
        <div id="doom-dosbox" ref={dosboxHostRef} className="doom-dosbox" />

        {(loading || error) && (
          <div className="doom-overlay">
            <div className="doom-overlay-title">
              {error || 'Loading DOOM...'}
            </div>
          </div>
        )}
      </div>

      <div className="doom-help" role="note" aria-label="DOOM controls help">
        <div className="doom-help-row">
          <span className="doom-help-label">Move</span>
          <span className="doom-kbd">↑</span>
          <span className="doom-kbd">←</span>
          <span className="doom-kbd">↓</span>
          <span className="doom-kbd">→</span>
        </div>
        <div className="doom-help-row">
          <span className="doom-help-label">Actions</span>
          <span><span className="doom-kbd">Ctrl</span> Fire</span>
          <span><span className="doom-kbd">Space</span> Use/Open</span>
          <span><span className="doom-kbd">Shift</span> Run</span>
          <span><span className="doom-kbd">Esc</span> Menu</span>
        </div>
      </div>
    </div>
  )
}

export default Doom
