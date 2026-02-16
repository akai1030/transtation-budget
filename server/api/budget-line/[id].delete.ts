import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')

    try {
        await prisma.budgetLine.delete({
            where: { id }
        })
        return { success: true }
    } catch (e) {
        console.error(e)
        throw createError({ statusCode: 500, statusMessage: "Failed to delete budget line" })
    }
})
