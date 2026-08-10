import { defineConfig, type Plugin } from 'vite';
import { resolve } from 'path';

// 独自ドメインで公開するときは環境変数 BASE_PATH=/ を渡す。
// github.io/<リポジトリ名>/ で公開している間はサブパスが必要なので既定はそのまま。
const base = process.env.BASE_PATH ?? '/mounige-radio-site/';

// Google タグマネージャーのコンテナ ID。
// GA4 の測定タグは GTM の管理画面側で作るので、サイトに埋めるのはこの ID だけ。
// GA4 のスニペットを直接埋めると二重計測になるため、ここには絶対に足さないこと。
// 環境変数 GTM_ID でも上書きできる。
// ↓ ここに GTM の管理画面で発行された "GTM-XXXXXXX" を入れる。空のままなら埋め込みを飛ばす。
const GTM_ID = process.env.GTM_ID ?? '';

/**
 * 本番ビルドのときだけ、全ページの <head> 先頭に GTM スニペットを差し込む。
 *
 * apply: 'build' なので npm run dev には入らない = 自分の開発アクセスは計測されない。
 * ID が未設定のままでもビルドは通し、単に埋め込みを飛ばす（壊れたタグを公開しないため）。
 */
function gtmPlugin(): Plugin {
  const enabled = /^GTM-[A-Z0-9]+$/.test(GTM_ID);
  let warned = false;

  return {
    name: 'mounige-gtm',
    apply: 'build',
    transformIndexHtml: {
      order: 'pre',
      handler() {
        if (!enabled) {
          if (!warned) {
            warned = true;
            console.warn(
              `[gtm] コンテナ ID が不正または未設定のため GTM を埋め込みませんでした（現在値: "${GTM_ID}"）`,
            );
          }
          return [];
        }
        return [
          {
            tag: 'script',
            injectTo: 'head-prepend' as const,
            children: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`,
          },
          {
            tag: 'noscript',
            injectTo: 'body-prepend' as const,
            children: `<iframe src="https://www.googletagmanager.com/ns.html?id=${GTM_ID}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`,
          },
        ];
      },
    },
  };
}

export default defineConfig({
  base,
  plugins: [gtmPlugin()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        gamesList: resolve(__dirname, 'games/index.html'),
        gamesRunner: resolve(__dirname, 'games/runner/index.html'),
        gamesCards: resolve(__dirname, 'games/cards/index.html'),
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
