import { CARDS, type Rarity } from './cards.js';

/**
 * 集めたカードをブラウザに保存する層。
 * サーバーを持たない構成なので localStorage に置く（外部送信は一切しない）。
 * 保存が壊れていてもゲームが止まらないよう、読み込みは必ず検証を通す。
 */

const KEY = 'mounige:cards:v1';
const VERSION = 1;

export interface Collection {
  v: number;
  /** カードID → 所持枚数 */
  counts: Record<number, number>;
  /** 開封したパック数 */
  packs: number;
  firstAt: string | null;
  lastAt: string | null;
}

export interface Stats {
  owned: number;
  total: number;
  packs: number;
  /** レアリティごとの [所持種類数, 全種類数] */
  byRarity: Record<Rarity, [number, number]>;
  complete: boolean;
}

const VALID_IDS = new Set(CARDS.map((c) => c.id));

function emptyCollection(): Collection {
  return { v: VERSION, counts: {}, packs: 0, firstAt: null, lastAt: null };
}

/** localStorage が実際に読み書きできるか（プライベートモードや容量超過を検出） */
export const storageAvailable: boolean = (() => {
  try {
    const probe = '__mounige_probe__';
    localStorage.setItem(probe, '1');
    localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
})();

// 保存できない環境ではこのセッション中だけ手札を保持する
let memory: Collection | null = null;

function sanitize(raw: unknown): Collection {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return emptyCollection();

  const src = raw as Record<string, unknown>;
  if (src.v !== VERSION) return emptyCollection();

  const counts: Record<number, number> = {};
  const rawCounts = src.counts;
  if (typeof rawCounts === 'object' && rawCounts !== null && !Array.isArray(rawCounts)) {
    for (const [key, value] of Object.entries(rawCounts as Record<string, unknown>)) {
      const id = Number(key);
      const n = Math.floor(Number(value));
      // 現存するカードで、1枚以上の整数のものだけ残す
      if (VALID_IDS.has(id) && Number.isFinite(n) && n > 0) counts[id] = n;
    }
  }

  const packs = Math.floor(Number(src.packs));
  return {
    v: VERSION,
    counts,
    packs: Number.isFinite(packs) && packs > 0 ? packs : 0,
    firstAt: typeof src.firstAt === 'string' ? src.firstAt : null,
    lastAt: typeof src.lastAt === 'string' ? src.lastAt : null,
  };
}

export function loadCollection(): Collection {
  if (!storageAvailable) return memory ?? (memory = emptyCollection());
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptyCollection();
    return sanitize(JSON.parse(raw));
  } catch {
    // 壊れた値が入っていても初期状態で復帰する
    return emptyCollection();
  }
}

function save(c: Collection): void {
  if (!storageAvailable) {
    memory = c;
    return;
  }
  try {
    localStorage.setItem(KEY, JSON.stringify(c));
  } catch {
    // 容量超過などで書けなくなった場合もゲームは続行させる
    memory = c;
  }
}

/**
 * 1パック分を記録し、今回はじめて手に入れたカードIDを返す。
 */
export function addPack(ids: number[]): number[] {
  const c = loadCollection();
  const now = new Date().toISOString();
  const newIds: number[] = [];

  for (const id of ids) {
    if (!VALID_IDS.has(id)) continue;
    if (!c.counts[id]) {
      c.counts[id] = 1;
      newIds.push(id);
    } else {
      c.counts[id] += 1;
    }
  }

  c.packs += 1;
  c.firstAt ??= now;
  c.lastAt = now;
  save(c);
  return newIds;
}

export function getStats(): Stats {
  const c = loadCollection();
  const byRarity = { 1: [0, 0], 2: [0, 0], 3: [0, 0], 4: [0, 0] } as Record<
    Rarity,
    [number, number]
  >;

  for (const card of CARDS) {
    byRarity[card.rarity][1] += 1;
    if (c.counts[card.id]) byRarity[card.rarity][0] += 1;
  }

  const owned = Object.keys(c.counts).length;
  return { owned, total: CARDS.length, packs: c.packs, byRarity, complete: owned === CARDS.length };
}

export function resetCollection(): void {
  memory = emptyCollection();
  if (!storageAvailable) return;
  try {
    localStorage.removeItem(KEY);
  } catch {
    // 消せなくても致命的ではない
  }
}
