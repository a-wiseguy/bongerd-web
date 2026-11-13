import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  addDays,
  amsterdamNow,
  type DayHours,
  fromAmsterdamInput,
  locationStatus,
  openingHoursSpecification,
  publishWindow,
  spanProblem,
  toAmsterdamInput,
  upcomingExceptions,
} from './hours'

// mon–fri 08:00–17:30, weekend closed
const week: DayHours[] = [0, 1, 2, 3, 4, 5, 6].map((weekday) =>
  weekday === 0 || weekday === 6
    ? { weekday, opens: null, closes: null, isClosed: true }
    : { weekday, opens: '08:00:00', closes: '17:30:00', isClosed: false },
)

const at = (date: string, weekday: number, clock: string) => {
  const [h, m] = clock.split(':').map(Number)
  return { date, weekday, minutes: h! * 60 + m! }
}

test('open during the day shows closing time', () => {
  assert.deepEqual(locationStatus(week, [], at('2026-11-12', 4, '10:15')), {
    open: true,
    label: 'Nu open',
    detail: 'Open tot 17:30',
  })
})

test('before opening says opens today', () => {
  assert.equal(locationStatus(week, [], at('2026-11-12', 4, '07:10')).detail, 'Opent vandaag om 08:00')
})

test('closing minute counts as closed', () => {
  const status = locationStatus(week, [], at('2026-11-12', 4, '17:30'))
  assert.equal(status.open, false)
  assert.equal(status.detail, 'Opent morgen om 08:00')
})

test('friday evening skips the weekend', () => {
  assert.equal(locationStatus(week, [], at('2026-11-13', 5, '18:52')).detail, 'Opent maandag om 08:00')
})

test('exception overrides hours and carries its label', () => {
  const xmasEve = [{ date: '2026-12-24', opens: '08:00:00', closes: '16:00:00', isClosed: false, label: 'Kerstavond' }]
  assert.deepEqual(locationStatus(week, xmasEve, at('2026-12-24', 4, '15:00')), {
    open: true,
    label: 'Nu open',
    detail: 'Kerstavond · Open tot 16:00',
  })
  assert.equal(locationStatus(week, xmasEve, at('2026-12-24', 4, '16:30')).open, false)
})

test('closed exception day points to next opening', () => {
  const closed = [{ date: '2026-12-25', opens: null, closes: null, isClosed: true, label: 'Eerste kerstdag' }]
  assert.equal(
    locationStatus(week, closed, at('2026-12-25', 5, '09:00')).detail,
    'Eerste kerstdag · Opent maandag om 08:00',
  )
})

test('no hours at all falls back without looping forever', () => {
  const allClosed = week.map((d) => ({ ...d, isClosed: true }))
  assert.equal(locationStatus(allClosed, [], at('2026-11-12', 4, '10:00')).detail, 'Tijdelijk gesloten')
})

test('invalid span (closes before opens) is treated as closed', () => {
  const broken = week.map((d) => (d.weekday === 4 ? { ...d, opens: '17:00:00', closes: '08:00:00' } : d))
  assert.equal(locationStatus(broken, [], at('2026-11-12', 4, '10:00')).open, false)
})

test('spanProblem validates admin input', () => {
  assert.equal(spanProblem({ opens: null, closes: null, isClosed: true }), null)
  assert.equal(spanProblem({ opens: '08:00', closes: '17:00', isClosed: false }), null)
  assert.equal(spanProblem({ opens: null, closes: '17:00', isClosed: false })?.field, 'opens')
  assert.equal(spanProblem({ opens: '08:00', closes: null, isClosed: false })?.field, 'closes')
  assert.equal(spanProblem({ opens: '17:00', closes: '08:00', isClosed: false })?.field, 'closes')
  assert.equal(spanProblem({ opens: '08:00', closes: '08:00', isClosed: false })?.field, 'closes')
})

test('addDays crosses month, year and dst boundaries', () => {
  assert.equal(addDays('2026-12-31', 1), '2027-01-01')
  assert.equal(addDays('2026-03-28', 1), '2026-03-29')
  assert.equal(addDays('2026-03-29', 1), '2026-03-30')
  assert.equal(addDays('2026-10-25', -1), '2026-10-24')
})

test('upcomingExceptions drops past days and sorts', () => {
  const list = [{ date: '2026-12-31' }, { date: '2026-11-01' }, { date: '2026-12-24' }, { date: '2027-06-01' }]
  assert.deepEqual(
    upcomingExceptions(list, '2026-11-13').map((e) => e.date),
    ['2026-12-24', '2026-12-31'],
  )
})

test('amsterdamNow uses local wall clock, not utc', () => {
  // 23:30 utc on 31 dec = 00:30 on 1 jan in amsterdam (cet)
  assert.deepEqual(amsterdamNow(new Date('2026-12-31T23:30:00Z')), { weekday: 5, date: '2027-01-01', minutes: 30 })
  // summer time: utc+2
  assert.equal(amsterdamNow(new Date('2026-07-01T06:00:00Z')).minutes, 8 * 60)
})

test('schema.org spec merges identical weekdays', () => {
  const mixed = week.map((d) => (d.weekday === 3 ? { ...d, closes: '12:00:00' } : d))
  assert.deepEqual(openingHoursSpecification(mixed), [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Thursday', 'Friday'],
      opens: '08:00',
      closes: '17:30',
    },
    { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Wednesday'], opens: '08:00', closes: '12:00' },
  ])
})

test('datetime-local values are amsterdam wall time in winter and summer', () => {
  assert.equal(fromAmsterdamInput('2026-11-13T09:30').toISOString(), '2026-11-13T08:30:00.000Z')
  assert.equal(fromAmsterdamInput('2026-07-01T09:30').toISOString(), '2026-07-01T07:30:00.000Z')
  assert.equal(toAmsterdamInput('2026-11-13T08:30:00.000Z'), '2026-11-13T09:30')
  assert.equal(toAmsterdamInput(new Date('2026-07-01T07:30:00Z')), '2026-07-01T09:30')
  // just after the spring-forward and fall-back switches
  assert.equal(fromAmsterdamInput('2026-03-29T03:30').toISOString(), '2026-03-29T01:30:00.000Z')
  assert.equal(toAmsterdamInput(fromAmsterdamInput('2026-10-25T04:00')), '2026-10-25T04:00')
  assert.throws(() => fromAmsterdamInput('13-11-2026 09:30'))
})

test('publish window stays inside mysql timestamp range', () => {
  const now = new Date('2026-11-13T12:00:00Z')
  const range = publishWindow(now)
  assert.equal(range.maxInput, '2028-11-12T23:59')
  assert.ok(range.contains(fromAmsterdamInput(range.maxInput)))
  assert.ok(!range.contains(fromAmsterdamInput('2099-01-01T09:00')))
  assert.ok(!range.contains(fromAmsterdamInput('1999-12-31T23:00')))
  assert.ok(range.contains(now))
})
