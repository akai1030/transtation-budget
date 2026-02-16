import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const GAS_API_URL = 'https://script.google.com/macros/s/AKfycbyKtICKtLnl01vytLz90174UICy1bfdMbKQdRqeZX3KOhyQGwJNQyXQDouxnXXfEfLQ/exec';

interface LegacyUser {
    name: string;
    pettyCash: number;
}

interface LegacyBudgetLine {
    category: string;
    budget: number;
}

interface LegacyIncomeTerm {
    name?: string;
    termName?: string;
    amount: number;
    status?: string;
}

interface LegacyProject {
    id: string; // Legacy ID like 'p1'
    name: string;
    totalBudget: number;
    retention?: number;
    budgetLines?: LegacyBudgetLine[];
    incomeTerms?: LegacyIncomeTerm[];
}

interface LegacyTransaction {
    date: string; // ISO string
    amount: number;
    relatedUser: string;
    note?: string;
    item: string; // Used as subject
    projectId?: string; // Legacy ID
    category?: string; // Budget Line Category
    isIncome?: boolean;
}

interface LegacyData {
    users: LegacyUser[];
    projects: LegacyProject[];
    allTransactions: LegacyTransaction[];
}

export default defineEventHandler(async (event) => {
    try {
        // 1. Fetch Legacy Data
        const res = await fetch(`${GAS_API_URL}?op=getData`);
        const data = await res.json() as LegacyData;

        const logs: string[] = [];
        logs.push(`Fetched legacy data: ${data.users.length} users, ${data.projects.length} projects.`);

        // 2. Transactional Import
        await prisma.$transaction(async (tx) => {

            // A. Users & Ensure all transaction users exist
            const uniqueUserNames = new Set(data.users.map((u: LegacyUser) => u.name));
            // Also collect names from transactions (e.g. 'Client', external payers)
            data.allTransactions.forEach((t: LegacyTransaction) => {
                if (t.relatedUser) uniqueUserNames.add(t.relatedUser);
            });

            for (const name of uniqueUserNames) {
                // Check if exists
                const exists = await tx.user.findUnique({ where: { name: name } });
                const legacyUser = data.users.find((u: LegacyUser) => u.name === name);

                if (!exists) {
                    await tx.user.create({
                        data: {
                            name: name,
                            pettyCash: legacyUser?.pettyCash || 0
                        }
                    });
                    logs.push(`Created User: ${name}`);
                } else if (legacyUser) {
                    // Optional: Update balance for known users
                    await tx.user.update({
                        where: { name: name },
                        data: { pettyCash: legacyUser.pettyCash }
                    });
                    logs.push(`Updated User: ${name}`);
                }
            }

            // B. Projects
            for (const p of data.projects) {
                let project = await tx.project.findFirst({ where: { name: p.name } });

                if (!project) {
                    project = await tx.project.create({
                        data: {
                            name: p.name,
                            totalBudget: p.totalBudget,
                            retention: p.retention || 10
                        }
                    });
                    logs.push(`Created Project: ${p.name}`);
                }

                // B-1. Budget Lines (Sub-projects)
                if (p.budgetLines) {
                    for (const line of p.budgetLines) {
                        // Check using new schema 'name' instead of 'category'
                        const existingLine = await tx.budgetLine.findFirst({
                            where: { projectId: project.id, name: line.category }
                        });
                        if (!existingLine) {
                            await tx.budgetLine.create({
                                data: {
                                    name: line.category, // Map legacy 'category' to new 'name'
                                    budget: line.budget,
                                    projectId: project.id
                                }
                            });
                        }
                    }
                }

                // B-2. Income Terms (Milestones)
                if (p.incomeTerms) {
                    for (const term of p.incomeTerms) {
                        const existingTerm = await tx.incomeTerm.findFirst({
                            where: { projectId: project.id, name: term.termName || term.name }
                        });
                        if (!existingTerm) {
                            await tx.incomeTerm.create({
                                data: {
                                    name: term.termName || term.name || 'Unknown Term',
                                    amount: term.amount,
                                    status: term.status || 'pending',
                                    projectId: project.id
                                }
                            });
                        }
                    }
                }
            }

            // C. Transactions
            const allProjects = await tx.project.findMany();
            const nameToUuid = new Map(allProjects.map(p => [p.name, p.id]));

            const allUsers = await tx.user.findMany();
            const userMap = new Map(allUsers.map(u => [u.name, u.id]));

            for (const txItem of data.allTransactions) {
                const userUuid = userMap.get(txItem.relatedUser);
                if (!userUuid) {
                    logs.push(`Skipping TX: User ${txItem.relatedUser} not found.`);
                    continue;
                }

                const legacyProject = data.projects.find((p: LegacyProject) => p.id === txItem.projectId);
                const projectUuid = legacyProject ? nameToUuid.get(legacyProject.name) : null;

                // Check for existing similar transaction to avoid duplicates on re-run
                const existingTx = await tx.transaction.findFirst({
                    where: {
                        date: new Date(txItem.date),
                        amount: txItem.amount,
                        userId: userUuid,
                        description: txItem.note || txItem.item
                    }
                });

                if (!existingTx) {
                    await tx.transaction.create({
                        data: {
                            date: new Date(txItem.date),
                            amount: txItem.amount,
                            isIncome: txItem.isIncome || false,
                            description: txItem.note || txItem.item,
                            subject: txItem.item, // Legacy 'item' was often used as subject
                            userId: userUuid,
                            projectId: projectUuid, // Can be null
                            budgetLineCategory: txItem.category // Map legacy 'category' to Expense Category
                        }
                    });
                }
            }
            logs.push(`Processed ${data.allTransactions.length} transactions.`);
        });

        return {
            success: true,
            logs
        };

    } catch (e: any) {
        console.error(e);
        return {
            success: false,
            error: e.message || String(e)
        };
    }
})
