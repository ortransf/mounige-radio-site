// public/images/games/runner/episodes/ep<番号>.png に存在する過去回
// （素材更新時は prep スクリプトの出力に合わせてここも更新する）
export const EPISODE_NUMBERS = [
  101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 117, 120, 123,
] as const;

export function episodeImagePath(base: string, num: number): string {
  return `${base}images/games/runner/episodes/ep${num}.png`;
}
