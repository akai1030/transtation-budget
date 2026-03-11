import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { userId, targetName, date, hours, hourlyRate, description } = body

    // One of them is required
    if (!userId && !targetName) {
        throw createError({ statusCode: 400, statusMessage: 'Requires a system user or a custom target name.' })
    }

    const logDate = new Date(date)
    const logHours = Number(hours)
    const logHourlyRate = Number(hourlyRate)
    const logDesc = description?.trim() || null

    // 尋找是否存在「未結算」且「對象、日期、描述、時薪」完全一致的紀錄
    const existingLog = await prisma.workLog.findFirst({
        where: {
            isSettled: false,
            userId: userId || null,
            targetName: targetName || null,
            date: logDate,
            hourlyRate: logHourlyRate,
            description: logDesc
        }
    })

    if (existingLog) {
        // 如果存在，進行累加
        const updatedHours = existingLog.hours + logHours
        return await prisma.workLog.update({
            where: { id: existingLog.id },
            data: {
                hours: updatedHours,
                amount: Math.round(updatedHours * logHourlyRate)
            }
        })
    } else {
        // 否則，創建新紀錄
        return await prisma.workLog.create({
            data: {
                userId: userId || null,
                targetName: targetName || null,
                date: logDate,
                hours: logHours,
                hourlyRate: logHourlyRate,
                amount: Math.round(logHours * logHourlyRate),
                description: logDesc
            }
        })
    }
})
