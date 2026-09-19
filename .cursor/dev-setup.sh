#!/usr/bin/env bash
set -euo pipefail

# idempotent dev infra for the cloud agent: a local mysql 8 + a dev .env.
# safe to run repeatedly (install and every boot). ephemeral dev creds only.

DB_NAME=bongerd
DB_USER=bongerd
DB_PASS=bongerd_dev_pw

if ! command -v mysqld >/dev/null 2>&1; then
  sudo DEBIAN_FRONTEND=noninteractive apt-get update -y
  sudo DEBIAN_FRONTEND=noninteractive apt-get install -y mysql-server
fi

sudo service mysql start

# wait for the server socket before issuing statements
for _ in $(seq 1 30); do
  sudo mysqladmin ping >/dev/null 2>&1 && break
  sleep 1
done

# native_password so mysql2 can auth with a plain password over tcp
sudo mysql <<SQL
CREATE DATABASE IF NOT EXISTS ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '${DB_USER}'@'127.0.0.1' IDENTIFIED WITH mysql_native_password BY '${DB_PASS}';
CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED WITH mysql_native_password BY '${DB_PASS}';
GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'127.0.0.1';
GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';
FLUSH PRIVILEGES;
SQL

# repo checkout re-runs on every boot, so recreate the gitignored dev .env when missing
if [ ! -f .env ]; then
  cat > .env <<ENV
MYSQL_USER=${DB_USER}
MYSQL_PASSWORD=${DB_PASS}
MYSQL_DATABASE=${DB_NAME}
DATABASE_URL=mysql://${DB_USER}:${DB_PASS}@127.0.0.1:3306/${DB_NAME}
SESSION_SECRET=dev-session-secret-at-least-32-characters-long-000
COOKIE_SECURE=false
TRUST_PROXY=false
ADMIN_EMAIL=beheer@apotheekdebongerd.nl
ADMIN_PASSWORD=BongerdDevAdmin123
RESET_ADMIN_PASSWORD=false
SITE_URL=http://localhost:3000
UPLOAD_DIR=./data/uploads
ENV
fi
