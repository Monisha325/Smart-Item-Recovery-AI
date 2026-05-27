# Smart Campus Lost & Found System

## Overview

CampusFind is an AI-powered lost-and-found platform for university campuses. Students post lost or found items, and the system automatically matches them using semantic embeddings, image labels, geolocation, and category similarity. Owners can attach QR tags to valuables so finders can scan and report them instantly.

---

## Features

- **AI matching** — semantic text embeddings (sentence-transformers) + image labels (ResNet50) score every lost/found pair on creation
- **QR recovery tags** — generate a unique QR code per item; scanners see owner info and a one-tap "I found this" flow
- **Real-time notifications** — polling-based unread badge; notified on new matches, QR scans, and claim events
- **Role-based access** — student / admin; admin dashboard with stats, user management (ban/unban), item moderation
- **Email verification + password reset** — full auth lifecycle via Nodemailer
- **Cloudinary image uploads** — up to 5 images per item, AI-labelled on upload
- **Responsive UI** — mobile-first with Tailwind CSS, skeleton loading states, confirm dialogs
- **Production-ready** — sanitisation (mongo-sanitize + xss-clean), rate limiting, compression, trust-proxy, code splitting

---

## Tech Stack

| Layer         | Technology                                        |
|---------------|---------------------------------------------------|
| Frontend      | React 18, Vite, Tailwind CSS, React Router v6     |
| State / data  | Zustand (auth + notifications), TanStack Query v5 |
| Forms         | React Hook Form + Zod                             |
| Maps          | Leaflet + OpenStreetMap (react-leaflet)           |
| Charts        | Recharts                                          |
| QR codes      | qrcode.react                                      |
| Backend       | Node.js 18, Express, Mongoose                     |
| Database      | MongoDB (Atlas in production)                     |
| Auth          | JWT (jsonwebtoken), bcryptjs                      |
| File storage  | Cloudinary                                        |
| Email         | Nodemailer (SMTP)                                 |
| AI service    | Python 3.11, FastAPI, uvicorn                     |
| Embeddings    | sentence-transformers (all-MiniLM-L6-v2)          |
| Image labels  | torchvision ResNet50 (ImageNet top-5)             |
| Deployment    | Vercel (frontend), Render (backend + AI)          |

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Browser (React SPA)                │
│         Vercel CDN · code-split bundles             │
└───────────────────────┬─────────────────────────────┘
                        │ HTTPS + Bearer JWT
                        ▼
┌─────────────────────────────────────────────────────┐
│           Express Backend  (Render)                 │
│   Auth · Items · Matches · Notifications · QR       │
│   Rate-limit · mongo-sanitize · xss-clean           │
└────────┬────────────────────────┬───────────────────┘
         │ Mongoose               │ HTTP (internal secret)
         ▼                        ▼
┌─────────────────┐    ┌───────────────────────────────┐
│  MongoDB Atlas  │    │   FastAPI AI Service (Render) │
│                 │    │   /embed  · /image-labels      │
│  Users · Items  │    │   sentence-transformers        │
│  Matches · QR   │    │   ResNet50 image classifier    │
└─────────────────┘    └───────────────────────────────┘
                                  │ Cloudinary CDN
                        ┌─────────┴──────────┐
                        │   Item images       │
                        │   (JPEG/PNG/WebP)   │
                        └────────────────────┘
```

---

## Prerequisites

- Node.js 18+
- Python 3.10+
- MongoDB 6+ (local) or a free [MongoDB Atlas](https://cloud.mongodb.com) cluster
- [Cloudinary](https://cloudinary.com) account (free tier)
- SMTP credentials (Gmail app password, SendGrid, etc.)

---

## Local Setup

Clone the repo, then start each service in its own terminal.

### 1 — Backend

```bash
cd backend
npm install
cp .env.example .env
# Fill in MONGODB_URI, JWT_SECRET, EMAIL_*, CLOUDINARY_*, AI_SERVICE_SECRET
npm run dev          # nodemon, port 5000
```

### 2 — AI Service

```bash
cd ai-service
python -m venv .venv
# macOS/Linux:
source .venv/bin/activate
# Windows PowerShell:
.venv\Scripts\Activate.ps1

# CPU-only PyTorch (faster install, works for dev):
pip install torch==2.4.1 torchvision==0.19.1 --index-url https://download.pytorch.org/whl/cpu
pip install -r requirements.txt

cp .env.example .env
# Set AI_SERVICE_SECRET to the same value as backend's AI_SERVICE_SECRET
uvicorn main:app --reload --port 8000
```

> First run downloads ~400 MB of model weights. Subsequent starts are fast (cached in `~/.cache/`).

### 3 — Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Set VITE_API_BASE_URL=http://localhost:5000
# Set VITE_ALLOWED_EMAIL_DOMAINS=college.edu  (or leave empty to allow all)
npm run dev          # Vite, port 5173
```

