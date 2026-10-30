# Wizz Bees

Aplicația client pentru demo-ul de la AI Validation Bootcamp (Provocarea 2: fix-uri livrate pe care nu le verifică nimeni).

Wizz Bees este o companie aeriană low-cost fictivă. Fluxurile urmează o aplicație reală de zbor: căutare, rezervare cu bagaje, check-in, boarding pass, cont și reclamații. Identitatea vizuală (fagure, galben și bleumarin) e proprie.

## Pornire

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # build de producție în dist/
```

## Ce conține

| Pagină | Rută | Ce face |
|---|---|---|
| Zboruri | `/` | Căutare după plecare, destinație, dată și pasageri |
| Rezultate | `/zboruri` | Zborurile zilei și prețul minim pe 7 zile |
| Rezervare | `/rezervare` | Pasageri, apoi bagaje și extra, apoi locuri, apoi plată simulată |
| Check-in | `/check-in` | Caută după PNR și nume, face check-in, afișează boarding pass-urile |
| Contul meu | `/cont` | Rezervări, recenzii și reclamații, export CSV |
| Recenzie | `/cont/recenzie` | Formular de recenzie sau reclamație (salvează și versiunea aplicației) |
| Noutăți | `/noutati` | Changelog: funcționalități și fix-uri, cu ID-urile tichetelor |

Nu există backend. Zborurile sunt generate determinist din rută și dată (`src/data/flights.js`). Rezervările și recenziile stau în `localStorage`. Plata e simulată: nu se cer date de card.

Rezervări de demo pentru check-in:

- `HNY42K` / Ionescu, un pasager
- `BEE5X2` / Popescu, grup de 6 pasageri

## Tichete mock și bug-uri pe versiuni

`mock-data/wizz-bees-tichete.xlsx` are patru foi:

- **Tichete**: 43 de tichete, fiecare cu data deschiderii, statusul, versiunea și data fix-ului, tichetul legat și cuvinte cheie în engleză pentru căutarea recenziilor publice.
- **Release-uri**: versiunile 3.0.0–3.14.0 (ian.–oct. 2026), cu tichetele rezolvate în fiecare.
- **Sumar**: formule pentru numărul de tichete pe status și categorie și pentru rata de redeschidere după fix.
- **Legendă**: ce înseamnă fiecare coloană și ce se poate edita.

Din footer alegeți **versiunea aplicației**. Patru bug-uri din tichete se reproduc în funcție de versiune (`src/data/bugs.js`):

| Bug | Tichete | Fix livrat în | Stare reală |
|---|---|---|---|
| Check-in-ul eșuează pentru grupuri de peste 4 pasageri | WB-1027, WB-1040 | 3.11.0 | **Persistă**: fix-ul n-a mers |
| Harta locurilor nu se încarcă pe A321neo | WB-1013, WB-1016, WB-1029 | 3.8.0, 3.11.0 | Reparat din 3.11.0 |
| Prețul bagajului de cală crește la plată | WB-1008 | 3.6.0 | Reparat din 3.6.0 |
| Codul QR de pe boarding pass e prea șters | WB-1022, WB-1036, WB-1042 | 3.8.0, 3.12.0 | **Persistă**: două fix-uri, niciunul n-a mers |

Exemple de demo: `BEE5X2` dă eroare la check-in chiar și în versiunea curentă. Un zbor cu A321neo în versiunea 3.9.0 rămâne blocat la harta locurilor, iar în 3.14.0 merge.

## Regenerarea datelor

```bash
python3 tools/generate_mock_data.py   # src/data/releases.json + mock-data/tickets.json
python3 tools/build_tickets_xlsx.py   # mock-data/wizz-bees-tichete.xlsx
```

Seed-ul e fix (42), deci datele ies identice la fiecare rulare. Dacă îl schimbați, actualizați ID-urile din `src/data/bugs.js`.
