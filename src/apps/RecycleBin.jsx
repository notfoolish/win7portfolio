import './RecycleBin.css'

function RecycleBin() {
  return (
    <div className="recycle-bin-app">
      <div className="recycle-bin-toolbar">
        <span className="recycle-btn">Empty Recycle Bin</span>
      </div>
      <div className="recycle-bin-empty">
        <img
          src="/win7icons/Shell32.dll/imageres_55.ico"
          alt="Recycle Bin"
          className="recycle-bin-empty-icon"
        />
        <span className="recycle-bin-empty-label">Recycle Bin is empty</span>
      </div>
    </div>
  )
}

export default RecycleBin
