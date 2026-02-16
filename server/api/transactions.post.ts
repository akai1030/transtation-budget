import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    if (body.action === 'expense') {
        return await handleExpense(body);
    }

    if (body.action === 'transfer') {
        return await handleTransfer(body);
    }

    return { success: false, message: "Unknown action" }
})

async function handleTransfer(payload: any) {
    const { date, toUser, amount, description, type } = payload

    const user = await prisma.user.findUnique({ where: { name: toUser } })
    if (!user) throw createError({ statusCode: 400, statusMessage: "User not found" })

    const result = await prisma.$transaction(async (tx) => {
        // Transfer is always an "Income" for the user (Top-up or Reimbursement)
        // From Company (projectId: null) to User
        const newTx = await tx.transaction.create({
            data: {
                date: new Date(date),
                amount: Number(amount),
                isIncome: true, // User receives money
                description: description || (type === 'reimburse' ? '代墊款歸還' : '零用金撥補'),
                subject: type === 'reimburse' ? '還款' : '撥款',
                userId: user.id,
                projectId: null, // From Company
                budgetLineCategory: 'Internal Transfer',
                currency: "TWD"
            }
        })

        await tx.user.update({
            where: { id: user.id },
            data: {
                pettyCash: { increment: Number(amount) }
            }
        })

        return [newTx]
    })

    return { success: true, transactions: result }
}

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
                    pettyCash: { decrement: Number(item.amount) } // Expense DECREASES cash on hand
                }
            })
        }

        return createdTxs
    })

    return { success: true, transactions: result }
}
