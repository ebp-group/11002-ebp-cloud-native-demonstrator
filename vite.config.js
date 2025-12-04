import {resolve} from 'path';
import {defineConfig} from 'vite';
import wasm from 'vite-plugin-wasm';

const GITHUB_PAGES_BASE = '/11002-ebp-cloud-native-demonstrator/';

export default defineConfig({
  root: './',
  define: {
    __GITHUB_PAGES_BASE__: GITHUB_PAGES_BASE,
  },
  base: GITHUB_PAGES_BASE,
  plugins: [wasm()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        cogtiff: resolve(__dirname, 'src/cogtiff/index.html'),
        pmtiles: resolve(__dirname, 'src/pmtiles/index.html'),
        geoparquet: resolve(__dirname, 'src/geoparquet/index.html'),
        flatgeobuf: resolve(__dirname, 'src/flatgeobuf/index.html'),
      },
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        // This is an optional configuration to silence SASS deprecation warnings.
        // You can keep or remove it based on your needs.
        silenceDeprecations: ['import', 'mixed-decls', 'color-functions', 'global-builtin'],
      },
    },
  },
});
