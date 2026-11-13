import assert from 'node:assert/strict'
import { test } from 'node:test'
import { formatNlDay, nextFreeSlug, slugify } from './format'
import { htmlToPlainText, plainTextLength, plainToParagraphs } from './html'
import { sanitizeHtml, toSafeHtml } from './sanitize.server'
import { serializeJsonLd } from './seo'

test('slugify strips accents, symbols and length', () => {
  assert.equal(slugify('Geen zaterdag-opening!'), 'geen-zaterdag-opening')
  assert.equal(slugify('Café & crème — één'), 'cafe-creme-een')
  assert.equal(slugify('   '), 'item')
  assert.equal(slugify('???', 'bericht'), 'bericht')
  const long = slugify('a'.repeat(79) + ' bcd')
  assert.ok(long.length <= 80)
  assert.ok(!long.endsWith('-'))
})

test('nextFreeSlug appends the first free number', () => {
  assert.equal(nextFreeSlug('nieuws', []), 'nieuws')
  assert.equal(nextFreeSlug('nieuws', ['nieuws']), 'nieuws-2')
  assert.equal(nextFreeSlug('nieuws', ['nieuws', 'nieuws-2', 'nieuws-3']), 'nieuws-4')
})

test('formatNlDay ignores the server timezone', () => {
  assert.equal(formatNlDay('2026-12-24'), 'donderdag 24 december')
  assert.equal(formatNlDay('2027-01-01', true), 'vrijdag 1 januari 2027')
})

test('sanitizer removes scripts, handlers and unsafe links', () => {
  const dirty =
    '<p onclick="x()">Hoi<script>alert(1)</script></p><a href="javascript:alert(1)">x</a><img src=x onerror=alert(1)><iframe src="//evil"></iframe>'
  const clean = sanitizeHtml(dirty)
  assert.doesNotMatch(clean, /script|onclick|onerror|javascript|iframe|<img/i)
  assert.match(clean, /<p>Hoi<\/p>/)
})

test('sanitizer opens only web links in a new tab', () => {
  assert.equal(
    sanitizeHtml('<a href="https://example.nl" target="_self">x</a>'),
    '<a href="https://example.nl" rel="noopener noreferrer" target="_blank">x</a>',
  )
  assert.equal(sanitizeHtml('<a href="tel:+31488482133">bel</a>'), '<a href="tel:+31488482133">bel</a>')
  assert.equal(sanitizeHtml('<a href="//evil.example">x</a>'), '<a>x</a>')
})

test('legacy plain text becomes escaped paragraphs', () => {
  assert.equal(
    plainToParagraphs('Regel 1\nregel 2\n\nKinderen <12 jaar & ouders'),
    '<p>Regel 1<br>regel 2</p><p>Kinderen &lt;12 jaar &amp; ouders</p>',
  )
  assert.equal(toSafeHtml('tekst met <b>tag</b>'), 'tekst met tag')
  assert.equal(toSafeHtml('<p>al html</p>'), '<p>al html</p>')
  assert.equal(toSafeHtml(''), '')
})

test('plain text helpers count what readers see', () => {
  assert.equal(plainTextLength('<p>Hallo&nbsp;<strong>wereld</strong></p>'), 12)
  assert.equal(htmlToPlainText('<h2>Kop</h2><p>A &amp; B</p><ul><li>een</li><li>twee</li></ul>'), 'Kop A & B een twee')
})

test('json-ld cannot break out of its script tag', () => {
  const out = serializeJsonLd({ name: '</script><script>alert(1)</script>', note: 'a\u2028b' })
  assert.doesNotMatch(out, /<\/script>/i)
  assert.doesNotMatch(out, /\u2028/)
  assert.deepEqual(JSON.parse(out), { name: '</script><script>alert(1)</script>', note: 'a\u2028b' })
})
