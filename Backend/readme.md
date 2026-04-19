# CivicConnect v2 — Backend

Express + MongoDB Atlas REST API for the Neighbourhood Issue Tracker.

---

## 📁 Folder Structure (MVC)

```
Backend/
├── config/
│   └── db.js                  # MongoDB Atlas connection
├── controllers/
│   ├── authController.js      # register, login, getMe
│   └── issueController.js     # CRUD + status + upvote
├── middleware/
│   └── authMiddleware.js      # protect (JWT) + adminOnly
├── models/
│   ├── User.js                # name, email, password, role
│   └── Issue.js               # title, description, category, status, coords, media
├── routes/
│   ├── authRoutes.js          # /api/auth/*
│   └── issueRoutes.js         # /api/issues/*
├── utils/
│   └── apiService.js          # Copy to Frontend/src/services/api.js
├── .env.example               # Template — copy to .env and fill in values
├── server.js                  # Entry point
└── package.json
```

---

## 🚀 Quick Start

### 1. Install dependencies
```bash
cd Backend
npm install
```

### 2. Create your `.env` file
```bash
cp .env.example .env
```
Then edit `.env`:
```
MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/civicconnect
JWT_SECRET=some_long_random_string
JWT_EXPIRES_IN=7d
PORT=5000
CLIENT_URL=http://localhost:5173
```

### 3. MongoDB Atlas setup
1. Go to https://cloud.mongodb.com → create free M0 cluster
2. **Database Access** → Add user with read/write permissions
3. **Network Access** → Add IP `0.0.0.0/0` (allow all, for dev)
4. **Connect** → "Connect your application" → copy the URI into `.env`

### 4. Run the server
```bash
npm run dev       # nodemon (auto-restart)
# or
npm start         # plain node
```

Server starts on `http://localhost:5000`

---

## 🗺️ API Routes

### Auth  `/api/auth`
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/register` | — | Create account |
| POST | `/login` | — | Get JWT token |
| GET | `/me` | 🔒 User | Get current user |

### Issues  `/api/issues`
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/` | — | All issues (filter + paginate) |
| GET | `/:id` | — | Single issue |
| POST | `/` | Optional | Create issue (anonymous OK) |
| PATCH | `/:id/status` | 🔑 Admin | Update status |
| DELETE | `/:id` | 🔑 Admin | Delete one issue |
| DELETE | `/` | 🔑 Admin | Delete ALL issues |
| POST | `/:id/upvote` | 🔒 User | Toggle upvote |

Query params for `GET /api/issues`:
- `category` — Garbage | Street Light | Roads | Water | Other
- `status` — Pending | In Progress | Resolved
- `page` — default 1
- `limit` — default 20

---

## 📦 Mongoose Models

### User
| Field | Type | Notes |
|-------|------|-------|
| name | String | required |
| email | String | unique, required |
| password | String | bcrypt hashed, select:false |
| role | String | "user" or "admin" |
| avatar | String | optional URL |

### Issue
| Field | Type | Notes |
|-------|------|-------|
| title | String | required, max 120 chars |
| description | String | required, max 1000 chars |
| category | Enum | Garbage / Street Light / Roads / Water / Other |
| status | Enum | Pending / In Progress / Resolved |
| locationText | String | manual address entry |
| locationCoords | {lat, lng} | from map picker |
| media | [String] | base64 data-URIs or cloud URLs |
| upvotes | Number | count |
| upvotedBy | [ObjectId] | refs to User |
| reportedBy | ObjectId | ref to User, null = anonymous |
| resolvedBy | ObjectId | admin who changed status |

---

## 🔌 Connecting the Frontend

1. Copy `utils/apiService.js` → `Frontend/src/services/api.js`
2. Add to `Frontend/.env`:
   ```
   VITE_API_URL=http://localhost:5000/api
   ```
3. Replace `localStorage` calls in your React components:
   ```js
   // OLD
   const stored = JSON.parse(localStorage.getItem("issues") || "[]");
   
   // NEW
   import { issueAPI } from "../services/api";
   const { issues } = await issueAPI.getAll({ category: "Garbage" });
   ```

---

## 🛡️ Creating Your First Admin User

After running the server, use Postman or curl:
```bash
# 1. Register normally
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@civic.com","password":"admin123"}'

# 2. Manually promote to admin in MongoDB Atlas UI
# Database → civicconnect → users collection
# Edit the document → set role: "admin"
```

---

## 📋 Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB Atlas via Mongoose
- **Auth**: JWT (jsonwebtoken) + bcryptjs
- **Dev**: nodemon
