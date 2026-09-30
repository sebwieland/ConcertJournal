// Optimized Vite configuration for better build performance
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import Sitemap from 'vite-plugin-sitemap'

// Only public routes belong in the sitemap — everything else sits behind
// login and must not be advertised to crawlers. The home page is picked
// up automatically; an empty list avoids duplicated entries.
const dynamicRoutes: string[] = []

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
        // esbuild minify: ~10x faster and far less memory-hungry than terser —
        // the terser step OOM-killed (SIGKILL) the build inside low-memory
        // Docker VMs; esbuild fits comfortably and produces ~equal size.
        minify: 'esbuild',
        sourcemap: process.env.NODE_ENV === 'development'
    },
    plugins: [
        react(),
        tsconfigPaths(),
        Sitemap({
            hostname: 'https://concertjournal.de',
            dynamicRoutes,
            // robots.txt is a static file in public/ with our real rules;
            // the plugin's default would overwrite it with "allow /"
            generateRobotsTxt: false,
        })
    ],
    // Essential server configuration for HMR
    server: {
        port: 3000,
        host: '0.0.0.0',
        open: false,
        proxy: {
            '/api': {
                target: 'http://localhost:8080',
                changeOrigin: true,
                secure: false
            },
            '/login': {
                target: 'http://localhost:8080',
                changeOrigin: true,
                secure: false
            },
            '/register': {
                target: 'http://localhost:8080',
                changeOrigin: true,
                secure: false
            },
            '/logout': {
                target: 'http://localhost:8080',
                changeOrigin: true,
                secure: false
            }
        },
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