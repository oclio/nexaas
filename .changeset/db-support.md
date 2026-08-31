---
'nexaas': minor
---

Add PostgreSQL with pgvector, Drizzle ORM, Docker Compose, and database health check

- PostgreSQL 16 with pgvector via Docker Compose (port 5455, healthcheck, persistent volume)
- Drizzle ORM client with postgres-js driver and connection pooling
- Auth schemas (users, sessions, accounts, verifications) with initial migration
- Database health check integrated into /api/health endpoint
- db:generate, db:migrate, db:studio scripts
- Documentation: infrastructure and database pages
