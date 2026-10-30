import { useMemo, useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { airport } from '../data/airports'
import { BAGS, EXTRAS, SEAT_PRICES, bagById } from '../data/extras'
import { formatDate, lei, rng } from '../data/flights'
import { makePnr, useStore } from '../store'

// Pașii rezervării sunt o secvență reală, deci îi numerotăm
const STEPS = ['Pasageri', 'Bagaje și extra', 'Locuri', 'Plată']

const ROWS = 30
const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

function seatType(row) {
  if (row <= 5) return 'front'
  if (row === 11 || row === 12) return 'exit'
  return 'standard'
}

export default function Booking() {
  const { state } = useLocation()
  const { bug, addBooking, version } = useStore()
  const flight = state?.flight
  const pax = state?.pax || 1

  const [step, setStep] = useState(0)
  const [passengers, setPassengers] = useState(() =>
    Array.from({ length: pax }, () => ({ first: '', last: '', bag: 'small', seat: '' })),
  )
  const [extras, setExtras] = useState([])
  const [activePax, setActivePax] = useState(0)
  const [done, setDone] = useState(null)

  // Locuri ocupate: deterministe pe zbor, ca harta să nu se schimbe la re-render
  const taken = useMemo(() => {
    if (!flight) return new Set()
    const r = rng(flight.id)
    const s = new Set()
    for (let row = 1; row <= ROWS; row++)
      for (const l of LETTERS) if (r() < 0.45) s.add(`${row}${l}`)
    return s
  }, [flight])

  if (!flight) return <Navigate to="/" replace />

  const updatePax = (i, patch) =>
    setPassengers((list) => list.map((p, j) => (j === i ? { ...p, ...patch } : p)))

  // --- Prețuri -------------------------------------------------------------
  // Bug WB-1008: în versiunile vechi, prețul bagajului de cală afișat la
  // selecție e mai mic decât cel încasat la plată (+40%).
  const bagMismatch = bug('bagPriceMismatch')
  const chargedBag = (b) =>
    bagMismatch && b.id.startsWith('hold') ? Math.round(b.price * 1.4) : b.price

  const seatPrice = (seat) => (seat ? SEAT_PRICES[seatType(parseInt(seat, 10))] : 0)
  const lines = [
    { label: `Bilet × ${pax}`, amount: flight.price * pax },
    ...passengers
      .filter((p) => bagById(p.bag).price > 0)
      .map((p) => ({
        label: `${bagById(p.bag).name}${p.first ? `, ${p.first}` : ''}`,
        amount: chargedBag(bagById(p.bag)),
      })),
    ...passengers
      .filter((p) => p.seat)
      .map((p) => ({ label: `Loc ${p.seat}${p.first ? `, ${p.first}` : ''}`, amount: seatPrice(p.seat) })),
    ...extras.map((id) => {
      const e = EXTRAS.find((x) => x.id === id)
      return { label: `${e.name} × ${pax}`, amount: e.price * pax }
    }),
  ]
  const total = lines.reduce((s, l) => s + l.amount, 0)

  // --- Validare pe pas -----------------------------------------------------
  const paxValid = passengers.every((p) => p.first.trim() && p.last.trim())
  const canNext = step !== 0 || paxValid

  const pay = () => {
    const booking = {
      pnr: makePnr(),
      createdAt: new Date().toISOString().slice(0, 10),
      appVersion: version,
      flight,
      passengers: passengers.map((p) => ({ ...p, first: p.first.trim(), last: p.last.trim() })),
      extras,
      total,
      checkedIn: false,
    }
    addBooking(booking)
    setDone(booking)
  }

  if (done) {
    return (
      <div className="wrap section narrow">
        <div className="confirm">
          <h1>Rezervarea e confirmată</h1>
          <p>
            Codul tău de rezervare este <span className="pnr">{done.pnr}</span>. Îl folosești la check-in,
            împreună cu numele de familie.
          </p>
          <div className="row gap-s">
            <Link className="btn btn-primary" to={`/check-in?pnr=${done.pnr}&last=${encodeURIComponent(done.passengers[0].last)}`}>
              Fă check-in
            </Link>
            <Link className="btn btn-ghost" to="/cont">Vezi rezervările mele</Link>
          </div>
        </div>
      </div>
    )
  }

  const seatMapBroken = bug('seatMapA321') && flight.aircraft === 'A321neo'

  return (
    <div className="wrap section booking">
      <div className="booking-main">
        <ol className="stepper">
          {STEPS.map((s, i) => (
            <li key={s} className={i === step ? 'is-current' : i < step ? 'is-done' : ''}>
              <span className="step-n">{i + 1}</span> {s}
            </li>
          ))}
        </ol>

        {step === 0 && (
          <section>
            <h2>Cine călătorește?</h2>
            <p className="muted">Scrie numele exact ca în actul de identitate. Corectarea ulterioară se taxează.</p>
            {passengers.map((p, i) => (
              <fieldset key={i} className="pax">
                <legend>Pasagerul {i + 1}</legend>
                <div className="grid-2">
                  <div className="field">
                    <label htmlFor={`first-${i}`}>Prenume</label>
                    <input id={`first-${i}`} value={p.first} onChange={(e) => updatePax(i, { first: e.target.value })} autoComplete="given-name" />
                  </div>
                  <div className="field">
                    <label htmlFor={`last-${i}`}>Nume de familie</label>
                    <input id={`last-${i}`} value={p.last} onChange={(e) => updatePax(i, { last: e.target.value })} autoComplete="family-name" />
                  </div>
                </div>
              </fieldset>
            ))}
          </section>
        )}

        {step === 1 && (
          <section>
            <h2>Bagaje</h2>
            <p className="muted">Geanta mică e inclusă. Bagajele adăugate acum costă mai puțin decât la aeroport.</p>
            {passengers.map((p, i) => (
              <fieldset key={i} className="pax">
                <legend>{p.first} {p.last}</legend>
                <div className="bag-options">
                  {BAGS.map((b) => (
                    <label key={b.id} className={`option ${p.bag === b.id ? 'is-on' : ''}`}>
                      <input type="radio" name={`bag-${i}`} checked={p.bag === b.id} onChange={() => updatePax(i, { bag: b.id })} />
                      <span className="option-name">{b.name}</span>
                      <span className="small muted">{b.detail}</span>
                      <span className="option-price">{b.price === 0 ? 'Inclus' : lei(b.price)}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}

            <h2>Extra pentru toți pasagerii</h2>
            <div className="bag-options">
              {EXTRAS.map((e) => {
                const on = extras.includes(e.id)
                return (
                  <label key={e.id} className={`option ${on ? 'is-on' : ''}`}>
                    <input type="checkbox" checked={on} onChange={() => setExtras(on ? extras.filter((x) => x !== e.id) : [...extras, e.id])} />
                    <span className="option-name">{e.name}</span>
                    <span className="small muted">{e.detail}</span>
                    <span className="option-price">{lei(e.price)} / pers.</span>
                  </label>
                )
              })}
            </div>
          </section>
        )}

        {step === 2 && (
          <section>
            <h2>Alege locurile</h2>
            <p className="muted">
              Opțional. Dacă nu alegi, primești un loc gratuit la check-in. Primele rânduri costă {lei(SEAT_PRICES.front)},
              ieșirile de urgență {lei(SEAT_PRICES.exit)}, restul {lei(SEAT_PRICES.standard)}.
            </p>

            <div className="pax-tabs" role="tablist">
              {passengers.map((p, i) => (
                <button key={i} role="tab" aria-selected={activePax === i} className={activePax === i ? 'is-active' : ''} onClick={() => setActivePax(i)}>
                  {p.first} {p.seat && <b>{p.seat}</b>}
                </button>
              ))}
            </div>

            {seatMapBroken ? (
              // Bug WB-1013 / WB-1016 / WB-1029: harta nu se încarcă pentru A321neo
              <div className="seatmap-loading" aria-busy="true">
                <span className="spinner" aria-hidden="true" />
                <p>Se încarcă harta locurilor…</p>
              </div>
            ) : (
              <div className="seatmap" aria-label={`Harta locurilor, ${flight.aircraft}`}>
                {Array.from({ length: ROWS }, (_, r) => r + 1).map((row) => (
                  <div key={row} className={`seat-row t-${seatType(row)}`}>
                    {LETTERS.map((l, li) => {
                      const id = `${row}${l}`
                      const mine = passengers.findIndex((p) => p.seat === id)
                      const isTaken = taken.has(id) && mine === -1
                      return (
                        <span key={l} className="seat-cell">
                          {li === 3 && <span className="aisle">{row}</span>}
                          <button
                            className={`seat ${mine === activePax ? 'is-mine' : mine > -1 ? 'is-other' : ''}`}
                            disabled={isTaken || (mine > -1 && mine !== activePax)}
                            aria-label={`Loc ${id}${isTaken ? ', ocupat' : ''}`}
                            onClick={() => updatePax(activePax, { seat: passengers[activePax].seat === id ? '' : id })}
                          >
                            {l}
                          </button>
                        </span>
                      )
                    })}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {step === 3 && (
          <section>
            <h2>Verifică și plătește</h2>
            <p className="muted">Plata e simulată. Nu introduci date de card și nu se încasează nimic.</p>
            <table className="summary">
              <tbody>
                {lines.map((l, i) => (
                  <tr key={i}><td>{l.label}</td><td className="right">{lei(l.amount)}</td></tr>
                ))}
              </tbody>
              <tfoot>
                <tr><th>Total</th><th className="right">{lei(total)}</th></tr>
              </tfoot>
            </table>
            <button className="btn btn-primary btn-l" onClick={pay}>Plătește {lei(total)}</button>
          </section>
        )}

        <div className="step-nav">
          {step > 0 && <button className="btn btn-ghost" onClick={() => setStep(step - 1)}>Înapoi</button>}
          {step < 3 && (
            <button className="btn btn-primary" disabled={!canNext} onClick={() => setStep(step + 1)}>
              {step === 2 && !passengers.some((p) => p.seat) ? 'Continuă fără locuri' : 'Continuă'}
            </button>
          )}
          {step === 0 && !paxValid && <span className="small muted">Completează numele tuturor pasagerilor.</span>}
        </div>
      </div>

      <aside className="booking-side">
        <h3>Zborul tău</h3>
        <p className="side-route">
          {airport(flight.from).city} <span className="muted">spre</span> {airport(flight.to).city}
        </p>
        <p className="small">
          {formatDate(flight.date, { weekday: 'long', day: 'numeric', month: 'long' })}
          <br />
          {flight.dep} – {flight.arr}, {flight.number}
        </p>
        <div className="side-total">
          <span>Total</span>
          <b>{lei(total)}</b>
        </div>
      </aside>
    </div>
  )
}
