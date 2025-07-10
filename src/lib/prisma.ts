import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// eslint-disable-next-line no-undef
export const prisma = (globalThis as any).prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  // eslint-disable-next-line no-undef
  (globalThis as any).prisma = prisma;
}