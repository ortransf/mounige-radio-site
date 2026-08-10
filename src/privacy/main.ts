import '../styles/base.css';
import './privacy.css';
import { createNav } from '../shared/nav.js';
import { createFooter } from '../shared/footer.js';

const CONTACT = 'monigeradio@gmail.com';
const UPDATED = '2026年8月10日';

const root = document.getElementById('root')!;
root.appendChild(createNav());

const main = document.createElement('main');
main.innerHTML = `
  <section class="privacy-section">
    <h1>プライバシーポリシー</h1>
    <p class="updated">制定日: ${UPDATED}</p>

    <p>
      もう逃げラジオ（以下「当番組」）は、当サイトをご利用いただく方のプライバシーを尊重し、
      取得する情報とその使い道を以下のとおり定めます。
    </p>

    <h2>1. アクセス解析について</h2>
    <p>
      当サイトでは、サイトの利用状況を把握して改善に役立てるため、Google LLC が提供する
      アクセス解析ツール「Google アナリティクス」を Google タグマネージャー経由で利用しています。
      Google アナリティクスは Cookie を使用して、次のような情報を匿名で収集します。
    </p>
    <ul>
      <li>閲覧したページと滞在時間</li>
      <li>参照元（どのサイト・SNS から来たか）</li>
      <li>ブラウザ・OS・端末の種類、おおまかな地域</li>
    </ul>
    <p>
      これらの情報は統計的に処理されるもので、<strong>氏名・住所・電話番号など個人を特定できる情報は含まれません</strong>。
      当番組が個人を特定する目的で利用することもありません。
    </p>
    <p>
      収集されたデータは Google 社のプライバシーポリシーに基づいて管理されます。詳しくは
      <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener">
        Google のサービスを使用するサイトやアプリから収集した情報の Google による使用</a>
      をご確認ください。
    </p>

    <h2>2. アクセス解析を無効にしたい場合</h2>
    <p>
      ブラウザの設定で Cookie を無効にするか、Google が提供する
      <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener">
        Google アナリティクス オプトアウト アドオン</a>
      を導入することで、データの収集を拒否できます。無効にしても当サイトの閲覧やミニゲームのプレイに支障はありません。
    </p>

    <h2>3. ブラウザ内に保存されるデータ</h2>
    <p>
      ミニゲーム「もう逃げトレーディングカード」で集めたカードの記録は、
      お使いのブラウザの localStorage に保存されます。
      <strong>この記録が当番組や外部に送信されることは一切ありません</strong>。
      端末とブラウザごとに独立した記録で、ゲーム内の「コレクションをリセット」または
      ブラウザのデータ削除でいつでも消去できます。
    </p>
    <p>
      なお、ブラウザの設定や仕様（Safari など一部のブラウザでは一定期間アクセスがないと
      自動削除されます）により、保存した記録が失われる場合があります。あらかじめご了承ください。
    </p>

    <h2>4. 外部サービスへのリンク</h2>
    <p>
      当サイトには Spotify、YouTube、Apple Podcasts、X、Google フォームなど外部サービスへのリンクがあります。
      リンク先での情報の取り扱いは各サービスのプライバシーポリシーに従います。当番組は責任を負いかねます。
    </p>

    <h2>5. お問い合わせ</h2>
    <p>
      本ポリシーに関するお問い合わせは <a href="mailto:${CONTACT}">${CONTACT}</a> までご連絡ください。
    </p>

    <h2>6. 改定について</h2>
    <p>
      本ポリシーの内容は、必要に応じて予告なく変更することがあります。
      変更後の内容は当ページに掲載した時点から適用されます。
    </p>
  </section>
`;
root.appendChild(main);
root.appendChild(createFooter());
