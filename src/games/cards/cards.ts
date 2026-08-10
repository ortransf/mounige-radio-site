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
  { id: 1, title: '積読タワー', comment: '読む本がたくさん溜まっているけど気にしない', char: 'maekawa', rarity: 1 },
  { id: 2, title: 'スーパーの天井気にしたことない', comment: 'スーパーの天井って実は誰も覚えてないんじゃないか', char: 'maekawa_b', rarity: 1 },
  { id: 3, title: '現実逃避', comment: 'もう逃してくれ', char: 'sugimoto', rarity: 1 },
  { id: 4, title: '男、お茶できる友達がいない問題', comment: '友達をみつけよう', char: 'maekawa', rarity: 1 },
  { id: 5, title: '平成懐古', comment: '慎吾ママを子供に見せる杉本', char: 'sugimoto_b', rarity: 1 },
  { id: 6, title: 'ワールドカップ見てないこと言わない方がいいよ', comment: '前川が言われた謎の一言', char: 'maekawa_b', rarity: 1 },
  { id: 7, title: '劇中のテレビ鑑賞シーンがさみしすぎる', comment: '映画やドラマでのテレビ鑑賞シーンが恐ろしいくらい寂しい', char: 'maekawa', rarity: 1 },
  { id: 8, title: '承認欲求を大事にしよう', comment: '自虐禁止！', char: 'sugimoto', rarity: 1 },
  { id: 9, title: '作品と人格切り離せる？', comment: '作品と人格切り離せるのか、難しい', char: 'maekawa_b', rarity: 1 },
  { id: 10, title: '王様のブランチの大革命', comment: '佐藤栞里さんの単独司会はテレビ史にのこる偉業', char: 'sugimoto_b', rarity: 1 },
  { id: 11, title: 'トイ・ストーリーガチ勢', comment: 'トイ・ストーリー5に向けて準備は万端だった前川', char: 'maekawa', rarity: 1 },
  { id: 12, title: '収録前のコンビニ', comment: '飲み物選びに五分かける', char: 'sugimoto', rarity: 1 },

  // ★★ レア（5種）
  { id: 13, title: '会社の評価制度きつすぎ', comment: '会社の評価制度がきついんで逃げだしたい', char: 'both', rarity: 2 },
  { id: 14, title: '喪主やめたい', comment: 'どうにか葬儀会社が喪主やってくれませんか', char: 'maekawa_b', rarity: 2 },
  { id: 15, title: 'カレーのじゃがいも過小評価されすぎ', comment: 'じゃがいもこそカレーのメインになるべきだと過激な主張', char: 'sugimoto_b', rarity: 2 },
  { id: 16, title: '職場でお土産配れない', comment: '職場でお土産配るのって一大イベント過ぎて一苦労だ', char: 'maekawa', rarity: 2 },
  { id: 17, title: '読書会', comment: '積んだ本の話をする回', char: 'both', rarity: 2 },

  // ★★★ スーパーレア（2種）
  { id: 18, title: 'ON AIR', comment: '今日も収録がはじまる', char: 'both_b', rarity: 3 },
  { id: 19, title: '大学で出会ったふたり', comment: 'かれこれ10年以上の付き合いなんだから', char: 'both', rarity: 3 },

  // ★★★★ ウルトラレア（1種）
  { id: 20, title: 'もう逃げラジオ', comment: '一緒に逃げ出しましょう', char: 'both_b', rarity: 4 },
];

/** レアリティごとの抽選ウェイト（数値が大きいほど出やすい） */
const WEIGHTS: Record<Rarity, number> = { 1: 100, 2: 28, 3: 7, 4: 2 };

/** 未入手カードに掛ける倍率。ダブりばかりで集まらない状態を緩和する */
const NEW_CARD_BONUS = 2;

/** 所持済みカードIDの集合。コレクション機能を持たない呼び出し側は省略できる */
export type OwnedIds = ReadonlySet<number>;

function weightOf(card: CardDef, owned?: OwnedIds): number {
  const base = WEIGHTS[card.rarity];
  return owned && !owned.has(card.id) ? base * NEW_CARD_BONUS : base;
}

function weightedPick(pool: CardDef[], owned?: OwnedIds): CardDef {
  const total = pool.reduce((sum, c) => sum + weightOf(c, owned), 0);
  let r = Math.random() * total;
  for (const card of pool) {
    r -= weightOf(card, owned);
    if (r <= 0) return card;
  }
  return pool[pool.length - 1];
}

export const PACK_SIZE = 3;

/**
 * 1パック分を抽選する。最後の1枚は必ず★★以上（当たり枠）。
 * 同じパック内で重複しないようにする。
 * owned を渡すと未入手カードが出やすくなる。
 */
export function drawPack(owned?: OwnedIds): CardDef[] {
  const remaining = [...CARDS];
  const result: CardDef[] = [];

  for (let i = 0; i < PACK_SIZE - 1; i++) {
    const card = weightedPick(remaining, owned);
    result.push(card);
    remaining.splice(remaining.indexOf(card), 1);
  }

  const rarePool = remaining.filter((c) => c.rarity >= 2);
  result.push(weightedPick(rarePool.length ? rarePool : remaining, owned));

  return result;
}

export function cardArtPath(base: string, id: number): string {
  return `${base}images/cards/art/card${id}.jpg`;
}

export function charPath(base: string, char: CharKey): string {
  return `${base}images/cards/chars/${CHAR_FILES[char]}`;
}
