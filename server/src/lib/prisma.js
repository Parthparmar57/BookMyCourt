import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  // Default budget for every interactive $transaction. The 5s Prisma default is
  // too tight for multi-step writes against a remote/pooled database (P2028
  // "transaction already closed" under normal latency). Raising it centrally
  // covers all call sites; individual transactions can still override.
  transactionOptions: {
    maxWait: 10000, // max time to wait for a connection from the pool
    timeout: 20000, // max time the interactive transaction may run
  },
});
