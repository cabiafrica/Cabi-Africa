/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#2563EB',
                    dark: '#1E40AF',
                    light: '#60A5FA',
                },
                secondary: {
                    DEFAULT: '#F59E0B',
                },
                success: '#10B981',
                error: '#EF4444',
                background: {
                    light: '#F3F4F6',
                    dark: '#111827',
                },
                surface: {
                    light: '#FFFFFF',
                    dark: '#1F2937',
                },
            },
        },
    },
    plugins: [],
};
