import { useEffect, useMemo, useState } from 'react'
import './Music.css'

const TRACKS = [
  { title: 'Midnight Drive', artist: 'Win7 Studio', duration: 213, mood: 'Chill' },
  { title: 'Pixel Skyline', artist: 'Retroform', duration: 197, mood: 'Focus' },
  { title: 'Cloud Runner', artist: 'Wave Circuit', duration: 249, mood: 'Chill' },
  { title: 'Night Shift', artist: 'Neon Unit', duration: 182, mood: 'Energy' },
  { title: 'Sea of Lights', artist: 'Afterglow', duration: 224, mood: 'Focus' },
]

const MOODS = ['All', 'Chill', 'Focus', 'Energy']

function formatTime(sec) {
  const s = Math.floor(Math.max(0, sec))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

function Music() {
  const [mood, setMood] = useState('All')
  const [queue, setQueue] = useState(TRACKS)
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [position, setPosition] = useState(0)

  const visibleTracks = useMemo(
    () => (mood === 'All' ? TRACKS : TRACKS.filter((t) => t.mood === mood)),
    [mood],
  )

  const current = queue[index] ?? queue[0]

  useEffect(() => {
    if (!playing || !current) return undefined
    const timer = window.setInterval(() => {
      setPosition((prev) => {
        if (prev + 1 >= current.duration) {
          setIndex((i) => (i + 1) % queue.length)
          return 0
        }
        return prev + 1
      })
    }, 1000)
    return () => window.clearInterval(timer)
  }, [playing, current, queue.length])

  useEffect(() => {
    setPosition(0)
  }, [index])

  const enqueueMood = () => {
    if (visibleTracks.length === 0) return
    setQueue(visibleTracks)
    setIndex(0)
    setPlaying(true)
  }

  return (
    <div className="music-app">
      <div className="music-header">
        <div>
          <h3>Music Library</h3>
          <p>Simulation mode · no external media files required</p>
        </div>
        <div className="music-moods">
          {MOODS.map((m) => (
            <button key={m} type="button" className={mood === m ? 'active' : ''} onClick={() => setMood(m)}>
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="music-body">
        <div className="music-library" role="list">
          {visibleTracks.map((track) => (
            <button
              key={track.title}
              type="button"
              role="listitem"
              className={`music-track${current?.title === track.title ? ' active' : ''}`}
              onClick={() => {
                const pos = queue.findIndex((q) => q.title === track.title)
                if (pos >= 0) {
                  setIndex(pos)
                } else {
                  setQueue((prev) => [...prev, track])
                  setIndex(queue.length)
                }
                setPlaying(true)
              }}
            >
              <span><img src="/win7icons/WMP12 Icons/WMP 12 9.ico" alt="" style={{width:14,height:14,verticalAlign:'middle',marginRight:6,objectFit:'contain'}} />{track.title}</span>
              <span>{track.artist}</span>
              <span>{formatTime(track.duration)}</span>
            </button>
          ))}
        </div>

        <aside className="music-now-playing">
          {current ? (
            <>
              <h4>{current.title}</h4>
              <p>{current.artist} · {current.mood}</p>
              <div className="music-progress">
                <span>{formatTime(position)}</span>
                <input
                  type="range"
                  min={0}
                  max={current.duration}
                  value={position}
                  onChange={(e) => setPosition(Number(e.target.value))}
                />
                <span>{formatTime(current.duration)}</span>
              </div>
              <div className="music-controls">
                <button type="button" onClick={() => setIndex((i) => (i - 1 + queue.length) % queue.length)}>Prev</button>
                <button type="button" onClick={() => setPlaying((v) => !v)}>{playing ? 'Pause' : 'Play'}</button>
                <button type="button" onClick={() => setIndex((i) => (i + 1) % queue.length)}>Next</button>
              </div>
              <button type="button" className="music-queue-btn" onClick={enqueueMood}>Play filtered list</button>
            </>
          ) : (
            <p>No track selected.</p>
          )}
        </aside>
      </div>
    </div>
  )
}

export default Music
