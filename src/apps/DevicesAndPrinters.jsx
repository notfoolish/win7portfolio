import { useState } from 'react'
import './DevicesAndPrinters.css'

const DEVICES = [
  { id: 'printer-laser', name: 'LaserJet Pro', type: 'Printer', status: 'Ready' },
  { id: 'printer-color', name: 'Color Ink 2400', type: 'Printer', status: 'Idle' },
  { id: 'mouse', name: 'Wireless Mouse', type: 'Input Device', status: 'Connected' },
  { id: 'speaker', name: 'Desktop Speakers', type: 'Audio Device', status: 'Connected' },
  { id: 'phone', name: 'Mobile Phone', type: 'Portable Device', status: 'Connected' },
]

function DevicesAndPrinters() {
  const [defaultPrinter, setDefaultPrinter] = useState('printer-laser')
  const [selected, setSelected] = useState(DEVICES[0])

  return (
    <div className="dp-app">
      <div className="dp-header">
        <p>Manage connected devices and default printer (simulation)</p>
      </div>

      <div className="dp-grid" role="list">
        {DEVICES.map((device) => {
          const isSelected = selected.id === device.id
          const isDefault = defaultPrinter === device.id
          return (
            <button
              key={device.id}
              type="button"
              role="listitem"
              className={`dp-card${isSelected ? ' active' : ''}`}
              onClick={() => setSelected(device)}
            >
              <div className="dp-icon">
                <img
                  src={device.type === 'Printer'
                    ? '/win7icons/Printers/prnfldr_5000.ico'
                    : '/win7icons/Shell32.dll/shell32_16783.ico'}
                  alt={device.type}
                />
              </div>
              <strong>{device.name}</strong>
              <span>{device.type}</span>
              <em>{device.status}</em>
              {isDefault && <small>Default printer</small>}
            </button>
          )
        })}
      </div>

      <div className="dp-actions">
        <span><strong>Selected:</strong> {selected.name}</span>
        {selected.type === 'Printer' && (
          <button type="button" onClick={() => setDefaultPrinter(selected.id)}>
            Set as default printer
          </button>
        )}
      </div>
    </div>
  )
}

export default DevicesAndPrinters
