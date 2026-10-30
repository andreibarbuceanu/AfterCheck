import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { airport } from '../data/airports'
import { useStore } from '../store'

// Aceleași categorii ca în Excel-ul cu tichete, ca recenziile să se poată
// grupa cu tichetele din aceeași categorie.
const CATEGORIES = [
  'Rezervare', 'Plăți', 'Bagaje', 'Check-in', 'Rambursări', 'Cont',
  'Notificări', 'Aplicație', 'Suport', 'Asistență specială', 'Abonamente',
]

export default function Review() {
  const [params] = useSearchParams()
  const { bookings, addReview, version } = useStore()
  const [form, setForm] = useState({
    type: 'Recenzie',
    pnr: params.get('pnr') || '',
    category: 'Check-in',
    rating: 0,
    title: '',
    message: '',
  })
  const [sent, setSent] = useState(null)
  const [error, setError] = useState('')
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const submit = (e) => {
    e.preventDefault()
    if (form.rating === 0) {
      setError('Alege o notă de la 1 la 5.')
      return
    }
    const review = {
      ...form,
      id: `REC-${Date.now().toString(36).toUpperCase()}`,
      date: new Date().toISOString().slice(0, 10),
      appVersion: version, // versiunea simulată, utilă la verificarea fix-urilor
      platform: 'Web',
    }
    addReview(review)
    setSent(review)
  }

  if (sent) {
    return (
      <div className="wrap section narrow">
        <div className="confirm">
          <h1>{sent.type === 'Reclamație' ? 'Reclamația a fost trimisă' : 'Recenzia a fost trimisă'}</h1>
          <p>
            Referința ta este <span className="pnr">{sent.id}</span>.
            {sent.type === 'Reclamație' && ' Îți răspundem în cel mult 5 zile lucrătoare.'}
          </p>
          <Link className="btn btn-primary" to="/cont">Înapoi la contul meu</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="wrap section narrow">
      <Link to="/cont" className="back">Contul meu</Link>
      <h1>Cum a fost călătoria?</h1>

      <form className="review-form" onSubmit={submit}>
        <div className="seg" role="radiogroup" aria-label="Tip mesaj">
          {['Recenzie', 'Reclamație'].map((t) => (
            <label key={t} className={form.type === t ? 'is-on' : ''}>
              <input type="radio" name="type" value={t} checked={form.type === t} onChange={set('type')} />
              {t}
            </label>
          ))}
        </div>

        <div className="grid-2">
          <div className="field">
            <label htmlFor="pnr">Rezervarea</label>
            <select id="pnr" value={form.pnr} onChange={set('pnr')}>
              <option value="">Fără rezervare</option>
              {bookings.map((b) => (
                <option key={b.pnr} value={b.pnr}>
                  {b.pnr}, {airport(b.flight.from).city} spre {airport(b.flight.to).city}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="category">Despre ce e vorba</label>
            <select id="category" value={form.category} onChange={set('category')}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <fieldset className="field">
          <legend>Nota ta</legend>
          <div className="hex-rating">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                type="button"
                key={n}
                className={n <= form.rating ? 'is-on' : ''}
                aria-label={`${n} din 5`}
                aria-pressed={n === form.rating}
                onClick={() => { setForm({ ...form, rating: n }); setError('') }}
              >
                <svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 3 L35 11.5 L35 28.5 L20 37 L5 28.5 L5 11.5 Z" /></svg>
                <span>{n}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <div className="field">
          <label htmlFor="title">Titlu</label>
          <input id="title" value={form.title} onChange={set('title')} maxLength={90} required placeholder="ex. Check-in-ul a dat eroare pentru familia mea" />
        </div>
        <div className="field">
          <label htmlFor="message">Ce s-a întâmplat</label>
          <textarea id="message" rows={6} value={form.message} onChange={set('message')} required />
        </div>

        <p className="small muted">Trimitem automat și versiunea aplicației ({version}), ca echipa să verifice dacă problema e deja rezolvată.</p>
        {error && <p className="error" role="alert">{error}</p>}
        <button className="btn btn-primary btn-l" type="submit">
          {form.type === 'Reclamație' ? 'Trimite reclamația' : 'Trimite recenzia'}
        </button>
      </form>
    </div>
  )
}
