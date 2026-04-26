# Frontend — ReleaseCheck UI

**🚀 Live App (Netlify)**: [https://cactro-releasecheck.netlify.app/](https://cactro-releasecheck.netlify.app/)

React 18 + Vite Single Page Application for managing software release checklists. Communicates with the backend exclusively via GraphQL over `axios`.

---

## Directory Structure

```text
frontend/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── ReleaseList.jsx     # Main list: search, filter by status/date, sort, paginate
│   │   └── ReleaseEditor.jsx   # Create/edit form with inline validation
│   ├── api.js                  # All GraphQL queries & mutations via Axios
│   ├── App.jsx                 # React Router v6 setup
│   ├── index.css               # Global Vanilla CSS design system (no frameworks)
│   └── main.jsx                # Vite entry point
├── .env.example                # Environment variable template
├── vite.config.js
└── package.json
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
VITE_API_URL=http://localhost:3000
```
> Point this at your running backend (local or Render).

### 3. Run
```bash
npm run dev      # Vite dev server with HMR
npm run build    # Production build → /dist
```

---

## Key Implementation Details

### GraphQL via Axios (`src/api.js`)
No Apollo Client. All GraphQL calls are plain:
```js
axios.post('/graphql', { query: `...`, variables: { ... } })
```
This keeps the bundle lightweight while fully leveraging GraphQL mutations and queries.

### Debounced Search
The search input uses a 500ms `setTimeout` debounce via `useRef` — prevents flooding the backend on rapid keystrokes.

### AbortController
Every fetch uses an `AbortController`. When a new request fires before the previous one resolves, the old one is cancelled — no stale data overwrites.

### Form Validation (`ReleaseEditor.jsx`)
- Required fields marked with `*`
- Inline error messages shown below each field (no `alert()` popups)
- Submit blocked until all required fields pass validation

### Bulletproof Date Parsing (`ReleaseList.jsx`)
Handles both ISO 8601 strings and UNIX epoch timestamps from the backend:
```js
const ts = !isNaN(release.release_date) ? Number(release.release_date) : release.release_date;
const dateObj = new Date(ts);
```
Prevents "Invalid Date" rendering regardless of backend format.

### Date Sort
Up/down arrow buttons on the Date column toggle `sortDir` (`asc`/`desc`), passed as a GraphQL variable — sorting is done in PostgreSQL via `ORDER BY release_date ASC/DESC`.
