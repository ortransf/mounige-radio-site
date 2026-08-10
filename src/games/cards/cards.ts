export type Rarity = 1 | 2 | 3 | 4;

export type CharKey = 'sugimoto' | 'sugimoto_b' | 'maekawa' | 'maekawa_b' | 'both' | 'both_b';

export interface CardDef {
  id: number;
  title: string;
  comment: string;
  char: CharKey;
  rarity: Rarity;
}

export const RARITY_LABELS: Record<Rarity, string> = {
  1: '★',
  2: '★★',
  3: '★★★',
  4: '★★★★',
};

export const RARITY_NAMES: Record<Rarity, string> = {
  1: 'ノーマル',
  2: 'レア',
  3: 'スーパーレア',
  4: 'ウルトラレア',
};

/** キャラ素材のファイル名（public/images/cards/chars/） */
export const CHAR_FILES: Record<CharKey, string> = {
  sugimoto: 'sugimoto.png',
  sugimoto_b: 'sugimoto_b.png',
  maekawa: 'maekawa.png',
  maekawa_b: 'maekawa_b.png',
  both: 'both.png',
  both_b: 'both_b.png',
};

export const CARDS: CardDef[] = [
  // ★ ノーマル（12種）
  { id: 1, title: '積読タワー', comment: '買った時点で満足してしまった', char: 'sugimoto', rarity: 1 },
  { id: 2, title: '深夜の映画鑑賞', comment: '明日も仕事、でも止まらない', char: 'sugimoto_b', rarity: 1 },
  { id: 3, title: '現実逃避', comment: 'もう逃してくれ', char: 'sugimoto', rarity: 1 },
  { id: 4, title: 'サブスク巡回', comment: '観る作品を探して一時間', char: 'maekawa', rarity: 1 },
  { id: 5, title: 'ノスタルジー', comment: '脳内が平成に支配されている', char: 'maekawa_b', rarity: 1 },
  { id: 6, title: '書店で長考', comment: '三十分立ち読みして、買わない', char: 'sugimoto_b', rarity: 1 },
  { id: 7, title: '通勤のおとも', comment: 'イヤホンだけが命綱', char: 'maekawa', rarity: 1 },
  { id: 8, title: '休日の惰眠', comment: '気づけばもう夕方だった', char: 'sugimoto', rarity: 1 },
  { id: 9, title: 'カフェで作業するふり', comment: '進捗はゼロ、雰囲気は満点', char: 'maekawa_b', rarity: 1 },
  { id: 10, title: '積みゲー', comment: 'いつかやる、たぶん、きっと', char: 'sugimoto_b', rarity: 1 },
  { id: 11, title: '夜更かし', comment: '明日の自分に丸投げする', char: 'maekawa', rarity: 1 },
  { id: 12, title: '収録前のコンビニ', comment: '飲み物選びに五分かける', char: 'sugimoto', rarity: 1 },

  // ★★ レア（5種）
  { id: 13, title: '脱線トーク', comment: '本題に戻れる気配がない', char: 'both', rarity: 2 },
  { id: 14, title: 'ネタバレ厳禁', comment: '言いたい。しかし言えない', char: 'maekawa_b', rarity: 2 },
  { id: 15, title: '限界アラサー', comment: '体力と気力の残高がゼロ', char: 'sugimoto_b', rarity: 2 },
  { id: 16, title: '熱弁', comment: '好きな作品の話は止まらない', char: 'maekawa', rarity: 2 },
  { id: 17, title: '読書会', comment: '積んだ本の話をする回', char: 'both', rarity: 2 },

  // ★★★ スーパーレア（2種）
  { id: 18, title: 'ON AIR', comment: '今日も収録がはじまる', char: 'both_b', rarity: 3 },
  { id: 19, title: '完パケ', comment: '編集を終えた夜のビール', char: 'both', rarity: 3 },

  // ★★★★ ウルトラレア（1種）
  { id: 20, title: 'もう逃げラジオ', comment: '一緒に逃げ出しましょう', char: 'both_b', rarity: 4 },
];

/** レアリティごとの抽選ウェイト（数値が大きいほど出やすい） */
const WEIGHTS: Record<Rarity, number> = { 1: 100, 2: 28, 3: 7, 4: 2 };

function weightedPick(pool: CardDef[]): CardDef {
  const total = pool.reduce((sum, c) => sum + WEIGHTS[c.rarity], 0);
  let r = Math.random() * total;
  for (const card of pool) {
    r -= WEIGHTS[card.rarity];
    if (r <= 0) return card;
  }
  return pool[pool.length - 1];
}

export const PACK_SIZE = 5;

/**
 * 1パック分を抽選する。最後の1枚は必ず★★以上（当たり枠）。
 * 同じパック内で重複しないようにする。
 */
export function drawPack(): CardDef[] {
  const remaining = [...CARDS];
  const result: CardDef[] = [];

  for (let i = 0; i < PACK_SIZE - 1; i++) {
    const card = weightedPick(remaining);
    result.push(card);
    remaining.splice(remaining.indexOf(card), 1);
  }

  const rarePool = remaining.filter((c) => c.rarity >= 2);
  result.push(weightedPick(rarePool.length ? rarePool : remaining));

  return result;
}

export function cardArtPath(base: string, id: number): string {
  return `${base}images/cards/art/card${id}.jpg`;
}

export function charPath(base: string, char: CharKey): string {
  return `${base}images/cards/chars/${CHAR_FILES[char]}`;
}
