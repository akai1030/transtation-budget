import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        isLoggedIn: false
    }),
    actions: {
        login(password) {
            if (password === 'nttudpca2022') {
                this.isLoggedIn = true;
                return true;
            }
            return false;
        },
        logout() {
            this.isLoggedIn = false;
        }
    },
    // persist: true // If you have pinia-plugin-persistedstate installed, otherwise we'll use a simple client-side check or localStorage later if needed.
});
