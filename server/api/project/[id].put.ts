import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const id = event.context.params?.id
    const body = await readBody(event)

    if (!id) throw createError({ statusCode: 400, statusMessage: "ID is required" })

    try {
        const project = await prisma.project.findUnique({
            where: { id },
            include: {
                incomeTerms: true,
            }
        });

        if (!project) throw new Error("Project not found");

        // 若要歸檔，且原本不是歸檔狀態
        const adminUser = await prisma.user.findFirst();

        if (body.isArchived === true && !project.isArchived && adminUser) {
            // 計算專案總收入
            const revenue = project.incomeTerms
                .filter(t => t.status === 'received')
                .reduce((sum, t) => sum + t.amount, 0);

            // 計算專案總支出
            const expenseAgg = await prisma.transaction.aggregate({
                where: { projectId: id, isIncome: false },
                _sum: { amount: true }
            });
            const totalExpense = expenseAgg._sum.amount || 0;

            const remainingBalance = revenue - totalExpense;

            // 如果有剩餘結餘，轉入公司帳
            if (remainingBalance > 0) {
                // 檢查是否已經有結算記錄 (防呆防重複)
                const existingSettle = await prisma.transaction.findFirst({
                    where: {
                        projectId: null,
                        subject: `[專案結算] ${project.name}`,
                        isIncome: true
                    }
                });

                if (!existingSettle) {
                    await prisma.transaction.create({
                        data: {
                            date: new Date(),
                            amount: remainingBalance,
                            isIncome: true,
                            subject: `[專案結算] ${project.name}`,
                            description: '專案結案結餘轉入公司',
                            budgetLineCategory: '專案款項',
                            projectId: null,
                            userId: adminUser.id
                        }
                    });
                }
            }
        }

        // 更新專案狀態
        const updatedProject = await prisma.project.update({
            where: { id },
            data: {
                isArchived: body.isArchived,
                description: body.description // Optional
            }
        })

        return { success: true, project: updatedProject }
    } catch (e: unknown) {
        console.error(e)
        const message = e instanceof Error ? e.message : String(e)
        throw createError({ statusCode: 500, statusMessage: message })
    }
})
