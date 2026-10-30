// Aeroporturi reale (codurile IATA sunt publice); compania și orarul sunt fictive.
export const AIRPORTS = [
  { code: 'OTP', city: 'București', name: 'Henri Coandă', country: 'România' },
  { code: 'CLJ', city: 'Cluj-Napoca', name: 'Avram Iancu', country: 'România' },
  { code: 'IAS', city: 'Iași', name: 'Aeroportul Iași', country: 'România' },
  { code: 'TSR', city: 'Timișoara', name: 'Traian Vuia', country: 'România' },
  { code: 'SBZ', city: 'Sibiu', name: 'Aeroportul Sibiu', country: 'România' },
  { code: 'LTN', city: 'Londra', name: 'Luton', country: 'Regatul Unit' },
  { code: 'FCO', city: 'Roma', name: 'Fiumicino', country: 'Italia' },
  { code: 'MXP', city: 'Milano', name: 'Malpensa', country: 'Italia' },
  { code: 'NAP', city: 'Napoli', name: 'Capodichino', country: 'Italia' },
  { code: 'BCN', city: 'Barcelona', name: 'El Prat', country: 'Spania' },
  { code: 'MAD', city: 'Madrid', name: 'Barajas', country: 'Spania' },
  { code: 'LIS', city: 'Lisabona', name: 'Humberto Delgado', country: 'Portugalia' },
  { code: 'BUD', city: 'Budapesta', name: 'Ferenc Liszt', country: 'Ungaria' },
  { code: 'CRL', city: 'Bruxelles', name: 'Charleroi', country: 'Belgia' },
  { code: 'DTM', city: 'Dortmund', name: 'Aeroportul Dortmund', country: 'Germania' },
  { code: 'ATH', city: 'Atena', name: 'Eleftherios Venizelos', country: 'Grecia' },
]

export const airport = (code) => AIRPORTS.find((a) => a.code === code)
