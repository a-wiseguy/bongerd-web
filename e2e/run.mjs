import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { copyFileSync, mkdirSync, readFileSync, readdirSync, rmSync, utimesSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import mysql from 'mysql2/promise'
import { chromium } from 'playwright-core'
import sharp from 'sharp'
import { makeFixtures } from './fixtures.mjs'

// browser flows against a running site + its database. they create and delete their own rows,
// but do touch shared data (hours, service order), so never point them at production.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
process.chdir(root)
try {
  process.loadEnvFile('.env')
} catch {}

const base = (process.env.E2E_BASE_URL ?? 'http://localhost:3000').replace(/\/$/, '')
if (!/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(base) && process.env.E2E_ALLOW_REMOTE !== '1') {
  console.error(`refusing to run against ${base}; set E2E_ALLOW_REMOTE=1 for a non-local test server`)
  process.exit(2)
}
const adminEmail = process.env.E2E_ADMIN_EMAIL ?? process.env.ADMIN_EMAIL
const adminPassword = process.env.E2E_ADMIN_PASSWORD ?? process.env.ADMIN_PASSWORD
if (!process.env.DATABASE_URL || !adminEmail || !adminPassword) {
  console.error('DATABASE_URL, ADMIN_EMAIL and ADMIN_PASSWORD (or E2E_ADMIN_*) are required')
  process.exit(2)
}
const uploadDir = path.resolve(process.env.UPLOAD_DIR ?? 'data/uploads')
const mailLog = process.env.E2E_MAIL_LOG ? path.resolve(process.env.E2E_MAIL_LOG) : null
const out = path.join(root, 'e2e', '.artifacts')
mkdirSync(out, { recursive: true })
const fixtures = await makeFixtures(path.join(out, 'fixtures'))

const db = await mysql.createConnection({ uri: process.env.DATABASE_URL, dateStrings: true })
/** mysql -N style: tab-separated columns, one row per line */
async function sql(query) {
  const [rows] = await db.query(query)
  if (!Array.isArray(rows)) return ''
  return rows.map((row) => Object.values(row).map((v) => (v === null ? 'NULL' : String(v))).join('\t')).join('\n')
}

const only = process.argv.slice(2)
const browser = await chromium.launch(
  process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : { channel: 'chrome' },
)
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: 'nl-NL', timezoneId: 'Europe/Amsterdam' })
let page = await ctx.newPage()
const errors = []
page.on('pageerror', (e) => errors.push(e.message))
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(m.text())
})

async function login() {
  await page.goto(`${base}/beheer/login`, { waitUntil: 'networkidle' })
  if (!page.url().includes('/login')) return
  await page.fill('input[name=email]', adminEmail)
  await page.fill('input[name=password]', adminPassword)
  await page.click('button[type=submit]')
  await page.waitForURL(/\/beheer\/?$/)
}

