export default defineEventHandler(async (event) => {
    const { sequence } = await readBody(event)
    const expected = process.env.AUTH_SEQUENCE || 'dpca'

    if (sequence !== expected) {
        throw createError({ statusCode: 401, statusMessage: 'Invalid sequence.' })
    }

    await setUserSession(event, { user: { role: 'admin' } })
    return { ok: true }
})
