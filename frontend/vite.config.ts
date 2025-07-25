console.log('Loading vite.config.ts...');
if (process.env.NODE_ENV === 'development') {
    console.log('Watch settings:', { usePolling: true, interval: 1000 });
}
console.log('Loading vite.config.ts...');
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
        // Ensure components are included in production builds
        minify: true,
        sourcemap: true
    },
    plugins: [
        react(),
        tsconfigPaths(),
        Sitemap({
            hostname: 'https://concertjournal.de',
            dynamicRoutes, // pass the function here
            exclude: ['/secret-page'] // optional exclude
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
// Removed incorrect console.log statements
// Removed incorrect console.log statements
        },
// Removed incorrect console.log statements
        watch: {
            usePolling: true,
            interval: 1000
        }
    },
    optimizeDeps: {
        include: ['react', 'react-dom', 'react-router-dom']
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './vitest.setup.ts',
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: [
                'node_modules/**',
                'dist/**',
                'build/**',
                '**/node_modules/**',
                '**/*.test.tsx',
                '**/*.test.ts',
                'src/tests/**',
                'src/tests/utils/**',
                'src/reportWebVitals.ts',
                'src/setupTests.ts',
                'src/utils/reportWebVitals.ts',
                'src/utils/setupTests.ts',
                'src/index.tsx',
                'src/react-app-env.d.ts'
            ],
            all: true,
            include: ['src/**/*.{js,jsx,ts,tsx}'],
            thresholds: {
                statements: 25,
                branches: 65,
                functions: 65,
                lines: 25
            },
            reportOnFailure: false
        },
        include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
        exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],
    },
})