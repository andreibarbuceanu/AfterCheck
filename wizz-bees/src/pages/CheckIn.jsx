import { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import BoardingPass from '../components/BoardingPass'
import { airport } from '../data/airports'
import { formatDate } from '../data/flights'
import { useStore } from '../store'

export default function CheckIn() {
  const [params] = useSearchParams()
  const { findBooking, updateBooking, bug } = useStore()
  const [pnr, setPnr] = useState(params.get('pnr') || '')
  const [last, setLast] = useState(params.get('last') || '')
  const [foundPnr, setFoundPnr] = useState(() =>
    params.get('pnr') && params.get('last') ? params.get('pnr') : null,
  )
  const [lookupError, setLookupError] = useState('')
  const [checkInError, setCheckInError] = useState('')
  const [busy, setBusy] = useState(false)

  // Re-căutăm la fiecare render ca să vedem starea actualizată din store
  const booking = foundPnr ? findBooking(foundPnr, last) : null

  const lookup = (e) => {
    e.preventDefault()
    setCheckInError('')
    const b = findBooking(pnr, last)
    if (!b) {
      setFoundPnr(null)
      setLookupError('Nu am găsit o rezervare cu acest cod și nume. Verifică emailul de confirmare.')
      return
    }
    setLookupError('')
    setFoundPnr(b.pnr)
  }

  const doCheckIn = () => {
    setBusy(true)
    setCheckInError('')
    // Simulăm un apel de rețea
    setTimeout(() => {
      setBusy(false)
      // Bug WB-1027 / WB-1040: grupurile de peste 4 pasageri primesc eroare
      if (bug('groupCheckIn') && booking.passengers.length > 4) {
        setCheckInError('Ceva nu a mers bine. Încearcă din nou sau fă check-in la ghișeul din aeroport. (Cod CHK-500)')
        return
      }
      // Pasagerii fără loc primesc unul gratuit, în spatele avionului
      const free = 26
      const passengers = booking.passengers.map((p, i) =>
        p.seat ? p : { ...p, seat: `${free + Math.floor(i / 6)}${'ABCDEF'[i % 6]}` },
      )
      updateBooking(booking.pnr, { checkedIn: true, passengers })
    }, 700)
  }

  return (
    <div className="wrap section">
      <h1>Check-in online</h1>

      {!booking && (
        <>
          <form className="lookup" onSubmit={lookup}>
            <div className="field">
              <label htmlFor="pnr">Codul rezervării</label>
              <input id="pnr" value={pnr} onChange={(e) => setPnr(e.target.value)} maxLength={6} placeholder="ex. HNY42K" required />
            </div>
            <div className="field">
              <label htmlFor="last">Numele de familie</label>
              <input id="last" value={last} onChange={(e) => setLast(e.target.value)} required />
            </div>
            <button className="btn btn-primary" type="submit">Caută rezervarea</button>
          </form>
          {lookupError && <p className="error" role="alert">{lookupError}</p>}

          <div className="demo-hint">
            <b>Rezervări de demo</b>
            <p className="small">
              <code>HNY42K</code> / Ionescu, un pasager. <code>BEE5X2</code> / Popescu, grup de 6 pasageri.
            </p>
          </div>
        </>
      )}

      {booking && (
        <section>
          <div className="checkin-head">
            <div>
              <p className="side-route">
                {airport(booking.flight.from).city} <span className="muted">spre</span> {airport(booking.flight.to).city}
              </p>
              <p className="small muted">
                {booking.flight.number}, {formatDate(booking.flight.date, { weekday: 'long', day: 'numeric', month: 'long' })}, plecare {booking.flight.dep}
              </p>
            </div>
            <button className="link-btn" onClick={() => setFoundPnr(null)}>Altă rezervare</button>
          </div>

          {!booking.checkedIn ? (
            <>
              <ul className="pax-list">
                {booking.passengers.map((p, i) => (
                  <li key={i}>
                    <span>{p.first} {p.last}</span>
                    <span className="small muted">{p.seat ? `Loc ${p.seat}` : 'Loc alocat gratuit'}</span>
                  </li>
                ))}
              </ul>
              <button className="btn btn-primary btn-l" onClick={doCheckIn} disabled={busy}>
                {busy ? 'Se face check-in…' : `Fă check-in pentru ${booking.passengers.length === 1 ? 'pasager' : `toți cei ${booking.passengers.length} pasageri`}`}
              </button>
              {checkInError && <p className="error" role="alert">{checkInError}</p>}
            </>
          ) : (
            <>
              <p className="ok">Check-in făcut. Arată boarding pass-ul la controlul de securitate și la poartă.</p>
              <div className="passes">
                {booking.passengers.map((p, i) => (
                  <BoardingPass key={i} booking={booking} passenger={p} index={i} lowContrast={bug('qrLowContrast')} />
                ))}
              </div>
              <p className="small muted">
                Ai avut probleme la check-in sau la poartă? <Link to={`/cont/recenzie?pnr=${booking.pnr}`}>Spune-ne ce s-a întâmplat</Link>.
              </p>
            </>
          )}
        </section>
      )}
    </div>
  )
}
