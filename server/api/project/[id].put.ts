import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const id = event.context.params?.id
    const body = await readBody(event)

    if (!id) throw createError({ statusCode: 400, statusMessage: "ID is required" })

    try {
        // Only support updating 'isArchived' for now, can extend later
        const updatedProject = await prisma.project.update({
            where: { id },
            data: {
                isArchived: body.isArchived,
                description: body.description // Optional
            }
        })

        return { success: true, project: updatedProject }
    } catch (e: unknown) {
        console.error(e)
        const message = e instanceof Error ? e.message : String(e)
        throw createError({ statusCode: 500, statusMessage: message })
    }
})
