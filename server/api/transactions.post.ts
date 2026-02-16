import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    if (body.action === 'expense') {
        return await handleExpense(body);
    }

    return { success: false, message: "Unknown action" }
})

async function handleExpense(payload: any) {
    const { date, payer, items } = payload

    const user = await prisma.user.findUnique({ where: { name: payer } })
    if (!user) throw createError({ statusCode: 400, statusMessage: "User not found" })

    const result = await prisma.$transaction(async (tx) => {
        const createdTxs = []

        for (const item of items) {
            const newTx = await tx.transaction.create({
                data: {
                    date: new Date(date),
                    amount: Number(item.amount),
                    isIncome: false,
                    description: item.description,
                    subject: item.subject,
                    userId: user.id,
                    projectId: item.projectId || null, // Allow null for Company Expenses
                    budgetLineId: item.budgetLineId || null,
                    budgetLineCategory: item.category, // Now represents 'Expense Category' (e.g. Lecture Fee)lds
                    // New Fields
                    currency: item.currency || "TWD",
                    photoUrl: item.photoUrl || null
                }
            })
            createdTxs.push(newTx)

            await tx.user.update({
                where: { id: user.id },
                data: {
                    pettyCash: { increment: Number(item.amount) }
                }
            })
        }

        return createdTxs
    })

    return { success: true, transactions: result }
}
