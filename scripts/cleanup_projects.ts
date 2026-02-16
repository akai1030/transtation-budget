import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🧹 開始清理重複專案資料...\n')

    // ── 步驟 0：查看目前狀態 ──
    const allProjects = await prisma.project.findMany({
        include: { incomeTerms: true, budgetLines: true }
    })
    console.log(`📊 目前共有 ${allProjects.length} 個專案：`)
    for (const p of allProjects) {
        console.log(`   - [${p.id}] ${p.name} (預算: ${p.totalBudget}, 保留: ${p.retention}%)`)
        for (const t of p.incomeTerms) {
            console.log(`     └ ${t.name}: $${t.amount} (${t.status})`)
        }
    }

    // 如果只有一個專案且名稱正確，只需確認 IncomeTerm
    if (allProjects.length === 1 && allProjects[0].name === '2026 青年系列活動') {
        console.log('\n✅ 專案數量正確，只檢查收款期程...')
        await ensureCorrectIncomeTerms(allProjects[0].id)
        await cleanupOrphanedTransactions()
        console.log('\n✅ 清理完成！')
        return
    }

    // ── 步驟 1：找出要保留的專案 ──
    // 優先保留名稱完全匹配的那個，如果有多個同名的取第一個
    const targetName = '2026 青年系列活動'
    const matchingProjects = allProjects.filter(p => p.name === targetName)

    let keepProject: typeof allProjects[0]

    if (matchingProjects.length > 0) {
        // 保留第一個匹配的
        keepProject = matchingProjects[0]
        console.log(`\n🎯 保留專案: [${keepProject.id}] ${keepProject.name}`)
    } else {
        // 沒有匹配的專案，建立一個新的
        console.log(`\n⚠️ 找不到 "${targetName}"，將建立新專案`)
        keepProject = await prisma.project.create({
            data: {
                name: targetName,
                totalBudget: 1500000,
                retention: 10,
                description: '2026 Youth Series'
            },
            include: { incomeTerms: true, budgetLines: true }
        })
        console.log(`   ✅ 建立新專案: [${keepProject.id}]`)
    }

    // ── 步驟 2：刪除其他所有專案 ──
    const projectsToDelete = allProjects.filter(p => p.id !== keepProject.id)
    console.log(`\n🗑️ 準備刪除 ${projectsToDelete.length} 個重複/多餘專案...`)

    for (const p of projectsToDelete) {
        console.log(`   刪除: [${p.id}] ${p.name}`)

        // 刪除該專案下的所有交易紀錄
        const deletedTxs = await prisma.transaction.deleteMany({
            where: { projectId: p.id }
        })
        console.log(`     └ 刪除 ${deletedTxs.count} 筆交易`)

        // 刪除收款期程
        const deletedTerms = await prisma.incomeTerm.deleteMany({
            where: { projectId: p.id }
        })
        console.log(`     └ 刪除 ${deletedTerms.count} 筆收款期程`)

        // 刪除預算項目
        const deletedLines = await prisma.budgetLine.deleteMany({
            where: { projectId: p.id }
        })
        console.log(`     └ 刪除 ${deletedLines.count} 筆預算項目`)

        // 刪除專案本身
        await prisma.project.delete({ where: { id: p.id } })
    }

    // ── 步驟 3：確認保留專案的收款期程 ──
    await ensureCorrectIncomeTerms(keepProject.id)

    // ── 步驟 4：清理無主的系統交易 ──
    await cleanupOrphanedTransactions()

    // ── 步驟 5：確認保留專案的基本資料 ──
    await prisma.project.update({
        where: { id: keepProject.id },
        data: {
            totalBudget: 1500000,
            retention: 10
        }
    })

    // ── 最終狀態確認 ──
    console.log('\n' + '='.repeat(50))
    console.log('📊 清理後狀態：')

    const finalProjects = await prisma.project.findMany({
        include: { incomeTerms: true }
    })
    console.log(`   專案數量：${finalProjects.length}`)
    for (const p of finalProjects) {
        console.log(`   - ${p.name} (預算: $${p.totalBudget.toLocaleString()}, 保留: ${p.retention}%)`)
        for (const t of p.incomeTerms) {
            console.log(`     └ ${t.name}: $${t.amount.toLocaleString()} (${t.status})`)
        }
    }

    const users = await prisma.user.findMany()
    console.log(`\n   使用者零用金：`)
    let totalLiability = 0
    for (const u of users) {
        console.log(`   - ${u.name}: $${u.pettyCash.toLocaleString()}`)
        if (u.pettyCash < 0) totalLiability += Math.abs(u.pettyCash)
    }

    // 計算公司公帳（= 已收款 × 保留比例）
    const receivedRevenue = finalProjects.reduce((sum, p) => {
        return sum + p.incomeTerms
            .filter(t => t.status === 'received')
            .reduce((s, t) => s + t.amount, 0)
    }, 0)
    const retentionRate = finalProjects[0]?.retention || 10
    const companyAccount = Math.floor(receivedRevenue * (retentionRate / 100))

    // 檢查是否有系統層級的收支影響公帳
    const systemTxs = await prisma.transaction.findMany({
        where: { projectId: null }
    })
    let sysIncome = 0, sysExpense = 0
    for (const tx of systemTxs) {
        if (tx.isIncome) sysIncome += tx.amount
        else sysExpense += tx.amount
    }

    const totalAssets = companyAccount + sysIncome - sysExpense
    const netValue = totalAssets - totalLiability

    console.log(`\n   公司公帳（提撥）：$${companyAccount.toLocaleString()}`)
    console.log(`   系統收入：$${sysIncome.toLocaleString()}`)
    console.log(`   系統支出：$${sysExpense.toLocaleString()}`)
    console.log(`   公司總資產：$${totalAssets.toLocaleString()}`)
    console.log(`   零用金負債：$${totalLiability.toLocaleString()}`)
    console.log(`   公司淨值：$${netValue.toLocaleString()}`)
    console.log('\n✅ 清理完成！')
}

