import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🚨 STARTING DATA RESET AND MIGRATION 🚨')

    // 1. Preserve Petty Cash (User Expenses)
    console.log('Step 1: Migrating User Expenses to Company Ledger...')
    const updateResult = await prisma.transaction.updateMany({
        where: {
            projectId: { not: null }, // Linked to old projects
            isIncome: false,          // Is an expense
            userId: { not: undefined } // Linked to a user (Petty Cash)
        },
        data: {
            projectId: null,
            budgetLineCategory: null // Clear category as budget lines will be deleted
        }
    })
    console.log(`   -> Migrated ${updateResult.count} expense transactions.`)

    // 2. Clear Old Data
    console.log('Step 2: Deleting Old Projects and related data...')

    // Delete all projects (Cascades to BudgetLines, IncomeTerms)
    // Note: Prisma might not cascade automatically depending on schema relation, 
    // but typically it handles relations if configured or we delete manually.
    // Our schema doesn't explicitly say onDelete: Cascade, so we might need to be manual.

    await prisma.budgetLine.deleteMany({})
    await prisma.incomeTerm.deleteMany({})

    // Delete transactions that are still linked to projects (Old Project Incomes, or non-user expenses)
    const deletedTxs = await prisma.transaction.deleteMany({
        where: { projectId: { not: null } }
    })
    console.log(`   -> Deleted ${deletedTxs.count} residual project transactions.`)

    await prisma.project.deleteMany({})
    console.log('   -> Deleted all projects.')

    // 3. Delete Historic System Income (The $910k)
    console.log('Step 3: Removing Historic System Income...')
    const deletedSystemIncome = await prisma.transaction.deleteMany({
        where: {
            projectId: null,
            isIncome: true
        }
    })
    console.log(`   -> Deleted ${deletedSystemIncome.count} historic income transactions.`)


    // 4. Seed New Project
    console.log('Step 4: Seeding "2026 青年系列活動"...')
    const newProject = await prisma.project.create({
        data: {
            name: '2026 青年系列活動',
            totalBudget: 1500000,
            retention: 10,
            description: '2026 Youth Series'
        }
    })
    console.log(`   -> Created Project: ${newProject.name} (${newProject.id})`)

    // 5. Seed Income Terms
    console.log('Step 5: Seeding Income Terms...')

    // Term 1: Received
    await prisma.incomeTerm.create({
        data: {
            name: '第一期款',
            amount: 900000,
            status: 'received',
            projectId: newProject.id
        }
    })

    // Transaction for Term 1 (Required for revenue calc in some views, though init.get.ts uses incomeTerms directly for revenue)
    // Wait, init.get.ts uses `p.incomeTerms` to calculate revenue. 
    // But strictly speaking, a Transaction record should exist to represent the cash inflow if we want to show it in lists?
    // User asked for "Company Public Account is 90k". 
    // If I don't create a transaction, does `totalCompanyRetention` still work? YES.
    // But `cashBalance` of project relies on it? 
    // `projectStats` uses `revenue` (from terms) - `totalExpense` (from transactions).
    // So strictly, the Transaction record is NOT required for the $90k calculation in `init.get.ts`.
    // However, for consistency, let's create it so it appears in the Project's history.

    await prisma.transaction.create({
        data: {
            date: new Date(),
            amount: 900000,
            subject: '第一期款',
            description: 'System generated income',
            isIncome: true,
            projectId: newProject.id,
            userId: (await prisma.user.findFirst())?.id || 'system-fallback', // Assign to first user or system flow? 
            // We need a user. Let's pick the first one.
        }
    })

    // Term 2: Pending
    await prisma.incomeTerm.create({
        data: {
            name: '第二期款',
            amount: 600000,
            status: 'pending',
            projectId: newProject.id
        }
    })

    console.log('✅ MIGRATION COMPLETE')
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
