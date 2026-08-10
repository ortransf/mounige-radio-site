import '../../styles/base.css';
import './runner.css';
import { createNav } from '../../shared/nav.js';
import { createGameLoop } from '../engine/loop.js';
import { setupCanvas } from '../engine/canvas.js';
import { createInputState } from '../engine/input.js';
import { preloadImages } from '../engine/assets.js';
import {
  createPlayer,
  updatePlayer,
  getPlayerRect,
  drawPlayer,
  HOST_COLORS,
  HOST_NAMES,
  type HostId,
  type Player,
} from './player.js';
import { createWorld, resetWorld, updateWorld, getScore } from './world.js';
import {
  createObstacleManager,
  RIVAL_WIDTH,
  RIVAL_HEIGHT,
  RIVAL_MARGIN,
} from './obstacle.js';
import { EPISODE_NUMBERS, episodeImagePath } from './episodes.js';

const base = import.meta.env.BASE_URL;
const IMAGE_PATHS: Record<HostId, string> = {
  sugimoto: `${base}images/games/runner/sugimoto.png`,
  maekawa: `${base}images/games/runner/maekawa.png`,
};
const BG_COUNT = 4; // public/images/games/runner/bg/bg1..N.png（存在するものだけ使う）

const root = document.getElementById('root')!;
root.appendChild(createNav());

const main = document.createElement('main');
main.innerHTML = `
  <section class="runner-section">
    <h1>ホスト選択ランナー</h1>
    <div class="runner-wrapper">
      <canvas></canvas>
      <div class="runner-overlay" id="select-overlay">
        <h2>ホストを選ぼう</h2>
        <div class="host-buttons">
          <button data-host="sugimoto" style="--host-color: ${HOST_COLORS.sugimoto}">
            <img src="${IMAGE_PATHS.sugimoto}" alt="杉本" />
            <span>杉本</span>
          </button>
          <button data-host="maekawa" style="--host-color: ${HOST_COLORS.maekawa}">
            <img src="${IMAGE_PATHS.maekawa}" alt="前川" />
            <span>前川</span>
          </button>
        </div>
        <p class="hint">スペース / ↑ / タップでジャンプ。突っ込んでくる相方をかわして、過去回を回収しよう！</p>
      </div>
      <div class="runner-overlay hidden" id="gameover-overlay">
        <h2 id="gameover-title">収録終了…</h2>
        <p id="final-score"></p>
        <p id="collected-episodes" class="collected-episodes"></p>
        <button id="retry-button">もう一度</button>
      </div>
      <div class="runner-hud" id="hud"></div>
    </div>
  </section>
`;
root.appendChild(main);

const canvas = main.querySelector('canvas')!;
const wrapper = main.querySelector<HTMLDivElement>('.runner-wrapper')!;
const selectOverlay = main.querySelector<HTMLDivElement>('#select-overlay')!;
const gameoverOverlay = main.querySelector<HTMLDivElement>('#gameover-overlay')!;
const gameoverTitle = main.querySelector<HTMLHeadingElement>('#gameover-title')!;
const finalScore = main.querySelector<HTMLParagraphElement>('#final-score')!;
const collectedLine = main.querySelector<HTMLParagraphElement>('#collected-episodes')!;
const hud = main.querySelector<HTMLDivElement>('#hud')!;

const { ctx, width, height } = setupCanvas(canvas, wrapper);
const input = createInputState();
const world = createWorld(width, height);

// --- 画像ロード ---
const hostImages: Partial<Record<HostId, HTMLImageElement>> = {};
preloadImages([IMAGE_PATHS.sugimoto, IMAGE_PATHS.maekawa]).then(([sugimoto, maekawa]) => {
  hostImages.sugimoto = sugimoto;
  hostImages.maekawa = maekawa;
});

const episodeImages = new Map<number, HTMLImageElement>();
preloadImages(EPISODE_NUMBERS.map((n) => episodeImagePath(base, n))).then((imgs) => {
  imgs.forEach((img, i) => episodeImages.set(EPISODE_NUMBERS[i], img));
});

// 背景は存在するものだけ集める（未生成でもゲームは動く）
function tryLoadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}
const backgrounds: HTMLImageElement[] = [];
for (let i = 1; i <= BG_COUNT; i++) {
  tryLoadImage(`${base}images/games/runner/bg/bg${i}.png`).then((img) => {
    if (img) backgrounds.push(img);
  });
}

const obstacles = createObstacleManager(episodeImages);

let player: Player | null = null;
let rival: HostId | null = null;
let currentBg: HTMLImageElement | null = null;
let collected: number[] = [];
let elapsedForBob = 0;

