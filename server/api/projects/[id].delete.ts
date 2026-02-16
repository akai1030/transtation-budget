import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const id = event.context.params.id

    if (!id) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Missing Project ID',
        })
    }

    try {
        // Use a transaction to ensure clean deletion
        await prisma.$transaction(async (tx) => {
            // 0. Rollback User Petty Cash (Claims)
            // Find all expenses in this project that are NOT 'Company Retention'
            // We assume 'Company Retention' / 'System' items don't affect Petty Cash.
            // Filter by isIncome: false AND category != '提撥' (Retention)
            const expensesToDelete = await tx.transaction.findMany({
                where: {
                    projectId: id,
                    isIncome: false,
                    NOT: {
                        subject: '公司提撥' // Safest check based on creation logic
                    }
                }
            })

            // Group by User and Decrement Petty Cash
            const userAdjustments: Record<string, number> = {}
            for (const t of expensesToDelete) {
                userAdjustments[t.userId] = (userAdjustments[t.userId] || 0) + t.amount
            }

            for (const [userId, totalAmount] of Object.entries(userAdjustments)) {
                await tx.user.update({
                    where: { id: userId },
                    data: {
                        pettyCash: { decrement: totalAmount }
                    }
                })
            }

            // 1. Delete associated transactions (Income & Expenses & Retention)
            await tx.transaction.deleteMany({
                where: { projectId: id }
            })

            // 2. Delete Income Terms
            await tx.incomeTerm.deleteMany({
                where: { projectId: id }
            })

            // 3. Delete Budget Lines
            await tx.budgetLine.deleteMany({
                where: { projectId: id }
            })

            // 4. Delete the Project itself
            await tx.project.delete({
                where: { id }
            })
        })

        return { success: true }
    } catch (e) {
        console.error('Delete Project Error:', e)
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to delete project',
        })
    }
})
