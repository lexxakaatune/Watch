# Frontend Setup Instructions

Follow these steps ONE BY ONE to get the frontend running.

## Step 1: Environment Setup

Create a `.env` file in the `frontend/` directory:

```env
VITE_API_URL=http://localhost:10000/api
```

For production (after backend deploy):
```env
VITE_API_URL=https://your-render-backend.onrender.com/api
```

## Step 2: Install Dependencies

```bash
cd frontend
npm install
```

## Step 3: Start Development Server

```bash
npm run dev
```

Frontend will start on `http://localhost:5173`

## Step 4: Verify Setup

1. Open `http://localhost:5173` in browser
2. You should see the Watch homepage with hero section
3. Click "Sign Up" to register a test user
4. Login should work and redirect to home
5. Dashboard link should appear in profile dropdown based on role

## Step 5: Build for Production

```bash
npm run build
```

This creates a `dist/` folder with optimized static files.

## Step 6: Deploy to Netlify

### Option A: Manual Deploy
1. Run `npm run build`
2. Drag `frontend/dist/` folder to Netlify deploy dropzone

### Option B: Git Integration (Recommended)
1. Push code to GitHub
2. Connect repo to Netlify
3. Netlify reads `netlify.toml` at repo root for config:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Add environment variable in Netlify UI:
   - Key: `VITE_API_URL`
   - Value: `https://your-render-backend.onrender.com/api`
5. Deploy

### Important: Update API Redirect
After deploying backend to Render, update `netlify.toml`:

```toml
[[redirects]]
  from = "/api/*"
  to = "https://your-actual-render-url.onrender.com/api/:splat"
  status = 200
  force = true
```

Replace `your-actual-render-url` with your real Render domain.

## Step 7: Role-Based Dashboard Access

After logging in, the profile dropdown shows a "Dashboard" link that routes to the correct dashboard based on your role:

| Role | Dashboard URL |
|------|---------------|
| User | `/dashboard` |
| Premium User | `/dashboard` |
| Creator | `/creator/dashboard` |
| Moderator | `/moderator/dashboard` |
| Admin | `/admin/dashboard` |
| Superadmin | `/superadmin/dashboard` |

## CSS Rules (STRICT)

- ALL styles are in `src/css/` folder
- `index.css` is the ONLY entry point - it imports all other CSS files
- NEVER import CSS inside components or pages
- NO Tailwind, NO styled-components, NO CSS modules, NO inline styles
- Theme variables in `global.css` support dark/light mode
- Mobile-first responsive design

## File Structure Reminder

```
frontend/
├── index.html              # HTML entry
├── vite.config.js          # Vite config
├── package.json
├── public/                 # Static assets
└── src/
    ├── main.jsx            # React entry
    ├── App.jsx             # Router + layout
    ├── components/
    │   ├── Header.jsx      # Navigation + search + theme toggle
    │   ├── Footer.jsx      # Site footer
    │   ├── Alert.jsx       # Toast notifications
    │   ├── ProtectedRoute.jsx # Role-based route guard
    │   └── VideoCard.jsx   # Reusable video card
    ├── pages/
    │   ├── Home.jsx        # Feed + hero + trending + shorts
    │   ├── Watch.jsx       # Video player + comments + related
    │   ├── Login.jsx       # Sign in + 2FA
    │   ├── Register.jsx    # Sign up
    │   ├── Profile.jsx     # Public profile
    │   ├── Settings.jsx    # Account settings + 2FA setup
    │   ├── Upload.jsx      # Video upload flow
    │   ├── Messages.jsx    # Chat interface
    │   ├── Notifications.jsx # Notification list
    │   ├── SearchResults.jsx # Search results
    │   ├── NotFound.jsx    # 404 page
    │   └── dashboards/
    │       ├── UserDashboard.jsx
    │       ├── CreatorDashboard.jsx
    │       ├── ModeratorDashboard.jsx
    │       ├── AdminDashboard.jsx
    │       └── SuperAdminDashboard.jsx
    ├── css/
    │   ├── index.css       # ONLY CSS entry point
    │   ├── global.css      # Reset + variables + utilities
    │   ├── home.css        # Homepage styles
    │   ├── watch.css       # Watch page styles
    │   ├── auth.css        # Login/register styles
    │   ├── profile.css     # Profile/settings styles
    │   ├── admin.css       # Dashboard styles
    │   ├── upload.css      # Upload page styles
    │   ├── notifications.css # Notifications styles
    │   └── messaging.css   # Chat styles
    ├── redux/
    │   └── store.js        # Redux store + auth thunks + theme
    └── utils/              # Helper functions
```

## Troubleshooting

- **Blank page**: Check browser console for errors, verify API URL is correct
- **CORS errors**: Ensure backend `FRONTEND_URL` matches your frontend domain
- **Styles not loading**: Make sure `index.css` imports are correct, no CSS in JS
- **Login not persisting**: Check cookies are being set (httpOnly, sameSite settings)
- **Dashboard not showing**: Verify user role in Redux devtools, check route guards

## Important Notes

- The frontend uses `withCredentials: true` for all API calls (cookies)
- Token refresh is automatic via axios interceptor
- Theme preference saves to localStorage
- All forms have validation before submission
- Mobile responsive down to 320px width
