import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    // Fetch pending logs
    const pending = await prisma.workLog.findMany({
        where: { isSettled: false },
        orderBy: { date: 'asc' }
    })

    // Fetch settled logs (limit to recent 50)
    const settled = await prisma.workLog.findMany({
        where: { isSettled: true },
        orderBy: { date: 'desc' },
        take: 50,
        include: {
            user: { select: { name: true } }
        }
    })

    return { pending, settled }
})
