import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const id = event.context.params?.id
    if (!id) throw createError({ statusCode: 400, statusMessage: "ID is required" })

    try {
        const result = await prisma.$transaction(async (tx) => {
            // 1. Get transaction to know amount and user
            const transaction = await tx.transaction.findUnique({ where: { id } })
            if (!transaction) throw new Error("Transaction not found")

            // 2. Revert User Balance
            // Only revert if the transaction actually affected the user's pettyCash.
            // Pure company records (projectId: null AND category !== 'Internal Transfer') do NOT affect pettyCash.
            const isPureCompanyRecord = transaction.projectId === null && transaction.budgetLineCategory !== 'Internal Transfer';

            if (!isPureCompanyRecord) {
                // In handleExpense (isIncome=false), we DECREMENTED pettyCash (cash goes out).
                // So to revert an expense, we INCREMENT pettyCash back.
                // In handleTransfer (isIncome=true), we INCREMENTED pettyCash (cash received).
                // So to revert an income, we DECREMENT pettyCash.
                if (!transaction.isIncome) {
                    await tx.user.update({
                        where: { id: transaction.userId },
                        data: { pettyCash: { increment: transaction.amount } }
                    })
                } else {
                    await tx.user.update({
                        where: { id: transaction.userId },
                        data: { pettyCash: { decrement: transaction.amount } }
                    })
                }
            }

            // 3. Delete Transaction
            await tx.transaction.delete({ where: { id } })

            return true
        })

        return { success: true }
    } catch (e: unknown) {
        console.error(e)
        const message = e instanceof Error ? e.message : String(e)
        throw createError({ statusCode: 500, statusMessage: message })
    }
})
