import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    server: {
        port: 3002,
        proxy: {
            '/api/dispatch': {
                target: 'http://localhost:3334',
                changeOrigin: true,
            },
            '/api': 'http://localhost:3000',
            '/socket.io': {
                target: 'http://localhost:3334',
                ws: true,
            },
        },
    },
});
