# TASKS — van prototype naar productie

Audit van de publieke site en `/beheer` (code, headless Chrome op desktop 1366px en mobiel 390px, HTTP-checks, `tsc`).
Elke taak wordt na de wijziging getest (typecheck, unit tests, build, screenshots en/of browser-flow).

Legenda: **P0** kapot / fout gedrag · **P1** nodig voor productie · **P2** UX en visueel · **P3** afwerking

## Ronde 1

### P0 — kapot of fout

- [x] **Nieuwsdetail onbereikbaar.** `/nieuws/<slug>` toont de nieuwslijst: `nieuws.tsx` is parent-layout van `nieuws.$slug.tsx` maar rendert geen `<Outlet />`. → lijst naar `nieuws.index.tsx`.
- [x] **Hydration mismatch op elke pagina.** JSON-LD gebruikt `process.env.SITE_URL`, die in de browser `undefined` is → server- en client-HTML verschillen (React-error in console op alle 9 pagina's). → JSON-LD en site-URL server-side in root-loader.
- [x] **Structured data liegt.** `pharmacyJsonLd` heeft hard-coded tijden (`Kesteren 08:00–17:00`), los van het CMS. → genereren uit `opening_hours` + afwijkende dagen.
- [x] **Berichten-knop blijft hangen.** Na "Afgehandeld" blijft de knop op "Bezig…" staan (busy wordt alleen bij fout gereset).
- [x] **TipTap dubbele `link`-extensie.** StarterKit v3 bevat Link al; editor laadt hem twee keer (console-warning op elke beheerpagina).
- [x] **`tsc` faalt** (`SiteFooter.tsx` hash-type). Geen typecheck-script, dus onopgemerkt.
- [x] **Afwijkende dagen**: verlopen datums blijven eeuwig publiek staan en de volgorde is willekeurig (Ochten toont 31 dec vóór 24 dec).
- [x] **Dubbele slug crasht.** Twee nieuwsberichten/diensten met dezelfde titel → unieke-index-fout uit MySQL i.p.v. een nette slug (`titel-2`).
- [x] **Openingstijden-validatie ontbreekt.** "Sluit" vóór "opent", of alleen één tijd invullen, wordt gewoon opgeslagen en geeft verkeerde open/dicht-status.
- [x] **`sanitize-html` (+ postcss, path, url, source-map-js) in de browserbundle.** Tientallen "externalized for browser compatibility"-warnings, onnodig grote bundle. → sanitizen alleen op de server, client rendert kant-en-klare HTML.

### P1 — productie-eisen

- [x] **Google Fonts extern geladen.** IP-adres van elke bezoeker gaat naar Google (AVG-risico, LG München 2022). → fonts self-hosten (`@fontsource`), CSP aanscherpen.
- [x] **SEO-basis**: canonical-URL, absolute `og:url`/`og:image`, deelbare foto i.p.v. logo van 300px, `robots.txt`, `sitemap.xml` (incl. nieuws), `noindex` op `/beheer`, `article`-meta op nieuwsberichten.
- [x] **Favicon/manifest**: `/favicon.ico` geeft 404, apple-touch-icon is 100px. → ico, 180px touch-icon, 192px icoon, `site.webmanifest`, `theme-color`. *(512px niet gemaakt: bronlogo is 100px, opschalen wordt wazig — vectorlogo nodig, zie REPORT.)*
- [x] **Afbeeldingen**: JPEG's tot 460 KB zonder afmetingen of lazy-loading (layout-shift, trage mobiele laadtijd). → WebP in juiste maat, `width`/`height`, `loading="lazy"` onder de vouw.
- [x] **Uploads**: telefoonfoto's (>2 MB) worden geweigerd en EXIF (incl. GPS) blijft in het bestand. → server-side verkleinen en herschrijven naar WebP met `sharp`, limiet naar 10 MB.
- [x] **Contactformulier**: inzendingen komen alleen in de database; niemand krijgt een seintje. → optionele e-mailmelding via SMTP (zonder berichtinhoud in de mail ivm privacy), duidelijk ingesteld via env.
- [x] **Berichten bewaren (AVG)**: niet te verwijderen, geen bewaartermijn. → verwijderknop + automatisch opschonen van afgehandelde berichten na X dagen.
- [x] **Accountbeheer ontbreekt**: wachtwoord wijzigen kan alleen via env-reset op de server. → pagina "Account" (wachtwoord wijzigen) en "Team" (collega's toevoegen/verwijderen).
- [x] **Sessies niet intrekbaar**: na wachtwoordwijziging blijven oude cookies 7 dagen geldig. → sessieversie per gebruiker in de database.
- [x] **CI**: alleen `npm audit`. → typecheck, tests en build in CI; `typecheck`-script.
- [x] **Healthcheck**: geen endpoint voor Docker/Caddy. → `/healthz` (DB-ping) + Docker `HEALTHCHECK`.
- [x] **Tests**: alleen `serviceHref`. → tests voor openingstijden-logica, slugs, sanitizer.

### P2 — UX en visueel

- [x] **Open/dicht-status zonder context.** "Gesloten · 08:00–17:00" op vrijdagavond. → "Opent maandag om 08:00" / "Open tot 17:30" / "Opent vandaag om 08:00".
- [x] **Home-hero**: drie knoppen waarvan twee naar dezelfde pagina; status-badge "Nu gesloten zie openingstijden" leest stroef; geen spoedverwijzing als alles dicht is.
- [x] **Mededelingen** staan onder een grote foto en lijken op gewone kaarten. → opvallende melding direct onder de hero; optioneel "tonen tot"-datum zodat een sluitingsbericht vanzelf verdwijnt.
- [x] **Openingstijdentabel**: weekdagen gecentreerd naast links uitgelijnde kop; vandaag niet gemarkeerd.
- [x] **Herhaalde foto's**: interieurfoto 3× in een korte route, nieuwskaarten op home allebei dezelfde boomgaard.
- [x] **Nieuws op home** zonder datum; nieuwsdetail zonder duidelijke terug-link.
- [x] **404** generiek; geen hulp om verder te komen.
- [x] **Beheer – zijbalk**: lange titels lopen buiten het kader.
- [x] **Beheer – uploadknop**: tekst niet verticaal gecentreerd.
- [x] **Beheer – openingstijden**: 21 losse opslaanknoppen. → één formulier per vestiging (hele week).
- [x] **Beheer – nieuws/diensten**: alle items als uitgeklapte formulieren onder elkaar (onwerkbaar bij 20+ berichten). → overzichtslijst met status + aparte bewerkpagina; publicatiedatum instelbaar; "bekijk op site".
- [x] **Beheer – dashboard**: alleen 4 getallen. → open berichten direct zichtbaar, snelle acties.
- [x] **Beheer – paginatitels**: elke tab heet "Beheer · Apotheek De Bongerd".

## Ronde 2

Volgt uit de second-opinion review van ronde 1 (zie `REPORT.md`).

- [ ] **Fouten onzichtbaar in productie.** Database onbereikbaar → bezoeker krijgt nette foutpagina, maar de server logt niets. → onverwachte fouten in server functions loggen (functienaam + fout, nooit formulierdata), validatiefouten en redirects niet.
- [ ] **Foutpagina zonder telefoonnummers.** "Bel uw vestiging" zonder nummer, juist als de site plat ligt. → vestigingsgegevens als vaste fallback (gedeeld met de seed) op de foutpagina.
- [ ] **Oud nieuws op de homepage.** Bericht uit januari 2022 staat als "Nieuws" op home; met twee berichten blijft een gat in het 3-koloms grid. → home toont alleen berichten van de laatste 12 maanden, layout past zich aan het aantal aan; `/nieuws` krijgt paginering.
- [ ] **Wijzigingen kwijt bij wegnavigeren.** Editor nieuws/diensten waarschuwt niet bij niet-opgeslagen wijzigingen. → waarschuwing bij navigeren (router) en sluiten/verversen (browser).
- [ ] **Verweesde uploads.** Foto geüpload maar niet opgeslagen → bestand blijft voor altijd op schijf. → periodiek opruimen: bestanden die nergens naar verwezen worden en ouder zijn dan 24 uur.
- [ ] **Browsertests niet in de repo.** De flows die echte bugs vonden staan in `/tmp`. → `e2e/` met `npm run test:e2e`, configureerbaar via env, en een CI-job die ze tegen een productiebuild + MySQL + SMTP-sink draait.
