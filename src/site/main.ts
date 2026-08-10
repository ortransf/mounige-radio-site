import '../styles/base.css';
import './site.css';
import { createNav } from '../shared/nav.js';
import { createFooter } from '../shared/footer.js';

// 番組の外部リンク。空文字は「準備中」表示になる
const LINKS = {
  spotify: 'https://open.spotify.com/show/6BcPNNzt7aj1LGH4ZdskpD',
  youtube: 'https://www.youtube.com/@mounigeradio',
  applePodcasts: 'https://podcasts.apple.com/jp/podcast/%E3%82%82%E3%81%86%E9%80%83%E3%81%92%E3%83%A9%E3%82%B8%E3%82%AA/id1679584302',
  x: 'https://x.com/monigeradio',
  otayoriForm: 'https://forms.gle/399x93EJv9Kh6QSN6',
  email: 'monigeradio@gmail.com',
  hashtag: 'もう逃げラジオ',
};

function externalLink(
  cls: string,
  label: string,
  icon: string,
  url: string,
  base: string,
): string {
  const img = `<img src="${base}images/icons/${icon}" alt="" />`;
  if (!url) {
    return `<span class="${cls} disabled">${img}<span>${label}</span><small>準備中</small></span>`;
  }
  return `<a class="${cls}" href="${url}" target="_blank" rel="noopener">${img}<span>${label}</span></a>`;
}

function initSite() {
  const root = document.getElementById('root')!;
  const base = import.meta.env.BASE_URL;

  const nav = createNav();
  root.appendChild(nav);

  const main = document.createElement('main');
  main.innerHTML = `
    <section class="hero">
      <div class="hero-content">
        <div class="hero-top">
          <img class="hero-char sugimoto" src="${base}images/chars/sugimoto.webp" alt="杉本" width="257" height="512" />
          <h1 class="hero-logo" aria-label="もう逃げラジオ"><img src="${base}images/logo.webp" alt="もう逃げラジオ" width="356" height="240" /></h1>
          <img class="hero-char maekawa" src="${base}images/chars/maekawa.webp" alt="前川" width="255" height="512" />
        </div>
        <p class="tagline">もう逃してくれ。</p>
        <p>限界アラサー男子の二人が、現実からの逃避をテーマに書籍や映画、ノスタルジーについて話す podcast です。</p>
        <p>「もう逃してくれラジオ」改め、「もう逃げラジオ」を聴いて一緒に逃げ出しましょう。</p>

        <div class="podcast-embed">
          <img class="platform-art" src="${base}images/chars/reading.webp" alt="読書する杉本と前川" width="720" height="468" loading="lazy" />
          <h2>配信プラットフォーム</h2>
          <div class="platform-links">
            ${externalLink('platform-link', 'Spotify', 'spotify.svg', LINKS.spotify, base)}
            ${externalLink('platform-link', 'YouTube', 'youtube.svg', LINKS.youtube, base)}
            ${externalLink('platform-link', 'Apple Podcasts', 'applepodcasts.svg', LINKS.applePodcasts, base)}
          </div>
          <div class="sns-links">
            ${externalLink('sns-link', 'X をフォロー', 'x.svg', LINKS.x, base)}
            ${externalLink('sns-link', 'お便りフォーム', 'googleforms.svg', LINKS.otayoriForm, base)}
          </div>
          <p class="contact-line">
            感想は <a href="https://x.com/hashtag/${encodeURIComponent(LINKS.hashtag)}" target="_blank" rel="noopener">#${LINKS.hashtag}</a> で！
            ご連絡は <a href="mailto:${LINKS.email}">${LINKS.email}</a> まで
          </p>
        </div>

        <div class="cta-buttons">
          <a href="${base}games/" class="btn btn-primary">🎮 ミニゲームで遊ぶ</a>
        </div>
      </div>
    </section>
  `;

  root.appendChild(main);
  root.appendChild(createFooter());
}

initSite();
