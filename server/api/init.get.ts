import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    try {
        const [users, projects, transactions] = await Promise.all([
            prisma.user.findMany(),
            prisma.project.findMany({
                include: {
                    budgetLines: true,
                    incomeTerms: true
                }
            }),
            prisma.transaction.findMany({
                take: 500, // Sync more history
                orderBy: {
                    date: 'desc'
                },
                include: {
                    user: true,
                    project: true
                }
            })
        ])

        const commonItems = [
            "交通費", "講師費", "餐費", "住宿費", "場地費", "器材租借", "雜支", "專案執行費", "行政管理費", "稅金"
        ];

        // --- Calculate Project Stats ---
        const projectStats: Record<string, any> = {};

        for (const p of projects) {
            // 1. Calculate Revenue (Received Income Terms)
            let revenue = 0;
            p.incomeTerms.forEach(t => {
                if (t.status === 'received') revenue += t.amount;
            });

            // 2. Fetch all expenses for this project (not just latest 500, but we need totals)
            // Optimization: We should use aggregation queries for totals, but for now filtering the fetched transactions 
            // ALMOST works, but 'transactions' is limited by `take`. 
            // We need Aggregates.

            // Let's do a separate aggregation for project expenses
            const expenseAgg = await prisma.transaction.aggregate({
                where: {
                    projectId: p.id,
                    isIncome: false
                },
                _sum: { amount: true }
            });
            const totalExpense = expenseAgg._sum.amount || 0;

            // 3. Safe Budget
            // retention is int usually e.g. 10 (%)
            const safeBudget = Math.floor(p.totalBudget * (1 - (p.retention / 100)));

            // 4. Budget Lines Usage
            // 5. Calculate Budget Line Usage (Sub-project usage)
            const lineAgg = await prisma.transaction.groupBy({
                by: ['budgetLineId'],
                where: {
                    projectId: p.id,
                    isIncome: false,
                    budgetLineId: { not: null }
                },
                _sum: { amount: true }
            });

            const budgetLinesWithUsage = p.budgetLines.map(line => {
                const usage = lineAgg.find(g => g.budgetLineId === line.id);
                return {
                    ...line,
                    used: usage?._sum.amount || 0,
                    // Map 'name' to 'category' for frontend backward compatibility if needed, 
                    // but better to use 'name' in frontend.
                    category: line.name
                };
            });
            projectStats[p.id] = {
                id: p.id,
                name: p.name,
                totalBudget: p.totalBudget,
                retention: p.retention,
                isArchived: p.isArchived, // Expose archived status
                retentionRate: p.retention, // Frontend uses this name
                safeBudget: safeBudget,
                safeBalance: safeBudget - totalExpense, // Remaining safe budget
                cashBalance: revenue - totalExpense, // Actual cash flow
                totalExpense: totalExpense,
                revenue: revenue,
                incomeTerms: p.incomeTerms,
                budgetLines: budgetLinesWithUsage
            };
        }


        // Transform transactions to match frontend format
        // Transform transactions to match frontend format
        const formattedTransactions = transactions.map(tx => {
            let subjectDisplay = tx.subject || '未分類';
            if (!subjectDisplay.startsWith('[')) {
                subjectDisplay = `[${subjectDisplay}]`;
            }

            return {
                id: tx.id,
                date: tx.date.toISOString().split('T')[0],
                amount: tx.amount,
                item: `${subjectDisplay} ${tx.description || ''}`,
                description: tx.description,
                note: tx.description,
                subject: tx.subject,
                isIncome: tx.isIncome,
                relatedUser: tx.user.name,
                projectName: tx.project?.name || 'Company', // Default if null
                projectId: tx.projectId, // Can be null now
                category: tx.budgetLineCategory,
                status: 'synced'
            };
        });

        // --- Calculate Total Company Retention ---
        let totalCompanyRetention = 0;

        // 1. Sum up retention from projects (Revenue Source)
        for (const pid in projectStats) {
            const p = projectStats[pid];
            const retentionAmount = Math.floor(p.revenue * (p.retention / 100));
            totalCompanyRetention += retentionAmount;
        }

        // 2. Add System Income (projectId: null, isIncome: true)
        // 3. Subtract System Expenses (projectId: null, isIncome: false)
        const systemTransactions = transactions.filter(t => t.projectId === null);

        // We might want separate stats for Company Income/Expense
        // But for now, let's just adjust the 'totalCompanyRetention' to represent 'Total Assets'
        // Or keep it pure retention and add another stat?
        // Let's stick to the plan: Company Treasury = (Retained Earnings) - (Company Expenses) + (Other Company Income)

        let companyExpenses = 0;
        let otherCompanyIncome = 0;

        for (const tx of systemTransactions) {
            if (tx.isIncome) {
                otherCompanyIncome += tx.amount;
            } else {
                companyExpenses += tx.amount;
            }
        }

        // Total Assets Calculation
        const totalCompanyAssets = totalCompanyRetention + otherCompanyIncome - companyExpenses;

        return {
            users,
            projects,
            projectStats,
            totalCompanyRetention: totalCompanyAssets, // Renaming logical meaning to Assets
            companyExpenses,      // New Stat
            otherCompanyIncome,   // New Stat
            allTransactions: formattedTransactions,
            commonItems
        }

    } catch (e) {
        console.error('API Error:', e)
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to fetch initial data',
            message: e instanceof Error ? e.message : String(e),
            data: e // Expose full error object for debugging
        })
    }
})
