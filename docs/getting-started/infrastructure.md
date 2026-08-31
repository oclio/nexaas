# Infrastructure

nexaas ships with a PostgreSQL database (with [pgvector](https://github.com/pgvector/pgvector)) running in Docker, managed by [Drizzle ORM](https://orm.drizzle.team). Everything is configured for zero-friction local development.

## PostgreSQL with pgvector

A `docker-compose.yml` file at the project root spins up a PostgreSQL 16 container with the pgvector extension pre-installed.

### Start the database

```bash
docker compose up -d
```

The database is available on port `5455` (mapped to avoid conflicts with local PostgreSQL installations).

### Configuration

| Setting         | Value                                |
| --------------- | ------------------------------------ |
| Image           | `pgvector/pgvector:pg16`             |
| Container       | `nexaas-postgres`                    |
| Port            | `5455` → `5432`                      |
| User / Password | `postgres` / `postgres`              |
| Database        | `db` (created by `init-postgres.sh`) |
| Volume          | `nexaas-postgres-data` (persistent)  |

The `docker/init-postgres.sh` script runs on first startup and:

1. Creates the `db` database
2. Enables the `vector` extension

### Stop the database

```bash
docker compose down
```

To wipe all data and start fresh:

```bash
docker compose down -v
```

::: warning
`docker compose down -v` deletes the persistent volume. All data will be lost.
:::

## Environment variables

Add these to your `.env` file:

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5455/db
DATABASE_POOL_MAX=10
DATABASE_IDLE_TIMEOUT=30
DATABASE_CONNECT_TIMEOUT=10
```

| Variable                   | Required | Default | Description                                |
| -------------------------- | -------- | ------- | ------------------------------------------ |
| `DATABASE_URL`             | Yes      | —       | PostgreSQL connection string               |
| `DATABASE_POOL_MAX`        | No       | `10`    | Maximum number of connections in the pool  |
| `DATABASE_IDLE_TIMEOUT`    | No       | `30`    | Seconds before idle connections are closed |
| `DATABASE_CONNECT_TIMEOUT` | No       | `10`    | Seconds to wait for a connection           |

### Production

For production, use a managed PostgreSQL provider ([Neon](https://neon.tech), [Supabase](https://supabase.com), [AWS RDS](https://aws.amazon.com/rds/)) instead of Docker. Update `DATABASE_URL` with your provider's connection string.

::: tip
If using a serverless provider with a connection pooler (e.g. Neon's PgBouncer), set `prepare: false` on the postgres client in `src/core/db/index.ts`.
:::

## Drizzle ORM scripts

| Script             | Description                                      |
| ------------------ | ------------------------------------------------ |
| `pnpm db:generate` | Generate SQL migration files from schema changes |
| `pnpm db:migrate`  | Apply pending migrations to the database         |
| `pnpm db:studio`   | Open Drizzle Studio (database GUI) at port 4979  |

### Workflow

```bash
# 1. Start the database
docker compose up -d

# 2. Edit a schema in src/**/db-schemas/*.ts

# 3. Generate a migration
pnpm db:generate

# 4. Apply the migration
pnpm db:migrate

# 5. Inspect with Drizzle Studio
pnpm db:studio
```

### Configuration

Drizzle Kit is configured in `drizzle.config.ts`:

- **Schema glob**: `./src/**/db-schemas/*.ts`
- **Migrations output**: `./drizzle/`
- **Dialect**: `postgresql`

Migrations are tracked in `drizzle/meta/` and should be committed to the repository.
