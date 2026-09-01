import { deleteCookie, getCookie, setCookie } from '@tanstack/react-start/server'
import { createHmac, timingSafeEqual } from 'node:crypto'

const COOKIE = 'bongerd_session'
const WEEK = 60 * 60 * 24 * 7
const SESSION_VERSION = 1

function secret() {
  const value = process.env.SESSION_SECRET
  if (!value || value.length < 32) {
    throw new Error('SESSION_SECRET moet minstens 32 tekens zijn')
  }
  return value
}

function sign(payload: string) {
  return createHmac('sha256', secret()).update(payload).digest('base64url')
}

export type SessionUser = { id: string; email: string }

export function setSession(user: SessionUser) {
  const payload = Buffer.from(
    JSON.stringify({ ...user, v: SESSION_VERSION, exp: Math.floor(Date.now() / 1000) + WEEK }),
  ).toString('base64url')
  const token = `${payload}.${sign(payload)}`
  setCookie(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: WEEK,
    secure: process.env.COOKIE_SECURE === 'true',
  })
}

export function clearSession() {
  deleteCookie(COOKIE, { path: '/' })
}

export function readSession(): SessionUser | null {
  const raw = getCookie(COOKIE)
  if (!raw) return null
  const dot = raw.lastIndexOf('.')
  if (dot === -1) return null
  const payload = raw.slice(0, dot)
  const sig = raw.slice(dot + 1)
  const expected = sign(payload)
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null
  try {
    const user = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as SessionUser & {
      v?: number
      exp?: number
    }
    if (!user?.id || !user?.email || user.v !== SESSION_VERSION || !user.exp || user.exp <= Math.floor(Date.now() / 1000)) {
      return null
    }
    return { id: user.id, email: user.email }
  } catch {
    return null
  }
}
