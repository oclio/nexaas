#!/bin/bash
set -e

# Create application database
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Application database (Drizzle)
    CREATE DATABASE db;
    GRANT ALL PRIVILEGES ON DATABASE db TO postgres;

    -- Enable Vector extension
    \c db
    CREATE EXTENSION IF NOT EXISTS vector;
EOSQL

echo "✅ Database created: db"
