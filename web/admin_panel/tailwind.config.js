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
            colors: {
                primary: 'var(--primary)',
                'primary-dark': 'var(--primary-dark)',
                secondary: 'var(--secondary)',
                background: 'var(--background)',
                surface: 'var(--surface)',
            },
            transitionProperty: {
                width: 'width'
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
