/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        // Tremor UI compliance
        "./node_modules/@tremor/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
            },
            colors: {
                primary: 'var(--primary)',
                'primary-dark': 'var(--primary-dark)',
                secondary: 'var(--secondary)',
                background: 'var(--background)',
                surface: 'var(--surface)',
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
            transitionProperty: {
                width: 'width'
            },
            borderRadius: {
                none: '0px',
                sm: '2px',
                DEFAULT: '3px',
                md: '3px',
                lg: '4px',
                xl: '4px',
                '2xl': '5px',
                '3xl': '6px',
                full: '9999px',
            },
        },
    },
    safelist: [
        {
            pattern: /^(fill|text|bg)-(emerald|rose|amber)-(400|500|600)$/,
        },
    ],
    plugins: [],
}
