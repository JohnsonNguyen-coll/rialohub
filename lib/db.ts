import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

// In Prisma 7, we pass the datasource URL directly to the constructor 
// to avoid "engine type client" errors on Vercel
export const prisma =
      globalForPrisma.prisma ||
      new PrismaClient({
            datasourceUrl: process.env.DATABASE_URL,
            log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
