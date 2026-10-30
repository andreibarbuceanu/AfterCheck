import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { AIRPORTS, airport } from '../data/airports'
import { addDays, lei, lowestPrice } from '../data/flights'

const TODAY = new Date().toISOString().slice(0, 10)

// Rute afișate ca idei sub căutare; prețul e calculat live din generator
const IDEAS = [
  ['OTP', 'LIS'], ['CLJ', 'BCN'], ['IAS', 'FCO'], ['TSR', 'DTM'], ['OTP', 'ATH'], ['SBZ', 'MXP'],
]

export default function Home() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ from: 'OTP', to: 'BCN', date: addDays(TODAY, 7), pax: 1 })
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const swap = () => setForm({ ...form, from: form.to, to: form.from })

  const submit = (e) => {
    e.preventDefault()
    const q = new URLSearchParams(form).toString()
    navigate(`/zboruri?${q}`)
  }

  return (
    <>
      <section className="hero">
        <div className="wrap hero-inner">
          <h1>
            Zbori prin Europa
            <br />
            fără să plătești tot stupul.
          </h1>
          <p className="hero-sub">
            Bilete simple, bagaje la vedere și check-in din telefon. Alegi doar ce-ți trebuie.
          </p>

          <form className="search" onSubmit={submit} aria-label="Caută zboruri">
            <div className="field">
              <label htmlFor="from">De la</label>
              <select id="from" value={form.from} onChange={set('from')}>
                {AIRPORTS.map((a) => (
                  <option key={a.code} value={a.code}>{a.city} ({a.code})</option>
                ))}
              </select>
            </div>

            <button type="button" className="swap" onClick={swap} aria-label="Inversează plecarea cu destinația">
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path d="M7 7h11l-3-3M17 17H6l3 3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <div className="field">
              <label htmlFor="to">Spre</label>
              <select id="to" value={form.to} onChange={set('to')}>
                {AIRPORTS.filter((a) => a.code !== form.from).map((a) => (
                  <option key={a.code} value={a.code}>{a.city} ({a.code})</option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="date">Plecare</label>
              <input id="date" type="date" min={TODAY} value={form.date} onChange={set('date')} required />
            </div>

            <div className="field field-s">
              <label htmlFor="pax">Pasageri</label>
              <select id="pax" value={form.pax} onChange={set('pax')}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>

            <button className="btn btn-primary btn-l" type="submit">Caută zboruri</button>
          </form>
        </div>
      </section>

      <section className="wrap section">
        <h2>Pleci în weekendul viitor?</h2>
        <p className="muted">Cele mai mici prețuri pentru o singură călătorie, peste 7 zile.</p>
        <ul className="ideas">
          {IDEAS.map(([from, to]) => {
            const date = addDays(TODAY, 7)
            const price = lowestPrice(from, to, date)
            const q = new URLSearchParams({ from, to, date, pax: 1 }).toString()
            return (
              <li key={from + to}>
                <Link to={`/zboruri?${q}`} className="idea">
                  <span className="idea-route">
                    {airport(from).city} <span className="muted">spre</span> {airport(to).city}
                  </span>
                  <span className="idea-price">de la {lei(price)}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </section>

      <section className="wrap section shortcuts">
        <Link to="/check-in" className="shortcut">
          <b>Check-in online</b>
          <span className="muted">Deschis cu 30 de zile până la 3 ore înainte de zbor.</span>
        </Link>
        <Link to="/cont" className="shortcut">
          <b>Rezervările mele</b>
          <span className="muted">Adaugă bagaje, vezi biletele sau lasă o recenzie.</span>
        </Link>
        <Link to="/cont/recenzie" className="shortcut">
          <b>Ai avut o problemă?</b>
          <span className="muted">Trimite o reclamație și îți răspundem în 5 zile lucrătoare.</span>
        </Link>
      </section>
    </>
  )
}
