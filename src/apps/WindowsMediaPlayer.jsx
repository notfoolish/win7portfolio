import { useEffect, useRef, useState } from 'react'
import './WindowsMediaPlayer.css'

const TRACKS = [
  { title: 'Sleep Away',                  artist: 'Bob Acri',         src: '/sounds/songs/Bob_Acri-Sleep_Away.mp3' },
  { title: 'Kalimba',                     artist: 'Mr. Scruff',       src: '/sounds/songs/Kalimba.mp3' },
  { title: 'Maid with the Flaxen Hair',   artist: 'Richard Stoltzman',src: '/sounds/songs/Maid_with_the_Flaxen_Hair-Richard_Stoltzman.mp3' },
]

function formatTime(seconds) {
  const s = Math.max(0, Math.floor(seconds))
  const m = Math.floor(s / 60)
  const rem = String(s % 60).padStart(2, '0')
  return `${m}:${rem}`
}

function WindowsMediaPlayer({ initialTrackSrc }) {
  const [tab, setTab] = useState('now-playing')
  const startIndex = initialTrackSrc ? TRACKS.findIndex(t => t.src === initialTrackSrc) : 0
  const [index, setIndex] = useState(startIndex >= 0 ? startIndex : 0)
  const [playing, setPlaying] = useState(!!initialTrackSrc)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef(null)

  const current = TRACKS[index]

  // Sync audio src when track changes
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.src = current.src
    audio.load()
    if (playing) audio.play().catch(() => {})
    setCurrentTime(0)
    setDuration(0)
  }, [index])

  // Play/pause
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    if (playing) audio.play().catch(() => {})
    else audio.pause()
  }, [playing])

  const goNext = () => setIndex(i => (i + 1) % TRACKS.length)
  const goPrev = () => setIndex(i => (i - 1 + TRACKS.length) % TRACKS.length)

  const bars = Array.from({ length: 24 }, (_, i) => ({ id: i, h: 20 + ((i * 17) % 45) }))

  return (
    <div className="wmp-app">
      <audio
        ref={audioRef}
        onTimeUpdate={e => setCurrentTime(e.target.currentTime)}
        onDurationChange={e => setDuration(e.target.duration)}
        onEnded={() => goNext()}
      />
      <div className="wmp-topbar">
        <div className="wmp-menubar">
          <button type="button">File</button>
          <button type="button">View</button>
          <button type="button">Play</button>
          <button type="button">Tools</button>
          <button type="button">Help</button>
        </div>
        <div className="wmp-tabs" role="tablist" aria-label="Media views">
          <button type="button" className={tab === 'now-playing' ? 'active' : ''} onClick={() => setTab('now-playing')}>
            Now Playing
          </button>
          <button type="button" className={tab === 'library' ? 'active' : ''} onClick={() => setTab('library')}>
            Library
          </button>
        </div>
      </div>

      <div className="wmp-main">
        <aside className="wmp-library-nav">
          <button type="button" className={tab === 'now-playing' ? 'active' : ''} onClick={() => setTab('now-playing')}>Now Playing</button>
          <button type="button" className={tab === 'library' ? 'active' : ''} onClick={() => setTab('library')}>Music</button>
        </aside>

        <section className="wmp-content">
        {tab === 'now-playing' && (
          <>
            <div className="wmp-stage">
              <div className="wmp-visualizer" aria-hidden="true">
                {bars.map((bar) => (
                  <span
                    key={bar.id}
                    className={`wmp-bar${playing ? ' animate' : ''}`}
                    style={{ height: `${bar.h}%`, animationDelay: `${bar.id * 0.06}s` }}
                  />
                ))}
              </div>
              <div className="wmp-meta">
                <h3>{current.title}</h3>
                <p>{current.artist}</p>
              </div>
            </div>

            <div className="wmp-progress-wrap">
              <span>{formatTime(currentTime)}</span>
              <input
                type="range"
                min={0}
                max={duration || 0}
                value={currentTime}
                onChange={e => { if (audioRef.current) { audioRef.current.currentTime = Number(e.target.value) } }}
                aria-label="Track position"
              />
              <span>{formatTime(duration)}</span>
            </div>
          </>
        )}

        {tab === 'library' && (
          <div className="wmp-list" role="list">
            {TRACKS.map((track, i) => (
              <button
                key={track.title}
                type="button"
                role="listitem"
                className={`wmp-item${i === index ? ' active' : ''}`}
                onDoubleClick={() => { setIndex(i); setPlaying(true) }}
                onClick={() => setIndex(i)}
              >
                <span>{track.title}</span>
                <span>{track.artist}</span>
                <span>{i === index ? formatTime(duration) : '—'}</span>
              </button>
            ))}
          </div>
        )}
        </section>
      </div>

      <div className="wmp-controls">
        <div className="wmp-transport">
          <button type="button" className="wmp-icon-btn" onClick={goPrev} title="Previous"><img src="/win7icons/Windows Media Player/DXPTaskRingtone_141.ico" alt="Prev" /></button>
          <button type="button" className="wmp-icon-btn wmp-playpause" onClick={() => setPlaying(v => !v)} title={playing ? 'Pause' : 'Play'}><img src={playing ? '/win7icons/Windows Media Player/DXPTaskRingtone_155.ico' : '/win7icons/Windows Media Player/DXPTaskRingtone_151.ico'} alt={playing ? 'Pause' : 'Play'} /></button>
          <button type="button" className="wmp-icon-btn" onClick={goNext} title="Next"><img src="/win7icons/Windows Media Player/DXPTaskRingtone_161.ico" alt="Next" /></button>
        </div>
        <label className="wmp-volume">
          Volume
          <input
            type="range"
            min={0}
            max={100}
            defaultValue={70}
            onChange={e => { if (audioRef.current) audioRef.current.volume = Number(e.target.value) / 100 }}
            aria-label="Volume"
          />
        </label>
      </div>

      <div className="wmp-statusbar">{current.title} — {current.artist} • {playing ? 'Playing' : 'Paused'}</div>
    </div>
  )
}

export default WindowsMediaPlayer
