import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import './BootScreen.css'

export default function BootScreen({ onDone }) {
  const videoRef = useRef(null)
  const [visible, setVisible] = useState(true)
  const [blocked, setBlocked] = useState(false)

  useEffect(() => {
    const vid = videoRef.current
    if (!vid) return

    // Autoplay policy: try to play, fall back to a short timeout if blocked
    const playPromise = vid.play()
    if (playPromise) {
      playPromise.catch(() => {
        // Autoplay blocked (common on mobile without user gesture).
        // Show a click-to-start overlay handled in JSX below.
        setBlocked(true)
      })
    }
  }, [])

  const handleManualStart = () => {
    const vid = videoRef.current
    if (!vid) return
    vid.currentTime = 0
    const playPromise = vid.play()
    if (playPromise) {
      playPromise
        .then(() => setBlocked(false))
        .catch(() => setBlocked(true))
    }
  }

  useEffect(() => {
    if (!blocked) return undefined

    const onKeyDown = () => {
      handleManualStart()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [blocked])

  return (
    <AnimatePresence onExitComplete={onDone}>
      {visible && (
        <motion.div
          key="boot"
          className="boot-screen"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
        >
          {blocked ? (
            <div
              className="boot-gesture-overlay"
              role="button"
              tabIndex={0}
              aria-label="Start Windows"
              onPointerDown={handleManualStart}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') handleManualStart()
              }}
            >
              <span className="boot-click-logo" />
              <span className="boot-click-text">To start Windows tap, click or press any key to continue</span>
            </div>
          ) : null}

          <video
            ref={videoRef}
            className="boot-video"
            src="/video/bootanim.mp4"
            playsInline
            onPlay={() => setBlocked(false)}
            onEnded={() => {
              setVisible(false)
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
