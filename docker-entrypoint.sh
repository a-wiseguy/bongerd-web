#!/bin/sh
set -e

echo "waiting for database..."
i=0
until node --input-type=module -e "import mysql from 'mysql2/promise'; const c=await mysql.createConnection(process.env.DATABASE_URL); await c.query('select 1'); await c.end();" ; do
  i=$((i+1))
  if [ "$i" -gt 40 ]; then
    echo "database not reachable"
    exit 1
  fi
  sleep 1
done

echo "applying schema..."
./node_modules/.bin/drizzle-kit push --force

mkdir -p "${UPLOAD_DIR:-./data/uploads}"

echo "seeding..."
./node_modules/.bin/tsx src/lib/seed.ts

echo "starting web..."
exec node .output/server/index.mjs
