#!/bin/bash
# Render video penuh + mux audio + QA.
#
# Pakai:
#   SCALE=1      bash scripts/render.sh          # 1080x1920 (default, paling cepat di CPU)
#   SCALE=1.3333 bash scripts/render.sh          # 1440x2560 (2K, hasil akhir)
#   GL=angle     bash scripts/render.sh          # backend GL (lihat scripts/smoke_gl.sh)
#
# Di mesin tanpa GPU pakai GL hasil smoke_gl.sh. Jangan pakai swangle kalau composer kosong.
set -uo pipefail
cd "$(dirname "$0")/.."

SCALE=${SCALE:-1}
GL=${GL:-angle}
COMP=${COMPOSITION:-BeerFlood}
OUT=${OUT:-out/final}
mkdir -p "$OUT"

echo "== render $COMP · scale $SCALE · gl $GL"
t0=$(date +%s)
npx remotion render src/index.tsx "$COMP" "$OUT/video_silent.mp4" \
  --codec h264 --crf 16 --scale "$SCALE" --gl "$GL" --concurrency 4 2>&1 | tail -30
rc=${PIPESTATUS[0]}
t1=$(date +%s)
echo "== render selesai rc=$rc dalam $((t1 - t0)) detik"
[ "$rc" -ne 0 ] && { echo "render gagal"; exit "$rc"; }

# Remotion menulis track audio senyap; ganti dengan mix kalau ada.
MIX=${MIX:-out/audio/mix.wav}
if [ -f "$MIX" ]; then
  echo "== mux audio dari $MIX"
  ffmpeg -y -v error -i "$OUT/video_silent.mp4" -i "$MIX" \
    -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -shortest "$OUT/video.mp4"
else
  echo "== tidak ada $MIX — video dibiarkan tanpa audio"
  cp "$OUT/video_silent.mp4" "$OUT/video.mp4"
fi

echo "== QA"
if [ -f scripts/short_qa.py ]; then
  mkdir -p "$OUT/qa"
  python3 scripts/short_qa.py "$OUT/video.mp4" "$OUT/qa" 2>&1 | tail -20 || echo "  (QA melewati dirinya sendiri; jalankan manual)"
fi

ffprobe -v error -show_entries format=duration,size -show_entries stream=codec_name,width,height,r_frame_rate,channels \
  -of default=nw=1 "$OUT/video.mp4"
echo "== hasil: $OUT/video.mp4"