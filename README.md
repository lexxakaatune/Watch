# Watch - Premium Streaming Platform

A full production-grade streaming platform built with React, Node.js, Express, MongoDB Atlas, AWS S3, and Redis. Supports multiple user roles, 2FA, video upload/processing pipeline, messaging, notifications, and comprehensive admin dashboards.

## Architecture

```
watch/
├── frontend/          # React + Vite SPA
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Route-level pages
│   │   ├── pages/dashboards/  # Role-based dashboards
│   │   ├── css/          # All styles (no inline, no CSS modules)
│   │   ├── redux/        # Redux Toolkit store + thunks
│   │   └── utils/        # Helper utilities
│   ├── public/
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── backend/           # Node.js + Express API
│   ├── src/
│   │   ├── config/       # DB, S3, Redis configs
│   │   ├── controllers/  # Route handlers
│   │   ├── middleware/   # Auth, rate limiting, validation, errors
│   │   ├── models/       # Mongoose schemas
│   │   ├── routes/       # API route definitions
│   │   ├── utils/        # JWT, email, queue utilities
│   │   ├── workers/      # Background job processors
│   │   └── scripts/      # One-off scripts (seed superadmin)
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── netlify.toml       # Netlify deployment config
├── render.yaml        # Render deployment blueprint
└── README.md
```

## Tech Stack

**Frontend:** React 18, Vite, React Router v6, Redux Toolkit, Pure CSS (no Tailwind, no styled-components)

**Backend:** Node.js 18+, Express, MongoDB Atlas, Redis, AWS S3, Bull Queue, JWT, bcryptjs, Speakeasy (2FA)

**Deployment:** Netlify (frontend), Render (backend + workers)

## User Roles

| Role | Permissions |
|------|-------------|
| **Guest** | Browse limited content, no interaction |
| **User** | Full viewing, likes, comments, playlists, watch later, messaging |
| **Premium User** | Everything in User + premium content, ad-free, downloads |
| **Creator** | Upload videos, analytics, earnings, content management |
| **Moderator** | Review reports, moderate uploads/comments, temporary suspensions |
| **Admin** | User management, creator approvals, ads, monetization overview |
| **Superadmin** | Full system control, admin management, infrastructure monitoring |

## Features

- **Authentication:** Register/Login with JWT (access + refresh tokens), httpOnly cookies, brute force protection, account lockout
- **2FA:** Mandatory for Creator/Moderator/Admin/Superadmin using TOTP (Google Authenticator compatible)
- **Video Upload:** Direct-to-S3 presigned URLs, background processing queue (240p-1080p HLS), progress tracking
- **Watch Page:** Sticky video player, comments (threaded replies, likes, pin, report), related videos
- **Messaging:** Private chat with text, unread indicators, real-time feel
- **Notifications:** Like, comment, follow, upload, system, moderation, payment alerts
- **Search:** Full-text search across titles, descriptions, tags
- **SEO:** Dynamic metadata ready, structured data support in video model
- **Security:** Helmet, CORS, rate limiting, input validation, XSS protection

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB Atlas cluster
- AWS account (S3 bucket)
- Redis instance (Upstash or Redis Cloud)

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd watch

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Variables

Copy `backend/.env.example` to `backend/.env` and fill in all values:

```env
NODE_ENV=production
PORT=10000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/watch?retryWrites=true&w=majority
ACCESS_TOKEN_SECRET=your_super_secret_access_key_min_32_chars
REFRESH_TOKEN_SECRET=your_super_secret_refresh_key_min_32_chars
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=watch-videos-bucket
REDIS_URL=redis://your-redis-url
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
FRONTEND_URL=http://localhost:5173
```

### 3. Create Superadmin

```bash
cd backend
node src/scripts/seedSuperAdmin.js superadmin superadmin@watch.com YourStrongPassword123!
```

This creates a superadmin account you can use to log in and manage the platform.

### 4. Run Locally

```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Backend runs on `http://localhost:10000`
Frontend runs on `http://localhost:5173`

## Deployment

### Frontend (Netlify)

1. Push code to GitHub
2. Connect repo to Netlify
3. Build settings are auto-configured via `netlify.toml`:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Update `netlify.toml` API redirect URL to your Render backend URL
5. Add environment variable in Netlify UI:
   - `VITE_API_URL`: `https://your-render-backend.onrender.com/api`

### Backend (Render)

