import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
export default defineConfig({
    plugins: [react()],
    resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
    server: {
        watch: {
            ignored: ['**/docs/**']
        }
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('/node_modules/')) {
                        if (/\/(react|react-dom|scheduler)\//.test(id)) return 'react';
                        return 'ui';
                    }
                }
            }
        }
    }
});
