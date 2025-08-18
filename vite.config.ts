import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    base: '/worlds-app/',
    server: {
        proxy: {
            '/api/squarespace': {
                target: 'https://api.squarespace.com',
                changeOrigin: true,
                secure: true,
                rewrite: (path) => path.replace(/^\/api\/squarespace/, ''),
            }
        }
    }
})
