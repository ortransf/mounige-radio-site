import '../../styles/base.css';
import './cards.css';
import { createNav } from '../../shared/nav.js';
import {
  drawPack,
  cardArtPath,
  charPath,
  RARITY_LABELS,
  RARITY_NAMES,
  PACK_SIZE,
  type CardDef,
} from './cards.js';

const base = import.meta.env.BASE_URL;

const root = document.getElementById('root')!;
root.appendChild(createNav());

const main = document.createElement('main');
main.innerHTML = `
  <section class="cards-section">
    <h1>もう逃げトレーディングカード</h1>
    <p class="cards-lead">パックを開けて名場面カードを引こう。1パック${PACK_SIZE}枚入り。</p>

    <div class="pack-stage" id="stage">
      <button class="pack" id="pack" aria-label="パックを開ける">
        <img src="${base}images/logo.png" alt="" />
        <span class="pack-label">タップして開封</span>
      </button>
    </div>

    <div class="reveal hidden" id="reveal">
      <div class="reveal-cards" id="reveal-cards"></div>
      <p class="reveal-hint" id="reveal-hint">カードをタップしてめくる</p>
      <button class="again-button hidden" id="again">もう1パック開ける</button>
    </div>
  </section>
`;
root.appendChild(main);

const stage = main.querySelector<HTMLDivElement>('#stage')!;
const packButton = main.querySelector<HTMLButtonElement>('#pack')!;
const reveal = main.querySelector<HTMLDivElement>('#reveal')!;
const revealCards = main.querySelector<HTMLDivElement>('#reveal-cards')!;
const revealHint = main.querySelector<HTMLParagraphElement>('#reveal-hint')!;
const againButton = main.querySelector<HTMLButtonElement>('#again')!;

function cardMarkup(card: CardDef): string {
  return `
    <div class="card-inner">
      <div class="card-back">
        <img src="${base}images/logo.png" alt="" />
      </div>
      <div class="card-front rarity-${card.rarity}">
        <div class="card-art">
          <img class="card-bg" src="${cardArtPath(base, card.id)}" alt="" loading="lazy" />
          <img class="card-char ${card.char.startsWith('both') ? 'wide' : ''}" src="${charPath(base, card.char)}" alt="" />
          <span class="card-rarity">${RARITY_LABELS[card.rarity]}</span>
        </div>
        <div class="card-text">
          <h2>${card.title}</h2>
          <p>${card.comment}</p>
        </div>
        <span class="card-no">No.${String(card.id).padStart(2, '0')} / ${RARITY_NAMES[card.rarity]}</span>
      </div>
    </div>
  `;
}

let flippedCount = 0;

function openPack() {
  const pack = drawPack();
  flippedCount = 0;

  stage.classList.add('hidden');
  reveal.classList.remove('hidden');
  againButton.classList.add('hidden');
  revealHint.textContent = 'カードをタップしてめくる';
  revealCards.innerHTML = '';

  pack.forEach((card, i) => {
    const el = document.createElement('button');
    el.className = `card rarity-${card.rarity}`;
    el.style.animationDelay = `${i * 90}ms`;
    el.innerHTML = cardMarkup(card);
    el.addEventListener('click', () => flip(el, card));
    revealCards.appendChild(el);
  });
}

function flip(el: HTMLButtonElement, card: CardDef) {
  if (el.classList.contains('flipped')) return;
  el.classList.add('flipped');
  if (card.rarity >= 3) el.classList.add('shine');

  flippedCount++;
  if (flippedCount === PACK_SIZE) {
    const best = Math.max(
      ...[...revealCards.querySelectorAll('.card')].map((c) =>
        Number((c.className.match(/rarity-(\d)/) ?? [])[1] ?? 1),
      ),
    );
    revealHint.textContent =
      best >= 4
        ? '⭐ ウルトラレア！ 一緒に逃げ出しましょう'
        : best === 3
          ? '✨ スーパーレアが出た！'
          : 'ぜんぶめくった！';
    againButton.classList.remove('hidden');
  }
}

function flipAllRemaining() {
  revealCards.querySelectorAll<HTMLButtonElement>('.card:not(.flipped)').forEach((el) => el.click());
}

packButton.addEventListener('click', openPack);
againButton.addEventListener('click', openPack);

// 一括めくり: 何もめくっていない状態でヒント文をタップ
revealHint.addEventListener('click', () => {
  if (flippedCount < PACK_SIZE) flipAllRemaining();
});

// デバッグ用: ?demo=opened で開封済みの状態を表示（表示検証用）
if (new URLSearchParams(location.search).get('demo') === 'opened') {
  openPack();
  flipAllRemaining();
}
