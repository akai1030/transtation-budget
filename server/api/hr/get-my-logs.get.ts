import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
    const { name } = getQuery(event)

    if (!name || typeof name !== 'string' || !name.trim()) {
        return { pending: [], settled: [] }
    }

    const [pending, settled] = await Promise.all([
        prisma.workLog.findMany({
            where: { targetName: name.trim(), isSettled: false },
            orderBy: { date: 'desc' }
        }),
        prisma.workLog.findMany({
            where: { targetName: name.trim(), isSettled: true },
            orderBy: { date: 'desc' },
            take: 20
        })
    ])

    return { pending, settled }
})
