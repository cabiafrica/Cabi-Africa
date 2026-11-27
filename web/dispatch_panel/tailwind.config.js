/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
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
                    light: '#F8FAFC',
                    dark: '#0a0a0a',
                },
                surface: {
                    light: '#FFFFFF',
                    dark: '#131722',
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
                'surface-dark': '#131722',
                'card-dark': '#131722',
                'telemetry-cyan': '#22D3EE',
            },
            borderRadius: {
                none: '0px',
                sm: '2px',
                DEFAULT: '3px',
                md: '3px',
                lg: '4px',
                xl: '4px',
                '2xl': '4px',
                '3xl': '4px',
                full: '9999px',
            },
        },
    },
    plugins: [],
};
