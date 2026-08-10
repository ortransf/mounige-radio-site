export function createNav(): HTMLElement {
  const nav = document.createElement('nav');
  nav.className = 'navbar';

  const base = import.meta.env.BASE_URL;

  nav.innerHTML = `
    <div class="nav-container">
      <a href="${base}" class="nav-logo"><img src="${base}images/logo.webp" alt="もう逃げラジオ" width="356" height="240" /></a>
      <ul class="nav-menu">
        <li><a href="${base}">ホーム</a></li>
        <li><a href="${base}games/">ゲーム</a></li>
      </ul>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .navbar {
      background: var(--bg-card);
      border-bottom: 1px solid var(--text-dim);
      padding: 1rem 0;
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .nav-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .nav-logo {
      display: block;
      transition: transform 0.2s;
    }

    .nav-logo:hover {
      transform: scale(1.05);
    }

    .nav-logo img {
      height: 44px;
      display: block;
    }

    .nav-menu {
      display: flex;
      gap: 2rem;
      list-style: none;
    }

    .nav-menu a {
      color: var(--text-secondary);
      transition: color 0.2s;
      font-family: var(--font-pixel);
      letter-spacing: 0.06em;
    }

    .nav-menu a:hover {
      color: var(--accent);
    }

    @media (max-width: 768px) {
      .nav-container {
        padding: 0 1rem;
      }

      .nav-menu {
        gap: 1rem;
      }

      .nav-logo img {
        height: 36px;
      }
    }
  `;

  document.head.appendChild(style);

  return nav;
}
