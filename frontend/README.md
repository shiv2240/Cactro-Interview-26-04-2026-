# Frontend - ReleaseCheck UI

**🚀 Live Website**: [https://cactro-interview-26-04-2026.onrender.com](https://cactro-interview-26-04-2026.onrender.com)

This directory houses the React application responsible for the client interface. It has been strictly engineered to communicate optimally with sophisticated, string-driven logic layers via Vite compiling.

## Design Concept & Vanilla CSS

Crucially, **no external component libraries** (like Material UI or Bootstrap) and **no utility frameworks** (like TailwindCSS) were utilized. 

The aesthetic is entirely manually crafted via Vanilla CSS (`src/index.css`) utilizing CSS Variables (Custom properties) extending an elegant, crisp, light-mode palette. This guarantees maximum flexibility over the design syntax and proves raw competency with standard web layout schemas (flexbox & grids).

## Core React Features implemented

### 1. GraphQL Network Translation
While massive projects mandate `Apollo Client`, incorporating massive global state libraries for a single CRUD architecture is overkill. Instead, `src/api.js` explicitly defines exact parameterised GraphQL strings (`mutations/queries`) that are elegantly attached onto standardized `axios.post` payload bodies pointing toward `/graphql`. This guarantees that the SPA remains ultra-lightweight while unlocking complex GraphQL manipulation rules.

### 2. High-Performance Debouncing
Because the search-filter queries the backend rather than an already loaded local state object (to enforce pagination memory protections), we utilize `setTimeout` bindings layered behind a `useRef` to catch and debounce rapid keystrokes within the `ReleaseList` Search bar. This is a crucial UX standard saving hundreds of DOM renders.

### 3. The `AbortController` Integration
To prevent the client state from overwriting React with resolving data from asynchronous latency spikes, `AbortController` forces standard XHR/Fetch interruptions strictly resolving the most recent network intent while purging older inflight requests. 

## Getting Started

1. Set up the dependencies: `npm install`
2. Configure your Environment Variables: Check `.env.example`, copy it to `.env`, and ensure `VITE_API_URL` points toward your active backend.
3. Start the Vite Dev Environment: `npm run dev`

To build the optimized static asset package for deployment:
```bash
npm run build
```
Vite will output perfectly minified assets into your `/dist` folder. Simply point servers (like NGINX, Vercel, or AWS S3) to this directory and serve effortlessly!
