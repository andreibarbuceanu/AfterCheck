"""
Construiește mock-data/wizz-bees-tichete.xlsx din mock-data/tickets.json.

Rulare (după generate_mock_data.py):
    python3 tools/build_tickets_xlsx.py
"""

import json
from datetime import date
from pathlib import Path

from openpyxl import Workbook
from openpyxl.comments import Comment
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.datavalidation import DataValidation

ROOT = Path(__file__).resolve().parent.parent
data = json.loads((ROOT / "mock-data/tickets.json").read_text(encoding="utf-8"))
tickets, releases = data["tickets"], data["releases"]

FONT = "Arial"
HEADER_FILL = PatternFill("solid", fgColor="1C1A17")      # negru „bee”
HEADER_FONT = Font(name=FONT, bold=True, color="FFC21A")  # galben „bee”
BODY = Font(name=FONT, size=10)
THIN = Side(style="thin", color="D9D4C7")
BORDER = Border(bottom=THIN)
WRAP = Alignment(wrap_text=True, vertical="top")
TOP = Alignment(vertical="top")

STATUS_FILL = {
    "Rezolvat – fix livrat": "E6F4EA",
    "În lucru": "FFF4D6",
    "Nou": "FDE7E7",
    "Închis – nu se reproduce": "EEEEEE",
}
STATUSES = list(STATUS_FILL)


def d(s):
    return date.fromisoformat(s) if s else None


def style_header(ws, headers, widths):
    for c, (h, w) in enumerate(zip(headers, widths), start=1):
        cell = ws.cell(row=1, column=c, value=h)
        cell.font, cell.fill = HEADER_FONT, HEADER_FILL
        cell.alignment = Alignment(vertical="center", wrap_text=True)
        ws.column_dimensions[get_column_letter(c)].width = w
    ws.row_dimensions[1].height = 30
    ws.freeze_panes = "B2"


wb = Workbook()

# ---------------------------------------------------------------------------
# Foaia 1: Tichete
# ---------------------------------------------------------------------------
ws = wb.active
ws.title = "Tichete"
cols = [
    ("ID tichet", 11), ("Data deschiderii", 13), ("Canal", 16), ("Categorie", 16),
    ("Funcționalitate", 18), ("Titlu", 46), ("Descriere", 70), ("Severitate", 11),
    ("Nr. raportări clienți", 12), ("Versiune raportată", 11), ("Status", 22),
    ("Versiune fix", 10), ("Data livrării fix-ului", 13), ("Data închiderii", 13),
    ("Zile până la fix", 10), ("Echipă responsabilă", 24), ("Tichet legat", 11),
    ("Cuvinte cheie recenzii (EN)", 50),
]
style_header(ws, [c[0] for c in cols], [c[1] for c in cols])

for r, t in enumerate(tickets, start=2):
    row = [
        t["id"], d(t["opened"]), t["channel"], t["category"], t["feature"], t["title"],
        t["description"], t["severity"], t["reports"], t["version_reported"], t["status"],
        t["fix_version"] or None, d(t["fix_date"]), d(t["closed"]),
        # Formulă, nu valoare calculată: se actualizează dacă schimbați datele
        f'=IF(M{r}="","",M{r}-B{r})',
        t["team"], t["linked"] or None, t["keywords_en"],
    ]
    for c, v in enumerate(row, start=1):
        cell = ws.cell(row=r, column=c, value=v)
        cell.font, cell.border = BODY, BORDER
        cell.alignment = WRAP if c in (6, 7, 18) else TOP
        if c in (2, 13, 14):
            cell.number_format = "yyyy-mm-dd"
    fill = PatternFill("solid", fgColor=STATUS_FILL[t["status"]])
    ws.cell(row=r, column=11).fill = fill

last = len(tickets) + 1
ws.auto_filter.ref = f"A1:R{last}"

# Listă derulantă pentru Status și Severitate, ca noile rânduri să rămână consistente
dv_status = DataValidation(type="list", formula1='"' + ",".join(STATUSES) + '"', allow_blank=True)
dv_sev = DataValidation(type="list", formula1='"Critică,Mare,Medie,Mică"', allow_blank=True)
ws.add_data_validation(dv_status)
ws.add_data_validation(dv_sev)
dv_status.add(f"K2:K{last + 200}")
dv_sev.add(f"H2:H{last + 200}")

ws["O1"].comment = Comment("Calculat: Data livrării fix-ului − Data deschiderii. Gol dacă nu există fix.", "Wizz Bees")
ws["R1"].comment = Comment(
    "Expresii în engleză pe care aplicația de reviews le poate căuta în recenziile publice "
    "pentru a verifica dacă problema mai apare după data fix-ului.", "Wizz Bees")

# ---------------------------------------------------------------------------
# Foaia 2: Release-uri
# ---------------------------------------------------------------------------
wr = wb.create_sheet("Release-uri")
style_header(wr, ["Versiune", "Data lansării", "Platforme", "Tichete rezolvate",
                  "Nr. fix-uri", "Funcționalitate nouă"], [10, 13, 18, 40, 10, 60])
