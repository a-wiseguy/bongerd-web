import { defineConfig } from 'drizzle-kit'

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) throw new Error('DATABASE_URL ontbreekt')

export default defineConfig({
  schema: './src/lib/schema.ts',
  out: './drizzle',
  dialect: 'mysql',
  dbCredentials: {
    url: databaseUrl,
  },
})
