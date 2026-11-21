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

GL=${GL:-swangle}
if [ "${FULL:-0}" = "1" ]; then
  CHROME_PATH=${CHROME_PATH:-/usr/bin/google-chrome}
  export CHROME_PATH
fi
WRAP=""
if [ "${XVFB:-0}" = "1" ] && command -v xvfb-run >/dev/null; then
  WRAP="xvfb-run -a -s '-screen 0 1280x1024x24'"
fi
export LIBGL_ALWAYS_SOFTWARE=${LIBGL_ALWAYS_SOFTWARE:-1}
LABEL=${LABEL:-"gl=$GL xvfb=${XVFB:-0} full=${FULL:-0}"}

mean_rgb() { ffmpeg -v error -i "$1" -vf scale=1:1 -f rawvideo -pix_fmt rgb24 - 2>/dev/null | od -An -tu1 | awk '{print $1","$2","$3}'; }

run_case() { # tag komposisi props frame
  local tag=$1 comp=$2 props=$3 frame=$4
  rm -f "out/smoke/d_${tag}_${frame}.jpg"
  eval $WRAP env GL="$GL" COMPOSITION="$comp" INPUT_PROPS="'$props'" DIAG="${DIAG:-0}" \
    node scripts/stills.mjs "out/smoke/d_${tag}_" "$frame" 0.5 > "out/smoke/d_${tag}.log" 2>&1
  local rc=$?
  local f="out/smoke/d_${tag}_${frame}.jpg"
  local v="gagal"
  [ -f "$f" ] && v=$(mean_rgb "$f")
  local glr
  glr=$(sed 's/\x1b\[[0-9;]*m//g' "out/smoke/d_${tag}.log" | grep -oE 'UNMASKED=[^ ]*' | head -1)
  printf 'DIFF %-10s rgb=%-13s rc=%s %s\n' "$tag" "$v" "$rc" "$glr"
}

echo "=== $LABEL"
echo "# kontrol: kubus tanpa composer (harus oranye), scene tanpa composer (terlihat), composer HDR (duga: kosong)"
run_case probe      Probe     '{}' 30
run_case nocomposer BeerFlood '{"post":{"composer":false}}' 60
run_case hdr        BeerFlood '{}' 60
echo "# composer LDR (UnsignedByte): tiga varian"
run_case ldr        BeerFlood '{"post":{"ldr":true}}' 60
run_case ldrmsaa0   BeerFlood '{"post":{"ldr":true,"msaa":0}}' 60
run_case ldronly    BeerFlood '{"post":{"ldr":true,"msaa":0,"lens":false,"bloom":false}}' 60
echo "--- acuan: 207,226,245 = kosong · ~110,115,131 = scene polos · oranye = kubus probe"
echo "--- log: out/smoke/d_*.log"
