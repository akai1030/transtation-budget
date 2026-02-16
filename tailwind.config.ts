/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./components/**/*.{js,vue,ts}",
        "./layouts/**/*.vue",
        "./pages/**/*.vue",
        "./plugins/**/*.{js,ts}",
        "./app.vue",
        "./error.vue",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['"Plus Jakarta Sans"', 'sans-serif'],
                mono: ['"JetBrains Mono"', 'monospace'],
            },
            colors: {
                // "Digital Stationery" Palette
                stationery: {
                    light: '#F0ECE6', // Warm Rice Paper
                    dark: '#1C1C1E',  // Sumi Ink
                },
                washi: {
                    light: '#FFFFFF', // Clean Paper
                    dark: '#2C2C2E',  // Charcoal
                },
                ink: {
                    blue: '#1B4588',  // Brand Blue
                    DEFAULT: '#1C1C1E',
                },
                crimson: {
                    alert: '#DC2626', // Negative numbers
                },
            },
            borderRadius: {
                '4xl': '32px',
                '5xl': '40px',
            },
            animation: {
                'spring': 'spring 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
                'fade-in-up': 'fadeInUp 0.3s ease-out forwards',
                'bounce-gentle': 'bounceGentle 2s infinite',
            },
            keyframes: {
                spring: {
                    '0%': { transform: 'scale(0.9)', opacity: 0 },
                    '100%': { transform: 'scale(1)', opacity: 1 },
                },
                fadeInUp: {
                    '0%': { opacity: 0, transform: 'translateY(10px)' },
                    '100%': { opacity: 1, transform: 'translateY(0)' },
                },
                bounceGentle: {
                    '0%, 100%': { transform: 'translateY(-2px)' },
                    '50%': { transform: 'translateY(2px)' },
                }
            }
        },
    },
    plugins: [],
}
