// vite.config.ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  ssr: {
    noExternal: ['@dashlane/pqc-sign-falcon-512-node'],
  },
  build: {
    outDir: "./docs/",
    rollupOptions: {
      external: ['fs', 'path', 'module', 'crypto'],
    },
    target: 'esnext',
  },
});
