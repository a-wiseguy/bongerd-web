import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import mysql from 'mysql2/promise'
import { drizzle } from 'drizzle-orm/mysql2'
import { migrate } from 'drizzle-orm/mysql2/migrator'

const JOURNAL_TABLE = '__drizzle_migrations'

type Journal = { entries: { idx: number; when: number; tag: string }[] }

async function tableExists(conn: mysql.Connection, name: string) {
  const [rows] = await conn.query<mysql.RowDataPacket[]>(
    'select 1 from information_schema.tables where table_schema = database() and table_name = ? limit 1',
    [name],
  )
  return rows.length > 0
}

// databases created by the old `drizzle-kit push` boot have tables but no journal
async function baselineLegacyDatabase(conn: mysql.Connection, folder: string) {
  if (await tableExists(conn, JOURNAL_TABLE)) return
  if (!(await tableExists(conn, 'users'))) return

  const journal = JSON.parse(readFileSync(path.join(folder, 'meta/_journal.json'), 'utf8')) as Journal
  const baseline = journal.entries[0]
  if (!baseline) throw new Error('geen baseline-migratie gevonden')
  const sql = readFileSync(path.join(folder, `${baseline.tag}.sql`), 'utf8')

  await conn.query(
    `create table if not exists \`${JOURNAL_TABLE}\` (id serial primary key, hash text not null, created_at bigint)`,
  )
  await conn.query(`insert into \`${JOURNAL_TABLE}\` (hash, created_at) values (?, ?)`, [
    createHash('sha256').update(sql).digest('hex'),
    baseline.when,
  ])
  console.log(`bestaande database gemarkeerd op ${baseline.tag}`)
}

async function main() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL ontbreekt')
  const folder = path.resolve(process.env.MIGRATIONS_DIR ?? 'drizzle')

  const conn = await mysql.createConnection({ uri: url })
  try {
    await baselineLegacyDatabase(conn, folder)
    await migrate(drizzle({ client: conn }), { migrationsFolder: folder })
    console.log('database-schema is actueel')
  } finally {
    await conn.end()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
