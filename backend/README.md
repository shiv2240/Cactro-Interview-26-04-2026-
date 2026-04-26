# Backend - ReleaseCheck System Architecture

This directory defines the core API mechanisms. Originally structured as pure MVC REST pathways, it has been massively upgraded into a dual-mode `express-graphql` node providing extreme payload flexibility to the attached React clients.

## Structure

```text
backend/
├── __tests__/                
│   └── helpers.test.js       # Algorithmic regressions parsed through Jest
├── config/
│   └── db.js                 # Bootstraps the MongoDB/Mongoose connection pool.
├── controllers/
│   └── releaseController.js  # Original REST fallback hooks.
├── graphql/
│   └── schema.js             # Core implementation defining exact GraphQL Mutations & Queries
├── models/
│   └── Release.js            # MongoDB Collection Schema tightly indexed for speed.
├── routes/
│   └── releaseRoutes.js      # Mounts the legacy REST fallbacks.
├── utils/
│   └── helpers.js            # Extracted functions for status calculations. Protected by Jest.
├── Dockerfile                # Defines the Alpine linux runtime build instructions.
├── .env                      # Environment config 
├── index.js                  # Entry point, mounts CORS, JSON parsers, and App Routes.
```

## Setup & Testing Executions

1. Resolve packages: `npm install`
2. **Environment**: Copy `.env.example` to `.env` and fill in your `MONGO_URI`.
3. **Execute Automated Tests**: Run `npm test` to trigger the `jest` automated validation loops that systematically pound `utils/helpers.js` checking that edge-case checklist completions render mathematically accurate `status` calculations.
4. Start natively: `npm run dev`

## API Design (GraphQL Base)

The API resolves strictly against `POST /graphql` executing structured schema requests.

### Queries

#### `Query.releases(page, limit, search, status, date)`
Executes parallel B-tree indexed Mongoose lookups validating Regex `search` statements mapping to paginated yields natively.
**Returns**: `ReleasesPayload` ({ data, metadata: { totalPages } })

#### `Query.release(id)`
Executes instant lookup based upon validated Mongoose `_id` strings.

### Mutations

#### `Mutation.createRelease(name, release_date, additional_info)`
Automatically parses the `utils/helpers.js` static 7-point checklist into an array format internally mapping `status = planned`. Returns the native `Release` schema ID.

#### `Mutation.updateRelease(id, name, release_date, additional_info, status, steps)`
Intercepts and updates arrays natively. Extremely intelligent computation wrapper recalculates the exact `status` value dynamically ensuring client manipulation cannot artificially generate a false 'Done' parameter maliciously.

#### `Mutation.deleteRelease(id)`
Drops the release safely from cluster records.
