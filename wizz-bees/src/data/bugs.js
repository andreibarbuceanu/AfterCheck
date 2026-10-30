// Bug-uri reproductibile în aplicație, legate de tichetele din
// mock-data/wizz-bees-tichete.xlsx.
//
// De ce există: pentru Provocarea 2 („fix-uri livrate pe care nu le verifică
// nimeni”) aplicația trebuie să aibă probleme reale care apar sau dispar în
// funcție de versiune. Din footer alegeți versiunea simulată, iar bug-urile de
// mai jos se comportă ca în istoricul din Excel.
//
//   fixedIn: versiunea din care bug-ul chiar a dispărut
//            null = fix-ul livrat NU a funcționat, bug-ul e încă prezent
//
// ID-urile vin din tools/generate_mock_data.py (seed fix = 42). Dacă schimbați
// seed-ul, actualizați și ID-urile de aici.

export const BUGS = {
  groupCheckIn: {
    title: 'Check-in-ul online eșuează pentru grupuri de peste 4 pasageri',
    tickets: ['WB-1027', 'WB-1040'],
    shippedFixes: ['3.11.0'],
    fixedIn: null, // fix livrat în 3.11.0, dar redeschis în WB-1040
  },
  seatMapA321: {
    title: 'Harta de locuri nu se încarcă pentru A321neo',
    tickets: ['WB-1013', 'WB-1016', 'WB-1029'],
    shippedFixes: ['3.8.0', '3.11.0'],
    fixedIn: '3.11.0', // primul fix (3.8.0) n-a mers, al doilea da
  },
  bagPriceMismatch: {
    title: 'Prețul bagajului de cală crește după rezervare',
    tickets: ['WB-1008'],
    shippedFixes: ['3.6.0'],
    fixedIn: '3.6.0',
  },
  qrLowContrast: {
    title: 'Codul QR de pe boarding pass nu e citit la poartă',
    tickets: ['WB-1022', 'WB-1036', 'WB-1042'],
    shippedFixes: ['3.8.0', '3.12.0'],
    fixedIn: null, // două fix-uri livrate, problema persistă
  },
}

// Compară versiuni semver simple: "3.10.0" > "3.9.0"
export function cmpVersion(a, b) {
  const pa = a.split('.').map(Number)
  const pb = b.split('.').map(Number)
  for (let i = 0; i < 3; i++) {
    if (pa[i] !== pb[i]) return pa[i] - pb[i]
  }
  return 0
}

export function isBugActive(key, version) {
  const bug = BUGS[key]
  if (!bug) return false
  if (bug.fixedIn === null) return true
  return cmpVersion(version, bug.fixedIn) < 0
}
