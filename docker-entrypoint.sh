#!/bin/sh
set -e

echo "waiting for database..."
i=0
until node --input-type=module -e "import postgres from 'postgres'; const s=postgres(process.env.DATABASE_URL,{max:1,connect_timeout:3}); await s\`select 1\`; await s.end();" ; do
  i=$((i+1))
  if [ "$i" -gt 40 ]; then
    echo "database not reachable"
    exit 1
  fi
  sleep 1
done

echo "applying schema..."
./node_modules/.bin/drizzle-kit push --force

echo "seeding..."
./node_modules/.bin/tsx src/lib/seed.ts

echo "starting web..."
exec node .output/server/index.mjs