for r, rel in enumerate(sorted(releases, key=lambda x: x["date"]), start=2):
    ids = ", ".join(f["ticket"] for f in rel["fixes"])
    vals = [rel["version"], d(rel["date"]), ", ".join(rel["platforms"]), ids or None,
            f'=COUNTIF(Tichete!$L$2:$L${last},A{r})', "; ".join(rel["features"])]
    for c, v in enumerate(vals, start=1):
        cell = wr.cell(row=r, column=c, value=v)
        cell.font, cell.border = BODY, BORDER
        cell.alignment = WRAP if c in (4, 6) else TOP
        if c == 2:
            cell.number_format = "yyyy-mm-dd"

# ---------------------------------------------------------------------------
# Foaia 3: Sumar (doar formule)
# ---------------------------------------------------------------------------
wsum = wb.create_sheet("Sumar")
wsum.column_dimensions["A"].width = 34
for col in "BCDE":
    wsum.column_dimensions[col].width = 16
T = f"Tichete!$K$2:$K${last}"

wsum["A1"] = "Sumar tichete Wizz Bees"
wsum["A1"].font = Font(name=FONT, bold=True, size=14)

def put(r, label, formula, fmt=None, bold=False):
    a = wsum.cell(row=r, column=1, value=label)
    b = wsum.cell(row=r, column=2, value=formula)
    a.font = b.font = Font(name=FONT, size=10, bold=bold)
    if fmt:
        b.number_format = fmt

put(3, "Total tichete", f"=COUNTA(Tichete!$A$2:$A${last})", bold=True)
for i, s in enumerate(STATUSES):
    put(4 + i, s, f'=COUNTIF({T},A{4 + i})')
put(9, "Redeschise după fix", f'=COUNTIF(Tichete!$F$2:$F${last},"[Redeschis după fix]*")', bold=True)
put(10, "Rată de redeschidere (din fix-urile livrate)", "=IF(B4=0,0,B9/B4)", "0.0%", bold=True)
put(11, "Medie zile până la fix", f"=IFERROR(AVERAGE(Tichete!$O$2:$O${last}),0)", "0.0")
wsum["C10"] = "Câte fix-uri au fost urmate de o nouă raportare pe aceeași problemă"
wsum["C10"].font = Font(name=FONT, size=9, italic=True, color="666666")

# Pe categorii
hdr = ["Categorie", "Tichete", "Fix livrat", "Redeschise", "Raportări clienți"]
for c, h in enumerate(hdr, start=1):
    cell = wsum.cell(row=13, column=c, value=h)
    cell.font, cell.fill = HEADER_FONT, HEADER_FILL
cats = sorted({t["category"] for t in tickets})
D = f"Tichete!$D$2:$D${last}"
for i, cat in enumerate(cats):
    r = 14 + i
    wsum.cell(row=r, column=1, value=cat)
    wsum.cell(row=r, column=2, value=f"=COUNTIF({D},A{r})")
    wsum.cell(row=r, column=3, value=f'=COUNTIFS({D},A{r},{T},"Rezolvat – fix livrat")')
    wsum.cell(row=r, column=4, value=f'=COUNTIFS({D},A{r},Tichete!$F$2:$F${last},"[Redeschis după fix]*")')
    wsum.cell(row=r, column=5, value=f"=SUMIF({D},A{r},Tichete!$I$2:$I${last})")
    for c in range(1, 6):
        wsum.cell(row=r, column=c).font = BODY

# ---------------------------------------------------------------------------
# Foaia 4: Legendă
# ---------------------------------------------------------------------------
wl = wb.create_sheet("Legendă")
wl.column_dimensions["A"].width = 28
wl.column_dimensions["B"].width = 100
rows = [
    ("Ce este", "Tichete de suport fictive pentru Wizz Bees, o companie aeriană inventată pentru demo-ul de la hackathon. Toate datele sunt mock."),
    ("Cum se leagă de aplicație", "Fiecare tichet „Rezolvat – fix livrat” apare și în pagina „Noutăți” din aplicația Wizz Bees, la versiunea din coloana „Versiune fix”."),
    ("Pentru Provocarea 2", "Aplicația de reviews ia „Data livrării fix-ului” și „Cuvinte cheie recenzii (EN)” și caută recenzii publice de după acea dată. Dacă problema mai apare, fix-ul nu a funcționat."),
    ("Redeschis după fix", "Tichete deschise din nou pentru aceeași problemă după un fix livrat. Coloana „Tichet legat” arată tichetul original."),
    ("Ce puteți edita", "Orice coloană din foaia Tichete, cu excepția „Zile până la fix” (formulă). Status și Severitate au liste derulante."),
    ("Rânduri noi", "Adăugați sub ultimul rând. Formulele din Sumar acoperă doar rândurile existente; extindeți intervalele dacă adăugați multe tichete."),
    ("Regenerare", "python3 tools/generate_mock_data.py && python3 tools/build_tickets_xlsx.py"),
]
for r, (a, b) in enumerate(rows, start=1):
    wl.cell(row=r, column=1, value=a).font = Font(name=FONT, bold=True, size=10)
    c = wl.cell(row=r, column=2, value=b)
    c.font, c.alignment = BODY, Alignment(wrap_text=True, vertical="top")
    wl.cell(row=r, column=1).alignment = TOP

out = ROOT / "mock-data/wizz-bees-tichete.xlsx"
wb.save(out)
print("Salvat:", out)
