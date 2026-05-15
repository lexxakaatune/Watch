require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const compression = require('compression');

const app = express();

app.use(helmet());
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

const allowedOrigins = [process.env.FRONTEND_URL || 'https://watch87.netlify.app'];
 app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/user'));
app.use('/api/videos', require('./routes/video'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/comments', require('./routes/comment'));
app.use('/api/messages', require('./routes/message'));
app.use('/api/notifications', require('./routes/notification'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/moderator', require('./routes/moderator'));
app.use('/api/creator', require('./routes/creator'));
app.use('/api/superadmin', require('./routes/superadmin'));

console.log('Routes loaded. Auth route:', require('./routes/auth'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route ${req.method} ${req.path} not found` });
});

// Error handler
app.use(require('./middleware/errorHandler'));

module.exports = app;
