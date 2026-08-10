import '../../styles/base.css';
import './cards.css';
import { createNav } from '../../shared/nav.js';
import {
  CARDS,
  drawPack,
  cardArtPath,
  charPath,
  RARITY_LABELS,
  RARITY_NAMES,
  PACK_SIZE,
  type CardDef,
  type Rarity,
} from './cards.js';
import {
  addPack,
  loadCollection,
  getStats,
  resetCollection,
  storageAvailable,
} from './storage.js';

const base = import.meta.env.BASE_URL;

const root = document.getElementById('root')!;
root.appendChild(createNav());

const main = document.createElement('main');
main.innerHTML = `
  <section class="cards-section">
    <h1>もう逃げトレーディングカード</h1>
    <p class="cards-lead">パックを開けて名場面カードを集めよう。1パック${PACK_SIZE}枚入り、全${CARDS.length}種。</p>

    <div class="tabs" role="tablist">
      <button class="tab is-active" id="tab-open" role="tab">パックを開ける</button>
      <button class="tab" id="tab-collection" role="tab">コレクション <span id="tab-count">0/${CARDS.length}</span></button>
    </div>

    <div id="view-open">
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
    </div>

    <div id="view-collection" class="hidden">
      <div class="progress-box">
        <p class="progress-label"><strong id="progress-text">0 / ${CARDS.length}</strong> 種類あつめた</p>
        <div class="progress-bar"><span id="progress-fill"></span></div>
        <p class="progress-sub" id="progress-sub"></p>
        <p class="complete-message hidden" id="complete-message">🎉 コンプリート！ 全種そろいました</p>
        <p class="storage-warning hidden" id="storage-warning">
          このブラウザでは保存できない設定のため、ページを閉じると手札が消えます
        </p>
      </div>

      <div class="collection-grid" id="collection-grid"></div>

      <button class="reset-button" id="reset">コレクションをリセット</button>
    </div>
  </section>
`;
root.appendChild(main);

const q = <T extends HTMLElement>(sel: string) => main.querySelector<T>(sel)!;

const tabOpen = q<HTMLButtonElement>('#tab-open');
const tabCollection = q<HTMLButtonElement>('#tab-collection');
const tabCount = q<HTMLSpanElement>('#tab-count');
const viewOpen = q<HTMLDivElement>('#view-open');
const viewCollection = q<HTMLDivElement>('#view-collection');
const stage = q<HTMLDivElement>('#stage');
const packButton = q<HTMLButtonElement>('#pack');
const reveal = q<HTMLDivElement>('#reveal');
const revealCards = q<HTMLDivElement>('#reveal-cards');
const revealHint = q<HTMLParagraphElement>('#reveal-hint');
const againButton = q<HTMLButtonElement>('#again');
const collectionGrid = q<HTMLDivElement>('#collection-grid');
const progressText = q<HTMLElement>('#progress-text');
const progressFill = q<HTMLSpanElement>('#progress-fill');
const progressSub = q<HTMLParagraphElement>('#progress-sub');
const completeMessage = q<HTMLParagraphElement>('#complete-message');
const storageWarning = q<HTMLParagraphElement>('#storage-warning');
const resetButton = q<HTMLButtonElement>('#reset');

/** カードの表面。コレクションでも開封でも同じ見た目を使う */
function cardFaceMarkup(card: CardDef, opts: { isNew?: boolean; count?: number } = {}): string {
  const badges = [
    opts.isNew ? '<span class="badge-new">NEW</span>' : '',
    opts.count && opts.count > 1 ? `<span class="badge-count">×${opts.count}</span>` : '',
  ].join('');

  return `
    <div class="card-front rarity-${card.rarity}">
      <div class="card-art">
        <img class="card-bg" src="${cardArtPath(base, card.id)}" alt="" />
        <img class="card-char ${card.char.startsWith('both') ? 'wide' : ''}" src="${charPath(base, card.char)}" alt="" />
        <span class="card-rarity">${RARITY_LABELS[card.rarity]}</span>
        ${badges}
      </div>
      <div class="card-text">
        <h2>${card.title}</h2>
        <p>${card.comment}</p>
      </div>
      <span class="card-no">No.${String(card.id).padStart(2, '0')} / ${RARITY_NAMES[card.rarity]}</span>
    </div>
  `;
}

