import { useMemo, useState } from 'react'
import './ControlPanel.css'

const CATEGORIES = {
  System: [
    { id: 'night-light', label: 'Night Light', type: 'toggle', value: false },
    { id: 'performance', label: 'Performance Mode', type: 'toggle', value: true },
  ],
  Network: [
    { id: 'wifi', label: 'Wi-Fi', type: 'toggle', value: true },
    { id: 'metered', label: 'Metered connection', type: 'toggle', value: false },
  ],
  Personalization: [
    { id: 'animations', label: 'Enable animations', type: 'toggle', value: true },
    { id: 'accent', label: 'Accent intensity', type: 'range', value: 68 },
  ],
  Security: [
    { id: 'defender', label: 'Real-time protection', type: 'toggle', value: true },
    { id: 'firewall', label: 'Firewall', type: 'toggle', value: true },
  ],
}

function ControlPanel() {
  const [activeCategory, setActiveCategory] = useState('System')
  const [settings, setSettings] = useState(() =>
    Object.values(CATEGORIES).flat().reduce((acc, item) => {
      acc[item.id] = item.value
      return acc
    }, {}),
  )

  const items = useMemo(() => CATEGORIES[activeCategory] ?? [], [activeCategory])

  const setValue = (id, value) => {
    setSettings((prev) => ({ ...prev, [id]: value }))
  }

  return (
    <div className="cp-app">
      <div className="cp-sidebar">
        {Object.keys(CATEGORIES).map((category) => (
          <button
            key={category}
            type="button"
            className={activeCategory === category ? 'active' : ''}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="cp-content">
        <h3>{activeCategory} settings</h3>
        <div className="cp-settings">
          {items.map((item) => (
            <div key={item.id} className="cp-setting-row">
              <span>{item.label}</span>
              {item.type === 'toggle' ? (
                <button
                  type="button"
                  className={`cp-toggle${settings[item.id] ? ' on' : ''}`}
                  onClick={() => setValue(item.id, !settings[item.id])}
                >
                  {settings[item.id] ? 'On' : 'Off'}
                </button>
              ) : (
                <label className="cp-range-wrap">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={settings[item.id]}
                    onChange={(e) => setValue(item.id, Number(e.target.value))}
                  />
                  <strong>{settings[item.id]}%</strong>
                </label>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ControlPanel
