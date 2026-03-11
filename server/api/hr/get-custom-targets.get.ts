import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    // 取得所有具有 targetName 的不重複姓名清單
    const logs = await prisma.workLog.findMany({
        where: {
            targetName: { not: null }
        },
        select: {
            targetName: true
        },
        distinct: ['targetName']
    })

    return logs.map(l => l.targetName).filter(Boolean)
})
