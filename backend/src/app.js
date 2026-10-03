import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { corsOptions } from './config/cors.js';
import routes from './routes.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';
import { globalLimiter } from './middleware/rateLimit.js';

const app = express();

// Required so express-rate-limit and req.ip use the real client IP behind a proxy/LB.
app.set('trust proxy', 1);

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

// Static uploads directory for media/photos
app.use('/uploads', express.static('uploads'));

// Baseline rate limit for the whole API (auth/public routes add stricter limits).
app.use('/api', globalLimiter);

// Main API Router
app.use('/api', routes);

// 404 and Error Handling
app.use(notFound);
app.use(errorHandler);

export default app;
