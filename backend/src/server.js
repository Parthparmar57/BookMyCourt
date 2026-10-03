import http from 'node:http';
import app from './app.js';
import { env } from './config/env.js';
import { initSocket, getIO } from './lib/socket.js';
import { startJobs } from './jobs/index.js';
import { logger } from './lib/logger.js';
import { prisma } from './lib/prisma.js';

const server = http.createServer(app);

initSocket(server);
startJobs();

server.listen(env.PORT, () => {
  logger.info(`Sports Club Management Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
});

// Graceful shutdown: stop accepting connections, close sockets and the DB pool,
// then exit — so deploys/restarts don't drop in-flight work or leak connections.
let shuttingDown = false;
const shutdown = async (signal) => {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info({ signal }, 'Shutting down gracefully...');

  const io = getIO();
  if (io) io.close();

  server.close(async () => {
    try {
      await prisma.$disconnect();
    } catch (err) {
      logger.error({ err: err.message }, 'Error disconnecting Prisma');
    }
    process.exit(0);
  });

  // Force-exit if close hangs.
  setTimeout(() => process.exit(1), 10000).unref();
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error({ reason }, 'Unhandled Rejection at Promise');
});

process.on('uncaughtException', (error) => {
  // The process is in an undefined state after an uncaught exception — log and exit
  // so a supervisor can restart it cleanly (Node's documented guidance).
  logger.error({ error: error.message, stack: error.stack }, 'Uncaught Exception thrown');
  shutdown('uncaughtException');
});
