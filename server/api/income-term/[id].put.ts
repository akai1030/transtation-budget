import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const id = event.context.params.id
    const body = await readBody(event)

    if (!id) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Missing ID',
        })
    }

    try {
        // Validation?
        // 1. Update the term
        const incomeTerm = await prisma.incomeTerm.update({
            where: { id },
            data: {
                ...body,
                amount: body.amount ? Number(body.amount) : undefined
            },
            include: { project: true }
        })

        // 2. If status changed to 'received', allow generating transactions
        if (body.status === 'received' && incomeTerm.project) {

            // Check if transaction already exists for this term to avoid duplicates? 
            // For now, assume simpler logic or trusting the user interaction.

            // A. Create Income Transaction
            await prisma.transaction.create({
                data: {
                    date: new Date(),
                    amount: incomeTerm.amount,
                    description: `[收款確認] ${incomeTerm.name}`,
                    subject: '專案進帳',
                    isIncome: true,
                    projectId: incomeTerm.projectId,
                    userId: body.operatorId || 'system', // Needs operator
                    category: '進帳' // Or similar
                }
            })

            // B. Create Retention Transaction (Expense)
            const rate = incomeTerm.project.retention || 10
            const retentionAmount = Math.floor(incomeTerm.amount * (rate / 100))

            if (retentionAmount > 0) {
                await prisma.transaction.create({
                    data: {
                        date: new Date(),
                        amount: retentionAmount,
                        description: `[系統提撥] ${rate}% 至公司總帳`,
                        subject: '公司提撥',
                        isIncome: false,
                        projectId: incomeTerm.projectId,
                        userId: body.operatorId || 'system',
                        category: '提撥'
                    }
                })
            }
        }

        return { success: true, incomeTerm }
    } catch (e) {
        console.error('Update IncomeTerm Error:', e)
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to update income term',
        })
    }
})
