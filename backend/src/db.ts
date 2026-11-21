import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const rawDbUrl = process.env.DATABASE_URL;
// When Prisma schema is configured for sqlite, only pass datasource URL if it uses 'file:'
const isPostgresUrl = rawDbUrl && rawDbUrl.startsWith('postgresql:');
const dbUrl = isPostgresUrl ? undefined : rawDbUrl;

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
