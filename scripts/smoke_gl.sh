#!/bin/bash
# Cari backend GL mana yang benar-benar menghasilkan gambar di mesin ini.
# Uji: satu frame dari komposisi Probe (kubus sederhana) dan satu dari BeerFlood,
# lalu baca rata-rata RGB-nya. Latar BeerFlood = #cfe3f2 (207,227,242) = kanvas kosong.
#
# Pakai: bash scripts/smoke_gl.sh
set -uo pipefail
cd "$(dirname "$0")/.."
mkdir -p out/smoke

mean_rgb() { # $1 = berkas jpg
  ffmpeg -v error -i "$1" -vf scale=1:1 -f rawvideo -pix_fmt rgb24 - 2>/dev/null \
    | od -An -tu1 | awk '{print $1","$2","$3}'
}

echo "backend | probe(60) | beerflood(60) | verdict"
echo "--------|-----------|----------------|--------"

for gl in angle egl vulkan swangle; do
  rm -f out/smoke/*.jpg
  GL=$gl COMPOSITION=Probe timeout 600 node scripts/stills.mjs out/smoke/probe_ "60" 0.5 > out/smoke/probe_$gl.log 2>&1
  rc_p=$?
  GL=$gl COMPOSITION=BeerFlood timeout 600 node scripts/stills.mjs out/smoke/flood_ "60" 0.5 > out/smoke/flood_$gl.log 2>&1
  rc_f=$?
  p=$( [ -f out/smoke/probe_60.jpg ] && mean_rgb out/smoke/probe_60.jpg || echo "gagal")
  f=$( [ -f out/smoke/flood_60.jpg ] && mean_rgb out/smoke/flood_60.jpg || echo "gagal")
  verdict="tidak terpakai"
  if [ "$p" != "gagal" ] && [ "$p" != "17,16,19" ]; then
    if [ "$f" = "209,227,244" ]; then verdict="GL hidup, composer KOSONG"; else verdict="SIAP RENDER"; fi
  elif [ "$rc_p" -ne 0 ]; then verdict="GL gagal (lihat log)"; fi
  echo "$gl | $p | $f | $verdict"
  mkdir -p out/smoke/$gl && mv out/smoke/*.jpg out/smoke/$gl/ 2>/dev/null
done

echo
echo "Log per backend ada di out/smoke/*.log. Yang 'SIAP RENDER' itu yang dipakai untuk render penuh."