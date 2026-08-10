import './footer.css';

/**
 * 全ページ共通のフッター。
 * プライバシーポリシーへの導線はここが唯一なので、新しいページを足すときも必ず呼ぶこと。
 */
export function createFooter(): HTMLElement {
  const base = import.meta.env.BASE_URL;
  const footer = document.createElement('footer');
  footer.className = 'site-footer';

  footer.innerHTML = `
    <ul class="footer-links">
      <li><a href="${base}">ホーム</a></li>
      <li><a href="${base}games/">ゲーム</a></li>
      <li><a href="${base}privacy/">プライバシーポリシー</a></li>
      <li><a href="mailto:monigeradio@gmail.com">お問い合わせ</a></li>
    </ul>
    <p class="footer-note">
      &copy; もう逃げラジオ<br />
      このサイトはアクセス解析に Google アナリティクスを使用しています。
    </p>
  `;

  return footer;
}
