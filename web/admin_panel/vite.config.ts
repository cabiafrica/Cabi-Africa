import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: 3001,
        proxy: {
            '/api': {
                target: 'http://localhost:3333',
                changeOrigin: true,
            }
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
        sourcemap: false, // Disable sourcemaps in production for faster builds
        minify: 'esbuild', // Use esbuild for faster minification
        chunkSizeWarningLimit: 1000,
        rollupOptions: {
            output: {
                // Manual chunk splitting for better caching
                manualChunks: {
                    'vendor-react': ['react', 'react-dom', 'react-router-dom'],
                    'vendor-mui': ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
                    'vendor-tremor': ['@tremor/react'],
                    'vendor-utils': ['axios', 'react-quill'],
                    'vendor-maps': ['leaflet'],
                }
            }
        },
        // Optimize chunk size
        cssCodeSplit: true,
        assetsInlineLimit: 4096,
    },
    optimizeDeps: {
        // Pre-bundle dependencies for faster dev server startup
        include: [
            'react',
            'react-dom',
            'react-router-dom',
            '@mui/material',
            '@mui/icons-material',
            'axios',
            'lodash',
        ],
        exclude: ['@tremor/react'], // Some packages work better without pre-bundling
    },
    // Performance enhancements
    esbuild: {
        logOverride: { 'this-is-undefined-in-esm': 'silent' }
    },
})
