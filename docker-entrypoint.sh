#!/bin/sh
set -e

UPLOAD_DIR="${UPLOAD_DIR:-./data/uploads}"
mkdir -p "$UPLOAD_DIR"
chown -R app:app "$UPLOAD_DIR"

echo "waiting for database..."
i=0
until su-exec app node --input-type=module -e "import mysql from 'mysql2/promise'; const c=await mysql.createConnection(process.env.DATABASE_URL); await c.query('select 1'); await c.end();" ; do
  i=$((i+1))
  if [ "$i" -gt 40 ]; then
    echo "database not reachable"
    exit 1
  fi
  sleep 1
done

echo "applying schema..."
# drizzle-kit push stays in the image for boot-time migrate; prefer not shipping forever if you move migrations out
su-exec app ./node_modules/.bin/drizzle-kit push --force

echo "seeding..."
su-exec app ./node_modules/.bin/tsx src/lib/seed.ts

# drop boot-only secrets before the long-lived server
unset ADMIN_PASSWORD
unset RESET_ADMIN_PASSWORD

echo "starting web..."
exec su-exec app node .output/server/index.mjs
