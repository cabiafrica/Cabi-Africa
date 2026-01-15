import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: 3001,
        proxy: {
            '/api/roles': {
                target: 'http://localhost:3334',
                changeOrigin: true,
            },
            '/api/admin': {
                target: 'http://localhost:3334',
                changeOrigin: true,
            },
            '/api': {
                target: 'http://localhost:3000',
                changeOrigin: true,
            }
        }
    },
    resolve: {
        alias: {
            '@': '/src',
        },
    },
})
