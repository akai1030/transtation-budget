import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { name, totalBudget, retention, description } = body

    if (!name || !totalBudget) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Missing required fields: name, totalBudget',
        })
    }

    try {
        const project = await prisma.project.create({
            data: {
                name,
                totalBudget: Number(totalBudget),
                retention: Number(retention || 10),
                description,
                isArchived: false,
                // Optional: Create default income terms or budget lines?
                // For now, let's keep it simple.
            }
        })

        return { success: true, project }
    } catch (e) {
        console.error('Create Project Error:', e)
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to create project',
        })
    }
})
