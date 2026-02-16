import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('⚖️ Balancing Historic Expenses...')

    // 1. Calculate Total Historic Expenses (System Level)
    const expenseAgg = await prisma.transaction.aggregate({
        where: { projectId: null, isIncome: false },
        _sum: { amount: true }
    })
    const totalHistoricExpenses = expenseAgg._sum.amount || 0
    console.log(`   -> Found Historic Expenses: -$${totalHistoricExpenses.toLocaleString()}`)

    if (totalHistoricExpenses === 0) {
        console.log('   -> No expenses to offset. Done.')
        return
    }

    // 2. Create Offsetting Income
    // We label it clearly so it's understood as an adjustment
    await prisma.transaction.create({
        data: {
            date: new Date('2025-01-01'), // Set to past
            amount: totalHistoricExpenses,
            subject: '歷史帳務結算',
            description: 'Offset for historic project expenses (Break-even)',
            isIncome: true,
            projectId: null,
            userId: (await prisma.user.findFirst())?.id || '',
            budgetLineCategory: '系統調整'
        }
    })

    console.log(`   -> Created Adjustment Income: +$${totalHistoricExpenses.toLocaleString()}`)
    console.log('✅ Balance Reset Complete.')
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
