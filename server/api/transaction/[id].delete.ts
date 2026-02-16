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
            // If it was an expense (isIncome=false), we incremented pettyCash (claims).
            // So to revert, we decrement.
            // If isIncome=true, we decremented pettyCash (owed to company? or just received cash?). 
            // Wait, current logic: Expense -> User Paid -> User Petty Cash (Claims) INCREASES.
            // So Revert Expense -> User Petty Cash DECREASES.

            if (!transaction.isIncome) {
                await tx.user.update({
                    where: { id: transaction.userId },
                    data: { pettyCash: { decrement: transaction.amount } }
                })
            } else {
                // Income logic not fully defined yet, assuming opposite
                await tx.user.update({
                    where: { id: transaction.userId },
                    data: { pettyCash: { increment: transaction.amount } }
                })
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
