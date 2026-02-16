import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')
    const body = await readBody(event)

    try {
        const updated = await prisma.budgetLine.update({
            where: { id },
            data: {
                name: body.name,
                budget: body.budget ? Number(body.budget) : undefined
            }
        })
        return { success: true, budgetLine: updated }
    } catch (e) {
        console.error(e)
        throw createError({ statusCode: 500, statusMessage: "Failed to update budget line" })
    }
})
