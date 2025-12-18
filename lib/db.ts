import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'



// Ensure singleton across hot reloads in development
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const db = new Proxy({} as PrismaClient, {
    get(target, prop) {
        if (!globalForPrisma.prisma) {
            const connectionString = process.env.DATABASE_URL;
            let adapter;
            if (connectionString) {
                const pool = new pg.Pool({ connectionString });
                adapter = new PrismaPg(pool);
            }

            globalForPrisma.prisma = new PrismaClient({
                adapter,
                log: ['query'],
            });
        }
        return (globalForPrisma.prisma as any)[prop];
    }
});
