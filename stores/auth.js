import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        isLoggedIn: false,
        email: 'transtation2022@gmail.com'
    }),
    actions: {
        loginSuccess() {
            this.isLoggedIn = true;
            return true;
        },
        logout() {
            this.isLoggedIn = false
        }
    }
});
