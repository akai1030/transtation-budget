import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🔍 Checking User Petty Cash Balances...')

    const users = await prisma.user.findMany()

    let totalNegativeValues = 0 // Liability (Company owes Users)
    let totalPositiveValues = 0 // Asset (Users owe Company)
    let netSum = 0

    console.log('\n--- User Balances ---')
    for (const u of users) {
        console.log(`[${u.name}] Petty Cash: $${u.pettyCash.toLocaleString()}`)
        netSum += u.pettyCash

        if (u.pettyCash < 0) {
            totalNegativeValues += Math.abs(u.pettyCash)
        } else {
            totalPositiveValues += u.pettyCash
        }
    }

    console.log('\n--- Summary ---')
    console.log(`👉 Total Liability (Company owes Users): $${totalNegativeValues.toLocaleString()}`)
    console.log(`👉 Total Receivables (Users owe Company): $${totalPositiveValues.toLocaleString()}`)
    console.log(`👉 Net Petty Cash Sum: $${netSum.toLocaleString()}`)
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
