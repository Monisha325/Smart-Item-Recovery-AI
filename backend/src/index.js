require('dotenv').config();

const express        = require('express');
const cors           = require('cors');
const helmet         = require('helmet');
const compression    = require('compression');
const morgan         = require('morgan');
const mongoSanitize  = require('express-mongo-sanitize');
const xss            = require('xss-clean');

const connectDB          = require('./config/db');
const errorHandler       = require('./middleware/errorHandler');
const { defaultLimiter } = require('./middleware/rateLimiter');
const logger             = require('./utils/logger');

const authRoutes         = require('./routes/auth');
const itemRoutes         = require('./routes/items');
const matchRoutes        = require('./routes/matches');
const notificationRoutes = require('./routes/notifications');
const qrRoutes           = require('./routes/qr');
const adminRoutes        = require('./routes/admin');

const app  = express();
const PORT = process.env.PORT || 5000;
const isProd = process.env.NODE_ENV === 'production';

// ── Trust proxy (required for Render / reverse-proxied deploys) ─────────────
app.set('trust proxy', 1);

// ── Security & compression ───────────────────────────────────────────────────
app.use(helmet());

const ALLOWED_ORIGINS = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (Postman, curl, health checks from Render)
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    logger.warn(`CORS blocked: origin="${origin}" not in [${ALLOWED_ORIGINS.join(', ')}]`);
    callback(new Error(`CORS: origin '${origin}' not allowed`));
  },
  credentials: true,
}));
app.use(compression());
app.use(morgan(isProd ? 'combined' : 'dev'));

// ── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Input sanitisation (after body parse, before routes) ─────────────────────
app.use(mongoSanitize());   // strips $ and . from req.body/query/params
app.use(xss());              // escapes HTML tags in req.body

// ── Rate limiting ─────────────────────────────────────────────────────────────
app.use(defaultLimiter);

// ── Health ────────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({
  status:    'ok',
  timestamp: new Date(),
  uptime:    process.uptime(),
}));

// ── Public stats ──────────────────────────────────────────────────────────────
app.get('/api/stats', async (_req, res) => {
  try {
    const Item = require('./models/Item');
    const User = require('./models/User');
    const [totalItems, totalUsers, totalRecovered, activeListings] = await Promise.all([
      Item.countDocuments(),
      User.countDocuments(),
      Item.countDocuments({ status: { $in: ['CLAIMED', 'RETURNED'] } }),
      Item.countDocuments({ status: { $in: ['LOST', 'FOUND'] } }),
    ]);
    res.json({ success: true, data: { totalItems, totalUsers, totalRecovered, activeListings } });
  } catch {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── API routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',          authRoutes);
app.use('/api/items',         itemRoutes);
app.use('/api/matches',       matchRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/qr',            qrRoutes);
app.use('/api/admin',         adminRoutes);

// ── Error handler (must be last) ─────────────────────────────────────────────
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────────────────────────
async function start() {
  await connectDB();
  app.listen(PORT, () =>
    logger.info(`Backend running — port ${PORT}, env: ${process.env.NODE_ENV || 'development'}`)
  );
}

start();
