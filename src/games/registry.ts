export interface GameEntry {
  id: string;
  name: string;
  description: string;
  path: string; // base-relative, e.g. 'games/runner/'
  emoji: string; // card thumbnail placeholder
  thumbnail?: string; // base-relative image path; falls back to emoji when absent
}

export const GAMES: GameEntry[] = [
  {
    id: 'runner',
    name: 'もう逃げランナー',
    description:
      '杉本か前川を選んで操作。突っ込んでくる相方をかわしながら、過去回のエピソードを回収しよう！',
    path: 'games/runner/',
    emoji: '🏃',
    thumbnail: 'images/games/runner/thumbnail.png',
  },
  {
    id: 'cards',
    name: 'もう逃げトレーディングカード',
    description:
      'パックを開けて名場面カードを集めよう。全20種、キラのスーパーレアやウルトラレアも入っている。',
    path: 'games/cards/',
    emoji: '🃏',
    thumbnail: 'images/cards/art/card20.jpg',
  },
];
