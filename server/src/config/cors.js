import { env } from './env.js';
import { ApiError } from '../utils/ApiError.js';

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
    // A disallowed origin is a client error (403), not a server fault — tagging
    // the status keeps it out of the "unhandled server error" logs.
    return callback(new ApiError(403, `Origin ${origin} is not allowed by CORS`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};
