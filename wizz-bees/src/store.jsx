// Starea globală a aplicației.
//
// Nu avem backend: rezervările, recenziile și versiunea simulată stau în
// localStorage. Un singur Context e suficient pentru o aplicație de demo;
// într-un proiect mare ați separa pe domenii sau ați folosi un store dedicat.
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import releases from './data/releases.json'
import { isBugActive } from './data/bugs'

const CURRENT_VERSION = releases[0].version // releases.json e sortat descrescător

// localStorage poate arunca excepții (mod privat, stocare blocată),
// așa că fiecare citire/scriere e protejată.
function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}
function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* fără persistență: aplicația merge în continuare în memorie */
  }
}

// Rezervări de demo, ca să puteți testa check-in-ul imediat
const SEED_BOOKINGS = [
  {
    pnr: 'BEE5X2',
    createdAt: '2026-10-02',
    flight: {
      id: 'WB412-2026-10-28', number: 'WB 412', from: 'OTP', to: 'BCN', date: '2026-10-28',
      dep: '07:15', arr: '09:50', duration: 215, aircraft: 'A321neo', price: 289,
    },
    passengers: [
      { first: 'Andrei', last: 'Popescu', bag: 'hold20', seat: '12A' },
      { first: 'Ioana', last: 'Popescu', bag: 'trolley', seat: '12B' },
      { first: 'Matei', last: 'Popescu', bag: 'small', seat: '12C' },
      { first: 'Sara', last: 'Popescu', bag: 'small', seat: '12D' },
      { first: 'Elena', last: 'Marin', bag: 'hold20', seat: '13A' },
      { first: 'Victor', last: 'Marin', bag: 'small', seat: '13B' },
    ],
    extras: ['priority'],
    total: 2650,
    checkedIn: false,
  },
  {
    pnr: 'HNY42K',
    createdAt: '2026-10-10',
    flight: {
      id: 'WB233-2026-10-30', number: 'WB 233', from: 'CLJ', to: 'LTN', date: '2026-10-30',
      dep: '18:40', arr: '20:25', duration: 165, aircraft: 'A320', price: 349,
    },
    passengers: [{ first: 'Daria', last: 'Ionescu', bag: 'trolley', seat: '3F' }],
    extras: [],
    total: 548,
    checkedIn: false,
  },
]

const StoreContext = createContext(null)

export function StoreProvider({ children }) {
  const [version, setVersion] = useState(() => load('wb.version', CURRENT_VERSION))
  const [bookings, setBookings] = useState(() => load('wb.bookings', SEED_BOOKINGS))
  const [reviews, setReviews] = useState(() => load('wb.reviews', []))

  useEffect(() => save('wb.version', version), [version])
  useEffect(() => save('wb.bookings', bookings), [bookings])
  useEffect(() => save('wb.reviews', reviews), [reviews])

  const value = useMemo(
    () => ({
      version,
      currentVersion: CURRENT_VERSION,
      setVersion,
      bug: (key) => isBugActive(key, version),

      bookings,
      addBooking: (b) => setBookings((list) => [b, ...list]),
      updateBooking: (pnr, patch) =>
        setBookings((list) => list.map((b) => (b.pnr === pnr ? { ...b, ...patch } : b))),
      findBooking: (pnr, last) =>
        bookings.find(
          (b) =>
            b.pnr === pnr.trim().toUpperCase() &&
            b.passengers.some((p) => p.last.toLowerCase() === last.trim().toLowerCase()),
        ),

      reviews,
      addReview: (r) => setReviews((list) => [r, ...list]),

      resetDemo: () => {
        setBookings(SEED_BOOKINGS)
        setReviews([])
        setVersion(CURRENT_VERSION)
      },
    }),
    [version, bookings, reviews],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export const useStore = () => useContext(StoreContext)

// PNR de 6 caractere, fără litere ușor de confundat (O/0, I/1)
export function makePnr() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}
