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
    name: 'ホスト選択ランナー',
    description:
      '杉本か前川を選んで操作。突っ込んでくる相方をかわしながら、過去回のエピソードを回収しよう！',
    path: 'games/runner/',
    emoji: '🏃',
    thumbnail: 'images/games/runner/thumbnail.png',
  },
];
