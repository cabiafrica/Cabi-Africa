/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './index.html',
        './src/**/*.{js,ts,jsx,tsx}',
        './web/dispatch_panel/index.html',
        './web/dispatch_panel/src/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
            },
            colors: {
                primary: {
                    DEFAULT: '#F59E0B',
                    dark: '#D97706',
                    light: '#FBBF24',
                },
                secondary: {
                    DEFAULT: '#10B981',
                },
                success: '#10B981',
                error: '#EF4444',
                background: {
                    light: '#F3F4F6',
                    dark: '#0a0a0a',
                },
                surface: {
                    light: '#FFFFFF',
                    dark: '#121212',
                },
                brand: {
                    black: '#0a0a0a',
                    dark: '#121212',
                    gray: '#1E1E1E',
                    yellow: '#F59E0B',
                    yellowHover: '#D97706',
                    accent: '#22D3EE',
                },
                'executive-gold': '#D4AF37',
                'surface-dark': '#0A0A0B',
                'card-dark': '#141416',
                'telemetry-cyan': '#22D3EE',
            },
        },
    },
    plugins: [],
};
