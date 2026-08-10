import '../styles/base.css';
import './list.css';
import { createNav } from '../shared/nav.js';
import { GAMES } from './registry.js';

const base = import.meta.env.BASE_URL;
const root = document.getElementById('root')!;

root.appendChild(createNav());

const main = document.createElement('main');
main.innerHTML = `
  <section class="games-section">
    <div class="games-header">
      <img class="header-char tilt-left" src="${base}images/chars/sugimoto.png" alt="" />
      <div>
        <h1>ミニゲーム</h1>
        <p>もう逃げラジオ発のブラウザゲームで遊ぼう</p>
      </div>
      <img class="header-char tilt-right" src="${base}images/chars/maekawa.png" alt="" />
    </div>
    <div class="games-grid">
      ${GAMES.map(
        (g) => `
        <article class="game-card">
          <div class="game-thumbnail">
            ${g.thumbnail ? `<img src="${base}${g.thumbnail}" alt="${g.name}" />` : g.emoji}
          </div>
          <div class="game-info">
            <h3>${g.name}</h3>
            <p>${g.description}</p>
            <a class="game-link" href="${base}${g.path}">プレイする</a>
          </div>
        </article>`,
      ).join('')}
    </div>
  </section>
`;
root.appendChild(main);
