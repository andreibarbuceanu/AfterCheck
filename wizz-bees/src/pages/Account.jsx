import { Link } from 'react-router-dom'
import { airport } from '../data/airports'
import { formatDate, lei } from '../data/flights'
import { useStore } from '../store'

// Exportăm recenziile în CSV, ca să le puteți pune lângă tichetele din Excel
function exportCsv(reviews) {
  const cols = ['id', 'date', 'type', 'category', 'rating', 'pnr', 'appVersion', 'title', 'message']
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const csv = [cols.join(','), ...reviews.map((r) => cols.map((c) => esc(r[c])).join(','))].join('\n')
  // BOM ca Excel să citească diacriticele corect
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = 'wizz-bees-recenzii.csv'
  a.click()
  URL.revokeObjectURL(a.href)
}

export default function Account() {
  const { bookings, reviews } = useStore()

  return (
    <div className="wrap section account">
      <h1>Contul meu</h1>

      <section>
        <div className="section-head">
          <h2>Rezervări</h2>
          <Link to="/" className="btn btn-ghost btn-s">Rezervare nouă</Link>
        </div>
        {bookings.length === 0 ? (
          <p className="empty">Nu ai rezervări încă. Caută un zbor ca să începi.</p>
        ) : (
          <ul className="trips">
            {bookings.map((b) => (
              <li key={b.pnr} className="trip">
                <div>
                  <p className="side-route">
                    {airport(b.flight.from).city} <span className="muted">spre</span> {airport(b.flight.to).city}
                  </p>
                  <p className="small muted">
                    {formatDate(b.flight.date, { day: 'numeric', month: 'long', year: 'numeric' })}, {b.flight.dep}.{' '}
                    {b.passengers.length} {b.passengers.length === 1 ? 'pasager' : 'pasageri'}, {lei(b.total)}
                  </p>
                </div>
                <div className="trip-meta">
                  <span className="pnr">{b.pnr}</span>
                  <span className={`tag ${b.checkedIn ? 'tag-ok' : ''}`}>{b.checkedIn ? 'Check-in făcut' : 'Check-in deschis'}</span>
                </div>
                <div className="trip-actions">
                  <Link className="btn btn-primary btn-s" to={`/check-in?pnr=${b.pnr}&last=${encodeURIComponent(b.passengers[0].last)}`}>
                    {b.checkedIn ? 'Boarding pass' : 'Fă check-in'}
                  </Link>
                  <Link className="btn btn-ghost btn-s" to={`/cont/recenzie?pnr=${b.pnr}`}>Lasă o recenzie</Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <div className="section-head">
          <h2>Recenzii și reclamații</h2>
          <div className="row gap-s">
            {reviews.length > 0 && (
              <button className="btn btn-ghost btn-s" onClick={() => exportCsv(reviews)}>Exportă CSV</button>
            )}
            <Link to="/cont/recenzie" className="btn btn-primary btn-s">Scrie una</Link>
          </div>
        </div>
        {reviews.length === 0 ? (
          <p className="empty">Nu ai trimis nicio recenzie. Spune-ne cum a fost zborul sau ce n-a mers.</p>
        ) : (
          <ul className="reviews">
            {reviews.map((r) => (
              <li key={r.id} className="review">
                <div className="review-head">
                  <span className={`tag ${r.type === 'Reclamație' ? 'tag-warn' : ''}`}>{r.type}</span>
                  <span className="small muted">{r.category}, {r.date}, versiunea {r.appVersion}</span>
                  <span className="rating" aria-label={`${r.rating} din 5`}>{'⬢'.repeat(r.rating)}<span className="muted">{'⬡'.repeat(5 - r.rating)}</span></span>
                </div>
                <b>{r.title}</b>
                <p>{r.message}</p>
                <p className="small muted">Referință {r.id}{r.pnr ? `, rezervarea ${r.pnr}` : ''}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
