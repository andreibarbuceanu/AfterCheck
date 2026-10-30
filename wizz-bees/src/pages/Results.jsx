import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { airport } from '../data/airports'
import { addDays, formatDate, formatDuration, lei, lowestPrice, searchFlights } from '../data/flights'

export default function Results() {
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const from = params.get('from')
  const to = params.get('to')
  const date = params.get('date')
  const pax = Number(params.get('pax') || 1)

  if (!from || !to || !date) {
    return (
      <div className="wrap section">
        <p>Alege plecarea, destinația și data ca să vezi zborurile.</p>
        <Link className="btn btn-primary" to="/">Caută zboruri</Link>
      </div>
    )
  }

  const flights = searchFlights(from, to, date)
  // Banda de 7 zile: 3 zile înainte, ziua aleasă, 3 zile după
  const days = [-3, -2, -1, 0, 1, 2, 3].map((n) => addDays(date, n))
  const pickDay = (d) => {
    params.set('date', d)
    setParams(params)
  }

  const choose = (flight) => navigate('/rezervare', { state: { flight, pax } })

  return (
    <div className="wrap section">
      <Link to="/" className="back">Schimbă căutarea</Link>
      <h1 className="route-title">
        {airport(from).city} <span className="muted">spre</span> {airport(to).city}
      </h1>
      <p className="muted">
        {pax} {pax === 1 ? 'pasager' : 'pasageri'} · doar dus
      </p>

      <div className="day-strip" role="tablist" aria-label="Alege ziua">
        {days.map((d) => {
          const p = lowestPrice(from, to, d)
          return (
            <button
              key={d}
              role="tab"
              aria-selected={d === date}
              className={`day ${d === date ? 'is-active' : ''}`}
              onClick={() => pickDay(d)}
            >
              <span>{formatDate(d)}</span>
              <b>{p ? lei(p) : '—'}</b>
            </button>
          )
        })}
      </div>

      {flights.length === 0 ? (
        <p className="empty">Nu zburăm pe această rută în ziua aleasă. Încearcă o zi din banda de mai sus.</p>
      ) : (
        <ul className="flights">
          {flights.map((f) => (
            <li key={f.id} className="flight">
              <div className="flight-times">
                <div>
                  <div className="time">{f.dep}</div>
                  <div className="small muted">{f.from}</div>
                </div>
                <div className="flight-line">
                  <span className="small muted">{formatDuration(f.duration)} · direct</span>
                  <span className="line" aria-hidden="true" />
                  <span className="small muted">{f.number} · {f.aircraft}</span>
                </div>
                <div className="right">
                  <div className="time">
                    {f.arr}
                    {f.nextDay && <sup>+1</sup>}
                  </div>
                  <div className="small muted">{f.to}</div>
                </div>
              </div>

              <div className="flight-buy">
                <div className="price">{lei(f.price)}</div>
                <div className="small muted">de persoană, geantă mică inclusă</div>
                {f.seatsLeft < 8 && <div className="small warn">Mai sunt {f.seatsLeft} locuri la acest preț</div>}
                <button className="btn btn-primary" onClick={() => choose(f)}>Alege zborul</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
