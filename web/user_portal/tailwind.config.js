/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#F59E0B',
                    dark: '#D97706',
                    light: '#FBBF24',
                },
                secondary: {
                    DEFAULT: '#10B981', // Mapped to success for variety if needed, or keep consistent
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
                // Maintaining brand alias for backward compatibility but mapping to new palette
                brand: {
                    black: '#0a0a0a',
                    dark: '#121212',
                    gray: '#1E1E1E',
                    yellow: '#F59E0B',
                    yellowHover: '#D97706',
                    accent: '#F59E0B',
                    purple: '#F59E0B',
                },
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
                'tech-overlay': "linear-gradient(to bottom, transparent, #0a0a0a), url('/assets/grid-pattern.png')",
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out forwards',
                'slide-up': 'slideUp 0.5s ease-out forwards',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'float': 'float 6s ease-in-out infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
            },
        },
    },
    plugins: [],
};
