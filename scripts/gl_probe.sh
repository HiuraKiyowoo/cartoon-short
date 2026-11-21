#!/bin/bash
# Uji pembeda: apakah GL-nya yang rusak, atau composer post-processing-nya.
#
# Pakai di mesin yang punya layar virtual (Xvfb) & Mesa:
#   bash scripts/gl_probe.sh                      # Chrome Headless Shell (bawaan Remotion)
#   FULL=1 bash scripts/gl_probe.sh               # Chrome penuh (butuh CHROME_PATH)
#
# Hasil: satu baris per kasus, RGB rata-rata. Latar BeerFlood = 207,226,245 = kanvas kosong.
set -uo pipefail
cd "$(dirname "$0")/.."
mkdir -p out/smoke

GL=${GL:-angle}
if [ "${FULL:-0}" = "1" ]; then
  CHROME_PATH=${CHROME_PATH:-/usr/bin/google-chrome}
  export CHROME_PATH
fi
WRAP=""
if [ "${XVFB:-1}" = "1" ] && command -v xvfb-run >/dev/null; then
  WRAP="xvfb-run -a -s '-screen 0 1280x1024x24'"
fi
export LIBGL_ALWAYS_SOFTWARE=${LIBGL_ALWAYS_SOFTWARE:-1}

mean_rgb() { ffmpeg -v error -i "$1" -vf scale=1:1 -f rawvideo -pix_fmt rgb24 - 2>/dev/null | od -An -tu1 | awk '{print $1","$2","$3}'; }

run_case() { # tag komposisi props frame
  local tag=$1 comp=$2 props=$3 frame=$4
  rm -f "out/smoke/d_${tag}_${frame}.jpg"
  eval $WRAP env GL="$GL" COMPOSITION="$comp" INPUT_PROPS="'$props'" \
    node scripts/stills.mjs "out/smoke/d_${tag}_" "$frame" 0.5 > "out/smoke/d_${tag}.log" 2>&1
  local rc=$?
  local f="out/smoke/d_${tag}_${frame}.jpg"
  local v="gagal"
  [ -f "$f" ] && v=$(mean_rgb "$f")
  local glr
  glr=$(sed 's/\x1b\[[0-9;]*m//g' "out/smoke/d_${tag}.log" | grep -o 'GL_RENDERER = [^,]*' | head -1)
  printf 'DIFF %-12s rgb=%-13s rc=%s %s\n' "$tag" "$v" "$rc" "$glr"
}

# probe: kubus polos, TANPA composer. Kalau ini gambar → GL sehat.
run_case probe Probe '{}' 30
# beerflood penuh: composer ter-mount.
run_case flood BeerFlood '{"diag":true}' 60
# beerflood tanpa composer: kalau ini gambar → composer penyebabnya.
run_case nocomposer BeerFlood '{"post":{"composer":false}}' 60

echo "--- catatan: latar BeerFlood 207,226,245 = kosong; kubus probe ~ oranye (R>G>B)"
echo "--- log: out/smoke/d_*.log"
