# Frontend — ReleaseCheck UI

**🚀 Live App (Netlify)**: [https://cactro-releasecheck.netlify.app/](https://cactro-releasecheck.netlify.app/)

React + Vite Single Page Application for managing software release checklists. Communicates with the backend exclusively via GraphQL.

---

## Directory Structure

```text
frontend/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── ReleaseList.jsx   # Main list view: search, filter, sort, paginate
│   │   └── ReleaseEditor.jsx # Create / edit release form with validation
│   ├── api.js                # All GraphQL queries & mutations via Axios
│   ├── App.jsx               # Router setup (React Router v6)
│   ├── index.css             # Global Vanilla CSS design system
│   └── main.jsx              # Vite entry point
├── .env.example              # Environment variable template
└── vite.config.js
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
> Point this at your backend URL (local or deployed on Render).

### 3. Run
```bash
npm run dev      # Development server
npm run build    # Production build → /dist
```

---

## Key Implementation Details

### GraphQL via Axios (`src/api.js`)
No Apollo Client — all GraphQL calls are plain `axios.post('/graphql', { query, variables })` calls. This keeps the bundle lightweight while still using the full power of GraphQL.

### Debounced Search
The search input uses a 500ms `setTimeout` debounce via `useRef` to avoid hammering the backend on every keystroke.

### AbortController
Each fetch call uses an `AbortController` to cancel in-flight requests when a new one is triggered, preventing stale data from overwriting current state.

### Form Validation
`ReleaseEditor.jsx` has inline validation — required fields are marked with `*` and clear error messages are shown inline without browser `alert()` popups.

### Bulletproof Date Parsing
Dates from the backend are handled with a safe parser that handles both ISO strings and UNIX epoch timestamps, preventing "Invalid Date" rendering.
