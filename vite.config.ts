import { defineConfig } from 'vite';
import { resolve } from 'path';

// 独自ドメインで公開するときは環境変数 BASE_PATH=/ を渡す。
// github.io/<リポジトリ名>/ で公開している間はサブパスが必要なので既定はそのまま。
const base = process.env.BASE_PATH ?? '/mounige-radio-site/';

export default defineConfig({
  base,
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
