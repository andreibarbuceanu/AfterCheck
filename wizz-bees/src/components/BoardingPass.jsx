import { airport } from '../data/airports'
import { formatDate, rng } from '../data/flights'
import { bagById } from '../data/extras'

// Cod 2D decorativ (nu e un QR valid), generat din PNR + nume.
// lowContrast reproduce bug-ul WB-1022/1036/1042: cod gri pe fundal deschis.
function FakeCode({ seed, lowContrast }) {
  const r = rng(seed)
  const n = 21
  const cells = []
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const finder =
        (x < 7 && y < 7) || (x >= n - 7 && y < 7) || (x < 7 && y >= n - 7)
      if (finder) {
        // Coordonate locale în pătratul de colț (0–6)
        const lx = x >= n - 7 ? x - (n - 7) : x
        const ly = y >= n - 7 ? y - (n - 7) : y
        const ring = lx === 0 || lx === 6 || ly === 0 || ly === 6
        const core = lx >= 2 && lx <= 4 && ly >= 2 && ly <= 4
        if (ring || core) cells.push([x, y])
      } else if (r() > 0.52) {
        cells.push([x, y])
      }
    }
  }
  return (
    <svg
      viewBox={`-1 -1 ${n + 2} ${n + 2}`}
      className="code"
      role="img"
      aria-label="Cod de îmbarcare"
      shapeRendering="crispEdges"
    >
      <rect x="-1" y="-1" width={n + 2} height={n + 2} fill="#fff" />
      {cells.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={lowContrast ? '#c9cdd6' : '#1D2B4F'} />
      ))}
    </svg>
  )
}

export default function BoardingPass({ booking, passenger, index, lowContrast }) {
  const f = booking.flight
  const from = airport(f.from)
  const to = airport(f.to)
  // Îmbarcarea începe cu 30 de minute înainte de plecare
  const [h, m] = f.dep.split(':').map(Number)
  const boardMin = (h * 60 + m - 30 + 1440) % 1440
  const boarding = `${String(Math.floor(boardMin / 60)).padStart(2, '0')}:${String(boardMin % 60).padStart(2, '0')}`
  const priority = booking.extras.includes('priority') || passenger.bag === 'trolley'

  return (
    <article className="pass">
      <div className="pass-main">
        <header className="pass-head">
          <span className="pass-brand">Wizz Bees · boarding pass</span>
          <span className="pass-flight">{f.number}</span>
        </header>

        <div className="pass-route">
          <div>
            <div className="iata">{f.from}</div>
            <div className="small">{from?.city}</div>
          </div>
          <svg className="pass-plane" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z" fill="currentColor" />
          </svg>
          <div className="right">
            <div className="iata">{f.to}</div>
            <div className="small">{to?.city}</div>
          </div>
        </div>

        <dl className="pass-grid">
          <div><dt>Pasager</dt><dd>{passenger.last.toUpperCase()} {passenger.first}</dd></div>
          <div><dt>Data</dt><dd>{formatDate(f.date)}</dd></div>
          <div><dt>Îmbarcare</dt><dd>{boarding}</dd></div>
          <div><dt>Loc</dt><dd>{passenger.seat || 'La poartă'}</dd></div>
          <div><dt>Grup</dt><dd>{priority ? 'Priority' : 'Standard'}</dd></div>
          <div><dt>Bagaj</dt><dd>{bagById(passenger.bag)?.name}</dd></div>
        </dl>
      </div>

      {/* Perforația în formă de faguri separă cotorul */}
      <div className="pass-stub">
        <FakeCode seed={`${booking.pnr}-${index}-${passenger.last}`} lowContrast={lowContrast} />
        <div className="small">PNR <b>{booking.pnr}</b></div>
        <div className="small muted">Secvență {String(index + 1).padStart(3, '0')}</div>
      </div>
    </article>
  )
}