const tests = {
  async upload() {
    await login()
    await page.goto(`${base}/beheer/content`, { waitUntil: 'networkidle' })
    const field = page.locator('input[type=file]').first()
    const box = field.locator('xpath=ancestor::div[contains(@class,"rounded-2xl")][1]')
    await field.setInputFiles(fixtures.fake)
    await box.getByText('Bestandstype komt niet overeen met de inhoud.').waitFor({ timeout: 8000 })
    await field.setInputFiles(fixtures.huge)
    await box.getByText('Bestand is te groot (max 10 MB).').waitFor({ timeout: 15000 })
    await field.setInputFiles(fixtures.phone)
    const preview = box.locator('img[src^="/uploads/"]')
    await preview.waitFor({ timeout: 20000 })
    const src = await preview.getAttribute('src')
    assert.match(src, /^\/uploads\/[0-9a-f-]{36}\.webp$/)
    const stored = [src, src.replace('.webp', '-800.webp')].map((url) => path.join(uploadDir, path.basename(url)))
    const info = await Promise.all(stored.map((file) => sharp(file).metadata()))
    // portrait after exif rotation, capped at 1600 / 800, exif gone
    assert.deepEqual(info.map((x) => [x.format, x.width, x.height, Boolean(x.exif)]), [['webp', 1200, 1600, false], ['webp', 600, 800, false]])
    const r800 = await page.request.get(`${base}${src.replace('.webp', '-800.webp')}`)
    assert.equal(r800.status(), 200)
    await page.waitForFunction((el) => el.complete && el.naturalWidth > 0, await preview.elementHandle())
    for (const file of stored) rmSync(file, { force: true })
  },
  async newsDetail() {
    await page.goto(`${base}/nieuws`, { waitUntil: 'networkidle' })
    await page.click('a[href="/nieuws/herhaalmedicatie-ophalen"]')
    await page.getByRole('heading', { level: 1, name: 'Nieuw ophaalmoment herhaalmedicatie' }).waitFor()
    await page.goto(`${base}/nieuws/herhaalmedicatie-ophalen`, { waitUntil: 'networkidle' })
    assert.equal(await page.locator('h1').innerText(), 'Nieuw ophaalmoment herhaalmedicatie')
    assert.match(await page.locator('article').innerText(), /DigiD/)
  },
  async jsonLd() {
    await page.goto(base, { waitUntil: 'networkidle' })
    const raw = await page.locator('script[type="application/ld+json"]').textContent()
    const data = JSON.parse(raw)
    const kesteren = data['@graph'].find((p) => p.name.endsWith('Kesteren'))
    assert.ok(kesteren.openingHoursSpecification.length >= 1)
    assert.ok(kesteren.image.startsWith('http'))
    console.log('  kesteren hours', JSON.stringify(kesteren.openingHoursSpecification))
  },
  async messages() {
    if (mailLog) rmSync(mailLog, { force: true })
    const send = async (text) => {
      await page.goto(`${base}/contact`, { waitUntil: 'networkidle' })
      await page.fill('input[name=name]', 'Test Persoon')
      await page.fill('input[name=email]', 'test@example.com')
      await page.selectOption('select[name=subject]', 'Herhaalrecept')
      await page.fill('textarea[name=message]', text)
      await page.click('form button[type=submit]')
      await page.getByText('Bedankt').waitFor()
    }
    await send('Vertrouwelijke vraag over mijn medicatie (flowtest A).')
    await page.waitForTimeout(800)
    if (mailLog) {
      const mails = readFileSync(mailLog, 'utf8').trim().split('\n').map((line) => JSON.parse(line))
      assert.equal(mails.length, 1)
      assert.equal(mails[0].subject, 'Nieuw bericht via de website: Herhaalrecept')
      assert.match(mails[0].text, /\/beheer\/berichten/)
      for (const secret of ['Vertrouwelijke', 'Test Persoon', 'test@example.com']) {
        assert.ok(!JSON.stringify(mails[0]).includes(secret), `mail leaks ${secret}`)
      }
    } else {
      console.log('  (E2E_MAIL_LOG not set: mail notice not checked)')
    }

    await login()
    await page.goto(`${base}/beheer`, { waitUntil: 'networkidle' })
    const openCount = Number(await sql('select count(*) from contact_submissions where handled = 0'))
    await page.getByRole('heading', { name: openCount === 1 ? '1 open bericht' : `${openCount} open berichten` }).waitFor()
    assert.ok(await page.locator('section', { hasText: 'open bericht' }).getByText('Herhaalrecept').first().isVisible())
    await page.goto(`${base}/beheer/berichten`, { waitUntil: 'networkidle' })
    const card = page.locator('li', { hasText: 'flowtest A' })
    await card.getByRole('button', { name: 'Markeer als afgehandeld' }).click()
    await card.waitFor({ state: 'detached', timeout: 8000 })
    await page.getByRole('link', { name: /Afgehandeld/ }).click()
    await page.waitForURL(/toon=afgehandeld/)
    const done = page.locator('li', { hasText: 'flowtest A' })
    await done.getByText(/Wordt automatisch verwijderd op/).waitFor()
    assert.equal(await sql("select count(*) from contact_submissions where message like '%flowtest A%' and handled_at is not null"), '1')

    // retention: handled 100 days ago -> purged on next visit
    await sql("update contact_submissions set handled_at = now() - interval 100 day where message like '%flowtest A%'")
    await page.reload({ waitUntil: 'networkidle' })
    assert.equal(await page.locator('li', { hasText: 'flowtest A' }).count(), 0)
    assert.equal(await sql("select count(*) from contact_submissions where message like '%flowtest A%'"), '0')

    // manual delete
    await send('Mag direct weg (flowtest B).')
    await page.goto(`${base}/beheer/berichten`, { waitUntil: 'networkidle' })
    const b = page.locator('li', { hasText: 'flowtest B' })
    await b.getByRole('button', { name: 'Verwijderen' }).click()
    await b.getByRole('button', { name: 'Definitief verwijderen' }).click()
    await b.waitFor({ state: 'detached', timeout: 8000 })
    assert.equal(await sql("select count(*) from contact_submissions where message like '%flowtest%'"), '0')
  },
  async hoursValidation() {
    await login()
    await page.goto(`${base}/beheer/openingstijden`, { waitUntil: 'networkidle' })
    const form = page.locator('form').first()
    await form.getByLabel('Maandag sluit').fill('07:00')
    await form.getByRole('button', { name: 'Week opslaan' }).click()
    await form.getByText('Sluitingstijd moet na de openingstijd liggen.').waitFor()
    await form.getByLabel('Maandag sluit').fill('17:00')
    await form.getByRole('button', { name: 'Week opslaan' }).click()
    await form.getByText(/opgeslagen/).waitFor()
  },
  async announcements() {
    await sql("delete from announcements where title like 'Flowtest mededeling%'")
    const today = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Amsterdam' }).format(new Date())
    const yesterday = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Amsterdam' }).format(new Date(Date.now() - 86_400_000))
    await login()
    await page.goto(`${base}/beheer/mededelingen`, { waitUntil: 'networkidle' })
    const form = page.locator('#mededeling-nieuw')
    await form.locator('input[name=title]').fill('Flowtest mededeling')
    await form.locator('.ProseMirror').click()
    await page.keyboard.type('Vandaag andere tijden.')
    await form.locator('input[name=visibleUntil]').fill(today)
    await form.getByRole('button', { name: 'Toevoegen' }).click()
    await form.getByText('Mededeling toegevoegd.').waitFor()
    assert.equal(await sql("select visible_until from announcements where title='Flowtest mededeling'"), today)
    assert.ok((await (await page.request.get(base)).text()).includes('Flowtest mededeling'), 'visible through today')

    const item = page.locator('li', { has: page.locator('input[value="Flowtest mededeling"]') })
    await item.getByText('Online').waitFor()
    await item.locator('input[name=visibleUntil]').fill(yesterday)
    await item.getByRole('button', { name: 'Opslaan' }).click()
    await item.getByText('Verlopen').waitFor()
    assert.ok(!(await (await page.request.get(base)).text()).includes('Flowtest mededeling'), 'expired hidden')

    await item.locator('input[name=visibleUntil]').fill('')
    await item.getByRole('button', { name: 'Opslaan' }).click()
    await item.getByText('Online').waitFor()
    assert.equal(await sql("select visible_until is null from announcements where title='Flowtest mededeling'"), '1')
    await item.getByRole('button', { name: 'Verwijderen' }).click()
    await item.getByRole('button', { name: 'Definitief verwijderen' }).click()
    await item.waitFor({ state: 'detached' })
  },
  async newsArchive() {
    await sql("delete from news_posts where slug like 'paginatest-%'")
    const values = Array.from({ length: 14 }, (_, i) => `(uuid(), 'paginatest-${i + 1}', 'Paginatest ${i + 1}', 'Samenvatting', '<p>x</p>', 1, now() - interval ${i + 30} day)`).join(',')
    await sql(`insert into news_posts (id, slug, title, excerpt, body, published, published_at) values ${values}`)
    try {
      const live = Number(await sql('select count(*) from news_posts where published and published_at <= now()'))
      await page.goto(`${base}/nieuws`, { waitUntil: 'networkidle' })
      assert.equal(await page.locator('main li a[href^="/nieuws/"]').count(), 12)
      await page.getByText(`Pagina 1 van ${Math.ceil(live / 12)}`).waitFor()
      await page.getByRole('link', { name: 'Oudere berichten' }).click()
      await page.waitForURL(/\?pagina=2$/)
      await page.getByText('Pagina 2 van').waitFor({ timeout: 5000 })
      assert.equal(await page.locator('main li a[href^="/nieuws/"]').count(), live - 12)
      assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'), `${base}/nieuws?pagina=2`)
      assert.equal(await page.title(), 'Nieuws – pagina 2 · Apotheek De Bongerd')
      await page.getByRole('link', { name: 'Nieuwere berichten' }).click()
      await page.waitForURL(/\/nieuws$/)
      assert.equal((await page.request.get(`${base}/nieuws?pagina=99`)).status(), 404)
      const bad = await page.request.get(`${base}/nieuws?pagina=abc`, { maxRedirects: 0 })
      assert.equal(bad.status(), 307)
      assert.equal(bad.headers().location, '/nieuws')
      // home: newest three of the last 12 months, never the 2022 post
      const home = await (await page.request.get(base)).text()
      assert.ok(!home.includes('Geen zaterdagopening'), 'stale post hidden on home')
      assert.ok(home.includes('/nieuws/paginatest-1"'), 'recent post on home')
    } finally {
      await sql("delete from news_posts where slug like 'paginatest-%'")
    }
  },
  async unsavedWarning() {
    await login()
    const id = await sql("select id from news_posts where slug='herhaalmedicatie-ophalen'")
    const dialogs = []
    let answer = false
    const onDialog = (d) => { dialogs.push(d.type()); answer ? d.accept() : d.dismiss() }
    page.on('dialog', onDialog)
    try {
      const open = async () => {
        await page.goto(`${base}/beheer/nieuws/${id}`, { waitUntil: 'networkidle' })
        await page.locator('.ProseMirror').waitFor()
      }
      const back = () => page.getByRole('link', { name: 'Alle berichten' }).click()

      await open()
      await back()
      await page.waitForURL(/\/beheer\/nieuws\/?$/)
      assert.equal(dialogs.length, 0, 'no prompt without changes')

      await open()
      await page.fill('input[name=title]', 'Gewijzigd maar niet opgeslagen')
      answer = false
      await back()
      await page.waitForTimeout(300)
      assert.deepEqual(dialogs, ['confirm'])
      assert.ok(page.url().endsWith(id), 'stays on editor after cancel')
      assert.equal(await page.inputValue('input[name=title]'), 'Gewijzigd maar niet opgeslagen')
      answer = true
      await back()
      await page.waitForURL(/\/beheer\/nieuws\/?$/)
      assert.equal(await sql(`select title from news_posts where id='${id}'`), 'Nieuw ophaalmoment herhaalmedicatie')

      // formatting only (no keystroke in a field) still counts
      dialogs.length = 0
      await open()
      await page.locator('.ProseMirror').click()
      await page.keyboard.press('Control+A')
      await page.getByRole('button', { name: 'Vet' }).click()
      answer = false
      await back()
      await page.waitForTimeout(300)
      assert.deepEqual(dialogs, ['confirm'], 'bold toggle marks dirty')

      // browser close / reload guard
      dialogs.length = 0
      answer = false
      await page.close({ runBeforeUnload: true })
      await new Promise((r) => setTimeout(r, 500))
      assert.deepEqual(dialogs, ['beforeunload'])
    } finally {
      page.off('dialog', onDialog)
    }
    // page was closed above; continue on a fresh one
    page = await ctx.newPage()
    page.on('pageerror', (e) => errors.push(e.message))
    await login()
    const seen = []
    page.on('dialog', (d) => { seen.push(d.type()); d.dismiss() })
    await page.goto(`${base}/beheer/nieuws/${id}`, { waitUntil: 'networkidle' })
    await page.locator('textarea[name=excerpt]').press('End')
    await page.locator('textarea[name=excerpt]').type(' ')
    await page.locator('textarea[name=excerpt]').press('Backspace')
    await page.getByRole('button', { name: 'Opslaan' }).click()
    await page.getByText('Opgeslagen.').waitFor()
    await page.getByRole('link', { name: 'Alle berichten' }).click()
    await page.waitForURL(/\/beheer\/nieuws\/?$/)
    assert.equal(seen.length, 0, 'no prompt after save')

    // create navigates to the new id without prompting
    await page.getByRole('link', { name: 'Nieuw bericht' }).click()
    await page.fill('input[name=title]', 'Unsaved flow nieuw')
    await page.fill('textarea[name=excerpt]', 'x')
    await page.locator('.ProseMirror').click()
    await page.keyboard.type('Inhoud.')
    await page.getByRole('button', { name: 'Bericht aanmaken' }).click()
    await page.waitForURL(/\/beheer\/nieuws\/[0-9a-f-]{36}$/)
    assert.equal(seen.length, 0, 'no prompt on create')
    await sql("delete from news_posts where title='Unsaved flow nieuw'")
  },
  async orphanUploads() {
    const dir = uploadDir
    const ids = { orphan: randomUUID(), fresh: randomUUID(), used: randomUUID() }
    const threeDaysAgo = new Date(Date.now() - 3 * 86_400_000)
    for (const id of Object.values(ids)) {
      for (const suffix of ['', '-800']) copyFileSync('public/images/orchard-800.webp', path.join(dir, `${id}${suffix}.webp`))
    }
    for (const id of [ids.orphan, ids.used]) {
      for (const suffix of ['', '-800']) utimesSync(path.join(dir, `${id}${suffix}.webp`), threeDaysAgo, threeDaysAgo)
    }
    await sql(`insert into news_posts (id, slug, title, excerpt, body, image_url, published, published_at) values (uuid(), 'orphantest', 'Orphantest', 'x', '<p>x</p>', '/uploads/${ids.used}.webp', 0, now())`)
    try {
      const script = "import('./src/server/uploadCleanup.server.ts').then(async (m) => { console.log(JSON.stringify(await m.purgeOrphanedUploads({ force: true }))); process.exit(0) })"
      const out = execFileSync('node_modules/.bin/tsx', ['-e', script], { env: { ...process.env, UPLOAD_DIR: dir } }).toString()
      const removed = JSON.parse(out.trim().split('\n').pop())
      assert.deepEqual(removed.sort(), [`${ids.orphan}-800.webp`, `${ids.orphan}.webp`])
      const left = readdirSync(dir).join('\n')
      assert.ok(!left.includes(ids.orphan), 'old orphan removed')
      assert.ok(left.includes(`${ids.fresh}.webp`) && left.includes(`${ids.fresh}-800.webp`), 'fresh upload kept (grace period)')
      assert.ok(left.includes(`${ids.used}.webp`) && left.includes(`${ids.used}-800.webp`), 'referenced upload kept')
    } finally {
      await sql("delete from news_posts where slug='orphantest'")
      for (const id of Object.values(ids)) {
        for (const suffix of ['', '-800']) rmSync(path.join(dir, `${id}${suffix}.webp`), { force: true })
      }
    }
  },
  async newsEditor() {
    await sql("delete from news_posts where slug like 'dubbele-titel-test%'")
    await login()
    const ids = []
    for (let i = 0; i < 2; i++) {
      await page.goto(`${base}/beheer/nieuws`, { waitUntil: 'networkidle' })
      await page.getByRole('link', { name: 'Nieuw bericht' }).click()
      await page.waitForURL(/\/beheer\/nieuws\/nieuw$/)
      await page.fill('input[name=title]', 'Dubbele titel test')
      await page.fill('textarea[name=excerpt]', 'Samenvatting')
      await page.locator('.ProseMirror').click()
      await page.keyboard.type('Inhoud van het bericht.')
      await page.getByRole('button', { name: 'Bericht aanmaken' }).click()
      await page.waitForURL(/\/beheer\/nieuws\/[0-9a-f-]{36}$/, { timeout: 8000 })
      await page.getByText('Bericht aangemaakt.').waitFor()
      ids.push(page.url().split('/').pop())
    }
    const slugs = (await sql("select slug from news_posts where slug like 'dubbele-titel-test%' order by slug")).split('\n')
    assert.deepEqual(slugs, ['dubbele-titel-test', 'dubbele-titel-test-2'])

    // rename keeps slug (no broken links), schedule hides it from the site
    await page.goto(`${base}/beheer/nieuws/${ids[0]}`, { waitUntil: 'networkidle' })
    await page.fill('input[name=title]', 'Dubbele titel test hernoemd')
    await page.fill('input[name=publishedAt]', '2099-01-01T09:00')
    await page.getByRole('button', { name: 'Opslaan' }).click()
    assert.equal(await page.locator('input[name=publishedAt]:invalid').count(), 1, 'browser blocks far future')
    await page.fill('input[name=publishedAt]', '2027-03-01T09:00')
    await page.getByRole('button', { name: 'Opslaan' }).click()
    await page.getByText('Opgeslagen.').waitFor()
    assert.equal(await sql(`select slug from news_posts where id='${ids[0]}'`), 'dubbele-titel-test')
    await page.reload({ waitUntil: 'networkidle' })
    assert.equal(await page.inputValue('input[name=publishedAt]'), '2027-03-01T09:00', 'amsterdam wall time round-trips')
    await page.getByText('Gepland', { exact: true }).waitFor()
    assert.equal((await page.request.get(`${base}/nieuws/dubbele-titel-test`)).status(), 404)
    const site = await (await page.request.get(`${base}/nieuws`)).text()
    assert.ok(!site.includes('hernoemd'), 'scheduled post hidden from list')
    assert.ok(site.includes('/nieuws/dubbele-titel-test-2'), 'live post listed')
    await page.goto(`${base}/beheer/nieuws`, { waitUntil: 'networkidle' })
    const row = page.locator('li', { hasText: 'hernoemd' })
    await row.getByText('Gepland').waitFor()
    assert.match(await row.innerText(), /Verschijnt .*2027/)

    // delete through the editor
    for (const id of ids) {
      await page.goto(`${base}/beheer/nieuws/${id}`, { waitUntil: 'networkidle' })
      await page.getByRole('button', { name: 'Verwijderen' }).click()
      await page.getByRole('button', { name: 'Definitief verwijderen' }).click()
      await page.waitForURL(/\/beheer\/nieuws\/?$/, { timeout: 8000 })
    }
    assert.equal(await sql("select count(*) from news_posts where slug like 'dubbele-titel-test%'"), '0')
    const missing = await page.request.get(`${base}/beheer/nieuws/00000000-0000-0000-0000-000000000000`)
    assert.equal(missing.status(), 404)
  },
  async servicesOrder() {
    const order = async () => (await sql('select title from services order by sort_order, title')).split('\n')
    await login()
    await page.goto(`${base}/beheer/diensten`, { waitUntil: 'networkidle' })
    const before = await order()
    await page.getByRole('button', { name: `${before[1]} omhoog` }).click()
    await page.waitForFunction((t) => document.querySelector('ol li a')?.textContent === t, before[1])
    const after = await order()
    assert.deepEqual(after.slice(0, 2), [before[1], before[0]])
    assert.equal(await sql('select count(distinct sort_order) = count(*) from services'), '1')
    const slugs = (await sql('select slug from services where published order by sort_order')).split('\n')
    const site = await (await page.request.get(`${base}/diensten`)).text()
    const chips = [...site.matchAll(/href="#([a-z-]+)"/g)].map((m) => m[1]).filter((s) => s !== 'inhoud')
    assert.deepEqual(chips, slugs, 'public order follows admin')
    assert.equal(await page.getByRole('button', { name: `${after[0]} omhoog` }).isDisabled(), true)
    await page.getByRole('button', { name: `${before[0]} omhoog` }).click()
    await page.waitForFunction((t) => document.querySelector('ol li a')?.textContent === t, before[0])
    assert.deepEqual(await order(), before)
  },
  async accounts() {
    await sql("delete from users where email = 'collega-test@example.com'")
    await login()
    await page.goto(`${base}/beheer/team`, { waitUntil: 'networkidle' })
    await page.fill('input[name=email]', 'collega-test@example.com')
    await page.getByRole('button', { name: 'Toevoegen' }).click()
    const notice = page.getByText('Tijdelijk wachtwoord voor collega-test@example.com')
    await notice.waitFor({ timeout: 8000 })
    const temp = (await page.locator('p.font-mono').innerText()).trim()
    assert.match(temp, /^[A-Za-z2-9]{4}(-[A-Za-z2-9]{4}){3}$/)

    const colleague = async () => {
      const c = await browser.newContext({ locale: 'nl-NL' })
      const p = await c.newPage()
      return { c, p }
    }
    const signIn = async (p, password) => {
      await p.goto(`${base}/beheer/login`, { waitUntil: 'networkidle' })
      await p.fill('input[name=email]', 'collega-test@example.com')
      await p.fill('input[name=password]', password)
      await p.click('button[type=submit]')
      await p.waitForURL(/\/beheer\/?$/, { timeout: 8000 })
    }
    const a = await colleague()
    const b = await colleague()
    await signIn(a.p, temp)
    await signIn(b.p, temp)

    // device a changes the password; device b must be logged out, a stays in
    await a.p.goto(`${base}/beheer/account`, { waitUntil: 'networkidle' })
    await a.p.fill('input[name=current]', temp)
    await a.p.fill('input[name=next]', 'kort')
    await a.p.fill('input[name=repeat]', 'kort')
    await a.p.getByRole('button', { name: 'Wachtwoord opslaan' }).click()
    assert.equal(await a.p.locator('input[name=next]:invalid').count(), 1, 'browser blocks short password')
    await a.p.fill('input[name=next]', 'een lange nieuwe zin 2026')
    await a.p.fill('input[name=repeat]', 'een lange nieuwe zin 2027')
    await a.p.getByRole('button', { name: 'Wachtwoord opslaan' }).click()
    await a.p.getByText('De nieuwe wachtwoorden zijn niet gelijk.').waitFor({ timeout: 5000 })
    await a.p.fill('input[name=current]', 'fout-wachtwoord-123')
    await a.p.fill('input[name=next]', 'een lange nieuwe zin 2026')
    await a.p.fill('input[name=repeat]', 'een lange nieuwe zin 2026')
    await a.p.getByRole('button', { name: 'Wachtwoord opslaan' }).click()
    await a.p.getByText('Het huidige wachtwoord klopt niet.').waitFor({ timeout: 8000 })
    await a.p.fill('input[name=current]', temp)
    await a.p.fill('input[name=next]', 'een lange nieuwe zin 2026')
    await a.p.fill('input[name=repeat]', 'een lange nieuwe zin 2026')
    await a.p.getByRole('button', { name: 'Wachtwoord opslaan' }).click()
    await a.p.getByText('Wachtwoord gewijzigd. Andere apparaten zijn uitgelogd.').waitFor({ timeout: 8000 })
    await a.p.goto(`${base}/beheer`, { waitUntil: 'networkidle' })
    assert.ok(!a.p.url().includes('/login'), 'device a stays logged in')
    await b.p.goto(`${base}/beheer`, { waitUntil: 'networkidle' })
    assert.ok(b.p.url().includes('/login'), 'device b is logged out')

    // old temp password no longer works, new one does
    await b.p.fill('input[name=email]', 'collega-test@example.com')
    await b.p.fill('input[name=password]', temp)
    await b.p.click('button[type=submit]')
    await b.p.getByText('E-mail of wachtwoord is onjuist.').waitFor({ timeout: 8000 })
    await signIn(b.p, 'een lange nieuwe zin 2026')

    // admin removes colleague: both devices lose access immediately
    await page.goto(`${base}/beheer/team`, { waitUntil: 'networkidle' })
    const row = page.locator('li', { hasText: 'collega-test@example.com' })
    await row.getByRole('button', { name: 'Verwijderen' }).click()
    await row.getByRole('button', { name: 'Definitief verwijderen' }).click()
    await row.waitFor({ state: 'detached', timeout: 8000 })
    for (const d of [a, b]) {
      await d.p.goto(`${base}/beheer`, { waitUntil: 'networkidle' })
      assert.ok(d.p.url().includes('/login'), 'removed colleague is logged out')
      await d.c.close()
    }
    // cannot remove yourself: no delete button on own row
    const own = page.locator('li', { hasText: adminEmail })
    assert.equal(await own.getByRole('button', { name: 'Verwijderen' }).count(), 0)
  },
}

let failed = 0
for (const [name, fn] of Object.entries(tests)) {
  if (only.length && !only.includes(name)) continue
  errors.length = 0
  try {
    await fn()
    console.log(`ok   ${name}${errors.length ? `  (console: ${errors.slice(0, 3).join(' | ').slice(0, 300)})` : ''}`)
  } catch (err) {
    failed++
    console.log(`FAIL ${name}: ${err.message.split('\n').filter(Boolean).slice(0, 4).join(' | ')}`)
    await page.screenshot({ path: path.join(out, `fail-${name}.png`), fullPage: true }).catch(() => {})
  }
}
await browser.close()
await db.end()
console.log(failed ? `\n${failed} flow(s) failed; screenshots in e2e/.artifacts/` : '\nall flows passed')
process.exit(failed ? 1 : 0)