/**
 * 確保指定專案有正確的兩筆收款期程
 */
async function ensureCorrectIncomeTerms(projectId: string) {
    console.log('\n📋 檢查收款期程...')

    // 取得目前的收款期程
    const terms = await prisma.incomeTerm.findMany({
        where: { projectId }
    })

    console.log(`   目前有 ${terms.length} 筆收款期程`)

    // 先刪除所有舊的，重新建立正確的
    if (terms.length !== 2 ||
        !terms.some(t => t.name === '第一期款' && t.amount === 900000 && t.status === 'received') ||
        !terms.some(t => t.name === '第二期款' && t.amount === 600000 && t.status === 'pending')) {

        console.log('   ⚠️ 收款期程不正確，重新建立...')
        await prisma.incomeTerm.deleteMany({ where: { projectId } })

        await prisma.incomeTerm.create({
            data: {
                name: '第一期款',
                amount: 900000,
                status: 'received',
                projectId
            }
        })
        await prisma.incomeTerm.create({
            data: {
                name: '第二期款',
                amount: 600000,
                status: 'pending',
                projectId
            }
        })
        console.log('   ✅ 已建立正確的收款期程')
    } else {
        console.log('   ✅ 收款期程正確')
    }
}

/**
 * 清理會影響公帳計算的孤立系統收入交易
 * （例如舊的 migrate 腳本自動產生的 90 萬收入交易）
 */
async function cleanupOrphanedTransactions() {
    console.log('\n🧹 檢查系統層交易...')

    // 查看是否有 projectId 不為 null 的收入交易（跟專案有關的收入）
    // 這些是由 seed 腳本產生的，不應該存在於 Transaction 表（因為 init.get.ts 用 IncomeTerm 算營收）
    const projectIncomes = await prisma.transaction.findMany({
        where: {
            isIncome: true,
            projectId: { not: null }
        }
    })

    if (projectIncomes.length > 0) {
        console.log(`   發現 ${projectIncomes.length} 筆專案收入交易（不應存在），刪除中...`)
        await prisma.transaction.deleteMany({
            where: {
                isIncome: true,
                projectId: { not: null }
            }
        })
        console.log('   ✅ 已清理')
    }

    // 查看系統層（projectId = null）的收入交易
    const systemIncomes = await prisma.transaction.findMany({
        where: {
            isIncome: true,
            projectId: null
        }
    })

    if (systemIncomes.length > 0) {
        console.log(`   系統層收入交易：${systemIncomes.length} 筆`)
        for (const tx of systemIncomes) {
            console.log(`     - $${tx.amount.toLocaleString()} | ${tx.subject} | ${tx.date.toISOString().split('T')[0]}`)
        }
        // 這些是舊的撥款、提撥等紀錄，如果來自不正確的 seed 也需清理
        // 這裡全部清除，因為公帳計算只透過 IncomeTerm 的 received 狀態
        console.log('   ⚠️ 刪除系統層收入交易（公帳只透過 IncomeTerm 計算）...')
        await prisma.transaction.deleteMany({
            where: {
                isIncome: true,
                projectId: null
            }
        })
        console.log('   ✅ 已清理')
    } else {
        console.log('   ✅ 無多餘系統收入交易')
    }
}

main()
    .catch(e => {
        console.error('❌ 清理失敗：', e)
        process.exit(1)
    })
    .finally(async () => await prisma.$disconnect())
