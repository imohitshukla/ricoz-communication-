import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:qrgzOLMITztpNZLsvWeCkOsMJqtzPzfA@switchyard.proxy.rlwy.net:49350/railway';

// Singleton: prevents multiple PrismaClient instances from being created
// which would exhaust the DB connection pool on Railway free tier.
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma =
  global.__prisma ??
  new PrismaClient({
    datasources: dbUrl
      ? {
          db: {
            url: dbUrl,
          },
        }
      : undefined,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.__prisma = prisma;
}
