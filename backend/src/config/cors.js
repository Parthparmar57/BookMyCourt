import { env } from './env.js';

// Explicit allowlist. In development we also permit localhost dev servers.
const allowedOrigins = new Set([env.CLIENT_URL]);

const isAllowed = (origin) => {
  if (allowedOrigins.has(origin)) return true;
  if (env.NODE_ENV !== 'production') {
    return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
  }
  return false;
};

export const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser clients (curl, mobile apps, server-to-server) that send no Origin.
    if (!origin) return callback(null, true);
    if (isAllowed(origin)) return callback(null, true);
    return callback(new Error(`Origin ${origin} is not allowed by CORS`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};
