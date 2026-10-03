import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';

/**
 * Record who created/changed/cancelled a significant entity (NFR: audit).
 * Best-effort — a failure to write the audit trail must never break the action.
 * Pass an interactive transaction client to keep the audit atomic with the change.
 */
export const writeAudit = async (client, { actorId, action, entity, entityId, meta } = {}) => {
  try {
    await (client || prisma).auditLog.create({
      data: {
        actorId: actorId || null,
        action,
        entity,
        entityId: entityId || null,
        meta: meta ?? undefined,
      },
    });
  } catch (err) {
    logger.warn({ err: err.message, action, entity }, 'Failed to write audit log');
  }
};
