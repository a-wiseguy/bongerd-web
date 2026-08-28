const WEEKDAYS = ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'] as const
export const WEEKDAY_LABELS = [
  { value: 1, label: 'Maandag' },
  { value: 2, label: 'Dinsdag' },
  { value: 3, label: 'Woensdag' },
  { value: 4, label: 'Donderdag' },
  { value: 5, label: 'Vrijdag' },
  { value: 6, label: 'Zaterdag' },
  { value: 0, label: 'Zondag' },
] as const

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
  const weekday = map[get('weekday')] ?? 0
  const y = get('year')
  const m = get('month')
  const d = get('day')
  const hour = Number(get('hour'))
  const minute = Number(get('minute'))
  return {
    weekday,
    date: `${y}-${m}-${d}`,
    minutes: hour * 60 + minute,
  }
}

function toMinutes(value: string | null) {
  if (!value) return null
  const [h, min] = value.split(':')
  if (h == null || min == null) return null
  return Number(h) * 60 + Number(min)
}

export function locationStatus(
  hours: DayHours[],
  exceptions: DayException[],
  now = amsterdamNow(),
) {
  const exception = exceptions.find((item) => item.date === now.date)
  if (exception) {
    if (exception.isClosed) {
      return { open: false, label: 'Gesloten', detail: exception.label }
    }
    const opens = toMinutes(exception.opens)
    const closes = toMinutes(exception.closes)
    if (opens == null || closes == null) {
      return { open: false, label: 'Gesloten', detail: exception.label }
    }
    const open = now.minutes >= opens && now.minutes < closes
    return {
      open,
      label: open ? 'Nu open' : 'Gesloten',
      detail: `${exception.label} · ${formatClock(exception.opens)}–${formatClock(exception.closes)}`,
    }
  }

  const today = hours.find((item) => item.weekday === now.weekday)
  if (!today || today.isClosed) {
    return { open: false, label: 'Gesloten', detail: 'Vandaag gesloten' }
  }
  const opens = toMinutes(today.opens)
  const closes = toMinutes(today.closes)
  if (opens == null || closes == null) {
    return { open: false, label: 'Gesloten', detail: 'Vandaag gesloten' }
  }
  const open = now.minutes >= opens && now.minutes < closes
  return {
    open,
    label: open ? 'Nu open' : 'Gesloten',
    detail: `${formatClock(today.opens)}–${formatClock(today.closes)}`,
  }
}

export function formatClock(value: string | null) {
  if (!value) return ''
  return value.slice(0, 5)
}

export function weekdayName(weekday: number) {
  return WEEKDAY_LABELS.find((d) => d.value === weekday)?.label ?? WEEKDAYS[weekday] ?? ''
}
