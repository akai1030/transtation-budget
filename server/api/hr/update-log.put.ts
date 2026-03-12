import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
    const { id, hours, date, description, targetName } = await readBody(event)

    if (!id) {
        throw createError({ statusCode: 400, statusMessage: 'Missing log ID.' })
    }

    const log = await prisma.workLog.findUnique({ where: { id } })
    if (!log) {
        throw createError({ statusCode: 404, statusMessage: 'Log not found.' })
    }

    const updatedHours = hours !== undefined ? Number(hours) : log.hours
    const updatedLog = await prisma.workLog.update({
        where: { id },
        data: {
            hours: updatedHours,
            amount: Math.round(updatedHours * log.hourlyRate),
            date: date ? new Date(date) : log.date,
            description: description !== undefined ? description : log.description,
            targetName: targetName !== undefined ? targetName : log.targetName,
        }
    })

    return updatedLog
})
