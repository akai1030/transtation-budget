import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { projectId, name, budget } = body

    if (!projectId || !name || budget === undefined) {
        throw createError({ statusCode: 400, statusMessage: "Missing required fields" })
    }

    try {
        const newLine = await prisma.budgetLine.create({
            data: {
                projectId,
                name,
                budget: Number(budget)
            }
        })
        return { success: true, budgetLine: newLine }
    } catch (e) {
        console.error(e)
        throw createError({ statusCode: 500, statusMessage: "Failed to create budget line" })
    }
})
