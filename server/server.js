import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { connectDB } from './config/db.js';
import routes from './routes/index.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import { assertAuthConfig } from './middleware/auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
assertAuthConfig(); // stop at startup if JWT_SECRET is missing
const app = express();
const isProd = process.env.NODE_ENV === 'production';

// behind Nginx: read the visitor's real IP from X-Forwarded-For (needed for the rate limits and login lockout)
if (isProd) app.set('trust proxy', 1);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // let images load from the Vite dev origin
    contentSecurityPolicy: {
      useDefaults: true,
      // blob: = the photo previews in the review form and the admin gallery
      directives: { 'img-src': ["'self'", 'data:', 'blob:'] },
    },
  })
);
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: '100kb' }));
app.use(morgan(isProd ? 'combined' : 'dev'));

app.use('/uploads', express.static(path.join(__dirname, 'uploads'), { maxAge: '7d' }));
app.use('/api', routes);

// production: serve the built React site from the same server (run `npm run build` first)
const dist = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(dist)) {
  // the build gives every JS/CSS file a hashed name, so those can be cached for a year
  app.use('/assets', express.static(path.join(dist, 'assets'), { maxAge: '1y', immutable: true }));
  app.use(express.static(dist, { maxAge: '1h', index: false }));
  app.get('/{*splat}', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) return next();
    if (req.path.startsWith('/admin')) res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    res.sendFile(path.join(dist, 'index.html'));
  });
}

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0'; // on the VPS set HOST=127.0.0.1 so only Nginx can reach the app
connectDB()
  .then(() => app.listen(PORT, HOST, () => console.log(`[server] listening on ${HOST}:${PORT}${isProd ? ' (production)' : ''}`)))
  .catch((err) => {
    console.error('[db] could not connect to MongoDB:', err.message);
    console.error('     Check that MongoDB is running and MONGO_URI in server/.env is correct.');
    process.exit(1);
  });
