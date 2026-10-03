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

// The overlap/stock guarantees live in prisma/migrations/manual_constraints.sql,
// which `prisma db push` does NOT apply. Verify the critical one is present so the
// server never runs without its data-integrity guarantees (Issue #14).
const verifyDbConstraints = async () => {
  try {
    const rows = await prisma.$queryRaw`SELECT 1 FROM pg_constraint WHERE conname = 'booking_no_overlap'`;
    if (!rows || rows.length === 0) {
      const msg =
        'Missing DB constraint "booking_no_overlap". Apply prisma/migrations/manual_constraints.sql ' +
        '(psql "$DATABASE_URL" -f prisma/migrations/manual_constraints.sql).';
      if (env.NODE_ENV === 'production') {
        logger.error(msg);
        process.exit(1);
      }
      logger.warn(msg);
    } else {
      logger.info('DB integrity constraints verified.');
    }
  } catch (err) {
    logger.warn({ err: err.message }, 'Could not verify DB constraints');
  }
};

server.listen(env.PORT, () => {
  logger.info(`Sports Club Management Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
  verifyDbConstraints();
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
