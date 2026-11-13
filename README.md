# Apotheek de Bongerd

Nieuwe website voor Apotheek de Bongerd: snel, mobielvriendelijk en volledig in het Nederlands, met een beveiligde beheeromgeving waar het apotheekteam zelf content kan bijwerken.

## Functies

**Publieke site**

- Home met live openingstijden-status per vestiging, mededelingen en snelkoppelingen
- Over ons, openingstijden (met afwijkende dagen), diensten, nieuws en contact
- Contactformulier (inhoud alleen zichtbaar in beheer; optioneel een e-mailmelding zonder inhoud)
- SEO: titels, omschrijvingen, canonical, Open Graph, Pharmacy structured data, `robots.txt` en `sitemap.xml`
- Foto's als responsive WebP; eigen lettertypen (geen externe font-CDN)

**Beheeromgeving** (`/beheer`)

- Inloggen met e-mail en wachtwoord; wachtwoord wijzigen en overal uitloggen (`/beheer/account`)
- Collega's toevoegen, wachtwoord resetten of verwijderen (`/beheer/team`)
- Overzicht met open berichten, actuele status per vestiging en komende afwijkende dagen
- Paginateksten, openingstijden en afwijkende dagen
- Mededelingen met optionele einddatum (verdwijnen vanzelf)
- Nieuws: overzicht + bewerkpagina, inplannen met publicatiedatum, verbergen; de URL blijft gelijk bij een nieuwe titel
- Diensten: volgorde met omhoog/omlaag-knoppen
- Foto-upload: wordt automatisch verkleind naar WebP, locatiegegevens (EXIF/GPS) worden verwijderd
- Contactberichten: open/afgehandeld, verwijderen, automatisch opruimen na `MESSAGE_RETENTION_DAYS`

## Tech stack

