import { env } from './env.js';
import { ApiError } from '../utils/ApiError.js';

// Explicit allowlist. In development we also permit localhost dev servers.
const allowedOrigins = new Set([env.CLIENT_URL]);

const isAllowed = (origin) => {
  if (allowedOrigins.has(origin)) return true;
  if (env.NODE_ENV !== 'production') {
    // Permit localhost, 127.0.0.1, and LAN IP ranges (192.168.x.x, 172.x.x.x, 10.x.x.x)
    return /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|172\.\d+\.\d+\.\d+|10\.\d+\.\d+\.\d+)(:\d+)?$/.test(origin);
  }
  return false;
};

export const corsOptions = {
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};
