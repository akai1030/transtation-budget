import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { name } = body

    if (!name || typeof name !== 'string' || name.trim() === '') {
        throw createError({ statusCode: 400, statusMessage: "使用者名稱不得為空" })
    }

    try {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { name: name.trim() }
        })

        if (existingUser) {
            throw createError({ statusCode: 400, statusMessage: "該使用者名稱已存在" })
        }

        const newUser = await prisma.user.create({
            data: {
                name: name.trim(),
                pettyCash: 0
            }
        })

        return { success: true, user: newUser }
    } catch (e: any) {
        console.error('API Error /api/users:', e)
        throw createError({
            statusCode: e.statusCode || 500,
            statusMessage: e.statusMessage || '建立使用者失敗'
        })
    }
})
