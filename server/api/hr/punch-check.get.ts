import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
    const { name } = getQuery(event)
    if (!name || typeof name !== 'string') {
        throw createError({ statusCode: 400, statusMessage: 'Missing name.' })
    }

    const identity = await prisma.punchIdentity.findUnique({
        where: { name: name.trim() }
    })

    return { exists: !!identity }
})
