// public/images/games/runner/episodes/ep<番号>.png に存在する過去回。
// タイトルは番組 RSS（https://anchor.fm/s/ddb187e8/podcast/rss）由来。
// 素材更新時は prep スクリプトの出力に合わせてここも更新する。
export interface EpisodeInfo {
  num: number;
  title: string;
}

export const EPISODES: EpisodeInfo[] = [
  { num: 101, title: '推しと自分の距離感を探求「オタク文化とフェミニズム」' },
  { num: 102, title: '職場でお土産配れない問題とサブスク系バラエティ番組が軒並み期待外れ問題' },
  { num: 103, title: 'なんでアイドルって恋愛しちゃだめなんだっけ？問題 -映画恋愛裁判を観て-' },
  { num: 104, title: 'ありがとう戦隊シリーズ、書籍紹介「仮放免の子どもたち」' },
  { num: 105, title: '観たぞ！映画「プロジェクト・ヘイル・メアリー」がすごかった。ネタバレあります' },
  { num: 106, title: 'ピクサー新境地 映画「私がビーバーになる時」' },
  { num: 107, title: '平成懐古に脳内が支配された二人が、爆笑問題太田光さんを考える 書籍紹介「芸人人語」' },
  { num: 108, title: '"必然の4作目"トイ・ストーリーシリーズ 一気見徹底レビュー' },
  { num: 109, title: '「マジックランプシアター」の"流し芝居"とお笑い芸人の有志infoアカウントに私たちはどう向き合うか' },
  { num: 110, title: 'これはアリなのか...「ザ・スーパーマリオギャラクシー・ムービー」徹底感想！映画革命か映画の終わりか' },
  { num: 111, title: '承認欲求は悪なのか問題～書籍紹介「孤独をほぐす」～' },
  { num: 112, title: 'グレー性犯罪に遭遇した時の対処法を考えよう' },
  { num: 113, title: '映画「君のクイズ」小説との違いを検証' },
  { num: 114, title: '「地獄に堕ちるわよ」NETFLIX製ドラマこれからどうなんの問題' },
  { num: 115, title: '「頭がいい」って何？～書籍『「頭がいい」とは何か』～' },
  { num: 117, title: '作品と人格、切り離せる？' },
  { num: 120, title: '「トイ・ストーリー5」賛否を超えた徹底感想！' },
  { num: 123, title: '【書籍】男は上を目指してない、ただ落ちたくないだけ。【転落男性論】' },
];

export const EPISODE_NUMBERS = EPISODES.map((e) => e.num);

export const EPISODE_TITLES = new Map(EPISODES.map((e) => [e.num, e.title]));

export function episodeImagePath(base: string, num: number): string {
  return `${base}images/games/runner/episodes/ep${num}.png`;
}