1. Push code to GitHub
2. In Render dashboard, click "New +" > "Blueprint"
3. Connect your repo and select `render.yaml`
4. Render will create:
   - Web service (API server)
   - Background worker (video processing)
5. Add all secret environment variables in Render dashboard (marked `sync: false` in render.yaml)
6. Update `FRONTEND_URL` to your Netlify domain

### Required External Services

- **MongoDB Atlas:** Create a cluster, whitelist all IPs (0.0.0.0/0 for Render), get connection string
- **AWS S3:** Create bucket, configure CORS, create IAM user with S3 access, get credentials
- **Redis:** Upstash (free tier) or Redis Cloud - get connection URL
- **Email:** Gmail App Password or any SMTP provider

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/2fa/verify` - Verify 2FA code
- `POST /api/auth/2fa/setup` - Setup 2FA (returns QR code)
- `POST /api/auth/2fa/confirm` - Confirm 2FA setup
- `POST /api/auth/refresh` - Refresh tokens
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Videos
- `GET /api/videos/feed` - Video feed with pagination/search
- `GET /api/videos/trending` - Trending videos
- `GET /api/videos/:id` - Single video + related
- `POST /api/videos/:id/like` - Like video
- `POST /api/videos/:id/dislike` - Dislike video
- `POST /api/videos/:id/report` - Report video

### Upload (Creator/Admin/Superadmin only)
- `POST /api/upload/url` - Get presigned S3 URL
- `POST /api/upload/confirm` - Confirm upload + start processing
- `GET /api/upload/status/:id` - Check processing status

### Comments
- `GET /api/comments/:videoId` - Get comments
- `POST /api/comments/:videoId` - Add comment
- `POST /api/comments/:id/like` - Like comment
- `POST /api/comments/:id/pin` - Pin comment (creator only)
- `POST /api/comments/:id/report` - Report comment

### User
- `GET /api/users/profile/:username` - Public profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/history` - Watch history
- `POST /api/users/history` - Add to history
- `GET /api/users/watch-later` - Watch later list
- `POST /api/users/watch-later` - Toggle watch later
- `GET /api/users/playlists` - Get playlists
- `POST /api/users/playlists` - Create playlist
- `POST /api/users/subscribe` - Subscribe/unsubscribe
- `POST /api/users/apply-creator` - Apply for creator status

### Messages
- `GET /api/messages/conversations` - Get conversations
- `GET /api/messages/:userId` - Get messages with user
- `POST /api/messages/:userId` - Send message

### Notifications
- `GET /api/notifications` - Get notifications
- `PUT /api/notifications/:id/read` - Mark as read

### Creator Dashboard
- `GET /api/creator/dashboard` - Creator stats + videos
- `GET /api/creator/analytics` - 30-day analytics
- `GET /api/creator/earnings` - Earnings overview
- `PUT /api/creator/videos/:id` - Update video
- `DELETE /api/creator/videos/:id` - Delete video

### Moderator Dashboard
- `GET /api/moderator/dashboard` - Moderation stats
- `GET /api/moderator/uploads` - Pending uploads
- `POST /api/moderator/videos/:id` - Approve/reject/flag video
- `POST /api/moderator/comments/:id` - Moderate comment
- `POST /api/moderator/users/:id/suspend` - Temporarily suspend user

### Admin Dashboard
- `GET /api/admin/dashboard` - Platform overview
- `GET /api/admin/users` - All users
- `PUT /api/admin/users/:id/role` - Change user role
- `POST /api/admin/users/:id/suspend` - Suspend/unsuspend user
- `GET /api/admin/creators/applications` - Pending creator apps
- `POST /api/admin/creators/:id/approve` - Approve/reject creator
- `GET /api/admin/reports` - All reports
- `PUT /api/admin/reports/:id/resolve` - Resolve report

### Superadmin
- `GET /api/superadmin/system-health` - System metrics
- `GET /api/superadmin/admins` - List all admins/moderators
- `PUT /api/superadmin/admins/:id/role` - Update admin role

## Security Features

- Password hashing with bcrypt (12 rounds)
- JWT access tokens (15min) + refresh tokens (7 days) with rotation
- httpOnly, Secure, SameSite cookies
- Rate limiting: 100 req/15min general, 5 login attempts/15min
- Brute force protection: 5 failed logins = 2-hour lockout
- IP/device anomaly tracking
- 2FA mandatory for elevated roles
- Helmet.js security headers
- Input validation with express-validator
- CORS with whitelist

## License

MIT
