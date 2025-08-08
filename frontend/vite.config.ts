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

// Get environment variables with defaults
const isDev = process.env.NODE_ENV === 'development';
const isLocal = process.env.MODE === 'dev-local';
const hmrHost = process.env.HMR_HOST || (isLocal ? 'localhost' : '0.0.0.0');
const hmrPort = parseInt(process.env.HMR_PORT || '24678', 10);

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
    // Essential server configuration for HMR
    server: {
        port: 3000,
        host: '0.0.0.0',
        open: false,
        hmr: {
            // Essential HMR settings
            port: hmrPort,
            host: hmrHost,
            clientPort: isLocal ? undefined : hmrPort
        },
        watch: {
            // Use polling only in Docker, native file system events for local development
            usePolling: !isLocal,
            interval: 200,
            binaryInterval: 200  // Interval for binary files
        }
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