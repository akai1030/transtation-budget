import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { id } = body

    if (!id) {
        throw createError({ statusCode: 400, statusMessage: 'Missing log ID.' })
    }

    // Only allow deleting unsettled logs
    const log = await prisma.workLog.findUnique({
        where: { id }
    })

    if (!log) {
        throw createError({ statusCode: 404, statusMessage: 'Log not found.' })
    }

    if (log.isSettled) {
        throw createError({ statusCode: 400, statusMessage: 'Cannot delete settled logs.' })
    }

    await prisma.workLog.delete({
        where: { id }
    })

    return { success: true }
})
