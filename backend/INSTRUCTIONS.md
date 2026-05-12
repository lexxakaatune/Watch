# Backend Setup Instructions

Follow these steps ONE BY ONE to get the backend running.

## Step 1: Environment Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in ALL environment variables in `.env`:
   - `MONGO_URI` - Your MongoDB Atlas connection string
   - `ACCESS_TOKEN_SECRET` - Random string, minimum 32 characters
   - `REFRESH_TOKEN_SECRET` - Different random string, minimum 32 characters
   - `AWS_ACCESS_KEY_ID` - From AWS IAM user
   - `AWS_SECRET_ACCESS_KEY` - From AWS IAM user
   - `AWS_REGION` - e.g., us-east-1
   - `AWS_S3_BUCKET` - Your S3 bucket name
   - `REDIS_URL` - From Upstash or Redis Cloud
   - `EMAIL_USER` - Your SMTP email
   - `EMAIL_PASS` - Your email app password
   - `FRONTEND_URL` - Your frontend URL (Netlify)

## Step 2: MongoDB Atlas Setup

1. Go to https://cloud.mongodb.com and create a free cluster
2. Create a database user with password
3. Whitelist IP: `0.0.0.0/0` (required for Render deployment)
4. Get connection string and paste into `MONGO_URI`
5. The database name in the URI should be `watch`

## Step 3: AWS S3 Setup

1. Go to AWS Console > S3 > Create bucket
2. Bucket name: `watch-videos-bucket` (or your choice)
3. Region: match your `AWS_REGION` env var
4. Uncheck "Block all public access" (we need public video access)
5. Add CORS configuration:
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST"],
       "AllowedOrigins": ["*"],
       "ExposeHeaders": ["ETag"]
     }
   ]
   ```
6. Go to IAM > Users > Create user
7. Attach policy: `AmazonS3FullAccess`
8. Create access keys, copy to env vars

## Step 4: Redis Setup

1. Go to https://upstash.com and create a free Redis database
2. Copy the Redis URL (starts with `redis://` or `rediss://`)
3. Paste into `REDIS_URL` env var

## Step 5: Install Dependencies

```bash
cd backend
npm install
```

## Step 6: Create Superadmin

```bash
node src/scripts/seedSuperAdmin.js superadmin superadmin@watch.com YourStrongPassword123!
```

This creates the first superadmin account. You can change the username, email, and password.

## Step 7: Start Server

```bash
npm start
```

Server will start on port 10000 (or whatever PORT env var is set to).

You should see:
- "MongoDB Atlas connected"
- "Watch server running on port 10000"

## Step 8: Test the API

Open browser or Postman and test:
- `GET http://localhost:10000/health` - Should return `{ "status": "ok" }`
- `POST http://localhost:10000/api/auth/register` - Register a test user

## Step 9: Deploy to Render

1. Push code to GitHub
2. In Render dashboard, click "New +" > "Blueprint"
3. Connect your repo
4. Render reads `render.yaml` and creates services automatically
5. Add all secret env vars in Render dashboard (the ones marked sync: false)
6. Update `FRONTEND_URL` to your Netlify domain after deploying frontend
7. Deploy

## Troubleshooting

- **MongoDB connection error**: Check URI format, ensure IP is whitelisted
- **Port already in use**: Change PORT env var or kill process on that port
- **S3 upload fails**: Check bucket CORS, IAM permissions, region match
- **Redis connection fails**: Verify URL format, check if TLS is required (use rediss://)
- **2FA not working**: Ensure system time is synced (TOTP is time-based)

## File Structure Reminder

```
backend/
├── server.js              # Entry point
├── src/
│   ├── app.js             # Express app setup
│   ├── config/
│   │   ├── db.js          # MongoDB connection
│   │   ├── s3.js          # AWS S3 setup
│   │   └── redis.js       # Redis connection
│   ├── controllers/       # All route handlers
│   ├── middleware/
│   │   ├── auth.js        # JWT auth + role checks + 2FA
│   │   ├── rateLimit.js   # Rate limiting rules
│   │   ├── errorHandler.js # Global error handler
│   │   └── validator.js   # Input validation
│   ├── models/            # Mongoose schemas
│   ├── routes/            # Route definitions
│   ├── utils/
│   │   ├── jwt.js         # Token generation/verification
│   │   ├── email.js       # Email sending
│   │   └── queue.js       # Bull queue setup
│   ├── workers/
│   │   └── videoWorker.js # Background video processing
│   └── scripts/
│       └── seedSuperAdmin.js # Create superadmin
└── package.json
```

## Important Notes

- NEVER commit `.env` to GitHub
- NEVER hardcode secrets in code
- Always use `process.env` for sensitive values
- The backend will FAIL to start if required env vars are missing
- Video processing worker runs separately from web server
- All errors return exact messages (no vague "something went wrong")
