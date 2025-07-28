// Optimized Vite configuration for better build performance
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import Sitemap from 'vite-plugin-sitemap'

const dynamicRoutes = [
    '/new-entry',
    '/your-journal',
    '/sign-up',
    '/sign-in',
    // Add other paths here
]

export default defineConfig({
    base: '/',
    build: {
        outDir: 'dist',
        // Enhanced build optimization settings
        minify: 'esbuild', // Use esbuild instead of terser for faster builds
        sourcemap: process.env.NODE_ENV === 'development',
        // Improve chunk splitting for better caching
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom', 'react-router-dom'],
                    mui: ['@mui/material', '@mui/icons-material', '@mui/x-data-grid', '@mui/x-date-pickers'],
                    utils: ['axios', 'dayjs', 'react-query'],
                },
                // Limit chunk size to improve loading performance
                chunkFileNames: 'assets/[name]-[hash].js',
                entryFileNames: 'assets/[name]-[hash].js',
                assetFileNames: 'assets/[name]-[hash].[ext]',
            },
        },
        // Improve build performance
        target: 'es2015',
        cssCodeSplit: true,
        assetsInlineLimit: 4096,
        // Reduce build size
        emptyOutDir: true,
        // Improve build speed
        reportCompressedSize: false,
    },
    plugins: [
        react(),
        tsconfigPaths(),
        Sitemap({
            hostname: 'https://concertjournal.de',
            dynamicRoutes,
            exclude: ['/secret-page']
        })
    ],
    define: {
        // Make environment variables available to the client
        'process.env.VITE_ENSURE_COMPONENTS': JSON.stringify(process.env.VITE_ENSURE_COMPONENTS || 'false')
    },
    server: {
        port: 3010,
        open: true,
        hmr: {
            overlay: true,
            timeout: 30000,
            clientPort: 3010
        },
        watch: {
            usePolling: true,
            interval: 1000
        }
    },
    // Enhanced dependency optimization
    optimizeDeps: {
        include: [
            'react', 
            'react-dom', 
            'react-router-dom',
            '@mui/material',
            '@mui/icons-material',
            '@mui/x-data-grid',
            '@mui/x-date-pickers',
            'axios',
            'dayjs',
            'react-query',
            'material-ui-confirm'
        ],
        // Force dependency pre-bundling
        force: true,
        // Optimize esbuild options
        esbuildOptions: {
            target: 'es2020',
            // Improve tree-shaking
            treeShaking: true,
            // Improve build performance
            legalComments: 'none',
            // Minify during dependency optimization
            minify: true,
        }
    },
    // Esbuild optimizations
    esbuild: {
        logOverride: { 'this-is-undefined-in-esm': 'silent' },
        target: 'es2020',
        // Improve tree-shaking
        treeShaking: true,
    }
})