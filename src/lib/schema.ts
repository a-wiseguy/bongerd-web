import {
  boolean,
  date,
  integer,
  pgTable,
  primaryKey,
  text,
  time,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const userRoles = pgTable(
  'user_roles',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    role: text('role').notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.role] })],
)

export const locations = pgTable('locations', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  address: text('address').notNull(),
  postal: text('postal').notNull(),
  city: text('city').notNull(),
  phone: text('phone').notNull(),
  phoneTel: text('phone_tel').notNull(),
  email: text('email').notNull(),
  zorgmail: text('zorgmail'),
  mapsQuery: text('maps_query').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
})

export const siteContent = pgTable('site_content', {
  id: uuid('id').defaultRandom().primaryKey(),
  page: text('page').notNull(),
  blockKey: text('block_key').notNull(),
  title: text('title').notNull(),
  body: text('body').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
})

export const openingHours = pgTable('opening_hours', {
  id: uuid('id').defaultRandom().primaryKey(),
  locationId: uuid('location_id')
    .notNull()
    .references(() => locations.id, { onDelete: 'cascade' }),
  weekday: integer('weekday').notNull(),
  opens: time('opens'),
  closes: time('closes'),
  isClosed: boolean('is_closed').notNull().default(false),
})

export const openingExceptions = pgTable('opening_exceptions', {
  id: uuid('id').defaultRandom().primaryKey(),
  locationId: uuid('location_id').references(() => locations.id, { onDelete: 'cascade' }),
  date: date('date').notNull(),
  opens: time('opens'),
  closes: time('closes'),
  isClosed: boolean('is_closed').notNull().default(false),
  label: text('label').notNull(),
})

export const announcements = pgTable('announcements', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  body: text('body').notNull(),
  published: boolean('published').notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const newsPosts = pgTable('news_posts', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  excerpt: text('excerpt').notNull(),
  body: text('body').notNull(),
  published: boolean('published').notNull().default(true),
  publishedAt: timestamp('published_at', { withTimezone: true }).defaultNow().notNull(),
})

export const services = pgTable('services', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  summary: text('summary').notNull(),
  body: text('body').notNull(),
  href: text('href'),
  sortOrder: integer('sort_order').notNull().default(0),
  published: boolean('published').notNull().default(true),
})

export const contactSubmissions = pgTable('contact_submissions', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull().default(''),
  subject: text('subject').notNull(),
  message: text('message').notNull(),
  handled: boolean('handled').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export type Location = typeof locations.$inferSelect
export type SiteContent = typeof siteContent.$inferSelect
export type OpeningHour = typeof openingHours.$inferSelect
export type OpeningException = typeof openingExceptions.$inferSelect
export type Announcement = typeof announcements.$inferSelect
export type NewsPost = typeof newsPosts.$inferSelect
export type Service = typeof services.$inferSelect
export type ContactSubmission = typeof contactSubmissions.$inferSelect
