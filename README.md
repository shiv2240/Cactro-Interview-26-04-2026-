# ReleaseCheck — Full-Stack Release Checklist Tool

**🚀 Live Frontend (Netlify)**: [https://cactro-releasecheck.netlify.app/](https://cactro-releasecheck.netlify.app/)
**⚡ Live Backend (Render)**: [https://cactro-interview-26-04-2026.onrender.com/graphql](https://cactro-interview-26-04-2026.onrender.com/graphql)
**💻 GitHub Repository**: [https://github.com/shiv2240/Cactro-Interview-26-04-2026-](https://github.com/shiv2240/Cactro-Interview-26-04-2026-)

A production-ready web application for engineering teams to manage software releases using a predefined 7-step checklist. Built as a decoupled SPA with a GraphQL API backed by PostgreSQL.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18 + Vite, React Router v6, Vanilla CSS, Axios |
| **Backend** | Node.js, Express.js, graphql-http |
| **API** | GraphQL (schema-first, with REST fallback) |
| **Database** | PostgreSQL (`pg` driver, hosted online) |
| **Testing** | Jest (unit tests for status calculation logic) |
| **Deployment** | Netlify (frontend) + Render (backend) |
| **Container** | Docker + docker-compose |

---

## Project Structure

```text
.
├── backend/                  # Node.js/Express GraphQL API (see backend/README.md)
├── frontend/                 # React/Vite SPA (see frontend/README.md)
├── docker-compose.yml        # Local one-command startup
├── Release-Checklist.postman_collection.json
└── README.md
```

---

## Getting Started

### Option A — Docker (recommended)
```bash
docker-compose up --build
```

### Option B — Manual

**Backend:**
```bash
cd backend
npm install
cp .env.example .env   # Fill in your PostgreSQL credentials
npm run dev
npm test               # Run Jest test suite
```

**Frontend:**
```bash
cd frontend
npm install
cp .env.example .env   # Set VITE_API_URL=http://localhost:3000
npm run dev
```

---

## Environment Variables

### Backend (`backend/.env`)
```env
PORT=3000
DB_HOST=your_postgres_host
DB_PORT=5432
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=your_database
# Or alternatively:
# DATABASE_URL=postgresql://user:password@host:5432/dbname
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:3000
```

---

## Database Schema

The `releases` table is auto-created at backend startup (no manual migrations needed):

| Column | Type | Description |
|---|---|---|
| `id` | `SERIAL PRIMARY KEY` | Auto-increment ID |
| `name` | `VARCHAR(255) NOT NULL` | Release name |
| `release_date` | `TIMESTAMP NOT NULL` | Target release date |
| `additional_info` | `TEXT` | Optional notes |
| `status` | `VARCHAR(50)` | Auto-calculated: `planned` / `ongoing` / `done` |
| `steps` | `JSONB` | 7-item checklist array `{ id, name, completed }` |

---

## GraphQL API

All requests go to `POST /graphql`.

### Queries
- `releases(page, limit, search, status, date, sortDir)` — paginated, filtered, sorted list
- `release(id)` — single release with full checklist steps

### Mutations
- `createRelease(name!, release_date!, additional_info)` — creates with default 7-step checklist
- `updateRelease(id!, ...)` — updates fields; auto-recalculates `status` from steps
- `deleteRelease(id!)` — permanently removes a release

---

## Notable Engineering Decisions

1. **GraphQL without Apollo**: The frontend uses plain `axios.post` with templated GraphQL strings — no heavy client library needed for a single-domain CRUD app.
2. **PostgreSQL DAO Pattern**: `models/Release.js` is a transparent Data Access Object that mirrors the Mongoose API surface (`find`, `findById`, `findByIdAndUpdate`, etc.) but executes parameterized `pg` SQL under the hood — making the migration from MongoDB seamless.
3. **Auto-schema migration**: The backend runs `CREATE TABLE IF NOT EXISTS` on startup, so no separate migration tooling is required.
4. **JSONB for checklist steps**: Storing the steps array as `JSONB` in Postgres avoids a join table while keeping full query flexibility.
5. **Debounced search + AbortController**: Prevents API flooding and race conditions on the frontend.
