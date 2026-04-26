# Backend — ReleaseCheck API

**⚡ Live GraphQL Endpoint (Render)**: [https://cactro-interview-26-04-2026.onrender.com/graphql](https://cactro-interview-26-04-2026.onrender.com/graphql)

Node.js + Express backend serving a **GraphQL API** backed by **PostgreSQL** (`pg` — raw SQL, no ORM). Implements MVC architecture, automated Jest testing, and Docker support.

---

## Directory Structure

```text
backend/
├── __tests__/
│   └── helpers.test.js         # Jest tests for calculateStatus() logic
├── config/
│   └── db.js                   # pg.Pool connection + auto CREATE TABLE + steps backfill
├── controllers/
│   └── releaseController.js    # Legacy REST handlers using raw pg queries
├── graphql/
│   └── schema.js               # GraphQL schema + resolvers — raw pg queries, no ORM
├── routes/
│   └── releaseRoutes.js        # Mounts REST fallback at /api/releases
├── utils/
│   └── helpers.js              # calculateStatus() + getPredefinedChecklist() — Jest-tested
├── Dockerfile                  # Alpine Node.js Docker build
├── .env.example                # Environment variable template
└── index.js                    # App entry — CORS, GraphQL handler, REST routes, DB connect
```

---

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
Copy `.env.example` to `.env`:
```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=your_database

# Or use a single connection string:
# DATABASE_URL=postgresql://user:password@host:5432/dbname?sslmode=require
```

### 3. Run
```bash
npm run dev     # Development with hot-reload (node --watch)
npm start       # Production
npm test        # Jest test suite
```

> **No manual migrations needed** — the app runs `CREATE TABLE IF NOT EXISTS releases (...)` and `CREATE INDEX IF NOT EXISTS` on every startup. Existing rows with empty `steps` are automatically backfilled with the 7-step checklist.

---

## GraphQL API (`POST /graphql`)

### Queries

#### `releases(page, limit, search, status, date, sortDir)`
Paginated list with optional filters. All filtering done with parameterized SQL (`ILIKE`, `=`, `BETWEEN`).
- **Returns**: `ReleasesPayload { data: [Release], metadata: { total, page, totalPages, limit } }`

#### `release(id)`
Single release by ID, including all checklist steps.

### Mutations

#### `createRelease(name!, release_date!, additional_info)`
Creates a new release. Steps auto-populated from `getPredefinedChecklist()`. Status set to `planned`.

#### `updateRelease(id!, name, release_date, additional_info, steps)`
Updates fields. If `steps` are provided, `status` is recalculated by `calculateStatus()`.

#### `deleteRelease(id!)`
Deletes a release. Returns `Boolean`.

---

## Database Schema (`releases` table)

Auto-created at startup via `CREATE TABLE IF NOT EXISTS`:

| Column | Type | Notes |
|---|---|---|
| `id` | `SERIAL PRIMARY KEY` | Auto-increment |
| `name` | `VARCHAR(255) NOT NULL` | Indexed |
| `release_date` | `TIMESTAMP NOT NULL` | Indexed |
| `additional_info` | `TEXT` | Optional |
| `status` | `VARCHAR(50) DEFAULT 'planned'` | `planned` / `ongoing` / `done`. Indexed |
| `steps` | `JSONB DEFAULT '[]'` | Array of `{ id, name, completed }` objects |

---

## Jest Tests
```bash
npm test
```
Tests in `__tests__/helpers.test.js` cover all edge cases for `calculateStatus()`:
- No steps → `planned`
- Steps exist, none completed → `planned`
- Some completed → `ongoing`
- All completed → `done`

---

## Docker

This service is included in the root `docker-compose.yml` which also spins up a PostgreSQL container:
```bash
# From the project root:
docker-compose up --build
```
