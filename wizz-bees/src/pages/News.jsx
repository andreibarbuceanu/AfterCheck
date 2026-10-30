import releases from '../data/releases.json'
import { formatDate } from '../data/flights'
import { useStore } from '../store'

// Changelog public. Fiecare fix are ID-ul tichetului din Excel, ca aplicația
// de reviews să poată lega o versiune de problemele pe care pretinde că le-a rezolvat.
export default function News() {
  const { version } = useStore()
  return (
    <div className="wrap section narrow">
      <h1>Noutăți în aplicație</h1>
      <p className="muted">Ce am lansat și ce am reparat în fiecare versiune.</p>

      <ol className="releases">
        {releases.map((r) => (
          <li key={r.version} className={`release ${r.version === version ? 'is-running' : ''}`}>
            <div className="release-head">
              <h2>{r.version}</h2>
              <span className="muted small">
                {formatDate(r.date, { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
              {r.version === version && <span className="tag">Rulezi această versiune</span>}
            </div>
            {r.features.map((f) => <p key={f}>{f}</p>)}
            {r.fixes.length > 0 && (
              <ul className="fixes">
                {r.fixes.map((f) => (
                  <li key={f.ticket}>
                    <code>{f.ticket}</code> {f.text}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ol>
    </div>
  )
}
