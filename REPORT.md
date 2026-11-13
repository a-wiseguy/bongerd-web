# Report — prototype → production

Branch `feature/production-upgrade-eaf5`. Work list: [`TASKS.md`](TASKS.md). This report covers what I did, why, what I found along the way, and an honest second opinion on my own changes after each round.

## TL;DR

- **The site was broken in ways a visitor or the team would hit on day one.** News articles couldn't be opened, every page threw a hydration error, the structured data showed made-up opening hours, and on the existing `master` the container **crashed on every restart after the first** (`drizzle-kit push` against an existing database fails).
- **Round 1** fixed 10 P0 bugs, added the missing production basics, and redesigned the public pages and the CMS. The production basics are: self-hosted fonts, SEO, sitemap, image pipeline, upload re-encoding, contact e-mail notice, retention, account/team management, revocable sessions, versioned migrations, CI, a health check and tests.
- **Round 2** came out of the self-review. It covers observability, the failure mode when the database is down, stale content on the homepage, protection against losing unsaved edits, orphaned uploads, and committing the browser tests to the repo and running them in CI.
- Every change was tested in a real browser (headless Chrome, desktop 1366px and mobile 390px), against both the dev server and the production build. That includes 9 scripted end-to-end flows, unit tests, typecheck and a production build.

## How I tested

| Check | What |
|---|---|
| `npm run typecheck` | `tsc --noEmit` (it failed on `master`; there was no script for it) |
| `npm test` | 26 unit tests: opening hours and status texts, Amsterdam timezone and DST, slugs, sanitizer, JSON-LD escaping, publish window |
| `npm run build` | production build, then everything below run again against `node .output/server/index.mjs` |
| Browser flows (Playwright + Chrome) | `upload` (10 MB limit, MIME sniffing, EXIF/GPS stripped, rotation, 1600/800 WebP), `newsDetail`, `jsonLd`, `messages` (mail notice with no patient data, handled, retention purge, delete, dashboard), `hoursValidation`, `announcements` (expiry), `newsEditor` (create, duplicate slug, rename keeps URL, scheduling, delete, 404), `servicesOrder`, `accounts` (add colleague, temporary password, change password logs out other devices, remove colleague kills their sessions) |
| Screenshots | every public and admin page, desktop + mobile, with checks for console errors, 4xx/5xx responses and horizontal overflow |
| Migrations | fresh database, legacy database created with `push`, and repeated runs (idempotent) |

## Round 1 — steps

| Commit | What |
|---|---|
| `7fe7e87` | `TASKS.md` from an audit of code + browser + HTTP |
| `605980f` | P0 fixes: news detail route, hydration mismatch, JSON-LD from CMS hours, stuck "Bezig…" button, duplicate TipTap link extension, `tsc`, expired/unsorted exceptions, duplicate slugs, hours validation, `sanitize-html` out of the browser bundle |
| `e8a7314` | Self-hosted fonts, responsive WebP with width/height/lazy, icons/manifest, redesigned public pages (status texts, hero, announcements, hours table with "vandaag", news cards with dates, 404 with suggestions, emergency/dienstapotheek band) |
| `9405e5c` | Versioned Drizzle migrations with baselining, `/healthz`, `robots.txt`, `sitemap.xml`, CI (typecheck/test/build + MySQL migration job + drift check), unit tests |
| `8a53b8a` | Account page (change password, log out everywhere), team page (add/reset/remove colleagues), sessions revocable via `session_version` |
| `8abc014` | Uploads re-encoded with `sharp` (rotate, strip EXIF/GPS, 1600 + 800 WebP, 10 MB, pixel-bomb limit); fixed uploads returning 404 in dev |
| `728c9e9` | Contact: optional SMTP notice (subject + link only), delete, automatic retention, open/handled tabs |
| `ea1f664` | Forms use `method="post"` and stay disabled until hydrated |
| `cc81daa` | CMS: news and services as an overview plus an edit page, scheduling, reorder buttons, stable slugs |
| `1c27f03` | Announcements: "tonen tot en met" (expire automatically) + status |
| `cf2dac9` | Dashboard (open messages, live status per location, upcoming exceptions, shortcuts), page titles everywhere, WebP login background, mobile list layout |
| `dcf2ca3` | README: migrations, health check, env vars, features |

## Bugs found (beyond the audit list)

These turned up while implementing and testing, not in the initial audit.