Open [http://localhost:5173](http://localhost:5173).

---

## Environment Variables

### Backend (`backend/.env`)

| Variable                  | Required | Description                                             |
|---------------------------|----------|---------------------------------------------------------|
| `PORT`                    | No       | HTTP port (default: 5000)                               |
| `NODE_ENV`                | No       | `production` enables combined logging                   |
| `MONGODB_URI`             | **Yes**  | MongoDB connection string                               |
| `JWT_SECRET`              | **Yes**  | Random 32+ char string for signing tokens               |
| `JWT_EXPIRES_IN`          | No       | Token lifetime (default: `7d`)                          |
| `CLIENT_URL`              | **Yes**  | Frontend origin for CORS (e.g. `https://app.vercel.app`)|
| `EMAIL_HOST`              | **Yes**  | SMTP host (e.g. `smtp.gmail.com`)                       |
| `EMAIL_PORT`              | No       | SMTP port (default: 587)                                |
| `EMAIL_USER`              | **Yes**  | SMTP username / sender address                          |
| `EMAIL_PASS`              | **Yes**  | SMTP password or app password                           |
| `CLOUDINARY_CLOUD_NAME`   | **Yes**  | Cloudinary cloud name                                   |
| `CLOUDINARY_API_KEY`      | **Yes**  | Cloudinary API key                                      |
| `CLOUDINARY_API_SECRET`   | **Yes**  | Cloudinary API secret                                   |
| `AI_SERVICE_URL`          | No       | AI service base URL (default: `http://localhost:8000`)  |
| `AI_SERVICE_SECRET`       | No       | Shared secret between backend and AI service            |
| `ALLOWED_EMAIL_DOMAINS`   | No       | Comma-separated campus domains (e.g. `college.edu`)     |

### AI Service (`ai-service/.env`)

| Variable            | Required | Description                                  |
|---------------------|----------|----------------------------------------------|
| `PORT`              | No       | HTTP port (default: 8000)                    |
| `AI_SERVICE_SECRET` | No       | Must match backend's `AI_SERVICE_SECRET`     |
| `CLIENT_URL`        | No       | Allowed CORS origin in production            |
| `BACKEND_URL`       | No       | Backend origin allowed by CORS in production |

### Frontend (`frontend/.env`)

| Variable                    | Required | Description                                    |
|-----------------------------|----------|------------------------------------------------|
| `VITE_API_BASE_URL`         | **Yes**  | Backend URL (e.g. `https://api.onrender.com`)  |
| `VITE_ALLOWED_EMAIL_DOMAINS`| No       | Campus domains for client-side validation      |

---

## Making a User an Admin

There is no API endpoint for role promotion. Set the role directly in MongoDB:

```js
// MongoDB shell / Atlas Data Explorer
db.users.updateOne(
  { email: "admin@college.edu" },
  { $set: { role: "admin" } }
)
```

Admin accounts unlock `GET/PUT/DELETE /api/admin/*`. Admins cannot be banned via the admin panel.

---

## Deployment

### Frontend → Vercel

1. Import the repo in [vercel.com](https://vercel.com).
2. Set **Root Directory** to `frontend`.
3. Build command: `npm run build` · Output: `dist`.
4. Add environment variables (`VITE_API_BASE_URL`, `VITE_ALLOWED_EMAIL_DOMAINS`).
5. `vercel.json` (already in repo) handles SPA rewrites automatically.

### Backend → Render

1. Create a new **Web Service** in [render.com](https://render.com), connect the repo.
2. Set **Root Directory** to `backend`.
3. `backend/render.yaml` pre-fills build/start commands and env var keys.
4. Fill in all `sync: false` variables in the Render dashboard.
5. Health check runs at `/health`.

### AI Service → Render (or Railway)

1. Create another **Web Service**, root directory `ai-service`.
2. Use `ai-service/render.yaml` — build: `pip install -r requirements.txt`, start: `uvicorn main:app --host 0.0.0.0 --port $PORT`.
3. Set `AI_SERVICE_SECRET` (same value as backend), `CLIENT_URL`, `BACKEND_URL`.

> **Note:** First deploy downloads PyTorch + model weights (~500 MB) and takes 5–10 minutes.  
> Render free tier **sleeps after 15 min** of inactivity — the next request triggers a cold start that re-downloads models. Use [Railway](https://railway.app) or Render Starter ($7/mo) for always-on inference.

### MongoDB → Atlas

1. Create a free M0 cluster at [cloud.mongodb.com](https://cloud.mongodb.com).
2. Whitelist IP `0.0.0.0/0` (Render uses dynamic IPs) or use Atlas Private Networking.
3. Create a database user, copy the connection string into `MONGODB_URI`.
4. The text index on `items.title + description` is created automatically on first write.

---

## API Reference

All endpoints return `{ success, data, message }`. Auth endpoints rate-limited to 20 req/15 min.

### Auth — `/api/auth`

| Method | Path                    | Auth | Description                          |
|--------|-------------------------|------|--------------------------------------|
| POST   | `/register`             | —    | Register; sends verification email   |
| POST   | `/login`                | —    | Returns `{ token, user }`            |
| GET    | `/verify-email?token=`  | —    | Activate account                     |
| POST   | `/forgot-password`      | —    | Send password reset email            |
| POST   | `/reset-password`       | —    | Reset with token from email          |
| GET    | `/me`                   | JWT  | Current user profile                 |
| PUT    | `/profile`              | JWT  | Update name / campusId               |
| PUT    | `/change-password`      | JWT  | Verify old password, set new         |
| GET    | `/my-stats`             | JWT  | `{ lostCount, foundCount, recoveredCount }` |

### Items — `/api/items`

| Method | Path              | Auth      | Description                                   |
|--------|-------------------|-----------|-----------------------------------------------|
| GET    | `/`               | —         | List items (type, category, status, search, page, limit) |
| POST   | `/`               | JWT       | Create item (multipart/form-data with images) |
| GET    | `/mine`           | JWT       | Current user's items (paginated)              |
| GET    | `/:id`            | —         | Item detail (populated userId)                |
| PUT    | `/:id`            | JWT/owner | Update item                                   |
| DELETE | `/:id`            | JWT/owner | Delete item + images + matches                |

### Matches — `/api/matches`

| Method | Path                  | Auth | Description                              |
|--------|-----------------------|------|------------------------------------------|
| GET    | `/mine`               | JWT  | My matches (as owner of either item)     |
| GET    | `/item/:itemId`       | JWT  | Matches for a specific item              |
| POST   | `/:id/accept`         | JWT  | Accept match → both items → CLAIMED      |
| POST   | `/:id/reject`         | JWT  | Reject match                             |
| POST   | `/trigger`            | admin| Manually re-run matching for an item     |

### Notifications — `/api/notifications`

| Method | Path            | Auth | Description                        |
|--------|-----------------|------|------------------------------------|
| GET    | `/`             | JWT  | List notifications (unreadOnly, page, limit) |
| GET    | `/unread-count` | JWT  | `{ count }`                        |
| PUT    | `/:id/read`     | JWT  | Mark one as read                   |
| PUT    | `/read-all`     | JWT  | Mark all as read                   |

### QR Tags — `/api/qr`

| Method | Path               | Auth | Description                             |
|--------|--------------------|------|-----------------------------------------|
| POST   | `/generate`        | JWT  | Generate QR tag for item `{ itemId }`   |
| GET    | `/item/:itemId`    | JWT  | Get tag for item (404 if none)          |
| GET    | `/scan/:token`     | —    | Public scan — returns item + owner info |
| DELETE | `/item/:itemId`    | JWT  | Delete QR tag                           |

### Public Stats — `/api/stats`

| Method | Path    | Auth | Description                                             |
|--------|---------|------|---------------------------------------------------------|
| GET    | `/`     | —    | `{ totalItems, totalUsers, totalRecovered, activeListings }` |

### Admin — `/api/admin` (role: admin)

| Method | Path                  | Description                              |
|--------|-----------------------|------------------------------------------|
| GET    | `/stats`              | 9-metric dashboard stats                 |
| GET    | `/users`              | Paginated users (search by name/email)   |
| PUT    | `/users/:id/ban`      | Toggle isBanned (cannot ban admin)       |
| GET    | `/items`              | Paginated items (type, status, category) |
| DELETE | `/items/:id`          | Delete item + cascade                    |
| GET    | `/matches`            | Paginated matches (status filter)        |

---

## Known Limitations & Future Improvements

- **Notifications are polling-based** (25 s interval). Replace with WebSockets or SSE for real-time push.
- **AI cold start on free tier** — sentence-transformers loads ~400 MB on first request. Cache model weights in a persistent volume.
- **No email templates** — plain-text emails only. Add MJML/React Email for branded HTML.
- **No pagination cursor** — offset pagination degrades on large datasets. Switch to cursor-based for items/matches.
- **Single-region** — all services on Render Oregon. Add a CDN layer (Cloudflare) for global asset delivery.
- **No 2FA** — add TOTP as an optional second factor for admin accounts.
- **Profile photo** — avatar is initials-only; add Cloudinary upload for profile pictures.
- **Item expiry** — no TTL on old listings. Add a cron job to auto-archive items older than 90 days.
