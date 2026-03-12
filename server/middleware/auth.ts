// Server middleware: protect all API routes except public ones
const PUBLIC_ROUTES = [
    '/api/auth/login',
    '/api/health',
    '/api/hr/get-custom-targets',
    '/api/hr/post-logs',
    '/api/hr/get-my-logs',
    '/api/hr/delete-log',
    '/api/hr/punch-check',
    '/api/hr/punch-register',
    '/api/hr/punch-verify',
    '/api/init',
]

export default defineEventHandler(async (event) => {
    const path = getRequestURL(event).pathname
    if (!path.startsWith('/api/')) return
    if (PUBLIC_ROUTES.some(r => path.startsWith(r))) return

    const session = await getUserSession(event)
    if (!session?.user) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized.' })
    }
})
