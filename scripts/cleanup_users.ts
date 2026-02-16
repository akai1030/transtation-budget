import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const namesToDelete = ['Admin', 'User', 'Client']

    for (const name of namesToDelete) {
        const user = await prisma.user.findUnique({ where: { name } })
        if (!user) {
            console.log(`${name}: 不存在，跳過`)
            continue
        }

        // 檢查關聯交易
        const txCount = await prisma.transaction.count({ where: { userId: user.id } })
        console.log(`${name}: 有 ${txCount} 筆交易`)

        if (txCount > 0) {
            // 先刪除該使用者的交易
            await prisma.transaction.deleteMany({ where: { userId: user.id } })
            console.log(`  → 已刪除 ${txCount} 筆交易`)
        }

        await prisma.user.delete({ where: { id: user.id } })
        console.log(`  ✅ 已刪除 ${name}`)
    }

    // 顯示剩餘使用者
    const remaining = await prisma.user.findMany()
    console.log('\n剩餘使用者：')
    remaining.forEach(u => console.log(`  - ${u.name}: $${u.pettyCash}`))
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect())
