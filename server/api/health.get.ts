import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    try {
        // Simple query to check connection
        const userCount = await prisma.user.count();

        // Get DB URL safe string
        // We can't access private variables easily unless we parse process.env.DATABASE_URL
        // But we can return the count to prove it's the right DB.

        const dbUrl = process.env.DATABASE_URL || '';
        const maskedUrl = dbUrl.length > 20
            ? `...${dbUrl.substring(dbUrl.indexOf('@') + 1)}`
            : 'Not Set';

        return {
            status: 'OK',
            message: 'Database Connected',
            userCount,
            connectedTo: maskedUrl,
            time: new Date().toISOString()
        }
    } catch (e) {
        return {
            status: 'Error',
            message: 'Database Connection Failed',
            error: e instanceof Error ? e.message : String(e),
            env_check: process.env.DATABASE_URL ? 'DATABASE_URL is Set' : 'DATABASE_URL is MISSING'
        }
    }
})
