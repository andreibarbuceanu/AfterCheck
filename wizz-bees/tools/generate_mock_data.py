"""
Generator pentru datele mock Wizz Bees.

De ce un singur script: release-urile din aplicație (pagina „Noutăți”) și
tichetele din Excel trebuie să spună aceeași poveste. Fiecare fix din
changelog are un ID de tichet, iar fiecare tichet rezolvat indică versiunea
în care a fost livrat fix-ul. Dacă le-am genera separat, s-ar desincroniza.

Rulare (din rădăcina proiectului):
    python3 tools/generate_mock_data.py

Ieșiri:
    src/data/releases.json     -> citit de aplicația React (pagina Noutăți)
    mock-data/tickets.json     -> intrare pentru build_tickets_xlsx.py
"""

import json
import random
from datetime import date, timedelta
from pathlib import Path

# Seed fix: aceleași date la fiecare rulare, ca demo-ul să fie reproductibil.
random.seed(42)

ROOT = Path(__file__).resolve().parent.parent

# ---------------------------------------------------------------------------
# 1. Release-uri: o versiune la ~3 săptămâni, ianuarie–octombrie 2026
# ---------------------------------------------------------------------------
RELEASE_START = date(2026, 1, 12)
releases = []
d = RELEASE_START
for minor in range(0, 15):
    releases.append({
        "version": f"3.{minor}.0",
        "date": d,
        "platforms": ["Web", "iOS", "Android"],
        "fixes": [],       # completat mai jos cu ID-uri de tichete
        "features": [],
    })
    d += timedelta(days=random.choice([19, 20, 21, 22]))

FEATURES = [
    "Hartă de locuri redesenată, cu filtru pentru locuri lângă ieșire",
    "Boarding pass salvabil offline",
    "Plată în rate pentru rezervări peste 500 €",
    "Notificări push pentru schimbarea porții",
    "Abonament BeeClub cu reducere la bagaje",
    "Alegerea mesei calde la rezervare",
    "Mod întunecat în aplicația mobilă",
    "Check-in automat cu 48h înainte",
    "Asistență specială (PRM) direct din aplicație",
    "Istoric rezervări cu export PDF",
    "Comparare tarife pe 7 zile",
    "Transfer de nume pe bilet din cont",
    "Portofel BeeCredit pentru rambursări",
    "Asistent chat pentru întrebări despre bagaje",
    "Plată cu Apple Pay și Google Pay",
]
for r, f in zip(releases, FEATURES):
    r["features"].append(f)

