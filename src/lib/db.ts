import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import * as schema from './schema'

type Db = ReturnType<typeof drizzle<typeof schema>>

let instance: Db | null = null

export function getDb(): Db {
  if (instance) return instance
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL ontbreekt')
  instance = drizzle(postgres(url, { max: 8 }), { schema })
  return instance
}

export const db = new Proxy({} as Db, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb() as object, prop, receiver)
  },
})
