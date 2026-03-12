import { useAuthStore } from '~/stores/auth';

export default defineNuxtRouteMiddleware(async (to) => {
    const authStore = useAuthStore()
    const { loggedIn, fetch: fetchSession } = useUserSession()

    // Public routes that don't require login
    const publicRoutes = ['/login', '/punch']
    if (publicRoutes.includes(to.path)) {
        if (loggedIn.value && to.path === '/login') return navigateTo('/')
        return
    }

    // Sync session from server if not yet loaded in Pinia
    if (!authStore.isLoggedIn) {
        await fetchSession()
        if (loggedIn.value) {
            authStore.loginSuccess()
        } else {
            return navigateTo('/login')
        }
    }
})
