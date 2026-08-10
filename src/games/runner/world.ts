export type GameState = 'select' | 'playing' | 'gameover';

export interface World {
  width: number;
  height: number;
  groundY: number;
  speed: number;
  elapsed: number;
  stars: number;
  state: GameState;
}

const BASE_SPEED = 320;
const MAX_SPEED = 640;
const ACCEL = 8;

export function createWorld(width: number, height: number): World {
  return {
    width,
    height,
    groundY: height - 56,
    speed: BASE_SPEED,
    elapsed: 0,
    stars: 0,
    state: 'select',
  };
}

export function resetWorld(world: World): void {
  world.speed = BASE_SPEED;
  world.elapsed = 0;
  world.stars = 0;
}

export function updateWorld(world: World, dt: number): void {
  world.elapsed += dt;
  world.speed = Math.min(MAX_SPEED, world.speed + ACCEL * dt);
}

export function getScore(world: World): number {
  return Math.floor(world.elapsed * 10) + world.stars * 100;
}
