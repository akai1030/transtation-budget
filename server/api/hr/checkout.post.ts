import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { logIds, projectId, settledById } = body

    if (!logIds || !logIds.length) {
        throw createError({ statusCode: 400, statusMessage: 'No logs provided for checkout.' })
    }

    // 1. Calculate total checkout amount
    const logsToSettle = await prisma.workLog.findMany({
        where: {
            id: { in: logIds },
            isSettled: false
        }
    })

    if (logsToSettle.length === 0) {
        throw createError({ statusCode: 400, statusMessage: 'These logs are already settled or invalid.' })
    }

    const totalAmount = logsToSettle.reduce((sum, log) => sum + log.amount, 0)
    const descriptionLines = logsToSettle.map(l => `${l.targetName || l.userId}: ${l.hours}h`).join(', ')

    // 2. Wrap everything in a Prisma transaction
    const result = await prisma.$transaction(async (tx) => {

        // 建立一筆支出交易 (Transaction)
        const transaction = await tx.transaction.create({
            data: {
                date: new Date(),
                amount: totalAmount,
                isIncome: false,
                subject: '人事工時結算結帳',
                description: `包含 ${logsToSettle.length} 筆工時紀錄。(${descriptionLines})`,
                userId: settledById, // 記錄操作者
                projectId: projectId || null, // 綁定特定專案或公司營運成本
            }
        })

        // 將所有的 WorkLog 標記為已結算，並綁定 Transaction ID 與 操作者 ID
        const updatedLogs = await tx.workLog.updateMany({
            where: { id: { in: logsToSettle.map(l => l.id) } },
            data: {
                isSettled: true,
                transactionId: transaction.id,
                settledById: settledById
            }
        })

        return { transaction, updatedLogsCount: updatedLogs.count }
    })

    return result
})
