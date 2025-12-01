import { resolve } from 'path';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
    root: './',
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                cogtiff: resolve(__dirname, 'src/cogtiff/index.html'),
            },
        },
    },
    css: {
        preprocessorOptions: {
            scss: {
                // This is an optional configuration to silence SASS deprecation warnings.
                // You can keep or remove it based on your needs.
                silenceDeprecations: [
                    'import',
                    'mixed-decls',
                    'color-functions',
                    'global-builtin',
                ],
            },
        },
    },
});