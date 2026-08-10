"""カードの内容を CSV で編集するためのツール。

  python scripts/cards_csv.py export   cards.ts → cards.csv を書き出す
  python scripts/cards_csv.py apply    cards.csv の内容を cards.ts に反映する

CSV は Excel で開けるよう BOM 付き UTF-8 で書き出す。
編集できるのは title / comment / レアリティ / 登場 の4列。
id は画像ファイル（card<id>.jpg）と紐づくので変更しないこと。

レアリティ: ノーマル / レア / スーパーレア / ウルトラレア
登場: 杉本 / 杉本(B) / 前川 / 前川(B) / 2人 / 2人(B)
      （(B) は同じ人物の別ポーズ。紫の頭＝杉本、水色の頭＋緑スーツ＝前川）
"""

import csv
import re
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")

ROOT = Path(__file__).resolve().parent.parent
TS = ROOT / "src" / "games" / "cards" / "cards.ts"
CSV = ROOT / "cards.csv"

# { id: 1, title: '…', comment: '…', char: 'sugimoto', rarity: 1 },
LINE_RE = re.compile(
    r"\{\s*id:\s*(?P<id>\d+),\s*"
    r"title:\s*'(?P<title>(?:[^'\\]|\\.)*)',\s*"
    r"comment:\s*'(?P<comment>(?:[^'\\]|\\.)*)',\s*"
    r"char:\s*'(?P<char>\w+)',\s*"
    r"rarity:\s*(?P<rarity>\d)\s*\},"
)

RARITY_NAME = {1: "ノーマル", 2: "レア", 3: "スーパーレア", 4: "ウルトラレア"}
CHAR_NAME = {
    "sugimoto": "杉本", "sugimoto_b": "杉本(B)",
    "maekawa": "前川", "maekawa_b": "前川(B)",
    "both": "2人", "both_b": "2人(B)",
}
RARITY_KEY = {v: k for k, v in RARITY_NAME.items()}
CHAR_KEY = {v: k for k, v in CHAR_NAME.items()}


def esc(s: str) -> str:
    """TS のシングルクォート文字列に入れる際のエスケープ"""
    return s.replace("\\", "\\\\").replace("'", "\\'")


def unesc(s: str) -> str:
    return s.replace("\\'", "'").replace("\\\\", "\\")


def export() -> None:
    src = TS.read_text(encoding="utf-8")
    rows = [m.groupdict() for m in LINE_RE.finditer(src)]
    if not rows:
        raise SystemExit("cards.ts からカードを読み取れなかった")

    with CSV.open("w", encoding="utf-8-sig", newline="") as f:
        w = csv.writer(f)
        w.writerow(["id", "title", "comment", "レアリティ", "登場"])
        for r in rows:
            w.writerow([
                r["id"],
                unesc(r["title"]),
                unesc(r["comment"]),
                RARITY_NAME[int(r["rarity"])],
                CHAR_NAME.get(r["char"], r["char"]),
            ])
    print(f"{CSV.name} に {len(rows)} 件を書き出した。title と comment 列を編集してください。")


def apply() -> None:
    if not CSV.exists():
        raise SystemExit(f"{CSV} が無い。先に export を実行すること")

    with CSV.open(encoding="utf-8-sig", newline="") as f:
        edits = {int(row["id"]): row for row in csv.DictReader(f)}

    src = TS.read_text(encoding="utf-8")
    changed: list[str] = []

    def replace(m: re.Match) -> str:
        cid = int(m.group("id"))
        row = edits.get(cid)
        if not row:
            return m.group(0)
        title = (row.get("title") or "").strip()
        comment = (row.get("comment") or "").strip()
        if not title or not comment:
            raise SystemExit(f"id={cid} の title か comment が空です")

        old_char, old_rarity = m.group("char"), int(m.group("rarity"))

        rarity_in = (row.get("レアリティ") or "").strip()
        if rarity_in and rarity_in not in RARITY_KEY:
            raise SystemExit(
                f"id={cid} のレアリティ '{rarity_in}' が不正。"
                f"使えるのは: {' / '.join(RARITY_KEY)}"
            )
        rarity = RARITY_KEY.get(rarity_in, old_rarity)

        char_in = (row.get("登場") or "").strip()
        if char_in and char_in not in CHAR_KEY:
            raise SystemExit(
                f"id={cid} の登場 '{char_in}' が不正。使えるのは: {' / '.join(CHAR_KEY)}"
            )
        char = CHAR_KEY.get(char_in, old_char)

        old_t, old_c = unesc(m.group("title")), unesc(m.group("comment"))
        diffs = []
        if title != old_t or comment != old_c:
            diffs.append(f"{old_t} / {old_c}\n      → {title} / {comment}")
        if char != old_char:
            diffs.append(f"登場: {CHAR_NAME[old_char]} → {CHAR_NAME[char]}")
        if rarity != old_rarity:
            diffs.append(f"レアリティ: {RARITY_NAME[old_rarity]} → {RARITY_NAME[rarity]}")
        if diffs:
            changed.append(f"  #{cid:02d} " + "\n      ".join(diffs))

        return (
            f"{{ id: {cid}, title: '{esc(title)}', comment: '{esc(comment)}', "
            f"char: '{char}', rarity: {rarity} }},"
        )

    updated = LINE_RE.sub(replace, src)
    if not changed:
        print("変更はありませんでした。")
        return

    TS.write_text(updated, encoding="utf-8")
    print(f"cards.ts を更新しました（{len(changed)} 件）:")
    print("\n".join(changed))


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else ""
    if cmd == "export":
        export()
    elif cmd == "apply":
        apply()
    else:
        raise SystemExit(__doc__)
