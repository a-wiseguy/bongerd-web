export const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0] as const

const WEEKDAY_NAMES = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'] as const
const SCHEMA_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const

export const WEEKDAY_LABELS = WEEKDAY_ORDER.map((value) => ({
  value,
  label: capitalize(WEEKDAY_NAMES[value]!),
}))

export type DayHours = {
  weekday: number
  opens: string | null
  closes: string | null
  isClosed: boolean
}

export type DayException = {
  date: string
  opens: string | null
  closes: string | null
  isClosed: boolean
  label: string
}

export type AmsterdamNow = {
  weekday: number
  date: string
  minutes: number
}

export type LocationStatus = {
  open: boolean
  label: string
  detail: string
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export function amsterdamNow(date = new Date()): AmsterdamNow {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Amsterdam',
    weekday: 'short',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? ''
  const map: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }
  return {
    weekday: map[get('weekday')] ?? 0,
    date: `${get('year')}-${get('month')}-${get('day')}`,
    minutes: Number(get('hour')) * 60 + Number(get('minute')),
  }
}

export function toMinutes(value: string | null | undefined) {
  if (!value) return null
  const [h, min] = value.split(':')
  if (h == null || min == null) return null
  const result = Number(h) * 60 + Number(min)
  return Number.isFinite(result) ? result : null
}

export function formatClock(value: string | null | undefined) {
  if (!value) return ''
  return value.slice(0, 5)
}

export function weekdayName(weekday: number) {
  return capitalize(WEEKDAY_NAMES[weekday] ?? '')
}

export function spanProblem(value: { opens: string | null; closes: string | null; isClosed: boolean }) {
  if (value.isClosed) return null
  if (!value.opens) return { field: 'opens', message: 'Vul een openingstijd in of kies gesloten.' } as const
  if (!value.closes) return { field: 'closes', message: 'Vul een sluitingstijd in of kies gesloten.' } as const
  if (value.closes.slice(0, 5) <= value.opens.slice(0, 5)) {
    return { field: 'closes', message: 'Sluitingstijd moet na de openingstijd liggen.' } as const
  }
  return null
}

/** calendar math on yyyy-mm-dd strings; utc avoids dst drift */
export function addDays(date: string, days: number) {
  const d = new Date(`${date}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

type Span = { opens: string; closes: string; from: number; to: number }

type DayPlan = { span: Span | null; exception: DayException | null }

export function planForDate(
  hours: DayHours[],
  exceptions: DayException[],
  date: string,
  weekday: number,
): DayPlan {
  const exception = exceptions.find((item) => item.date === date) ?? null
  const source = exception ?? hours.find((item) => item.weekday === weekday)
  if (!source || source.isClosed) return { span: null, exception }
  const from = toMinutes(source.opens)
  const to = toMinutes(source.closes)
  if (from == null || to == null || to <= from) return { span: null, exception }
  return {
    span: { opens: formatClock(source.opens), closes: formatClock(source.closes), from, to },
    exception,
  }
}

function dayPhrase(offset: number, weekday: number) {
  if (offset === 0) return 'vandaag'
  if (offset === 1) return 'morgen'
  return WEEKDAY_NAMES[weekday] ?? ''
}

export function locationStatus(
  hours: DayHours[],
  exceptions: DayException[],
  now: AmsterdamNow = amsterdamNow(),
): LocationStatus {
  const today = planForDate(hours, exceptions, now.date, now.weekday)
  const note = today.exception?.label ? `${today.exception.label} · ` : ''

  if (today.span && now.minutes >= today.span.from && now.minutes < today.span.to) {
    return { open: true, label: 'Nu open', detail: `${note}Open tot ${today.span.closes}` }
  }

  for (let offset = 0; offset <= 14; offset++) {
    const weekday = (now.weekday + offset) % 7
    const plan =
      offset === 0 ? today : planForDate(hours, exceptions, addDays(now.date, offset), weekday)
    if (!plan.span) continue
    if (offset === 0 && now.minutes >= plan.span.from) continue
    return {
      open: false,
      label: 'Gesloten',
      detail: `${note}Opent ${dayPhrase(offset, weekday)} om ${plan.span.opens}`,
    }
  }

  return { open: false, label: 'Gesloten', detail: today.exception?.label || 'Tijdelijk gesloten' }
}

/** today first, only upcoming, max horizon days ahead */
export function upcomingExceptions<T extends { date: string }>(
  exceptions: T[],
  today: string,
  horizonDays = 120,
) {
  const last = addDays(today, horizonDays)
  return exceptions
    .filter((item) => item.date >= today && item.date <= last)
    .sort((a, b) => a.date.localeCompare(b.date))
}

/** weekdays with identical hours merged, for schema.org */
export function openingHoursSpecification(hours: DayHours[]) {
  const groups = new Map<string, { opens: string; closes: string; days: string[] }>()
  for (const weekday of WEEKDAY_ORDER) {
    const row = hours.find((item) => item.weekday === weekday)
    if (!row || row.isClosed || !row.opens || !row.closes) continue
    const opens = formatClock(row.opens)
    const closes = formatClock(row.closes)
    const key = `${opens}-${closes}`
    const group = groups.get(key) ?? { opens, closes, days: [] }
    group.days.push(SCHEMA_DAYS[weekday]!)
    groups.set(key, group)
  }
  return [...groups.values()].map((group) => ({
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: group.days,
    opens: group.opens,
    closes: group.closes,
  }))
}

function amsterdamWallMs(instant: number) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Amsterdam',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(instant))
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value)
  return Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'))
}

/** instant → value for <input type="datetime-local">, always in amsterdam time */
export function toAmsterdamInput(value: Date | string) {
  const instant = new Date(value).getTime()
  return new Date(amsterdamWallMs(instant)).toISOString().slice(0, 16)
}

/** "yyyy-mm-ddThh:mm" amsterdam wall time → instant; server tz independent */
export function fromAmsterdamInput(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value)
  if (!match) throw new Error('Ongeldige datum')
  const [, y, mo, d, h, mi] = match.map(Number) as [number, number, number, number, number, number]
  const wall = Date.UTC(y, mo - 1, d, h, mi)
  let instant = wall - (amsterdamWallMs(wall) - wall)
  instant = wall - (amsterdamWallMs(instant) - instant)
  return new Date(instant)
}

/** mysql timestamp ends 2038; keep scheduling well inside */
export function publishWindow(now = new Date()) {
  const min = new Date(Date.UTC(2000, 0, 1))
  const max = new Date(now.getTime() + 2 * 365 * 86_400_000)
  return {
    contains: (value: Date) => value >= min && value.getTime() <= max.getTime() + 86_400_000,
    minInput: '2000-01-01T00:00',
    maxInput: `${toAmsterdamInput(max).slice(0, 10)}T23:59`,
  }
}
