import { logger } from '../lib/logger.js';

export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let errors = err.errors || null;

  // Handle Prisma Known Request Errors
  if (err.code === 'P2002') {
    statusCode = 409;
    const target = Array.isArray(err.meta?.target) ? err.meta.target.join(', ') : err.meta?.target;
    message = `Duplicate entry error: Unique constraint failed on field(s): ${target || 'unknown'}`;
  } else if (err.code === 'P2025') {
    statusCode = 404;
    message = err.meta?.cause || 'Record to update/delete not found';
  } else if (err.message && (err.message.includes('no_overlap') || err.message.includes('exclusion constraint'))) {
    statusCode = 409;
    message = 'This court is already booked for that time (overlap detected)';
  }

  if (statusCode >= 500) {
    logger.error({ err, path: req.path, method: req.method }, 'Unhandled server error');
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
