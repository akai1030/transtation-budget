import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { projectId, name, amount, date } = body

    if (!projectId || !amount) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Missing fields',
        })
    }

    try {
        const term = await prisma.incomeTerm.create({
            data: {
                projectId,
                name: name || '新收款項',
                amount: Number(amount),
                date: date ? new Date(date) : undefined,
                status: 'pending'
            }
        })
        return { success: true, term }
    } catch (e) {
        console.error('Create IncomeTerm Error:', e)
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to create income term',
        })
    }
})