1. **Container restart crash on `master`.** The entrypoint ran `drizzle-kit push` on every boot. Against an existing database it tries to drop and recreate the `user_roles` primary key and fails with `ER_DROP_INDEX_FK`, so the second boot never gets to start the web server. I replaced it with versioned SQL migrations (`drizzle/`) and `src/lib/migrate.ts`. That script marks a database created with the old `push` as already at the baseline migration, then applies the remaining migrations normally. I tested a fresh database, a legacy database and repeated runs, and CI runs the same checks.
2. **Password in the URL.** If you submitted the login form before JavaScript had loaded (slow phone, quick typist), the browser did a native GET: `/beheer/login?email=…&password=…`. That ends up in browser history, proxy logs and server logs. The contact form had the same flaw, with patient messages. All forms now use `method="post"`, and the submit buttons stay disabled until hydration.
3. **Uploads returned 404 in dev.** Nitro's dev server treats any URL ending in an image extension as a static file, so `/uploads/x.jpg` never reached the route. Production was fine. A small dev-only Vite middleware now serves them.
4. **Year 2038 limit.** `news_posts.published_at` is a MySQL `TIMESTAMP`, which ends in January 2038. Scheduling a post for 2099 failed with a generic error. Scheduling is now capped at two years ahead, with a clear message from the server and `min`/`max` on the input.
5. **Fallback photos repeated.** The fallback image was chosen from a hash of the slug, so two neighbouring news cards could get the same photo. Fallbacks now rotate by position in the list.
6. **The dashboard loaded every contact message**, personal data included, just to count them. It now uses `count(*)`.

## Key decisions

- **Versioned migrations instead of `push`.** `push` is a development tool. It decides at runtime what to drop, which is how the crash above happened. Migrations are reviewed SQL in git, and CI checks for drift between the schema and the migrations.
- **The e-mail notice carries no message content.** Patient questions are medical data. Mail is neither end-to-end encrypted nor under the pharmacy's control once sent, so the mail contains only the subject category and a link to `/beheer/berichten`.
- **Retention.** Handled messages are deleted after `MESSAGE_RETENTION_DAYS` (90 by default), and open messages are never auto-deleted. The purge runs lazily (on a contact submit or an admin visit), so no cron job is needed.
- **Sessions.** Each user has a `session_version` that is stored in the cookie. Changing your password, "log out everywhere", a reset or removing a user bumps it, which ends that user's sessions immediately. Side effect: the cookie format changed, so everyone is logged out once after deploy.
- **The slug is fixed at creation.** Renaming a news post no longer changes its URL, so shared links and Google results keep working. The cost is that a typo in a URL can't be fixed afterwards.
- **Uploads are always re-encoded.** Phone photos are 5–10 MB and carry GPS coordinates. Every upload is rotated, stripped of metadata and saved as 1600px and 800px WebP. The original is never kept.
- **The publication date is Amsterdam wall-clock time** in the form and on the server, independent of the server's timezone. Tests cover DST.
- **Fewer decorative hero photos.** Services, news and privacy now open with text, and the photos appear where they carry meaning (cards, team). This brings less repetition and faster first paint.

## Second opinion — round 1

I re-read my diff and looked at fresh screenshots of the production build, specifically looking for anything I would push back on in someone else's PR.

**Keep, clearly an improvement**

- Migrations and the restart fix, the password-in-URL fix, revocable sessions, re-encoding uploads, and the e-mail notice without content. These are correctness and privacy fixes with little downside.
- The CMS overview plus edit page. It scales to 50+ posts. The old version rendered every post as an expanded editor.
- The status texts ("Opent maandag om 08:00"). This is the information visitors actually come for.

**Keep, with a caveat**

- **Submit buttons disabled until hydration.** On a very slow connection the button looks inactive for a moment. That is still better than leaking credentials or losing a submit silently.
- **The datetime input shows AM/PM in my test browser.** That comes from the browser locale. Dutch Chrome and Safari show 24-hour time, so I left it.
- **Lazy retention.** It works because the admin is used daily. If nobody logs in for months, nothing is purged until the next contact submit. That is acceptable for this site, and documented.

**Weaknesses I found in my own work, which became round 2**

1. **Errors are invisible in production.** I brought the database down (a second instance with a wrong `DATABASE_URL`). Visitors got the friendly error page with a 500, which is good, but the server logged nothing. In production nobody would know why.
2. **The error page tells people to "bel uw vestiging" without a phone number.** For a pharmacy, the phone number is the one thing that must survive an outage.
3. **The homepage shows a news post from January 2022.** It makes the site look abandoned. With only two posts, the three-column grid also leaves a visible gap.
4. **Navigating away from an editor loses unsaved changes** without a warning. That is the classic CMS complaint.
5. **Orphaned uploads.** Uploading a photo and then not saving leaves a file on disk forever.
6. **My browser flows live in `/tmp`.** They caught real bugs (the slug race, the 2038 limit, the mobile layout), but they are not in the repo, so nobody can rerun them and CI doesn't run them.

**Things I chose not to do**

- **Higher-resolution logo and icons.** The source logo is 300×121 and the favicon 100×100, and upscaling only adds blur. This needs the original vector logo from the owner; once it's available, the icons regenerate from it.
- **HEIC uploads.** iPhones convert to JPEG when uploading through the browser, and `sharp`'s prebuilt binaries don't include HEIC. Unsupported files get a clear error.
- **Docker image.** Docker isn't available in this environment, so I couldn't build the image. The Dockerfile change is small (it copies `drizzle/` and adds a `HEALTHCHECK`). `sharp` ships prebuilt `linuxmusl` binaries for Alpine.
