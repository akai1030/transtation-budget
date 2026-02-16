import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
    const projects = await prisma.project.findMany({
        where: {
            OR: [
                { name: { contains: 'Company' } },
                { name: { contains: '公司' } },
                { name: { contains: '總帳' } },
                { name: { contains: 'General' } }
            ]
        }
    })
    console.log(JSON.stringify(projects, null, 2))
}
main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
