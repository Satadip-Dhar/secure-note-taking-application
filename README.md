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
