import './AboutMe.css'

const SOCIAL = [
  { label: 'GitHub',   href: 'https://github.com/notfoolish',           fa: 'fa-brands fa-github' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/laszloakos',  fa: 'fa-brands fa-linkedin' },
  { label: 'Facebook', href: 'https://facebook.com/laszloakos14',       fa: 'fa-brands fa-facebook' },
]

const SKILLS = [
  { label: 'React',       fa: 'fa-brands fa-react' },
  { label: 'JavaScript',  fa: 'fa-brands fa-js' },
  { label: 'HTML / CSS',  fa: 'fa-brands fa-html5' },
  { label: 'Node.js',     fa: 'fa-brands fa-node-js' },
  { label: 'PHP',         fa: 'fa-brands fa-php' },
  { label: 'Java',        fa: 'fa-brands fa-java' },
  { label: 'Swift',       fa: 'fa-brands fa-swift' },
  { label: '.NET / C#',   fa: 'fa-solid fa-code' },
  { label: 'MySQL',       fa: 'fa-solid fa-database' },
  { label: 'Unity',       fa: 'fa-brands fa-unity' },
  { label: 'Figma',       fa: 'fa-brands fa-figma' },
]

const SOFTWARE = [
  { label: 'VS Code',       fa: 'fa-solid fa-code' },
  { label: 'GitHub', fa: 'fa-brands fa-git-alt' },
  { label: 'Jira',          fa: 'fa-brands fa-atlassian' },
  { label: 'Docker',        fa: 'fa-brands fa-docker' },
]

const PROJECTS = [
  {
    name: 'BitFighters',
    desc: '2D wave-based survival game (Unity) with website and launcher.',
    link: 'https://bitfighters.eu',
    linkLabel: 'bitfighters.eu',
  },
  {
    name: 'DevMatch',
    desc: 'Matches developers with jobs based on their GitHub profile.',
    link: 'https://github.com/notfoolish/DevMatch',
    linkLabel: 'GitHub',
  },
  {
    name: 'X Clone',
    desc: 'Full-stack social media platform inspired by X / Twitter.',
    link: 'https://github.com/notfoolish/XClone',
    linkLabel: 'GitHub',
  },
  {
    name: 'iOS Home App',
    desc: 'iOS app for managing a homemade doorbell camera.',
    link: 'https://github.com/notfoolish/IosHomeApp',
    linkLabel: 'GitHub',
  },
]

function SideSection({ title, children }) {
  return (
    <div className="am-side-section">
      <div className="am-side-header">{title}</div>
      <div className="am-side-body">{children}</div>
    </div>
  )
}

function AboutMe() {
  return (
    <div className="am-app">

      {/* ── Toolbar ── */}
      <div className="am-toolbar">
        <div className="am-nav">
          <button className="am-nav-btn" disabled title="Back"><i className="fa-solid fa-chevron-left" /></button>
          <button className="am-nav-btn" disabled title="Forward"><i className="fa-solid fa-chevron-right" /></button>
        </div>
        <div className="am-breadcrumb">
          <i className="fa-solid fa-user am-bread-icon" />
          <span className="am-crumb">László Ákos</span>
          <span className="am-crumb-sep"><i className="fa-solid fa-chevron-right" /></span>
          <span className="am-crumb am-crumb-active">About Me</span>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="am-body">

        {/* Left sidebar */}
        <aside className="am-sidebar">
          <SideSection title="Social Links">
            {SOCIAL.map(s => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="am-side-item"
              >
                <i className={`${s.fa} am-side-item-icon`} />
                {s.label}
              </a>
            ))}
          </SideSection>

          <SideSection title="Skills">
            {SKILLS.map(s => (
              <div key={s.label} className="am-side-item">
                <i className={`${s.fa} am-side-item-icon`} />
                {s.label}
              </div>
            ))}
          </SideSection>

          <SideSection title="Software">
            {SOFTWARE.map(s => (
              <div key={s.label} className="am-side-item">
                <i className={`${s.fa} am-side-item-icon`} />
                {s.label}
              </div>
            ))}
          </SideSection>
        </aside>

        {/* Main content */}
        <main className="am-main">
          <div className="am-hero">
            <div className="am-avatar">LÁ</div>
            <div>
              <h1 className="am-name">Hi, I'm László Ákos 👋</h1>
              <p className="am-sub">Fullstack developer · Pécs, Hungary · Age 20</p>
            </div>
          </div>

          <div className="am-cards">
            {/* About */}
            <div className="am-card">
              <div className="am-card-title">About Me</div>
              <p>
                I started my technical journey at age 8 with hardware repair
                and rebuilding devices. At 16, I started living independently
                while balancing school, work, and responsibilities.
                Over time I transitioned from hardware and system troubleshooting
                into fullstack web development.
              </p>
            </div>

            {/* What I Do */}
            <div className="am-card">
              <div className="am-card-title">What I Do</div>
              <ul className="am-list">
                <li>React applications</li>
                <li>JavaScript / Node.js development</li>
                <li>Backend: Express.js · MongoDB · PHP</li>
                <li>PC building, repair &amp; Windows optimisation</li>
              </ul>
            </div>

            {/* Tech Stack */}
            <div className="am-card">
              <div className="am-card-title">Tech Stack</div>
              <p className="am-stack-label">Frontend</p>
              <div className="am-chips">
                {['React','JavaScript','HTML5','CSS3','Tailwind','Vite'].map(c => (
                  <span key={c} className="am-chip">{c}</span>
                ))}
              </div>
              <p className="am-stack-label">Backend</p>
              <div className="am-chips">
                {['Node.js','PHP','Java','Swift','.NET','MySQL'].map(c => (
                  <span key={c} className="am-chip">{c}</span>
                ))}
              </div>
              <p className="am-stack-label">Tools</p>
              <div className="am-chips">
                {['Unity','C#','Figma','Jira','GitHub','Docker'].map(c => (
                  <span key={c} className="am-chip">{c}</span>
                ))}
              </div>
            </div>

            {/* Projects – full width */}
            <div className="am-card am-card-full">
              <div className="am-card-title">Projects</div>
              <ul className="am-list">
                {PROJECTS.map(p => (
                  <li key={p.name}>
                    <strong>{p.name}</strong> — {p.desc}&nbsp;
                    <a href={p.link} target="_blank" rel="noopener noreferrer">
                      {p.linkLabel}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div className="am-card">
              <div className="am-card-title">Contact</div>
              <ul className="am-list">
                <li>Email:&nbsp;
                  <a href="mailto:alosos398@gmail.com">alosos398@gmail.com</a>
                </li>
                <li>Phone:&nbsp;
                  <a href="tel:+36703269157">+36 70 326 9157</a>
                </li>
                <li>CV:&nbsp;
                  <a href="/Laszlo_Akos_CV.pdf" target="_blank" rel="noopener noreferrer">
                    Laszlo_Akos_CV.pdf
                  </a>
                </li>
              </ul>
            </div>

            {/* Outside Code */}
            <div className="am-card">
              <div className="am-card-title">Outside Code</div>
              <p>⚽ Soccer &nbsp;·&nbsp; 🥾 Hiking &nbsp;·&nbsp; 🎱 Pool &nbsp;·&nbsp; 🏋️ Gym</p>
            </div>
          </div>
        </main>
      </div>

      {/* ── Status bar ── */}
      <div className="am-status">
        <i className="fa-solid fa-circle-info am-status-icon" />
        Learn more about László
      </div>
    </div>
  )
}

export default AboutMe
