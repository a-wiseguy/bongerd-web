import assert from 'node:assert/strict'
import { test } from 'node:test'
import { isValidServiceHref, serviceHrefKind } from './serviceHref'

test('service href accepts empty, path, https', () => {
  assert.equal(isValidServiceHref(''), true)
  assert.equal(isValidServiceHref('/contact'), true)
  assert.equal(isValidServiceHref('/foo/bar'), true)
  assert.equal(isValidServiceHref('https://home.mijngezondheid.net'), true)
})

test('service href rejects protocol-relative and other schemes', () => {
  assert.equal(isValidServiceHref('//evil'), false)
  assert.equal(isValidServiceHref('//evil.example/phish'), false)
  assert.equal(isValidServiceHref('http://insecure.example'), false)
  assert.equal(isValidServiceHref('javascript:alert(1)'), false)
  assert.equal(isValidServiceHref('contact'), false)
})

test('service href kind for public render', () => {
  assert.equal(serviceHrefKind('https://example.com'), 'external')
  assert.equal(serviceHrefKind('/contact'), 'internal')
  assert.equal(serviceHrefKind('//evil'), 'invalid')
  assert.equal(serviceHrefKind('http://x'), 'invalid')
})
