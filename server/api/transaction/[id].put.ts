import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const id = event.context.params?.id
    const body = await readBody(event)

    if (!id) throw createError({ statusCode: 400, statusMessage: "ID is required" })

    try {
        const result = await prisma.$transaction(async (tx) => {
            // 1. Get original transaction
            const originalTx = await tx.transaction.findUnique({ where: { id } })
            if (!originalTx) throw new Error("Transaction not found")

            // 2. Revert logic for old amount
            // If Expense: User Paid -> Petty Cash Increased. Revert = Decrement old amount.
            if (!originalTx.isIncome) {
                await tx.user.update({
                    where: { id: originalTx.userId },
                    data: { pettyCash: { decrement: originalTx.amount } }
                })
            } else {
                // Income logic (placeholder)
                await tx.user.update({
                    where: { id: originalTx.userId },
                    data: { pettyCash: { increment: originalTx.amount } }
                })
            }

            // 3. Update Transaction
            const updatedTx = await tx.transaction.update({
                where: { id },
                data: {
                    date: new Date(body.date),
                    amount: Number(body.amount),
                    description: body.description,
                    projectId: body.projectId,
                    budgetLineCategory: body.category,
                    photoUrl: body.photoUrl,
                    // Note: We don't usually allowing changing 'payer' (userId) easily as it complicates balance calc logic heavily.
                    // Assuming payer stays same for now for simplicity.
                }
            })

            // 4. Apply new amount to User Balance
            if (!updatedTx.isIncome) {
                await tx.user.update({
                    where: { id: updatedTx.userId },
                    data: { pettyCash: { increment: updatedTx.amount } }
                })
            } else {
                await tx.user.update({
                    where: { id: updatedTx.userId },
                    data: { pettyCash: { decrement: updatedTx.amount } }
                })
            }

            return updatedTx
        })

        return { success: true, transaction: result }
    } catch (e: unknown) {
        console.error(e)
        const message = e instanceof Error ? e.message : String(e)
        throw createError({ statusCode: 500, statusMessage: message })
    }
})
