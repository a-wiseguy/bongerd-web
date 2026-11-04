import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { complaintsHtml, houseRulesParts, listItemsFromHtml } from './overOnsContent.ts'

describe('overOnsContent', () => {
  it('parses house rules list items', () => {
    const html =
      '<p>In de apotheek zijn vaak meerdere mensen tegelijk.</p><ul><li>Respect voor elkaars privacy.</li><li>Geen agressie.</li></ul>'
    assert.equal(listItemsFromHtml(html).length, 2)
    const parts = houseRulesParts(html)
    assert.match(parts.intro, /meerdere mensen/)
    assert.equal(parts.rules.length, 2)
  })

  it('linkifies complaint contact details', () => {
    const html = complaintsHtml(
      'Bel 06 2292 1649 of mail bemiddelingapotheken@kpnmail.nl. Meer op skge.nl.',
    )
    assert.match(html, /href="tel:\+31622921649"/)
    assert.match(html, /href="mailto:bemiddelingapotheken@kpnmail\.nl"/)
    assert.match(html, /href="https:\/\/www\.skge\.nl"/)
  })
})
