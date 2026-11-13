import assert from 'node:assert/strict'
import { test } from 'node:test'
import { orphanedUploads } from './uploads'

const now = Date.parse('2026-11-13T12:00:00Z')
const old = now - 48 * 3_600_000
const fresh = now - 3_600_000
const a = '11111111-1111-4111-8111-111111111111'
const b = '22222222-2222-4222-8222-222222222222'
const c = '33333333-3333-4333-8333-333333333333'

test('only old, unreferenced, managed files are orphans', () => {
  const files = [
    { name: `${a}.webp`, mtimeMs: old },
    { name: `${a}-800.webp`, mtimeMs: old },
    { name: `${b}.webp`, mtimeMs: old },
    { name: `${b}-800.webp`, mtimeMs: old },
    { name: `${c}.webp`, mtimeMs: fresh },
    { name: `${c}-800.webp`, mtimeMs: fresh },
    { name: '.gitkeep', mtimeMs: old },
    { name: 'notes.txt', mtimeMs: old },
  ]
  const orphans = orphanedUploads(files, [`/uploads/${a}.webp`], now)
  assert.deepEqual(orphans.sort(), [`${b}-800.webp`, `${b}.webp`])
})

test('legacy jpg uploads that are still referenced survive', () => {
  const files = [{ name: `${a}.jpg`, mtimeMs: old }]
  assert.deepEqual(orphanedUploads(files, [`/uploads/${a}.jpg`], now), [])
  assert.deepEqual(orphanedUploads(files, [], now), [`${a}.jpg`])
})
