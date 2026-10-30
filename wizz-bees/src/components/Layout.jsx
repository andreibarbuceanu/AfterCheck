import { NavLink, Outlet, Link } from 'react-router-dom'
import Logo from './Logo'
import { useStore } from '../store'
import releases from '../data/releases.json'

export default function Layout() {
  const { version, currentVersion, setVersion, resetDemo } = useStore()
  const simulating = version !== currentVersion

  return (
    <div className="app">
      {simulating && (
        <div className="sim-banner" role="status">
          Rulezi versiunea simulată {version}. Bug-urile reparate după această versiune sunt active.
          <button className="link-btn" onClick={() => setVersion(currentVersion)}>
            Revino la {currentVersion}
          </button>
        </div>
      )}

      <header className="site-header">
        <div className="wrap header-inner">
          <Link to="/" aria-label="Wizz Bees, pagina principală">
            <Logo />
          </Link>
          <nav className="main-nav" aria-label="Navigare principală">
            <NavLink to="/" end>Zboruri</NavLink>
            <NavLink to="/check-in">Check-in</NavLink>
            <NavLink to="/cont">Contul meu</NavLink>
            <NavLink to="/noutati">Noutăți</NavLink>
          </nav>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="wrap footer-inner">
          <div>
            <Logo size={26} />
            <p className="muted small">
              Companie aeriană fictivă, creată pentru demo. Zborurile, prețurile și rezervările nu sunt reale.
            </p>
          </div>

          {/* Panou de demo: versiunea simulată controlează ce bug-uri sunt active */}
          <div className="demo-panel">
            <label htmlFor="version-select" className="small">Versiunea aplicației</label>
            <div className="row gap-s">
              <select id="version-select" value={version} onChange={(e) => setVersion(e.target.value)}>
                {releases.map((r) => (
                  <option key={r.version} value={r.version}>
                    {r.version} ({r.date}){r.version === currentVersion ? ', curentă' : ''}
                  </option>
                ))}
              </select>
              <button className="btn btn-ghost btn-s" onClick={resetDemo}>Resetează datele demo</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
