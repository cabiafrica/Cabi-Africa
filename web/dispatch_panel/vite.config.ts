import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';

export default defineConfig({
    // root: 'web/dispatch_panel',
    plugins: [react()],
    server: {
        port: 3002,
        proxy: {
            '/api/dispatch': {
                target: 'http://localhost:3333',
                changeOrigin: true,
            },
            '/api': 'http://localhost:3333',
            '/socket.io': {
                target: 'http://localhost:3333',
                ws: true,
            },
        },
        // Performance optimizations
        warmup: {
            clientFiles: ['./src/main.tsx', './src/App.tsx'],
        },
    },
    resolve: {
        alias: {
            '@': '/src',
        },
    },
    build: {
        sourcemap: false,
        minify: 'esbuild',
        chunkSizeWarningLimit: 1000,
        rollupOptions: {
            output: {
                manualChunks: {
                    'vendor-react': ['react', 'react-dom', 'react-router-dom'],
                    'vendor-socket': ['socket.io-client'],
                    'vendor-utils': ['axios'],
                }
            }
        },
        cssCodeSplit: true,
        assetsInlineLimit: 4096,
    },
    optimizeDeps: {
        include: [
            'react',
            'react-dom',
            'react-router-dom',
            'socket.io-client',
            'axios',
        ],
    },
    esbuild: {
        logOverride: { 'this-is-undefined-in-esm': 'silent' }
    },
});
