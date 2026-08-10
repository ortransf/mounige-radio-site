import type { Rect } from '../engine/types.js';
import { intersects } from '../engine/types.js';
import type { World } from './world.js';

// 障害物 = 突っ込んでくる相方（の分身）
interface RivalObstacle {
  x: number;
  y: number; // 基準位置（空中タイプはここから上下に揺れる）
  width: number;
  height: number;
  air: boolean;
  phase: number; // 揺れの位相
}

interface EpisodeItem {
  num: number;
  image: HTMLImageElement;
  x: number;
  y: number;
  size: number;
}

// 画面右端に立つ相方本体の描画サイズ。main.ts と共有
export const RIVAL_WIDTH = 44;
export const RIVAL_HEIGHT = 88;
export const RIVAL_MARGIN = 24;

const MINI_WIDTH = 34;
const MINI_HEIGHT = 68;

export interface ObstacleManager {
  /** 敵として使う相方の画像（ゲーム開始時に設定） */
  setRivalImage(img: HTMLImageElement): void;
  update(world: World, dt: number): void;
  draw(ctx: CanvasRenderingContext2D): void;
  hits(playerRect: Rect): boolean;
  /** 回収した過去回の番号を返す（このフレームぶん） */
  collectEpisodes(playerRect: Rect): number[];
  reset(): void;
}

export function createObstacleManager(
  episodeImages: Map<number, HTMLImageElement>,
): ObstacleManager {
  let rivalImage: HTMLImageElement | null = null;
  let obstacles: RivalObstacle[] = [];
  let items: EpisodeItem[] = [];
  let obstacleTimer = 1.4;
  let itemTimer = 1.0;
  let elapsed = 0;

  function spawnX(world: World): number {
    return world.width - RIVAL_MARGIN - RIVAL_WIDTH / 2;
  }

  function obstacleRect(o: RivalObstacle, time: number): Rect {
    const bobY = o.air ? Math.sin(time * 4 + o.phase) * 12 : 0;
    // キャラ画像の余白ぶん判定は甘めに
    return {
      x: o.x + 5,
      y: o.y + bobY + 6,
      width: o.width - 10,
      height: o.height - 10,
    };
  }

  function itemRect(it: EpisodeItem): Rect {
    return { x: it.x, y: it.y, width: it.size, height: it.size };
  }

  return {
    setRivalImage(img) {
      rivalImage = img;
    },

    update(world, dt) {
      elapsed += dt;

      obstacleTimer -= dt;
      if (obstacleTimer <= 0 && rivalImage) {
        obstacleTimer = 1.1 + Math.random() * 0.9;
        const air = Math.random() < 0.45;
        const y = air
          ? world.groundY - MINI_HEIGHT - 60 - Math.random() * 60
          : world.groundY - MINI_HEIGHT;
        obstacles.push({
          x: spawnX(world),
          y,
          width: MINI_WIDTH,
          height: MINI_HEIGHT,
          air,
          phase: Math.random() * Math.PI * 2,
        });
      }

      itemTimer -= dt;
      if (itemTimer <= 0 && episodeImages.size > 0) {
        itemTimer = 1.0 + Math.random() * 1.0;
        const nums = [...episodeImages.keys()];
        const num = nums[Math.floor(Math.random() * nums.length)];
        const size = 40;
        const y = world.groundY - 70 - Math.random() * 120;
        items.push({ num, image: episodeImages.get(num)!, x: world.width + size, y, size });
      }

      for (const o of obstacles) o.x -= world.speed * dt;
      for (const it of items) it.x -= world.speed * dt;
      obstacles = obstacles.filter((o) => o.x + o.width > -10);
      items = items.filter((it) => it.x + it.size > -10);
    },

    draw(ctx) {
      // 相方の分身（左向き反転 + 走り/浮遊の揺れ）
      if (rivalImage) {
        for (const o of obstacles) {
          const bobY = o.air ? Math.sin(elapsed * 4 + o.phase) * 12 : 0;
          const tilt = o.air ? Math.sin(elapsed * 6 + o.phase) * 0.15 : -0.08;
          const cx = o.x + o.width / 2;
          const cy = o.y + bobY + o.height / 2;
          ctx.save();
          ctx.translate(cx, cy);
          ctx.scale(-1, 1);
          ctx.rotate(tilt);
          ctx.drawImage(rivalImage, -o.width / 2, -o.height / 2, o.width, o.height);
          ctx.restore();
        }
      }

      // 過去回（白枠つきサムネ + 番号）
      ctx.save();
      for (const it of items) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(it.x - 2, it.y - 2, it.size + 4, it.size + 4);
        ctx.drawImage(it.image, it.x, it.y, it.size, it.size);
        ctx.fillStyle = '#e8e8f0';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(`#${it.num}`, it.x + it.size / 2, it.y + it.size + 5);
      }
      ctx.restore();
    },

    hits(playerRect) {
      return obstacles.some((o) => intersects(playerRect, obstacleRect(o, elapsed)));
    },

    collectEpisodes(playerRect) {
      const collected: number[] = [];
      items = items.filter((it) => {
        if (intersects(playerRect, itemRect(it))) {
          collected.push(it.num);
          return false;
        }
        return true;
      });
      return collected;
    },

    reset() {
      obstacles = [];
      items = [];
      obstacleTimer = 1.4;
      itemTimer = 1.0;
    },
  };
}
