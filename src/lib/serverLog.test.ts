import assert from 'node:assert/strict'
import { test } from 'node:test'
import { notFound, redirect } from '@tanstack/react-router'
import { describeError, isExpectedError } from './serverLog'

test('query params never reach the log line', () => {
  const cause = Object.assign(new Error("Duplicate entry 'x' for key 'slug'"), { code: 'ER_DUP_ENTRY' })
  const error = new Error(
    'Failed query: insert into `contact_submissions` (`name`, `email`, `message`) values (?, ?, ?)\nparams: Jan Jansen,jan@example.com,Mijn medicatie',
    { cause },
  )
  const line = describeError(error)
  assert.match(line, /^Error: Failed query: insert into `contact_submissions`/)
  assert.match(line, /cause: ER_DUP_ENTRY Duplicate entry/)
  for (const secret of ['Jan Jansen', 'jan@example.com', 'Mijn medicatie', 'params']) {
    assert.ok(!line.includes(secret), `leaks ${secret}`)
  }
})

test('validation and router control flow are not incidents', () => {
  assert.equal(isExpectedError(new Error('[{"path":["email"],"message":"Ongeldig e-mailadres"}]')), true)
  assert.equal(isExpectedError(redirect({ to: '/beheer/login' })), true)
  assert.equal(isExpectedError(notFound()), true)
  assert.equal(isExpectedError(new Error('connect ECONNREFUSED 127.0.0.1:3306')), false)
})
