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
| **Database** | PostgreSQL (`pg` driver — raw SQL, no ORM) |
| **Testing** | Jest (unit tests for status calculation logic) |
| **Deployment** | Netlify (frontend) + Render (backend) |
| **Container** | Docker + docker-compose (Postgres + Backend) |

---

## Project Structure

```text
.
├── backend/                  # Node.js/Express GraphQL API (see backend/README.md)
├── frontend/                 # React/Vite SPA (see frontend/README.md)
├── docker-compose.yml        # Spins up PostgreSQL + backend together
├── Release-Checklist.postman_collection.json
└── README.md
```

---

## Getting Started

### Option A — Docker (recommended, includes Postgres)

```bash
docker-compose up --build
```

This spins up:
- A **PostgreSQL 16** container with a named volume for persistence
- The **backend** Node.js API connected to it

The API will be available at `http://localhost:3000/graphql`.

> You can override credentials via environment variables or a `.env` file in the project root:
> ```env
> DB_USER=shiv
> DB_PASSWORD=StrongPassword123!
> DB_NAME=shiv_db
> ```

### Option B — Manual

**Backend:**
```bash
cd backend
npm install
cp .env.example .env   # Fill in your PostgreSQL credentials
npm run dev            # Start with hot-reload
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

# Connection String (Recommended)
DATABASE_URL=postgresql://user:password@host:5432/dbname?sslmode=require

# OR Individual Params
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=your_database
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:3000
```

---

## Database Schema

The `releases` table is created automatically at backend startup — no manual migrations needed:

| Column | Type | Description |
|---|---|---|
| `id` | `SERIAL PRIMARY KEY` | Auto-increment integer ID |
| `name` | `VARCHAR(255) NOT NULL` | Release name (indexed) |
| `release_date` | `TIMESTAMP NOT NULL` | Target release date (indexed) |
| `additional_info` | `TEXT` | Optional notes |
| `status` | `VARCHAR(50)` | `planned` / `ongoing` / `done` — auto-calculated (indexed) |
| `steps` | `JSONB` | 7-item checklist array `{ id, name, completed }` |

> Rows with empty `steps` are automatically backfilled with the predefined checklist on every server startup.

---

## GraphQL API

All requests go to `POST /graphql`.

### Queries
- `releases(page, limit, search, status, date, sortDir)` — paginated, filtered, sorted list
- `release(id)` — single release with full checklist steps

### Mutations
- `createRelease(name!, release_date!, additional_info)` — creates with default 7-step checklist
- `updateRelease(id!, name, release_date, additional_info, steps)` — updates; auto-recalculates `status`
- `deleteRelease(id!)` — permanently removes a release

---

## Notable Engineering Decisions

1. **Raw SQL, no ORM**: `graphql/schema.js` and `controllers/releaseController.js` use parameterized `pg` queries directly — no Mongoose, no Sequelize.
2. **Auto-schema migration**: Backend runs `CREATE TABLE IF NOT EXISTS` on startup — zero config for reviewers.
3. **JSONB for steps**: Stores the checklist array in a single column — no join table required.
4. **GraphQL without Apollo Client**: Frontend uses plain `axios.post` with templated query strings — no heavy client library.
5. **Debounced search + AbortController**: Prevents API flooding and race conditions on the frontend.
