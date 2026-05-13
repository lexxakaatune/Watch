# Watch - Frontend

Production-ready React frontend for the Watch streaming platform.

## Features

- **React 18 + Vite** - Fast development and optimized builds
- **Redux Toolkit** - State management with async thunks
- **React Router v6** - Client-side routing with role-based protection
- **Pure CSS** - No Tailwind, no styled-components, no CSS modules
- **Dark/Light Theme** - Persistent theme toggle with localStorage
- **Real API Integration** - All endpoints connect to your backend
- **Role-Based Dashboards** - Separate UIs for each user role
- **Mobile-First** - Responsive design for all screen sizes

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 |
| Build Tool | Vite 5 |
| Router | React Router DOM 6 |
| State | Redux Toolkit |
| HTTP Client | Axios (withCredentials for cookies) |
| Styling | Pure CSS (global styles) |
| Icons | Custom SVG components |

## Project Structure

```
src/
  api/           # API layer - all backend calls
    index.js     # Axios instance with interceptors
    auth.js      # Auth endpoints
    user.js      # User endpoints
    video.js     # Video endpoints
    comment.js   # Comment endpoints
    upload.js    # Upload endpoints
    notification.js
    message.js
    creator.js
    moderator.js
    admin.js
    superadmin.js
  components/    # Reusable components
    Header.jsx   # Navigation header
    Layout.jsx   # Page layout wrapper
    VideoCard.jsx
    Skeletons.jsx
    Alert.jsx
    Icons.jsx    # 100+ SVG icons
    ProtectedRoute.jsx
    RoleRoute.jsx
  css/           # All styles
    index.css    # ONLY entry point - imports all
    global.css   # Reset, variables, utilities
    home.css
    watch.css
    auth.css
    profile.css
    admin.css
    upload.css
    notifications.css
    messaging.css
  hooks/         # Custom hooks
    useAuth.js
    useTheme.js
  pages/         # Route pages
    HomePage.jsx
    WatchPage.jsx
    LoginPage.jsx
    RegisterPage.jsx
    ProfilePage.jsx
    UserDashboard.jsx
    CreatorDashboard.jsx
    ModeratorDashboard.jsx
    AdminDashboard.jsx
    SuperAdminDashboard.jsx
    UploadPage.jsx
    NotificationsPage.jsx
    MessagingPage.jsx
    SettingsPage.jsx
    SearchPage.jsx
    NotFoundPage.jsx
  store/         # Redux store
    index.js
    slices/
      authSlice.js
      uiSlice.js
      videoSlice.js
      notificationSlice.js
  utils/         # Utilities
    constants.js
  App.jsx
  main.jsx
```

## CSS Rules (Strict)

- **index.css is the ONLY CSS entry point** - imports all other CSS files
- **Never import CSS inside components/pages**
- **No Tailwind, No styled-components, No CSS modules, No inline styles**
- All CSS lives in `src/css/`
- Uses CSS custom properties for theming

## API Integration

All API calls use `withCredentials: true` to send httpOnly cookies automatically.

Base URL: `https://watch-backend-bo7o.onrender.com/api`

### Auth Flow
1. `POST /auth/login` → Sets httpOnly cookies
2. `GET /auth/me` → Fetches current user
3. `POST /auth/refresh` → Auto-refresh on 401
4. `POST /auth/logout` → Clears cookies

### Role Hierarchy
```
guest < user < premium_user < creator < moderator < admin < superadmin
```

Each role has its own protected dashboard with real API calls.

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server (proxies /api to backend)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

Create `.env` from `.env.example`:

```
VITE_API_URL=https://your-backend.com/api
```

## Backend Routes Covered

| Route File | Endpoints Implemented |
|-----------|----------------------|
| auth.routes.js | register, login, 2fa, refresh, logout, me |
| user.routes.js | profile, history, watch-later, playlists, subscribe, apply-creator |
| video.routes.js | feed, trending, getVideo, like, dislike, report |
| comment.routes.js | get, add, like, pin, report |
| upload.routes.js | getUrl, confirm, status |
| notification.routes.js | get, markRead |
| message.routes.js | conversations, get, send |
| creator.routes.js | dashboard, analytics, earnings, update, delete |
| moderator.routes.js | dashboard, uploads, moderateVideo, moderateComment, suspend |
| admin.routes.js | dashboard, users, role, suspend, creators, reports |
| superadmin.routes.js | health, admins, role |

## Theme

- **Primary**: #22C55E (Green)
- **Background**: #0B0B0F (Dark)
- **Card**: #151A1A
- **Text Primary**: #F5F7FA
- **Text Secondary**: #A1A1AA

Toggle between dark/light mode - persists in localStorage.
