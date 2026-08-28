import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { userRoles, users } from '@/lib/schema'
import { clearSession, readSession, setSession, type SessionUser } from '@/lib/session'

const DUMMY =
  '$2b$12$C6UzMDM.H6dfI/f/IKcEe.OjzQe.OjzQe.OjzQe.OjzQe.OjzQeO'

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
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, data.email.toLowerCase()))
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
  setSession({ id: user.id, email: user.email })
  return { ok: true as const }
}

export function logoutImpl() {
  clearSession()
}