# ---------------------------------------------------------------------------
# 2. Șabloane de probleme: realiste pentru o companie aeriană low-cost.
#    keywords_en ajută aplicația voastră să găsească recenzii publice despre
#    același tip de problemă (recenziile sunt mai ales în engleză).
# ---------------------------------------------------------------------------
ISSUES = [
    ("Check-in", "Check-in online", "Check-in-ul online eșuează pentru grupuri de peste 4 pasageri",
     "La finalizarea check-in-ului pentru 5+ pasageri apare eroarea „Ceva nu a mers bine”. Pasagerii sunt trimiși la ghișeu și plătesc taxa de check-in în aeroport.",
     "online check-in failed; check-in error group; forced airport check-in fee", "Echipa Check-in", "Critică"),
    ("Check-in", "Boarding pass", "Boarding pass-ul nu se descarcă pe Android 14",
     "Butonul „Descarcă boarding pass” nu face nimic pe Android 14. Pe iOS și web funcționează.",
     "boarding pass download not working; boarding pass app android; can't get boarding pass", "Echipa Mobile", "Mare"),
    ("Check-in", "Boarding pass", "Codul QR de pe boarding pass nu e citit la poartă",
     "Codul QR generat în aplicație are contrast prea mic în modul întunecat. Scannerele de la poartă nu îl citesc.",
     "boarding pass qr not scanning; gate scanner rejected; dark mode boarding pass", "Echipa Mobile", "Mare"),
    ("Plăți", "Plată card", "Plata e respinsă, dar suma e blocată pe card",
     "Clientul vede „Plată eșuată”, însă banca blochează suma. Clientul reîncearcă și ajunge să plătească de două ori.",
     "payment failed but charged; double charged; money taken booking failed", "Echipa Plăți", "Critică"),
    ("Plăți", "Conversie valutară", "Prețul în RON diferă între căutare și plată",
     "Tariful afișat la căutare este în RON, dar la plată apare o sumă mai mare, din cauza unui curs de schimb vechi.",
     "price changed at checkout; currency conversion wrong; hidden fees checkout", "Echipa Plăți", "Medie"),
    ("Bagaje", "Adăugare bagaj", "Prețul bagajului de cală crește după rezervare",
     "Același bagaj de 20 kg costă mult mai mult când e adăugat după rezervare. Prețul nu e afișat clar la rezervare.",
     "baggage price after booking; checked bag expensive; luggage fee increase", "Echipa Ancillaries", "Medie"),
    ("Bagaje", "Dimensiuni bagaj", "Ghidul de dimensiuni pentru bagajul de mână e neclar",
     "Pagina de bagaje nu arată clar diferența dintre geanta mică gratuită și trolerul de 10 kg. Clienții plătesc taxe la poartă.",
     "cabin bag size; carry-on fee at gate; hand luggage charged gate", "Echipa Conținut", "Mică"),
    ("Rezervare", "Selecție locuri", "Harta de locuri nu se încarcă pentru zborurile cu A321neo",
     "La aeronavele A321neo harta rămâne goală și clientul nu poate alege loc.",
     "seat map not loading; can't select seat; seat selection error", "Echipa Rezervări", "Mare"),
    ("Rezervare", "Selecție locuri", "Familiile sunt așezate separat deși au plătit locuri",
     "Locurile alese pentru copii sunt reatribuite la check-in, iar copiii ajung separați de părinți.",
     "family seated apart; kids separated from parents; paid seats changed", "Echipa Rezervări", "Mare"),
    ("Rezervare", "Căutare zboruri", "Căutarea flexibilă afișează zboruri anulate",
     "Calendarul de tarife arată prețuri pentru zboruri deja anulate din orar.",
     "flight cancelled after booking; booked cancelled flight; search shows cancelled", "Echipa Rezervări", "Medie"),
    ("Rambursări", "Cerere rambursare", "Cererile de rambursare rămân „În procesare” peste 30 de zile",
     "După anularea zborului, cererile de rambursare nu trec de starea „În procesare”. Clienții nu primesc nicio actualizare.",
     "refund not received; refund pending weeks; still waiting for refund", "Echipa Rambursări", "Critică"),
    ("Rambursări", "BeeCredit", "Rambursarea se face automat în BeeCredit în loc de card",
     "Opțiunea implicită de rambursare este creditul în cont, iar clientul nu poate alege cardul.",
     "refund as credit only; forced voucher; wizz credit instead of refund", "Echipa Rambursări", "Mare"),
    ("Cont", "Autentificare", "Codul OTP de autentificare nu ajunge prin SMS",
     "Pentru numerele din România și Italia, SMS-ul cu codul de autentificare ajunge cu întârziere sau deloc.",
     "verification code not received; sms code login; can't log in account", "Echipa Identitate", "Mare"),
    ("Cont", "Profil", "Modificarea numelui pe bilet cere taxă chiar și pentru o greșeală de tastare",
     "Corectarea unei litere din nume este taxată ca schimbare completă de nume.",
     "name change fee; typo in name charged; correct name on ticket", "Echipa Rezervări", "Medie"),
    ("Notificări", "Schimbare poartă", "Notificarea de schimbare a porții ajunge după îmbarcare",
     "Notificarea push despre poarta nouă ajunge cu 20–40 de minute întârziere.",
     "gate change not notified; missed flight gate change; no notification delay", "Echipa Mobile", "Mare"),
    ("Notificări", "Întârzieri", "Nu se trimite email la întârzieri de peste 3 ore",
     "Clienții nu sunt anunțați de întârzierile mari și nu află că pot cere compensație.",
     "flight delay no information; delayed no email; compensation delay", "Echipa Operațiuni Digitale", "Mare"),
    ("Aplicație", "Stabilitate", "Aplicația iOS se închide la deschiderea rezervării",
     "Pe iOS 19.1, aplicația se închide imediat după ce clientul apasă pe o rezervare din „Călătoriile mele”.",
     "app crashes; app keeps crashing ios; app closes booking", "Echipa Mobile", "Critică"),
    ("Aplicație", "Performanță", "Încărcare lentă a paginii de plată pe web",
     "Pagina de plată se încarcă în 8–12 secunde și unii clienți abandonează rezervarea.",
     "website slow; checkout page slow; website keeps loading", "Echipa Web", "Medie"),
    ("Suport", "Chat", "Asistentul chat repetă aceleași răspunsuri și nu transferă la un agent",
     "Asistentul chat nu oferă opțiunea de a vorbi cu un agent, iar clientul rămâne blocat.",
     "customer service chat bot useless; can't reach human; no customer support", "Echipa Suport", "Mare"),
    ("Asistență specială", "PRM", "Cererea de asistență specială nu ajunge la aeroport",
     "Cererile de asistență cu scaun rulant făcute din aplicație nu sunt transmise echipei de la aeroport.",
     "wheelchair assistance not provided; special assistance failed; reduced mobility", "Echipa Operațiuni Digitale", "Critică"),
    ("Rezervare", "Priority", "Priority Boarding nu apare pe boarding pass după upgrade",
     "Clientul cumpără Priority după rezervare, dar boarding pass-ul nu se actualizează și e oprit la poartă.",
     "priority boarding not on boarding pass; paid priority refused; priority not showing", "Echipa Ancillaries", "Mare"),
    ("Abonamente", "BeeClub", "Reducerea BeeClub nu se aplică la bagaje",
     "Membrii BeeClub nu primesc reducerea promisă la bagajul de cală.",
     "discount club not applied; membership discount; club price not working", "Echipa Ancillaries", "Mică"),
]

