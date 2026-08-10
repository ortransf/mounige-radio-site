"""カードのタイトル・コメントを CSV で編集するためのツール。

  python scripts/cards_csv.py export   cards.ts → cards.csv を書き出す
  python scripts/cards_csv.py apply    cards.csv の内容を cards.ts に反映する

CSV は Excel で開けるよう BOM 付き UTF-8 で書き出す。
編集してよいのは title と comment の列だけ（id / char / rarity を変えると
画像やレアリティの対応が崩れるため、apply 時に元の値で上書きする）。
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
        w.writerow(["id", "title", "comment", "レアリティ(参考)", "登場(参考)"])
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
        old_t, old_c = unesc(m.group("title")), unesc(m.group("comment"))
        if title != old_t or comment != old_c:
            changed.append(f"  #{cid:02d} {old_t} / {old_c}\n      → {title} / {comment}")
        # char と rarity は CSV 側の値を無視し、元の定義を維持する
        return (
            f"{{ id: {cid}, title: '{esc(title)}', comment: '{esc(comment)}', "
            f"char: '{m.group('char')}', rarity: {m.group('rarity')} }},"
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
