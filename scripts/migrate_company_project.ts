import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🚀 Starting Company Project Migration...')

    // 1. Find the Company Project
    const companyProject = await prisma.project.findFirst({
        where: {
            OR: [
                { name: { contains: '公司總帳' } },
                { name: { contains: 'Company General Ledger' } }
            ]
        }
    })

    if (!companyProject) {
        console.log('❌ Company Project not found. Aborting.')
        return
    }

    console.log(`✅ Found Company Project: ${companyProject.name} (${companyProject.id})`)

    // 2. Identify Transactions to Migrate
    const transactionsToMigrate = await prisma.transaction.findMany({
        where: { projectId: companyProject.id }
    })

    console.log(`📊 Found ${transactionsToMigrate.length} transactions to migrate.`)

    // 3. Perform Migration in a Transaction
    await prisma.$transaction(async (tx) => {
        // A. Update Transactions: Set projectId to NULL
        // Note: We need to ensure budgetLineCategory matches roughly what we want, 
        // but for now we keep the category as is.
        await tx.transaction.updateMany({
            where: { projectId: companyProject.id },
            data: {
                projectId: null,
                // Ensure isIncome is correct based on logic (usually expenses)
                // If it was an expense in the project, it remains an expense for the company
            }
        })
        console.log('🔄 Transactions updated to System Level (projectId: null).')

        // B. Delete related IncomeTerms (if any - unlikely for Company Ledger but good to check)
        await tx.incomeTerm.deleteMany({
            where: { projectId: companyProject.id }
        })
        console.log('🗑️  Related IncomeTerms deleted.')

        // C. Delete related BudgetLines
        await tx.budgetLine.deleteMany({
            where: { projectId: companyProject.id }
        })
        console.log('🗑️  Related BudgetLines deleted.')

        // D. Delete the Project itself
        await tx.project.delete({
            where: { id: companyProject.id }
        })
        console.log('🔥 Company Project entity deleted.')
    })

    console.log('🎉 Migration Complete!')
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
