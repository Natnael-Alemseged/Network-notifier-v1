import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

// Get connection string from env
const connectionString = process.env.DATABASE_URL;

// Create Prisma adapter only if connection string exists
let adapter;
if (connectionString) {
    const pool = new pg.Pool({ connectionString });
    adapter = new PrismaPg(pool);
}

// Ensure singleton across hot reloads in development
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const db =
    globalForPrisma.prisma ||
    new PrismaClient({
        adapter,
        log: ['query'], // Optional: keep your query logs
    })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
