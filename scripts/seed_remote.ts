import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    const user = await prisma.user.upsert({
        where: { name: '陳昀楷' },
        update: {},
        create: {
            name: '陳昀楷',
            pettyCash: 0,
        },
    })
    console.log('Seeded user:', user)
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
