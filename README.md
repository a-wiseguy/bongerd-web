# Apotheek de Bongerd

Nieuwe website voor Apotheek de Bongerd: snel, mobielvriendelijk en volledig in het Nederlands, met een beveiligde beheeromgeving waar het apotheekteam zelf content kan bijwerken.

## Functies

**Publieke site**

- Home met live openingstijden-status, mededelingen en snelkoppelingen
- Over ons, openingstijden, diensten, nieuws en contact
- Contactformulier (inzendingen alleen zichtbaar in beheer)
- SEO-titels, omschrijvingen en Pharmacy structured data

**Beheeromgeving** (`/beheer`)

- Inloggen met e-mail en wachtwoord
- Paginateksten, openingstijden, mededelingen, nieuws en diensten beheren
- Contactberichten lezen en als afgehandeld markeren

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

4. Pas het database-schema toe en seed initiële content:

```bash
npm run db:push
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
| `SITE_URL` | Publieke URL van de site (bijv. `http://localhost:3000`) |

Zie `.env.example` voor een volledig voorbeeld.

## Scripts

| Commando | Beschrijving |
|---|---|
| `npm run dev` | Start de ontwikkelserver |
| `npm run build` | Bouw voor productie |
| `npm start` | Start de productieserver (na build) |
| `npm run db:push` | Synchroniseer database-schema |
| `npm run db:seed` | Vul initiële content en admin-account |
| `npm test` | Kleine unit checks (o.a. service-href validatie) |

## Productie (Docker)

1. Vul `.env` in met productiewaarden (`COOKIE_SECURE=true` achter HTTPS, sterke wachtwoorden, juiste `SITE_URL`). Zet `ADMIN_PASSWORD` voor de eerste start; daarna kun je die uit `.env` halen (entrypoint unset ook na seed). Laat `RESET_ADMIN_PASSWORD` op `false`.

2. Start alles (bridge network; alleen poort 3000 naar de host, MySQL intern op `db:3306`):

```bash
docker compose up -d --build
```

Bij bestaande containers met oude host-networking: herschep na `docker compose down` (volumes blijven behouden tenzij je `-v` gebruikt).

Bij opstarten worden schema en seed toegepast; daarna start de webserver als non-root op poort 3000.

**Let op:** `drizzle-kit` en `tsx` zitten nog in de productie-image voor boot-time migrate/seed. CI runt `npm audit --audit-level=high` (prod deps); matige transitive issues via drizzle-kit blokkeren CI niet.

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
