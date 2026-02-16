import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🔍 Analyzing Company Balance Breakdown...')

    // 1. Calculate Project Retention (Income)
    const projects = await prisma.project.findMany({ include: { incomeTerms: true } })
    let totalRetention = 0

    console.log('\n--- 1. Project Retention (Income) ---')
    for (const p of projects) {
        const revenue = p.incomeTerms
            .filter(t => t.status === 'received')
            .reduce((sum, t) => sum + t.amount, 0)

        if (revenue > 0) {
            const retentionAmount = Math.floor(revenue * (p.retention / 100))
            totalRetention += retentionAmount
            console.log(`[${p.name}] Revenue: $${revenue.toLocaleString()} => Retention (${p.retention}%): +$${retentionAmount.toLocaleString()}`)
        }
    }
    console.log(`👉 Total Retention Income: +$${totalRetention.toLocaleString()}`)

    // 2. System Income (Other)
    const otherIncomeAgg = await prisma.transaction.aggregate({
        where: { projectId: null, isIncome: true },
        _sum: { amount: true }
    })
    const otherIncome = otherIncomeAgg._sum.amount || 0
    console.log(`\n--- 2. Other System Income ---`)
    console.log(`👉 Total Other Income: +$${otherIncome.toLocaleString()}`)

    // 3. System Expenses (Migrated Petty Cash)
    const expenseAgg = await prisma.transaction.aggregate({
        where: { projectId: null, isIncome: false },
        _sum: { amount: true }
    })
    const totalExpenses = expenseAgg._sum.amount || 0
    console.log(`\n--- 3. System Expenses (Migrated History) ---`)
    console.log(`👉 Total Expenses: -$${totalExpenses.toLocaleString()}`)

    // 4. Final Balance
    const balance = totalRetention + otherIncome - totalExpenses
    console.log(`\n💰 FINAL BALANCE: $${balance.toLocaleString()}`)
    console.log(`   (= ${totalRetention} + ${otherIncome} - ${totalExpenses})`)
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
