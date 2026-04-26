# ReleaseCheck - Full-Stack Interview Project

**🚀 Live Frontend (Netlify)**: [https://cactro-releasecheck.netlify.app/](https://cactro-releasecheck.netlify.app/)
**⚡ Live Backend (Render)**: [https://cactro-interview-26-04-2026.onrender.com/graphql](https://cactro-interview-26-04-2026.onrender.com/graphql)
**💻 GitHub Repository**: [https://github.com/shiv2240/Cactro-Interview-26-04-2026-](https://github.com/shiv2240/Cactro-Interview-26-04-2026-)

A comprehensive, production-ready web application designed to help engineering teams track software releases using predefined checklist steps. Built natively as a Single Page Application (SPA), it focuses on high performance, clean architecture, and exceptional user experience.

Most importantly, this repository completely satisfies all **Must-Have** and **Nice-to-Have** assignment criteria (including GraphQL, Jest Automations, Docker encapsulation).

## System Architecture & Tech Stack

This project implements the modern **MERN** stack, transitioning into a modern GraphQL bridge structure.

- **Frontend**: React + Vite
  - _Routing_: React Router DOM (v6)
  - _Styling_: Pure Vanilla CSS, meticulously structured without heavy libraries.
  - _Network Layer_: Axios dispatching parsed `.graphql` query payloads perfectly integrating `AbortController` cancellation to prevent race conditions.
- **Backend**: Node.js + Express.js
  - _Architecture_: MVC (Model, View, Controller) logic supporting legacy REST parameters while prioritizing a new `express-graphql` endpoint wrapper.
  - _Database Structure_: MongoDB natively (Tested via Cloud Atlas scaling + Local container scaling).
  - _Continuous Integration_: Automated `Jest` testing algorithmic assertions securely over mathematical dependencies.

## Notable Engineering/Performance Features

1.  **GraphQL Abstraction**: The monolithic transition replaces thousands of legacy REST calls with surgical, precise GraphQL fetching resolving to `/graphql`.
2.  **Backend Pagination Limits**: Whether parsed by REST or GraphQL, MongoDB strictly leverages `.skip()` and `.limit()` rendering the client fully shielded from hydrating thousands of rows simultaneously.
3.  **Debounced Searching**: A custom 500ms debounce buffer sits over the search input preventing the GraphQL server from being bombarded while a user types rapidly.
4.  **Database Indexing**: Explicit `{ index: true }` markers were laid into the Mongoose schema for the `name`, `status`, and `release_date` fields ensuring logarithmic time complexity reads.

## Application Data Workflow

To understand how the technologies piece together in a production environment, here is the exact lifecycle of data tracing from the User Interface down to the Database:

### Example: Checking a Step off the List

1. **User Interaction**: The user clicks a checkbox next to "All tests are passing" on the `ReleaseEditor.jsx` component.
2. **Local State Shift**: React immediately fires an `onChange` handler, swapping the boolean state for that specific step and re-rendering the frontend.
3. **Dispatching to Network (`Axios` + `GraphQL`)**: When the user clicks `Save`, `frontend/src/api.js` captures the entire State object and dynamically constructs a **GraphQL Mutation String** (e.g., `mutation UpdateRelease($id: ID!, $steps: [StepInput])`). Axios intercepts this string and `POST`s it across the network to `/graphql`.
4. **Server Interception (`express-graphql`)**: The Express backend receives the payload on `index.js`. It detects the `/graphql` route and hands the Request over to the `express-graphql` pipeline middleware.
5. **Schema Resolution (`Node.js`)**: The GraphQL engine parses the AST payload and maps it to the `updateRelease` resolver function inside `backend/graphql/schema.js`.
6. **Algorithmic Computation (`Jest Tested`)**: Before saving, the resolver intercepts the incoming `steps` array and passes it into our `calculateStatus()` helper. The helper loops mathematically evaluating if the new checkmark means the release is `ongoing`, `planned`, or `done`.
7. **Persistence (`Mongoose` -> `MongoDB`)**: With an updated `status` string appended, the resolver invokes `Release.findByIdAndUpdate()`. Mongoose validates the schema structure, then executes the secure B-tree indexed write command to the **MongoDB Atlas Cluster**.
8. **Resolution**: The updated ID and Status return up the chain to the client, and React triggers a `useNavigate('/')` safely routing the user back to the list cleanly!

## Project Structure

```text
.
├── backend                   # Node.js/Express API & GraphQL Root (See backend/README.md)
├── frontend                  # React/Vite Client (See frontend/README.md)
├── docker-compose.yml        # Easy local deployment wrapper
├── Release-Checklist.postman_collection.json # API testing suite (REST and GraphQL)
└── README.md                 # This file
```

## Global Getting Started Guide

### 1. Configure Environments

You will need to set up environment variables for both the frontend and backend based on the provided example files.

**Backend (`/backend/.env`)**:
Copy `/backend/.env.example` to `/backend/.env`. Insert your MongoDB connection URI (Atlas or Local).

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
```

**Frontend (`/frontend/.env`)**:
Copy `/frontend/.env.example` to `/frontend/.env`. This points the React app to your backend.

```env
VITE_API_URL=http://localhost:3000
```

### 2. The 1-Click Environment Setup (Dockerized)

The easiest way to review this application is to spin up the Docker architecture natively:

```bash
docker-compose up --build
```

_This command parses the `/backend/Dockerfile` and maps your terminal port directly to the operational Node.js server seamlessly handling Mongo networking natively._

### 2. Manual Start Instructions

If you prefer traditional native hosting without containerization:
**Backend**:

```bash
cd backend
npm install
npm run dev
# Run algorithmic validations:
npm test
```

**Frontend**:

```bash
cd frontend
npm install
npm run dev
```

## Database Schema

The primary storage structure handled by the MongoDB cluster is the `Release` model:

- `name`: String (Required, Indexed) - The title of the release.
- `release_date`: Date (Required, Indexed) - Targeted deploy date.
- `additional_info`: String (Optional) - Notes or remarks.
- `status`: String (Default 'planned', Indexed) - Calculated field based on step completion (planned, ongoing, done).
- `steps`: Array - Handles the static 7 steps indicating individual boolean logic (`{ id: 1, name: "step", completed: false }`).

## API Logic (GraphQL Node)

The server predominantly operates off single-point endpoint interactions resolving against `POST /graphql`. Standard Legacy REST Endpoints (`GET /api/releases`) remain intact and functional inside `/routes` for fallback testing. Please refer to `backend/README.md` for extended GraphQL Schema definitions.
