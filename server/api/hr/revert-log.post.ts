import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { id } = body

    if (!id) {
        throw createError({ statusCode: 400, statusMessage: 'Missing log ID.' })
    }

    // 將指定的工時紀錄設為未結算，並清空結算關聯
    const updatedLog = await prisma.workLog.update({
        where: { id },
        data: {
            isSettled: false,
            transactionId: null,
            settledById: null
        }
    })

    return updatedLog
})
