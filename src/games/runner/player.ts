import type { Rect } from '../engine/types.js';
import type { World } from './world.js';

export type HostId = 'sugimoto' | 'maekawa';

export const HOST_COLORS: Record<HostId, string> = {
  sugimoto: '#b600ff',
  maekawa: '#00fff9',
};

export const HOST_NAMES: Record<HostId, string> = {
  sugimoto: '杉本',
  maekawa: '前川',
};

const GRAVITY = 2400;
const JUMP_VELOCITY = -950;
// キャラ画像は約 1:2（幅:高さ）
const WIDTH = 40;
const HEIGHT = 80;

export interface Player {
  host: HostId;
  image: HTMLImageElement;
  x: number;
  y: number;
  vy: number;
  onGround: boolean;
}

export function createPlayer(host: HostId, image: HTMLImageElement, world: World): Player {
  return {
    host,
    image,
    x: 90,
    y: world.groundY - HEIGHT,
    vy: 0,
    onGround: true,
  };
}

export function updatePlayer(player: Player, world: World, jumpHeld: boolean, dt: number): void {
  if (jumpHeld && player.onGround) {
    player.vy = JUMP_VELOCITY;
    player.onGround = false;
  }

  player.vy += GRAVITY * dt;
  player.y += player.vy * dt;

  const floor = world.groundY - HEIGHT;
  if (player.y >= floor) {
    player.y = floor;
    player.vy = 0;
    player.onGround = true;
  }
}

export function getPlayerRect(player: Player): Rect {
  // 頭の丸みと手足の余白ぶん、当たり判定は画像より甘めにする
  return { x: player.x + 6, y: player.y + 8, width: WIDTH - 12, height: HEIGHT - 12 };
}

export function drawPlayer(ctx: CanvasRenderingContext2D, player: Player): void {
  ctx.save();
  if (!player.onGround) {
    // ジャンプ中は軽く前傾
    const cx = player.x + WIDTH / 2;
    const cy = player.y + HEIGHT / 2;
    ctx.translate(cx, cy);
    ctx.rotate(0.12);
    ctx.translate(-cx, -cy);
  }
  ctx.drawImage(player.image, player.x, player.y, WIDTH, HEIGHT);
  ctx.restore();
}
