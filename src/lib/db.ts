import mysql from 'mysql2/promise'
import { drizzle } from 'drizzle-orm/mysql2'
import * as schema from './schema'

type Db = ReturnType<typeof drizzle<typeof schema, 'default'>>

let instance: Db | null = null

export function getDb(): Db {
  if (instance) return instance
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL ontbreekt')
  instance = drizzle({
    client: mysql.createPool({ uri: url, connectionLimit: 8 }),
    schema,
    mode: 'default',
  })
  return instance
}

export const db = new Proxy({} as Db, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb() as object, prop, receiver)
  },
})