CANALE = ["Aplicație iOS", "Aplicație Android", "Web", "Call center", "Email", "Rețele sociale"]

# ---------------------------------------------------------------------------
# 3. Tichete. Fiecare problemă produce 1–3 tichete. Câteva tichete sunt
#    redeschise după fix: exact cazul „fix livrat, dar nimeni n-a verificat”
#    din Provocarea 2.
# ---------------------------------------------------------------------------
def release_after(day, min_gap=7):
    """Primul release livrat la cel puțin `min_gap` zile după `day`."""
    for r in releases:
        if r["date"] >= day + timedelta(days=min_gap):
            return r
    return None

TODAY = date(2026, 10, 24)
tickets = []
next_id = 1001

for (cat, func, titlu, desc, kw, echipa, sev) in ISSUES:
    n = random.choices([1, 2, 3], weights=[2, 4, 3])[0]
    opened = date(2026, 1, 5) + timedelta(days=random.randint(0, 220))
    prev = None  # tichetul anterior pe aceeași temă (dict) sau None
    for k in range(n):
        tid = f"WB-{next_id}"
        next_id += 1
        version_reported = max(
            (r for r in releases if r["date"] <= opened), key=lambda r: r["date"],
            default=releases[0])["version"]

        rel = release_after(opened, min_gap=random.randint(7, 35))
        roll = random.random()
        status, fix_version, fix_date, closed = "", "", None, None

        if rel is None or (k == n - 1 and roll < 0.18):
            status = random.choice(["Nou", "În lucru"])
        elif roll < 0.25 and k == 0:
            status = "Închis – nu se reproduce"
            closed = opened + timedelta(days=random.randint(3, 12))
        else:
            status = "Rezolvat – fix livrat"
            fix_version, fix_date = rel["version"], rel["date"]
            rel["fixes"].append({"ticket": tid, "text": titlu})

        # Al doilea/al treilea tichet pe aceeași temă:
        #  - dacă tichetul anterior avea fix livrat -> regresie („Redeschis după fix”)
        #  - altfel -> problema e raportată din nou
        if prev and prev["status"] == "Rezolvat – fix livrat":
            titlu_k = f"[Redeschis după fix] {titlu}"
            desc_k = (f"Clienții raportează din nou problema după fix-ul din versiunea "
                      f"{prev['fix_version']} ({{LINK}}). " + desc)
        elif prev and prev["status"] in ("Nou", "În lucru"):
            titlu_k = f"[Duplicat] {titlu}"
            desc_k = "Raportare nouă pentru aceeași problemă, încă deschisă în {LINK}. " + desc
        elif prev:
            titlu_k = f"[Raportat din nou] {titlu}"
            desc_k = "Problema apare din nou după închiderea {LINK}. " + desc
        else:
            titlu_k, desc_k = titlu, desc

        tickets.append({
            "id": tid,
            "opened": opened.isoformat(),
            "channel": random.choice(CANALE),
            "category": cat,
            "feature": func,
            "title": titlu_k,
            "description": desc_k,
            "severity": sev,
            "reports": random.randint(3, 420) if sev in ("Critică", "Mare") else random.randint(1, 90),
            "version_reported": version_reported,
            "status": status,
            "fix_version": fix_version,
            "fix_date": fix_date.isoformat() if fix_date else "",
            "closed": closed.isoformat() if closed else "",
            "team": echipa,
            "linked": prev["id"] if prev else "",
            "keywords_en": kw,
        })

        # Următorul tichet pe aceeași temă apare după fix (regresie) sau mai târziu
        base = fix_date or opened
        opened = base + timedelta(days=random.randint(10, 45))
        if opened > TODAY - timedelta(days=3):
            break
        prev = tickets[-1]

# Sortăm cronologic și renumerotăm, ca ID-urile să crească odată cu data.
tickets.sort(key=lambda t: t["opened"])
remap = {t["id"]: f"WB-{1001 + i}" for i, t in enumerate(tickets)}
for t in tickets:
    t["id"] = remap[t["id"]]
    if t["linked"]:
        t["linked"] = remap[t["linked"]]
    # ID-ul tichetului legat se completează abia acum, după renumerotare
    t["description"] = t["description"].replace("{LINK}", t["linked"])
for r in releases:
    for f in r["fixes"]:
        f["ticket"] = remap[f["ticket"]]
    r["fixes"].sort(key=lambda f: f["ticket"])

# ---------------------------------------------------------------------------
# 4. Scriere fișiere
# ---------------------------------------------------------------------------
releases_out = [
    {**r, "date": r["date"].isoformat()} for r in reversed(releases)  # cele mai noi primele
]
(ROOT / "src/data/releases.json").write_text(
    json.dumps(releases_out, ensure_ascii=False, indent=2), encoding="utf-8")
(ROOT / "mock-data/tickets.json").write_text(
    json.dumps({"tickets": tickets, "releases": releases_out}, ensure_ascii=False, indent=2),
    encoding="utf-8")

print(f"{len(releases_out)} release-uri, {len(tickets)} tichete")
from collections import Counter
print(Counter(t["status"] for t in tickets))
