import './Resume.css'

const RESUME_FILE = '/Laszlo_Akos_CV.pdf'

function Resume() {
  return (
    <div className="resume-app">
      <iframe
        className="resume-viewer"
        src={RESUME_FILE}
        title="Resume Preview"
      />
    </div>
  )
}

export default Resume
