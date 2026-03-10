export default defineNuxtRouteMiddleware((to, from) => {
    const authStore = useAuthStore()

    // Public routes that don't require login
    const publicRoutes = ['/login', '/punch']

    // 如果使用者沒有登入而且想去的頁面不在 publicRoutes 裡面，就強制導向 /login
    if (!authStore.isLoggedIn && !publicRoutes.includes(to.path)) {
        return navigateTo('/login')
    }

    // 如果使用者已經登入而且想去 /login，就強制導向首頁
    if (authStore.isLoggedIn && to.path === '/login') {
        return navigateTo('/')
    }
})
