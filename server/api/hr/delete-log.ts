import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { id, name } = body

    if (!id) {
        throw createError({ statusCode: 400, statusMessage: 'Missing log ID.' })
    }

    // Only allow deleting unsettled logs
    const log = await prisma.workLog.findUnique({ where: { id } })

    if (!log) {
        throw createError({ statusCode: 404, statusMessage: 'Log not found.' })
    }

    if (log.isSettled) {
        throw createError({ statusCode: 400, statusMessage: 'Cannot delete settled logs.' })
    }

    // If request comes without admin session, verify name ownership
    const session = await getUserSession(event)
    if (!session?.user) {
        if (!name || log.targetName !== name.trim()) {
            throw createError({ statusCode: 403, statusMessage: 'Forbidden.' })
        }
    }

    await prisma.workLog.delete({ where: { id } })

    return { success: true }
})
