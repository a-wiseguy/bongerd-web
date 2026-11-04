import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { enrichCmsHtml } from './cmsRichText.ts'

describe('cmsRichText', () => {
  it('does not break existing anchor tags in html', () => {
    const html =
      '<p>Intro</p><ul><li>Vraag aan via <a href="https://home.mijngezondheid.net">MijnGezondheid.net</a> (DigiD).</li></ul>'
    const out = enrichCmsHtml(html)
    assert.match(out, /href="https:\/\/home\.mijngezondheid\.net"/)
    assert.match(out, />MijnGezondheid\.net<\/a>/)
    assert.doesNotMatch(out, /home\.mijngezondheid\.net">/)
  })

  it('linkifies plain text inside simple html paragraphs', () => {
    const out = enrichCmsHtml('<p>Vraag aan via MijnGezondheid.net met DigiD.</p>')
    assert.match(out, /href="https:\/\/home\.mijngezondheid\.net"/)
  })

  it('linkifies plain text email', () => {
    const out = enrichCmsHtml('Mail info@apotheekdebongerd.nl voor hulp.')
    assert.match(out, /href="mailto:info@apotheekdebongerd\.nl"/)
  })
})
