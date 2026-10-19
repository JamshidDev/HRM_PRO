#!/usr/bin/env bash
# dist → web root uzilishsiz. Avval yangi fayllar (eskilari o'chirilmaydi — ochiq tablar eski
# chunk'larni so'raydi), index.html eng oxirida atomik almashadi, eski assetlar KEEP_DAYS dan keyin.
# Foydalanish: scripts/publish-dist.sh <dist> <web-root>
set -euo pipefail

SRC=${1:?dist papkasi kerak}
TARGET=${2:?web root kerak}
KEEP_DAYS=${KEEP_DAYS:-7}

[ -f "$SRC/index.html" ] || { echo "!! $SRC/index.html yo'q — build to'liq emas"; exit 1; }
[ -d "$TARGET" ] || { echo "!! $TARGET papkasi yo'q"; exit 1; }

# 1) Yangi chunk/asset'lar — index.html hali eski, foydalanuvchi oraliq holatni ko'rmaydi.
rsync -a --exclude='/index.html' "$SRC"/ "$TARGET"/

# 2) index.html — atomik (bitta rename): sayt shu lahzada to'liq yangi versiyaga o'tadi.
cp "$SRC/index.html" "$TARGET/.index.html.new"
mv -f "$TARGET/.index.html.new" "$TARGET/index.html"

# 3) Yangi build'da yo'q va KEEP_DAYS dan eski hash'li assetlar.
removed=0
if [ -d "$TARGET/assets" ]; then
  while IFS= read -r -d '' f; do
    if [ ! -e "$SRC/assets/$(basename "$f")" ]; then
      rm -f "$f"
      removed=$((removed + 1))
    fi
  done < <(find "$TARGET/assets" -maxdepth 1 -type f -mtime +"$KEEP_DAYS" -print0)
fi
echo "== publish OK: $(find "$SRC" -type f | wc -l | tr -d ' ') fayl, eski asset o'chirildi: $removed =="
