import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { userRoles, users } from '@/lib/schema'
import { clearSession, readSession, setSession, type SessionUser } from '@/lib/session'

const DUMMY =
  '$2b$12$C6UzMDM.H6dfI/f/IKcEe.OjzQe.OjzQe.OjzQe.OjzQe.OjzQeO'
const LOGIN_WINDOW = 15 * 60 * 1000
const LOGIN_LIMIT = 10
const MAX_LOGIN_KEYS = 10_000
const loginAttempts = new Map<string, { count: number; startedAt: number }>()

function tooManyLoginAttempts(email: string) {
  const now = Date.now()
  const previous = loginAttempts.get(email)
  if (!previous || now - previous.startedAt > LOGIN_WINDOW) {
    if (loginAttempts.size >= MAX_LOGIN_KEYS) {
      for (const [entryKey, entry] of loginAttempts) {
        if (now - entry.startedAt > LOGIN_WINDOW) loginAttempts.delete(entryKey)
      }
      if (loginAttempts.size >= MAX_LOGIN_KEYS) return true
    }
    loginAttempts.set(email, { count: 1, startedAt: now })
    return false
  }
  previous.count += 1
  return previous.count > LOGIN_LIMIT
}

export async function getAdminUserImpl(): Promise<SessionUser | null> {
  const session = readSession()
  if (!session) return null
  const [role] = await db
    .select()
    .from(userRoles)
    .where(eq(userRoles.userId, session.id))
    .limit(1)
  if (role?.role !== 'admin') return null
  return session
}

export async function loginImpl(data: { email: string; password: string }) {
  const email = data.email.trim().toLowerCase()
  if (tooManyLoginAttempts(email)) {
    return { error: 'Te veel pogingen. Probeer het later opnieuw.' as const }
  }
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1)
  let matches = false
  try {
    matches = await bcrypt.compare(data.password, user?.passwordHash ?? DUMMY)
  } catch {
    matches = false
  }
  if (!user || !matches) {
    return { error: 'E-mail of wachtwoord is onjuist.' as const }
  }
  const [role] = await db.select().from(userRoles).where(eq(userRoles.userId, user.id)).limit(1)
  if (role?.role !== 'admin') {
    return { error: 'Dit account heeft geen toegang tot beheer.' as const }
  }
  loginAttempts.delete(email)
  setSession({ id: user.id, email: user.email })
  return { ok: true as const }
}

export function logoutImpl() {
  clearSession()
}
