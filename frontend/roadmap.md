# KPI monitorizare și distribuție
- [x] Adaugă monitorizarea din Stats și trei segmente cu procent din total.
- [x] Numără scăderile reclamațiilor, fără rezultate inventate sau modificări API/import.
- [x] 54 de teste trec și compilarea automată este OK; răspunsuri izolate de test verifică KPI 7/2/3/2/5, grafic 29%, legendă 2/3/2 și impact gol fără rezultate inventate, fără erori; importul real pe server extern rămâne neverificat.

# Două surse în Import
- [x] Păstrează importul Excel și adaugă CSV feedback prin adaptorul API existent.
- [x] Două zone independente, validare extensii, rezultate și erori separate.
- [x] 49 de teste trec; extensii și erori independente verificate pe calculator și mobil, fără erori sau derulare laterală; importul reușit pe serverul extern rămâne neverificat, iar modul mock nu inventează rezultate CSV.

# AfterCheck rebranding
- [x] Impact după release: contract, șapte exemple demo, hook și invalidare.
- [x] Card în raport, coloană în listă și un KPI în prezentarea generală, cu stări independente.
- [x] Teste și verificare în previzualizare cu date demo: scădere, stabil, creștere și finalizare verificare; fără modificări backend. Serverul extern nu a fost verificat.
- [x] Replace user-facing branding and page metadata; add the requested subtitle.
- [x] Refine premium surfaces and brand colors while preserving all functionality.
- [x] Verify branding across every page, roles, verification, and compact layouts.
- [x] Final polish: extra-bold slate metric numbers, tinted role pills, pulsing live dot, hover-lift metric cards.

# Role-aware dashboard
- [x] Developer mode: first metric shows tickets available to pick up instead of total tickets.
- [x] Make the role switcher drive real React state across the app.
- [x] Add a Role View Banner that adapts to the active role on dashboard, tickets and reports.
- [x] Product Manager view: business insights, release efficacy metrics, executive summary cards.
- [x] Developer view: AI Testing Agent logs — step-by-step automation trace, DOM errors, stack traces for failed/zombie tickets.
- [x] Verify both role views in the preview and run the tests.

# Lean copy
- [x] Remove repeated statements and long subtitles; keep a short, casual dashboard tone.

# Real backend corrections
- [x] "Verifică acum" button back, steps with 3 states + screenshots + lightbox, Priorități table, donut %, Setări, Import, Rapoarte + report page.

# Pagina Tichete
- [x] Filtre în URL, scurtături numerice și tabel după prioritatea primită.
- [x] Detalii laterale, tichete asociate și verificare individuală.
- [x] Verifică filtrele, navigarea și testele; verificarea individuală a fost exercitată în modul demonstrativ disponibil în sandbox, nu pe serverul extern.

# Prezentare generală simplificată
- [x] Cinci priorități compacte cu detalii laterale și legătură spre Tichete.
- [x] Sinteză compactă și KPI-uri în două coloane pe mobil, fără schimbări API.
- [x] Verifică ordinea, verdictul unic, navigarea și ambele teme; verificări în previzualizare cu datele demonstrative disponibile.

# Tichete simplificate
- [x] Căutare și panou unic de filtre, selecții în URL, chip-uri și trei filtre rapide.
- [x] Tabel compact și carduri pe mobil, cu aceleași detalii laterale.
- [x] 28 de teste trec; filtre, reîncărcare URL, căutare fără rezultate și detalii verificate în ambele teme, cu datele demonstrative disponibile.

# Product Manager exclusiv
- [x] Elimină selectorul, providerul, hook-ul și variantele Developer; curăță preferințele vechi fără a crea un rol implicit.
- [x] Păstrează dashboardul PM, paginile, verificările și detaliile tehnice din rapoarte; API-ul și modelele rămân neschimbate.
- [x] 30 de teste trec; cele cinci pagini și detaliile raportului verificate în previzualizare, inclusiv cu preferința veche Developer și ambele teme. Verificările și importul nu au fost rerulate pe serverul extern.

# Sidebar fix
- [x] Elimină butonul și starea de restrângere a meniului din stânga; lățime permanentă 264px.
- [x] 30 de teste trec; lățimea, navigarea, tema și mobilul verificate în previzualizare.

# Eliminarea setărilor
- [x] Elimină butonul din meniu, pagina /setari și tot ce ține de ea (tip, hook-uri, apeluri API).
- [x] Teste și verificare în previzualizare: patru pagini rămase, fără legături spre Setări.

# Panou detalii tichet simplificat
- [x] Panoul lateral păstrează doar ID, titlu, badge-uri, raportări, descriere, pași numerotați cu „Rezultat așteptat", ultima verificare și butonul „Verifică acum"; câmpurile administrative rămân în date, neafișate.
- [x] 31 de teste trec, build OK; verificat în previzualizare pentru tichet invalidat și redeschis, confirmat, neverificat și pe mobil (fără derulare orizontală).
