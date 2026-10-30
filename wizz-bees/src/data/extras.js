// Opțiuni de bagaj și servicii suplimentare. Prețurile sunt fictive.
export const BAGS = [
  { id: 'small', name: 'Geantă mică', detail: '40 × 30 × 20 cm, sub scaun', price: 0, included: true },
  { id: 'trolley', name: 'Troler de cabină', detail: '10 kg, 55 × 40 × 23 cm, include Priority', price: 129 },
  { id: 'hold20', name: 'Bagaj de cală 20 kg', detail: 'Predat la ghișeu', price: 189 },
  { id: 'hold32', name: 'Bagaj de cală 32 kg', detail: 'Predat la ghișeu', price: 269 },
]

export const EXTRAS = [
  { id: 'priority', name: 'Priority Boarding', detail: 'Îmbarcare în primul grup', price: 59 },
  { id: 'flex', name: 'Schimbare flexibilă', detail: 'Schimbi data o dată, fără taxă', price: 99 },
  { id: 'checkin', name: 'Check-in automat', detail: 'Primești boarding pass-ul cu 48h înainte', price: 25 },
]

export const SEAT_PRICES = { front: 69, exit: 89, standard: 29 }

export const bagById = (id) => BAGS.find((b) => b.id === id)
export const extraById = (id) => EXTRAS.find((e) => e.id === id)
