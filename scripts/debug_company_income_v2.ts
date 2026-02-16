import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🔍 Analyzing Company Income Sources (Detailed)...')

    const systemIncomeTxs = await prisma.transaction.findMany({
        where: {
            projectId: null,
            isIncome: true
        }
    })

    if (systemIncomeTxs.length > 0) {
        systemIncomeTxs.forEach(t => {
            console.log(`[${t.date.toISOString().split('T')[0]}] Amount: $${t.amount.toLocaleString()}`)
            console.log(`\tSubject: ${t.subject}`)
            console.log(`\tDescription: ${t.description}`)
            console.log(`\tCategory: ${t.budgetLineCategory}`)
            console.log('------------------------------------------------')
        })
    } else {
        console.log('(None)')
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
