import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🔍 Analyzing Company Income Sources...')

    // 1. Fetch Projects to calculate Retention
    const projects = await prisma.project.findMany({
        include: { incomeTerms: true }
    })

    let totalRetention = 0
    console.log('\n--- Project Retention (10% standard) ---')
    for (const p of projects) {
        // Calculate received revenue
        const revenue = p.incomeTerms
            .filter(t => t.status === 'received')
            .reduce((sum, t) => sum + t.amount, 0)

        if (revenue > 0) {
            const retentionRate = p.retention || 10
            const contribution = Math.floor(revenue * (retentionRate / 100))
            totalRetention += contribution
            console.log(`[${p.name}] Revenue: $${revenue.toLocaleString()} => Retention (${retentionRate}%): $${contribution.toLocaleString()}`)
        }
    }
    console.log(`\n👉 Total Project Retention: $${totalRetention.toLocaleString()}`)

    // 2. Fetch System Income (Other Income)
    const systemIncomeTxs = await prisma.transaction.findMany({
        where: {
            projectId: null,
            isIncome: true
        }
    })

    const totalSystemIncome = systemIncomeTxs.reduce((sum, t) => sum + t.amount, 0)
    console.log(`\n--- Other Company Income (System Level) ---`)
    if (systemIncomeTxs.length > 0) {
        systemIncomeTxs.forEach(t => {
            console.log(`[${t.date.toISOString().split('T')[0]}] ${t.item}: $${t.amount.toLocaleString()}`)
        })
    } else {
        console.log('(None)')
    }
    console.log(`\n👉 Total Other Income: $${totalSystemIncome.toLocaleString()}`)

    // 3. Grand Total
    const grandTotal = totalRetention + totalSystemIncome
    console.log(`\n💰 GRAND TOTAL INCOME: $${grandTotal.toLocaleString()}`)
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
