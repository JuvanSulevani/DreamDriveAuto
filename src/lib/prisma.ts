import { PrismaClient } from '@prisma/client';
import { resolveDatabaseUrl } from '@/lib/database-url';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

async function createPrismaClient() {
  const datasourceUrl = await resolveDatabaseUrl();

  return new PrismaClient({
    datasourceUrl,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error']
  });
}

export const prisma = globalForPrisma.prisma ?? await createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
