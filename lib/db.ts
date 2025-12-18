import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

// Get connection string from env
const connectionString = process.env.DATABASE_URL!
if (!connectionString) throw new Error('DATABASE_URL is not set')

// Create PostgreSQL pool
const pool = new pg.Pool({ connectionString })

// Create Prisma adapter
const adapter = new PrismaPg(pool)

// Ensure singleton across hot reloads in development
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const db =
    globalForPrisma.prisma ||
    new PrismaClient({
        adapter,
        log: ['query'], // Optional: keep your query logs
    })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
