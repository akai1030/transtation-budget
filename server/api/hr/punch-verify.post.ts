import prisma from '~/server/utils/prisma'
import { createHash } from 'node:crypto'

export default defineEventHandler(async (event) => {
    const { name, pin } = await readBody(event)

    if (!name || !pin) {
        throw createError({ statusCode: 400, statusMessage: 'Missing name or pin.' })
    }

    const identity = await prisma.punchIdentity.findUnique({ where: { name: name.trim() } })
    if (!identity) {
        throw createError({ statusCode: 404, statusMessage: 'Name not found.' })
    }

    const pinHash = createHash('sha256').update(pin).digest('hex')
    if (pinHash !== identity.pinHash) {
        throw createError({ statusCode: 401, statusMessage: 'Wrong PIN.' })
    }

    return { ok: true }
})
