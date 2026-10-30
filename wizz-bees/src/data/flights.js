// Generator determinist de zboruri.
// Nu avem backend, așa că zborurile sunt „calculate” din rută + dată cu un
// generator pseudo-aleator cu seed. Aceeași căutare dă mereu același rezultat,
// ceea ce face demo-ul reproductibil (important când verificați un bug).

// Hash simplu de string -> întreg pe 32 de biți (folosit ca seed)
function hash(str) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

// mulberry32: PRNG mic și rapid; returnează o funcție care dă numere în [0, 1)
export function rng(seedStr) {
  let a = hash(seedStr)
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const pad = (n) => String(n).padStart(2, '0')
const toHHMM = (min) => `${pad(Math.floor(min / 60) % 24)}:${pad(min % 60)}`

export const AIRCRAFT = ['A321neo', 'A320', 'A321neo', 'A321ceo']

/**
 * Întoarce zborurile dintre două aeroporturi într-o zi dată (YYYY-MM-DD).
 * 1–3 zboruri pe zi, durată și preț derivate din seed.
 */
export function searchFlights(from, to, dateISO) {
  if (!from || !to || from === to) return []
  const r = rng(`${from}-${to}-${dateISO}`)
  // Durata depinde doar de rută, nu și de zi (cum e în realitate)
  const routeR = rng(`${from}-${to}`)
  const duration = 70 + Math.floor(routeR() * 170) // 70–240 min
  const count = 1 + Math.floor(r() * 3)
  const flights = []
  for (let i = 0; i < count; i++) {
    const dep = 6 * 60 + Math.floor(r() * 15 * 60 / 5) * 5 // 06:00–21:00
    const base = 79 + Math.floor(r() * 520)                  // lei
    const seatsLeft = 2 + Math.floor(r() * 40)
    flights.push({
      id: `WB${100 + Math.floor(routeR() * 800) + i * 2}-${dateISO}`,
      number: `WB ${100 + Math.floor(routeR() * 800) + i * 2}`,
      from,
      to,
      date: dateISO,
      dep: toHHMM(dep),
      arr: toHHMM(dep + duration),
      nextDay: dep + duration >= 24 * 60,
      duration,
      aircraft: AIRCRAFT[Math.floor(r() * AIRCRAFT.length)],
      price: base,
      seatsLeft,
    })
  }
  return flights.sort((a, b) => a.dep.localeCompare(b.dep))
}

/** Cel mai mic preț pe zi, pentru banda de 7 zile din pagina de rezultate. */
export function lowestPrice(from, to, dateISO) {
  const f = searchFlights(from, to, dateISO)
  return f.length ? Math.min(...f.map((x) => x.price)) : null
}

export const formatDuration = (min) => `${Math.floor(min / 60)}h ${pad(min % 60)}m`

export const lei = (n) =>
  new Intl.NumberFormat('ro-RO', { maximumFractionDigits: 0 }).format(n) + ' lei'

export const addDays = (iso, n) => {
  const d = new Date(iso + 'T12:00:00')
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

export const formatDate = (iso, opts = { weekday: 'short', day: 'numeric', month: 'short' }) =>
  new Date(iso + 'T12:00:00').toLocaleDateString('ro-RO', opts)
