import './ViceCity.css';
import { useEffect, useState, useRef } from 'react'

function ViceCity() {
  const gameUrl = 'https://gta.laszloakos.hu/?cheats=1&autoplay=1';
  const MOBILE_BREAKPOINT = 600
  const [forceLandscape, setForceLandscape] = useState(false)
  const wrapperRef = useRef(null)
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })
  const iframeRef = useRef(null)

  useEffect(() => {
    const check = () => {
      if (window.innerWidth <= MOBILE_BREAKPOINT) {
        // if portrait, force landscape transform to better fit
        setForceLandscape(window.innerWidth < window.innerHeight)
      } else {
        setForceLandscape(false)
      }
    }

    window.addEventListener('resize', check)
    check()
    return () => window.removeEventListener('resize', check)
  }, [])

  // Prompt the user to enter fullscreen when the game opens.
  useEffect(() => {
    // only prompt once per session
    try {
      if (typeof window !== 'undefined' && !document.fullscreenElement) {
        const wants = window.confirm('For the best experience, enter fullscreen for GTA: Vice City. Tap OK to enter fullscreen now.')
        if (wants) {
          const target = iframeRef.current || wrapperRef.current || document.documentElement
          if (target && typeof target.requestFullscreen === 'function') {
            target.requestFullscreen().catch(() => {
              // fallback alert if browser blocks fullscreen
              window.alert('Unable to enter fullscreen automatically. Please use your browser menu or press F11.')
            })
          } else {
            // older browsers / iOS fallback
            window.alert('Fullscreen is not supported on this device. Try using the browser menu or install as a PWA.')
          }
        }
      }
    } catch (e) {
      // ignore errors and do not block app
    }
  }, [])

  // measure the wrapper to size the iframe so rotation doesn't crop content
  useEffect(() => {
    const el = wrapperRef.current
    if (!el) return

    const update = () => {
      const r = el.getBoundingClientRect()
      setContainerSize({ width: Math.max(0, r.width), height: Math.max(0, r.height) })
    }

    update()
    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(update)
      ro.observe(el)
      return () => ro.disconnect()
    }
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [wrapperRef.current])

  const iframeStyle = forceLandscape
    ? {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%) rotate(90deg)',
      transformOrigin: 'center center',
      width: `${containerSize.height}px`,
      height: `${containerSize.width}px`,
      border: 0,
      background: '#000',
    }
    : { width: '100%', height: '100%', border: 0, background: '#000', display: 'block' }

  return (
    <div ref={wrapperRef} className={`vicecity-app${forceLandscape ? ' force-landscape' : ''}`}>
      <iframe
        title="GTA Vice City"
        src={gameUrl}
        ref={iframeRef}
        className="vicecity-iframe"
        style={iframeStyle}
        allow="fullscreen; autoplay; gamepad"
        allowFullScreen
      />
    </div>
  )
}

export default ViceCity;
