# Backend — ReleaseCheck API

**⚡ Live GraphQL Endpoint (Render)**: [https://cactro-interview-26-04-2026.onrender.com/graphql](https://cactro-interview-26-04-2026.onrender.com/graphql)

Node.js + Express backend serving a **GraphQL API** backed by **PostgreSQL** (`pg`). Implements MVC architecture, automated Jest testing, and Docker support.

---

## Directory Structure

```text
backend/
├── __tests__/
│   └── helpers.test.js       # Jest tests for status calculation logic
├── config/
│   └── db.js                 # PostgreSQL pool connection + auto-migration (CREATE TABLE IF NOT EXISTS)
├── controllers/
│   └── releaseController.js  # Legacy REST endpoint handlers (fallback)
├── graphql/
│   └── schema.js             # GraphQL schema + root resolvers (CRUD, filtering, sorting)
├── models/
│   └── Release.js            # PostgreSQL DAO — mirrors Mongoose API using native pg queries
├── routes/
│   └── releaseRoutes.js      # Mounts REST fallback routes at /api/releases
├── utils/
│   └── helpers.js            # calculateStatus() + getPredefinedChecklist() — Jest-tested
├── Dockerfile                # Alpine-based Docker build
├── .env.example              # Environment variable template
└── index.js                  # App entry point — wires up CORS, GraphQL, REST, DB connection
```

---

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
Copy `.env.example` to `.env` and fill in your PostgreSQL credentials:
```env
PORT=3000
DB_HOST=your_host
DB_PORT=5432
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=your_database
```
> Alternatively, you can provide a single `DATABASE_URL` connection string — the app handles both formats.

### 3. Run
```bash
npm run dev        # Development (hot-reload via --watch)
npm start          # Production
npm test           # Run Jest test suite
```

> **Note:** The database tables and indexes are created automatically at startup via `CREATE TABLE IF NOT EXISTS`. No manual migrations required.

---

## GraphQL API (`POST /graphql`)

### Queries

#### `releases(page, limit, search, status, date, sortDir)`
Returns a paginated list of releases with optional filtering and sorting.
- **Returns**: `ReleasesPayload { data: [Release], metadata: { totalPages } }`

#### `release(id)`
Returns a single release by ID, including all checklist steps.

### Mutations

#### `createRelease(name!, release_date!, additional_info)`
Creates a new release with the predefined 7-step checklist. Status auto-set to `planned`.

#### `updateRelease(id!, name, release_date, additional_info, status, steps)`
Updates a release. If `steps` are provided, `status` is recalculated automatically via `calculateStatus()`.

#### `deleteRelease(id!)`
Permanently deletes a release. Returns `Boolean`.

---

## Database Schema

PostgreSQL table `releases`, created automatically at startup:

| Column | Type | Notes |
|---|---|---|
| `id` | `SERIAL PRIMARY KEY` | Auto-increment integer |
| `name` | `VARCHAR(255) NOT NULL` | Indexed |
| `release_date` | `TIMESTAMP NOT NULL` | Indexed |
| `additional_info` | `TEXT` | Optional |
| `status` | `VARCHAR(50)` | `planned` / `ongoing` / `done`. Indexed |
| `steps` | `JSONB` | Array of `{ id, name, completed }` objects |

---

## Running Tests
```bash
npm test
```
The Jest suite in `__tests__/helpers.test.js` validates the `calculateStatus()` logic across all edge cases (no steps, none completed, some completed, all completed).
