import bcrypt from 'bcryptjs'
import { randomBytes } from 'node:crypto'
import { and, asc, count, eq, sql } from 'drizzle-orm'
import { clientIp } from '@/lib/clientIp'
import { db } from '@/lib/db'
import { userRoles, users } from '@/lib/schema'
import { clearSession, readSession, setSession, type SessionUser } from '@/lib/session'

// valid bcrypt so compare cost matches real hashes when user missing
const DUMMY =
  '$2b$12$Z9JmuVn1bG0ifm7perCIKelf/icEL1LlV97bl3BYMsl.QhBC/Abs2'
const BCRYPT_COST = 12
const LOGIN_WINDOW = 15 * 60 * 1000
const LOGIN_LIMIT = 10
const MAX_LOGIN_KEYS = 10_000
const loginAttempts = new Map<string, { count: number; startedAt: number }>()

function tooManyLoginAttempts(key: string) {
  const now = Date.now()
  const previous = loginAttempts.get(key)
  if (!previous || now - previous.startedAt > LOGIN_WINDOW) {
    if (loginAttempts.size >= MAX_LOGIN_KEYS) {
      for (const [entryKey, entry] of loginAttempts) {
        if (now - entry.startedAt > LOGIN_WINDOW) loginAttempts.delete(entryKey)
      }
      if (loginAttempts.size >= MAX_LOGIN_KEYS) return true
    }
    loginAttempts.set(key, { count: 1, startedAt: now })
    return false
  }
  previous.count += 1
  return previous.count > LOGIN_LIMIT
}

async function adminRecord(id: string) {
  const [row] = await db
    .select({ id: users.id, email: users.email, passwordHash: users.passwordHash, sessionVersion: users.sessionVersion })
    .from(users)
    .innerJoin(userRoles, and(eq(userRoles.userId, users.id), eq(userRoles.role, 'admin')))
    .where(eq(users.id, id))
    .limit(1)
  return row ?? null
}

export async function getAdminUserImpl(): Promise<SessionUser | null> {
  const session = readSession()
  if (!session) return null
  const user = await adminRecord(session.id)
  if (!user || user.sessionVersion !== session.sv) return null
  return { id: user.id, email: user.email }
}

async function requireAdmin() {
  const user = await getAdminUserImpl()
  if (!user) throw new Error('Uw sessie is verlopen. Log opnieuw in.')
  return user
}

export async function loginImpl(data: { email: string; password: string }) {
  const email = data.email.trim().toLowerCase()
  const ip = clientIp()
  const rateKey = `${ip}|${email}`
  if (tooManyLoginAttempts(rateKey)) {
    return { error: 'Te veel pogingen. Probeer het later opnieuw.' as const }
  }
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1)
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
  loginAttempts.delete(rateKey)
  setSession({ id: user.id, email: user.email }, user.sessionVersion)
  return { ok: true as const }
}

export function logoutImpl() {
  clearSession()
}

async function bumpSessionVersion(id: string) {
  await db
    .update(users)
    .set({ sessionVersion: sql`${users.sessionVersion} + 1` })
    .where(eq(users.id, id))
  const [row] = await db.select({ sv: users.sessionVersion }).from(users).where(eq(users.id, id)).limit(1)
  return row?.sv ?? 0
}

export async function changePasswordImpl(data: { current: string; next: string }) {
  const me = await requireAdmin()
  const record = await adminRecord(me.id)
  if (!record || !(await bcrypt.compare(data.current, record.passwordHash))) {
    throw new Error('Het huidige wachtwoord klopt niet.')
  }
  if (data.current === data.next) {
    throw new Error('Kies een ander wachtwoord dan het huidige.')
  }
  await db
    .update(users)
    .set({ passwordHash: await bcrypt.hash(data.next, BCRYPT_COST) })
    .where(eq(users.id, me.id))
  // other devices are logged out, this one stays in
  setSession(me, await bumpSessionVersion(me.id))
  return { ok: true as const }
}

export async function logoutEverywhereImpl() {
  const me = await requireAdmin()
  await bumpSessionVersion(me.id)
  clearSession()
  return { ok: true as const }
}

// readable temp password: no 0/O/1/l confusion when read aloud or copied from screen
function temporaryPassword() {
  const alphabet = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const bytes = randomBytes(16)
  const chars = [...bytes].map((b) => alphabet[b % alphabet.length])
  return `${chars.slice(0, 4).join('')}-${chars.slice(4, 8).join('')}-${chars.slice(8, 12).join('')}-${chars.slice(12, 16).join('')}`
}

export async function listAdminsImpl() {
  const me = await requireAdmin()
  const rows = await db
    .select({ id: users.id, email: users.email, createdAt: users.createdAt })
    .from(users)
    .innerJoin(userRoles, and(eq(userRoles.userId, users.id), eq(userRoles.role, 'admin')))
    .orderBy(asc(users.email))
  return { me: me.id, users: rows }
}

export async function addAdminImpl(data: { email: string }) {
  await requireAdmin()
  const email = data.email.trim().toLowerCase()
  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1)
  if (existing) throw new Error('Er bestaat al een account met dit e-mailadres.')
  const password = temporaryPassword()
  const id = crypto.randomUUID()
  await db.transaction(async (tx) => {
    await tx.insert(users).values({ id, email, passwordHash: await bcrypt.hash(password, BCRYPT_COST) })
    await tx.insert(userRoles).values({ userId: id, role: 'admin' })
  })
  return { email, password }
}

export async function resetAdminPasswordImpl(data: { id: string }) {
  const me = await requireAdmin()
  if (data.id === me.id) throw new Error('Wijzig uw eigen wachtwoord via Account.')
  const target = await adminRecord(data.id)
  if (!target) throw new Error('Deze collega bestaat niet meer.')
  const password = temporaryPassword()
  await db
    .update(users)
    .set({ passwordHash: await bcrypt.hash(password, BCRYPT_COST) })
    .where(eq(users.id, target.id))
  await bumpSessionVersion(target.id)
  return { email: target.email, password }
}

export async function removeAdminImpl(data: { id: string }) {
  const me = await requireAdmin()
  if (data.id === me.id) throw new Error('U kunt uw eigen account niet verwijderen.')
  if (!(await adminRecord(data.id))) throw new Error('Deze collega bestaat niet meer.')
  const [{ value: admins } = { value: 0 }] = await db
    .select({ value: count() })
    .from(userRoles)
    .where(eq(userRoles.role, 'admin'))
  if (Number(admins) <= 1) throw new Error('Er moet minstens één beheerder overblijven.')
  await db.delete(users).where(eq(users.id, data.id))
  return { ok: true as const }
}
