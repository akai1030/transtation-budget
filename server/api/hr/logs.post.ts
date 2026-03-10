import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { userId, targetName, date, hours, hourlyRate, description } = body

    // One of them is required
    if (!userId && !targetName) {
        throw createError({ statusCode: 400, statusMessage: 'Requires a system user or a custom target name.' })
    }

    const log = await prisma.workLog.create({
        data: {
            userId: userId || null,
            targetName: targetName || null,
            date: new Date(date),
            hours: Number(hours),
            hourlyRate: Number(hourlyRate),
            amount: Math.round(Number(hours) * Number(hourlyRate)),
            description: description || null
        }
    })

    return log
})
