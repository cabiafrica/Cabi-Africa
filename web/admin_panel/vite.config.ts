import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: 3001,
        proxy: {
            '/api': {
                target: 'http://localhost:3333',
                changeOrigin: true,
                secure: false,
                // Add error handling to proxy
                configure: (proxy, _options) => {
                    proxy.on('error', (err, _req, _res) => {
                        console.log('proxy error', err);
                    });
                    proxy.on('proxyReq', (proxyReq, req, _res) => {
                        console.log('Sending Request to the Target:', req.method, req.url);
                    });
                    proxy.on('proxyRes', (proxyRes, req, _res) => {
                        console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
                    });
                },
            }
        },
        // Performance optimizations
        warmup: {
            clientFiles: ['./src/main.tsx', './src/App.tsx'],
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            // Explicitly alias lodash to the main file to avoid deep import issues in ESM
            'lodash': 'lodash',
            'lodash/get': 'lodash/get',
        },
    },
    build: {
        sourcemap: false,
        minify: 'esbuild',
        chunkSizeWarningLimit: 1000,
        commonjsOptions: {
            include: [/lodash/, /recharts/, /node_modules/],
            transformMixedEsModules: true,
        },
        rollupOptions: {
            output: {
                manualChunks: {
                    'vendor-react': ['react', 'react-dom', 'react-router-dom'],
                    'vendor-mui': ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
                    'vendor-tremor': ['@tremor/react'],
                    'vendor-utils': ['axios', 'react-quill'],
                    'vendor-maps': ['leaflet'],
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
            '@mui/material',
            '@mui/icons-material',
            'axios',
            'lodash',
            'lodash/get',
            'recharts',
        ],
        exclude: ['@tremor/react'],
    },
    esbuild: {
        logOverride: { 'this-is-undefined-in-esm': 'silent' }
    },
})
