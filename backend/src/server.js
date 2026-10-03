import http from 'node:http';
import app from './app.js';
import { env } from './config/env.js';
import { initSocket } from './lib/socket.js';
import { startJobs } from './jobs/index.js';
import { logger } from './lib/logger.js';

const server = http.createServer(app);

initSocket(server);
startJobs();

server.listen(env.PORT, () => {
  logger.info(`Sports Club Management Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error({ reason }, 'Unhandled Rejection at Promise');
});

process.on('uncaughtException', (error) => {
  logger.error({ error: error.message, stack: error.stack }, 'Uncaught Exception thrown');
});
