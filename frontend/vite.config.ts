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

const isDev = process.env.NODE_ENV === 'development';

export default defineConfig({
    base: '/',
    // Simplified esbuild configuration
    esbuild: {
        jsxFactory: 'React.createElement',
        jsxFragment: 'React.Fragment',
        target: 'es2015'
    },
    build: {
        outDir: 'dist',
        minify: 'terser',
        sourcemap: process.env.NODE_ENV === 'development'
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
    server: {
        port: 3000,
        open: false,
        proxy: {
            '/api': {
                target: 'http://127.0.0.1:8080',
                changeOrigin: true,
                secure: false
            }
        },
    },
    // Basic dependency optimization
    optimizeDeps: {
        include: [
            'react',
            'react-dom',
            'react-router-dom',
            '@mui/material',
            '@mui/icons-material',
            '@mui/x-date-pickers'
        ]
    },
    // Simple environment variable definitions
    define: {
        '__DEV__': isDev
    }
})