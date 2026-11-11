# Secure Note-Taking Application

A secure, role-based REST API and frontend platform featuring JWT authentication, role-based access control (RBAC), optimized MongoDB indexing, and aggregation pipelines.

---

## Live Deployments

- **Live Frontend (Vercel):** [https://secure-note-taking-application-indol.vercel.app](https://secure-note-taking-application-indol.vercel.app/)
- **Live Backend API (Render):** [https://secure-notes-api-gs3h.onrender.com/api](https://secure-notes-api-gs3h.onrender.com/api)
- **API Health Check:** [https://secure-notes-api-gs3h.onrender.com/api/health](https://secure-notes-api-gs3h.onrender.com/api/health)

---

## Architecture Overview

The system is organized into three decoupled services:

```
secure-note-taking-application/
├── docker-compose.yml            # Orchestrates all three services
├── database/                     # Isolated MongoDB service & initialization
│   ├── Dockerfile
│   └── init/01-init.js
├── backend/                      # Node.js + Express REST API
│   ├── Dockerfile
│   ├── server.js
│   ├── config/db.js
│   ├── models/                   # Mongoose schemas with schema.index()
│   ├── middleware/               # JWT auth & RBAC
│   ├── controllers/
│   ├── routes/
│   └── utils/                    # Pagination & Seeder
└── frontend/                     # React 18 + Vite SPA
    ├── Dockerfile
    ├── src/
    │   ├── api/                  # Axios with JWT interceptors
    │   ├── context/              # Authentication context
    │   ├── pages/                # Notes, Posts, Admin, Aggregations, Auth
    │   └── components/
    └── package.json
```

---

## Roles & Access Control

| Role | Permissions |
|---|---|
| **User** | Create, view, update, delete own notes; publish & read community posts; run aggregations. |
| **Admin** | Inherits all User capabilities; view everyone's notes; manage users (create, list, update, delete). |

---

## Database Indexing Strategy

In accordance with strict indexing efficiency requirements, only indexes that directly back query filters, sorting, and aggregations are created using `schema.index()`:

### Defined Indexes

1. **`User` Collection**:
   - `userSchema.index({ email: 1 }, { unique: true })`
     - **Purpose:** Fast $O(1)$ equality lookup on user login (`findOne({ email })`) and database-enforced email uniqueness.
   - `userSchema.index({ interests: 1 })`
     - **Purpose:** Multikey index backing the initial `$match` stage of the "Group by Interests" aggregation pipeline (`$unwind` + `$group`).

2. **`Note` Collection**:
   - `noteSchema.index({ userId: 1, createdAt: -1 })`
     - **Purpose:** Compound index backing user notes listing (`Note.find({ userId }).sort({ createdAt: -1 })`). Conforms to the ESR (Equality, Sort, Range) rule by putting the equality filter first and sort order second in a single index scan.

3. **`Post` Collection**:
   - `postSchema.index({ userId: 1, createdAt: -1 })`
     - **Purpose:** Backs `$lookup` joins where `foreignField` is `userId`, as well as sorted retrieval of posts by author.

### Intentionally Omitted Indexes

- **No explicit `_id` indexes:** MongoDB automatically creates unique indexes on `_id`. Single-item GET endpoints (`/api/notes/:id`, `/api/users/:id`, `/api/posts/:id`) leverage this native index without extra memory overhead.
- **No index on `role`:** Authorization is verified statelessly from the signed JWT payload rather than querying the database per request.
- **Unfiltered list sorting:** Admin user listing (`/api/users`) and public post listing (`/api/posts`) sort on `{ _id: -1 }` (which embeds creation timestamp and uses the free default index).

---

## Aggregation Pipelines

### Scenario 1: Group Users by Interests
- **Endpoint:** `GET /api/aggregations/users-by-interests`
- **Method:** Exactly one `User.aggregate()` call.
- **Pipeline:**
  1. `$match`: Filters documents having non-empty `interests` (uses multikey index).
  2. `$unwind`: Deconstructs the `interests` array.
  3. `$group`: Groups by interest name, computes count, and collects user references.
  4. `$sort`: Orders by group popularity descending.
  5. `$project`: Formats output fields cleanly.

### Scenario 2: User Posts ($lookup)
- **Endpoint:** `GET /api/aggregations/users/:userId/posts`
- **Method:** Single aggregation pipeline on `User` with `$lookup`.
- **Pipeline:**
  1. `$match`: Selects target user by `_id`.
  2. `$lookup`: Joins `posts` collection on `userId`, sorted by `createdAt: -1`.
  3. `$project`: Includes user details, joined post array, and total post count.

---

## Getting Started

### Prerequisites
- [Docker](https://www.docker.com/) & Docker Compose
- Or [Node.js](https://nodejs.org/) v18+ & MongoDB v6+

### 1. Run with Docker Compose (Recommended)

Start all three services (database, backend, frontend):

```bash
docker compose up --build
```

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5050/api
- **Database:** `mongodb://localhost:27017/notes_app`

To seed initial users and sample data inside the container:

```bash
docker compose exec backend npm run seed
```

### 2. Run Locally Without Docker

**Start Database:**
Ensure MongoDB is running locally on port 27017.

**Start Backend:**
```bash
cd backend
npm install
npm run seed       # Seeds sample admin and users
npm run dev        # Starts server on port 5050
```

**Start Frontend:**
```bash
cd frontend
npm install
npm run dev        # Starts Vite on port 5173
```

---

## Seed Accounts

| Email | Password | Role | Interests |
|---|---|---|---|
| `admin@example.com` | `password123` | `admin` | chess, reading, travel |
| `alice@example.com` | `password123` | `user` | chess, coding, music |
| `bob@example.com` | `password123` | `user` | reading, hiking, gaming |
| `charlie@example.com` | `password123` | `user` | coding, chess |

---

## REST API Reference

### Authentication
- `POST /api/auth/register` — Register a new account (`name`, `email`, `password`, `role`, `interests`)
- `POST /api/auth/login` — Authenticate and receive JWT token
- `GET /api/auth/me` — Retrieve authenticated user profile

### Notes (`Bearer <token>`)
- `GET /api/notes?page=1&limit=10` — List notes (User gets own notes; Admin gets all notes)
- `GET /api/notes/:id` — Retrieve a specific note
- `POST /api/notes` — Create a note (`title`, `content`)
- `PUT /api/notes/:id` — Update a note
- `DELETE /api/notes/:id` — Delete a note

### Users (Admin Only, `Bearer <token>`)
- `GET /api/users?page=1&limit=10` — List users with pagination
- `GET /api/users/:id` — Fetch user details
- `POST /api/users` — Create user
- `PUT /api/users/:id` — Update user
- `DELETE /api/users/:id` — Remove user and associated data

### Posts (`Bearer <token>`)
- `GET /api/posts?page=1&limit=10` — List all community posts
- `GET /api/posts/:id` — Retrieve a single post
- `POST /api/posts` — Create a new post
- `PUT /api/posts/:id` — Update a post (owner/admin)
- `DELETE /api/posts/:id` — Delete a post (owner/admin)

### Aggregations (`Bearer <token>`)
- `GET /api/aggregations/users-by-interests` — Aggregation 1: Group users by interests
- `GET /api/aggregations/users/:userId/posts` — Aggregation 2: Retrieve user's posts via `$lookup`
- `GET /api/aggregations/my-posts` — Aggregation 2 for the current user