- [TanStack Start](https://tanstack.com/start) + React 19
- [TanStack Router](https://tanstack.com/router)
- Tailwind CSS 4
- MySQL 8 + [Drizzle ORM](https://orm.drizzle.team/)
- Docker voor productie

## Vereisten

- Node.js 22+
- MySQL 8 (lokaal of via Docker)

## Lokaal ontwikkelen

1. Installeer dependencies:

```bash
npm install
```

2. Kopieer en vul de omgevingsvariabelen in:

```bash
cp .env.example .env
```

3. Start MySQL via Compose (bridge network; poort 3306 alleen via de dev-override):

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up db -d
```

4. Pas de migraties toe en seed initiële content:

```bash
npm run db:migrate
npm run db:seed
```

5. Start de dev-server:

```bash
npm run dev
```

De site draait op [http://localhost:3000](http://localhost:3000). De beheeromgeving is bereikbaar via `/beheer`.

`DATABASE_URL` voor lokale npm wijst naar `127.0.0.1:3306`. De `web`-service in Compose bouwt zelf `mysql://…@db:3306/…` en publiceert MySQL niet op de host.

## Omgevingsvariabelen

| Variabele | Beschrijving |
|---|---|
| `DATABASE_URL` | MySQL connection string (lokaal npm); Compose-web gebruikt `@db:3306` |
| `SESSION_SECRET` | Minimaal 32 willekeurige tekens voor sessies |
| `COOKIE_SECURE` | `true` achter HTTPS in productie; `false` voor plain HTTP / lokaal Docker |
| `TRUST_PROXY` | `true` alleen achter een vertrouwde reverse proxy (dan wordt `X-Forwarded-For` gebruikt) |
| `ADMIN_EMAIL` | E-mailadres van het initiële beheeraccount (alleen nodig bij eerste seed / reset) |
| `ADMIN_PASSWORD` | Wachtwoord bij eerste seed of `RESET_ADMIN_PASSWORD=true`; daarna weglaten/roteren |
| `RESET_ADMIN_PASSWORD` | Alleen `true` om het adminwachtwoord opnieuw te zetten; standaard `false` |
| `SITE_URL` | Publieke URL van de site (bijv. `http://localhost:3000`); gebruikt voor canonical, sitemap en e-mails |
| `UPLOAD_DIR` | Map voor geüploade foto's (standaard `./data/uploads`; in Docker een volume) |
| `SMTP_URL` | Optioneel. SMTP-verbinding voor de melding bij een nieuw contactbericht |
| `NOTIFY_EMAIL` | Optioneel. Ontvanger van die melding (alleen onderwerp + link, nooit de inhoud) |
| `MAIL_FROM` | Optioneel. Afzender van de melding |
| `MESSAGE_RETENTION_DAYS` | Afgehandelde berichten worden na zoveel dagen verwijderd (standaard 90) |

Zie `.env.example` voor een volledig voorbeeld.

## Scripts

| Commando | Beschrijving |
|---|---|
| `npm run dev` | Start de ontwikkelserver |
| `npm run build` | Bouw voor productie |
| `npm start` | Start de productieserver (na build) |
| `npm run db:generate` | Maak een nieuwe migratie in `drizzle/` na een wijziging in `src/lib/schema.ts` |
| `npm run db:migrate` | Pas openstaande migraties toe (ook op een database die vroeger met `db:push` is gemaakt) |
| `npm run db:seed` | Vul initiële content en admin-account (idempotent) |
| `npm run typecheck` | TypeScript-controle |
| `npm test` | Unit tests (openingstijden, tijdzones, slugs, sanitizer, JSON-LD) |
| `npm run test:e2e` | Browsertests tegen een draaiende site (zie hieronder) |
| `npm run e2e:smtp` | Lokale SMTP-sink die mails naar `e2e/.artifacts/mails.jsonl` schrijft |

## Browsertests (e2e)

`e2e/run.mjs` doorloopt de belangrijkste flows in Chrome: upload (formaat, EXIF/GPS, 10 MB), nieuws (aanmaken, inplannen, archief), mededelingen met einddatum, berichten (melding, afhandelen, bewaartermijn, verwijderen), openingstijden-validatie, volgorde diensten, niet-opgeslagen wijzigingen, accounts en sessies, opruimen van uploads.

```bash
npm run e2e:smtp &          # optioneel: controleert ook de e-mailmelding
npm run dev                 # of: npm run build && npm start
E2E_MAIL_LOG=e2e/.artifacts/mails.jsonl npm run test:e2e
npm run test:e2e -- upload newsEditor   # alleen deze flows
```

De tests lezen `.env` (database, adminaccount) en gebruiken de lokale Chrome (`CHROME_PATH` om een ander pad te kiezen). Ze maken en verwijderen hun eigen testdata, maar raken ook gedeelde data (openingstijden, volgorde diensten): draai ze alleen tegen een dev- of CI-database. Een niet-lokale URL wordt geweigerd tenzij `E2E_ALLOW_REMOTE=1`. Bij een fout staat een screenshot in `e2e/.artifacts/`. In CI draaien ze tegen een productiebuild met MySQL en de SMTP-sink.

## Database-migraties

Het schema staat in `src/lib/schema.ts`; de migraties in `drizzle/` worden meegecommit. Werkwijze bij een schemawijziging:

1. Pas `src/lib/schema.ts` aan.
2. `npm run db:generate` en controleer de nieuwe SQL in `drizzle/`.
3. `npm run db:migrate` lokaal; commit schema + migratie samen.

Een bestaande database die nog met `drizzle-kit push` is aangemaakt wordt bij de eerste `db:migrate` automatisch als baseline gemarkeerd. CI controleert dat migraties op een lege database slagen, herhaalbaar zijn en dat schema en migraties niet uit elkaar lopen.

## Productie (Docker)

1. Vul `.env` in met productiewaarden (`COOKIE_SECURE=true` achter HTTPS, sterke wachtwoorden, juiste `SITE_URL`). Zet `ADMIN_PASSWORD` voor de eerste start; daarna kun je die uit `.env` halen (entrypoint unset ook na seed). Laat `RESET_ADMIN_PASSWORD` op `false`.

2. Start alles (bridge network; alleen poort 3000 naar de host, MySQL intern op `db:3306`):

```bash
docker compose up -d --build
```

Bij bestaande containers met oude host-networking: herschep na `docker compose down` (volumes blijven behouden tenzij je `-v` gebruikt).

Bij opstarten worden migraties en seed toegepast; daarna start de webserver als non-root op poort 3000.

`GET /healthz` geeft `200` als de app en de database bereikbaar zijn en anders `503`; de Docker `HEALTHCHECK` gebruikt dit endpoint.

**Let op:** `tsx` zit in de productie-image voor de migratie- en seedstap bij het opstarten; `drizzle-kit` is alleen een dev-dependency. CI draait typecheck, tests, build en een migratietest tegen MySQL; `npm audit --audit-level=high` controleert de productie-dependencies.

## Projectstructuur

```
src/
├── routes/          # Pagina's (publiek + /beheer/*)
├── components/      # Gedeelde UI-componenten
├── server/          # Server functions (auth, admin, contact, public)
└── lib/             # Database, schema, seed, helpers
```

## Wat zit er niet in

Geen online bestelsysteem, koppeling met apotheeksystemen, patiëntportaal of medische gegevensverwerking.
