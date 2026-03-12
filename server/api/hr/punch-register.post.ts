import prisma from '~/server/utils/prisma'
import { createHash } from 'node:crypto'

export default defineEventHandler(async (event) => {
    const { name, pin } = await readBody(event)

    if (!name || !pin) {
        throw createError({ statusCode: 400, statusMessage: 'Missing name or pin.' })
    }
    if (!/^\d{4}$/.test(pin)) {
        throw createError({ statusCode: 400, statusMessage: 'PIN must be 4 digits.' })
    }

    const existing = await prisma.punchIdentity.findUnique({ where: { name: name.trim() } })
    if (existing) {
        throw createError({ statusCode: 409, statusMessage: 'Name already registered.' })
    }

    const pinHash = createHash('sha256').update(pin).digest('hex')
    await prisma.punchIdentity.create({
        data: { name: name.trim(), pinHash }
    })

    return { ok: true }
})
