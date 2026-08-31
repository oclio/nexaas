# API Endpoints

## GET /api/health

Health check for load balancers and monitoring tools. When authenticated, the endpoint actively pings each upstream service — it does not just report configuration status. Each service is queried with a short timeout, so a degraded response reflects real connectivity issues, not stale state.

### Authentication

Set `HEALTH_CHECK_SECRET` in your environment. When set, include it as a Bearer token:

```text
Authorization: Bearer <HEALTH_CHECK_SECRET>
```

Without authentication, the endpoint returns a simple `ok` without checking upstream services.

### Responses

#### Unauthenticated (or no secret configured)

```json
{
  "status": "ok"
}
```

`200 OK`

#### Authenticated — healthy

```json
{
  "status": "ok",
  "timestamp": "2026-08-29T20:00:00.000Z",
  "services": {
    "security": {
      "status": "healthy"
    },
    "logs": {
      "status": "healthy"
    },
    "errorsCapture": {
      "status": "healthy"
    },
    "database": {
      "status": "healthy"
    }
  }
}
```

`200 OK` · `Cache-Control: no-store, max-age=0`

#### Authenticated — degraded

```json
{
  "status": "degraded",
  "timestamp": "2026-08-29T20:00:00.000Z",
  "services": {
    "security": {
      "status": "healthy"
    },
    "logs": {
      "status": "unhealthy",
      "error": "connection refused"
    },
    "errorsCapture": {
      "status": "disabled"
    },
    "database": {
      "status": "healthy"
    }
  }
}
```

`503 Service Unavailable` · `Cache-Control: no-store, max-age=0`

### Services

| Key             | Service    | Env vars                       |
| --------------- | ---------- | ------------------------------ |
| `security`      | Arcjet     | `ARCJET_KEY`                   |
| `logs`          | Axiom      | `AXIOM_TOKEN`, `AXIOM_DATASET` |
| `errorsCapture` | Sentry     | `NEXT_PUBLIC_SENTRY_DSN`       |
| `database`      | PostgreSQL | `DATABASE_URL`                 |

### Service statuses

| Status      | Meaning                                                |
| ----------- | ------------------------------------------------------ |
| `healthy`   | Service responded successfully                         |
| `unhealthy` | Service failed or timed out                            |
| `disabled`  | Service is not configured (e.g. `AXIOM_TOKEN` not set) |

> **Note:** The `database` service is always required and never returns `disabled`.

---

## POST /api/web-vitals

Receives Core Web Vitals from the client-side `WebVitals` component.

### Behavior

- **Production**: Ingests the metric into Axiom with the correlated `traceId`
- **Non-production**: Returns `{ "status": "ignored" }` without ingesting

### Request body

```json
{
  "name": "CLS",
  "value": 0.1,
  "id": "v3-abc123",
  "traceId": "uuid-from-cookie"
}
```

### Responses

| Scenario             | Status | Body                                         |
| -------------------- | ------ | -------------------------------------------- |
| Non-production       | `200`  | `{ "status": "ignored" }`                    |
| Axiom not configured | `200`  | `{ "status": "ignored" }`                    |
| Success              | `200`  | `{ "status": "ok" }`                         |
| Error                | `500`  | `{ "status": "error", "error": "Message." }` |