function startGame(host: HostId) {
  const image = hostImages[host];
  if (!image) return; // 画像ロード前の連打は無視
  resetWorld(world);
  obstacles.reset();
  player = createPlayer(host, image, world);
  rival = host === 'sugimoto' ? 'maekawa' : 'sugimoto';
  const rivalImg = hostImages[rival];
  if (rivalImg) obstacles.setRivalImage(rivalImg);
  collected = [];
  currentBg = backgrounds.length
    ? backgrounds[Math.floor(Math.random() * backgrounds.length)]
    : null;
  world.state = 'playing';
  selectOverlay.classList.add('hidden');
  gameoverOverlay.classList.add('hidden');
}

function endGame() {
  world.state = 'gameover';
  const rivalName = rival ? HOST_NAMES[rival] : '相方';
  const name = player ? HOST_NAMES[player.host] : '';
  gameoverTitle.textContent = `${rivalName} の妨害で収録終了…`;
  finalScore.textContent = `${name} のスコア: ${getScore(world)}`;
  collectedLine.textContent = collected.length
    ? `回収した過去回: ${collected.map((n) => `#${n}`).join(' ')}`
    : '過去回を1本も回収できなかった…';
  gameoverOverlay.classList.remove('hidden');
}

selectOverlay.querySelectorAll<HTMLButtonElement>('button[data-host]').forEach((btn) => {
  btn.addEventListener('click', () => startGame(btn.dataset.host as HostId));
});

main.querySelector<HTMLButtonElement>('#retry-button')!.addEventListener('click', () => {
  world.state = 'select';
  gameoverOverlay.classList.add('hidden');
  selectOverlay.classList.remove('hidden');
});

function update(dt: number) {
  elapsedForBob += dt;
  if (world.state !== 'playing' || !player) return;

  updateWorld(world, dt);
  updatePlayer(player, world, input.isDown('Jump'), dt);
  obstacles.update(world, dt);

  const rect = getPlayerRect(player);
  const got = obstacles.collectEpisodes(rect);
  if (got.length) {
    collected.push(...got);
    world.stars += got.length;
  }
  if (obstacles.hits(rect)) endGame();

  hud.textContent = `SCORE ${getScore(world)}　過去回 × ${world.stars}`;
}

function drawBackground() {
  // ピクセル風の質感: 縮小描画を最近傍にしてドット感を出す
  ctx.imageSmoothingEnabled = false;
  if (currentBg) {
    // cover 相当で描画し、視認性のため薄暗いオーバーレイを重ねる
    const scale = Math.max(world.width / currentBg.width, world.height / currentBg.height);
    const w = currentBg.width * scale;
    const h = currentBg.height * scale;
    ctx.drawImage(currentBg, (world.width - w) / 2, (world.height - h) / 2, w, h);
    ctx.fillStyle = 'rgba(10, 10, 15, 0.4)';
    ctx.fillRect(0, 0, world.width, world.height);
  } else {
    ctx.fillStyle = '#141420';
    ctx.fillRect(0, 0, world.width, world.height);
  }

  // ground
  ctx.fillStyle = currentBg ? 'rgba(20, 20, 36, 0.85)' : '#1e1e30';
  ctx.fillRect(0, world.groundY, world.width, world.height - world.groundY);
  ctx.strokeStyle = '#555577';
  ctx.beginPath();
  ctx.moveTo(0, world.groundY);
  ctx.lineTo(world.width, world.groundY);
  ctx.stroke();
}

function drawRival() {
  if (!rival) return;
  const img = hostImages[rival];
  if (!img) return;
  const bob = Math.sin(elapsedForBob * 3) * 4;
  const x = world.width - RIVAL_MARGIN - RIVAL_WIDTH;
  const y = world.groundY - RIVAL_HEIGHT + bob;
  ctx.save();
  // プレイヤーの方（左）を向くように反転
  ctx.translate(x + RIVAL_WIDTH / 2, 0);
  ctx.scale(-1, 1);
  ctx.translate(-(x + RIVAL_WIDTH / 2), 0);
  ctx.drawImage(img, x, y, RIVAL_WIDTH, RIVAL_HEIGHT);
  ctx.restore();
}

function render() {
  drawBackground();
  if (world.state !== 'select') {
    drawRival();
    obstacles.draw(ctx);
    if (player) drawPlayer(ctx, player);
  }
}

createGameLoop(update, render).start();

// デバッグ用: ?autostart=sugimoto|maekawa で即プレイ開始（動作確認・スクリーンショット用）
const auto = new URLSearchParams(location.search).get('autostart');
if (auto === 'sugimoto' || auto === 'maekawa') {
  const timer = setInterval(() => {
    if (hostImages[auto] && episodeImages.size > 0) {
      clearInterval(timer);
      startGame(auto);
    }
  }, 100);
}
