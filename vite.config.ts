import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/mounige-radio-site/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        gamesList: resolve(__dirname, 'games/index.html'),
        gamesRunner: resolve(__dirname, 'games/runner/index.html'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
      },
    },
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
  },
});
