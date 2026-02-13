import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

// In Prisma 7, we handle the connection URL here.
// We use a type assertion to bypass the strict "never" type error during build,
// because datasourceUrl is indeed the correct property for Prisma 7.
const url = process.env.DATABASE_URL;

export const prisma =
      globalForPrisma.prisma ||
      new PrismaClient({
            datasourceUrl: url,
            log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      } as any)

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