function packCardMarkup(card: CardDef, isNew: boolean): string {
  return `
    <div class="card-inner">
      <div class="card-back">
        <img src="${base}images/logo.png" alt="" />
      </div>
      ${cardFaceMarkup(card, { isNew })}
    </div>
  `;
}

// --- 開封 ---

let flippedCount = 0;

function openPack() {
  const owned = new Set(Object.keys(loadCollection().counts).map(Number));
  const pack = drawPack(owned);
  const newIds = new Set(addPack(pack.map((c) => c.id)));
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
    el.innerHTML = packCardMarkup(card, newIds.has(card.id));
    el.addEventListener('click', () => flip(el, card));
    revealCards.appendChild(el);
  });

  refreshCollection();
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
    const newCount = revealCards.querySelectorAll('.badge-new').length;
    revealHint.textContent =
      best >= 4
        ? '⭐ ウルトラレア！ 一緒に逃げ出しましょう'
        : best === 3
          ? '✨ スーパーレアが出た！'
          : newCount > 0
            ? `新しいカードが ${newCount} 枚！`
            : 'ぜんぶめくった！';
    againButton.classList.remove('hidden');
  }
}

function flipAllRemaining() {
  revealCards.querySelectorAll<HTMLButtonElement>('.card:not(.flipped)').forEach((el) => el.click());
}

// --- コレクション ---

function refreshCollection() {
  const counts = loadCollection().counts;
  const stats = getStats();

  tabCount.textContent = `${stats.owned}/${stats.total}`;
  progressText.textContent = `${stats.owned} / ${stats.total}`;
  progressFill.style.width = `${(stats.owned / stats.total) * 100}%`;

  const rarityParts = ([1, 2, 3, 4] as Rarity[]).map((r) => {
    const [have, all] = stats.byRarity[r];
    return `${RARITY_LABELS[r]} ${have}/${all}`;
  });
  progressSub.textContent = `${rarityParts.join('　')}　／　開封 ${stats.packs} パック`;

  completeMessage.classList.toggle('hidden', !stats.complete);
  storageWarning.classList.toggle('hidden', storageAvailable);

  collectionGrid.innerHTML = CARDS.map((card) => {
    const count = counts[card.id] ?? 0;
    if (count === 0) {
      return `
        <div class="card collection-card locked">
          <div class="card-front rarity-${card.rarity}">
            <div class="card-art">
              <img class="card-bg" src="${cardArtPath(base, card.id)}" alt="" />
              <img class="card-char ${card.char.startsWith('both') ? 'wide' : ''}" src="${charPath(base, card.char)}" alt="" />
              <span class="card-rarity">${RARITY_LABELS[card.rarity]}</span>
            </div>
            <div class="card-text">
              <h2>？？？</h2>
              <p>まだ引いていない</p>
            </div>
            <span class="card-no">No.${String(card.id).padStart(2, '0')} / ${RARITY_NAMES[card.rarity]}</span>
          </div>
        </div>
      `;
    }
    return `<div class="card collection-card">${cardFaceMarkup(card, { count })}</div>`;
  }).join('');
}

function switchTab(toCollection: boolean) {
  tabOpen.classList.toggle('is-active', !toCollection);
  tabCollection.classList.toggle('is-active', toCollection);
  viewOpen.classList.toggle('hidden', toCollection);
  viewCollection.classList.toggle('hidden', !toCollection);
  if (toCollection) refreshCollection();
}

packButton.addEventListener('click', openPack);
againButton.addEventListener('click', openPack);
tabOpen.addEventListener('click', () => switchTab(false));
tabCollection.addEventListener('click', () => switchTab(true));

resetButton.addEventListener('click', () => {
  if (!confirm('集めたカードをすべて消します。よろしいですか？')) return;
  resetCollection();
  refreshCollection();
});

// 一括めくり: 何もめくっていない状態でヒント文をタップ
revealHint.addEventListener('click', () => {
  if (flippedCount < PACK_SIZE) flipAllRemaining();
});

refreshCollection();

// デバッグ用: ?demo=opened で開封済み、?demo=collection でコレクションを表示
const demo = new URLSearchParams(location.search).get('demo');
if (demo === 'opened') {
  openPack();
  flipAllRemaining();
} else if (demo === 'collection') {
  switchTab(true);
}
