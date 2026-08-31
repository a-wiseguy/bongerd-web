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

3. Start MySQL (bijv. via Docker Compose, alleen de database):

```bash
docker compose up db -d
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

## Omgevingsvariabelen

| Variabele | Beschrijving |
|---|---|
| `DATABASE_URL` | MySQL connection string |
| `SESSION_SECRET` | Minimaal 32 willekeurige tekens voor sessies |
| `COOKIE_SECURE` | `true` in productie (HTTPS), `false` lokaal |
| `ADMIN_EMAIL` | E-mailadres van het initiële beheeraccount |
| `ADMIN_PASSWORD` | Wachtwoord van het initiële beheeraccount |
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

## Productie (Docker)

1. Vul `.env` in met productiewaarden (`COOKIE_SECURE=true`, sterk wachtwoord, juiste `SITE_URL`).

2. Start alles:

```bash
docker compose up -d --build
```

Bij opstarten worden automatisch het schema toegepast, de database gevuld en de webserver gestart op poort 3000.

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
