import {
  boolean,
  char,
  date,
  int,
  mysqlTable,
  primaryKey,
  text,
  time,
  timestamp,
  varchar,
} from 'drizzle-orm/mysql-core'

function uuid(name: string) {
  return char(name, { length: 36 })
}

export const users = mysqlTable('users', {
  id: uuid('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const userRoles = mysqlTable(
  'user_roles',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    role: varchar('role', { length: 64 }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.role] })],
)

export const locations = mysqlTable('locations', {
  id: uuid('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  slug: varchar('slug', { length: 64 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  address: varchar('address', { length: 255 }).notNull(),
  postal: varchar('postal', { length: 32 }).notNull(),
  city: varchar('city', { length: 128 }).notNull(),
  phone: varchar('phone', { length: 64 }).notNull(),
  phoneTel: varchar('phone_tel', { length: 64 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  zorgmail: varchar('zorgmail', { length: 255 }),
  mapsQuery: varchar('maps_query', { length: 255 }).notNull(),
  sortOrder: int('sort_order').notNull().default(0),
})

export const siteContent = mysqlTable('site_content', {
  id: uuid('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  page: varchar('page', { length: 64 }).notNull(),
  blockKey: varchar('block_key', { length: 64 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  body: text('body').notNull(),
  imageUrl: varchar('image_url', { length: 512 }),
  imageAlt: varchar('image_alt', { length: 255 }),
  sortOrder: int('sort_order').notNull().default(0),
})

export const openingHours = mysqlTable('opening_hours', {
  id: uuid('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  locationId: uuid('location_id')
    .notNull()
    .references(() => locations.id, { onDelete: 'cascade' }),
  weekday: int('weekday').notNull(),
  opens: time('opens'),
  closes: time('closes'),
  isClosed: boolean('is_closed').notNull().default(false),
})

export const openingExceptions = mysqlTable('opening_exceptions', {
  id: uuid('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  locationId: uuid('location_id').references(() => locations.id, { onDelete: 'cascade' }),
  date: date('date', { mode: 'string' }).notNull(),
  opens: time('opens'),
  closes: time('closes'),
  isClosed: boolean('is_closed').notNull().default(false),
  label: varchar('label', { length: 255 }).notNull(),
})

export const announcements = mysqlTable('announcements', {
  id: uuid('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: varchar('title', { length: 255 }).notNull(),
  body: text('body').notNull(),
  published: boolean('published').notNull().default(true),
  sortOrder: int('sort_order').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const newsPosts = mysqlTable('news_posts', {
  id: uuid('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  slug: varchar('slug', { length: 191 }).notNull().unique(),
  title: varchar('title', { length: 255 }).notNull(),
  excerpt: text('excerpt').notNull(),
  body: text('body').notNull(),
  imageUrl: varchar('image_url', { length: 512 }),
  imageAlt: varchar('image_alt', { length: 255 }),
  published: boolean('published').notNull().default(true),
  publishedAt: timestamp('published_at').notNull().defaultNow(),
})

export const services = mysqlTable('services', {
  id: uuid('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  slug: varchar('slug', { length: 191 }).notNull().unique(),
  title: varchar('title', { length: 255 }).notNull(),
  summary: text('summary').notNull(),
  body: text('body').notNull(),
  imageUrl: varchar('image_url', { length: 512 }),
  imageAlt: varchar('image_alt', { length: 255 }),
  href: varchar('href', { length: 512 }),
  sortOrder: int('sort_order').notNull().default(0),
  published: boolean('published').notNull().default(true),
})

export const contactSubmissions = mysqlTable('contact_submissions', {
  id: uuid('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 64 }).notNull().default(''),
  subject: varchar('subject', { length: 255 }).notNull(),
  message: text('message').notNull(),
  handled: boolean('handled').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export type Location = typeof locations.$inferSelect
export type SiteContent = typeof siteContent.$inferSelect
export type OpeningHour = typeof openingHours.$inferSelect
export type OpeningException = typeof openingExceptions.$inferSelect
export type Announcement = typeof announcements.$inferSelect
export type NewsPost = typeof newsPosts.$inferSelect
export type Service = typeof services.$inferSelect
export type ContactSubmission = typeof contactSubmissions.$inferSelect
