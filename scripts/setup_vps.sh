#!/bin/bash
# Setup sekali-jalan untuk render three.js/Remotion di VPS Linux tanpa GPU (Mesa llvmpipe).
# Pakai: bash scripts/setup_vps.sh
# Setelah ini: bash scripts/smoke_gl.sh  (cari backend GL mana yang menghasilkan gambar)
set -euo pipefail

echo "== 1. paket sistem (mesa + dependensi chromium + ffmpeg)"
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
# Mesa: llvmpipe = OpenGL 4.5 di CPU, jauh lebih lengkap dari SwiftShader (float RT, MSAA).
# Deps chromium: nama paket beda antara Debian 12 dan Ubuntu 24 (akhiran t64).
apt-get install -y --no-install-recommends \
  libgl1-mesa-dri libglx-mesa0 libegl1 libgles2 libglu1-mesa mesa-utils \
  libnss3 libdbus-1-3 libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 libxfixes3 \
  libxrandr2 libgbm1 libpango-1.0-0 libcairo2 libatk1.0-0t64 libatk-bridge2.0-0t64 \
  libcups2t64 libasound2t64 ffmpeg python3-pip curl xz-utils \
  || apt-get install -y --no-install-recommends \
  libgl1-mesa-dri libglx-mesa0 libegl1 libgles2 libglu1-mesa mesa-utils \
  libnss3 libdbus-1-3 libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 libxfixes3 \
  libxrandr2 libgbm1 libpango-1.0-0 libcairo2 libatk1.0-0 libatk-bridge2.0-0 \
  libcups2 libasound2 ffmpeg python3-pip curl xz-utils

echo "== 2. Node 22"
if ! command -v node >/dev/null || [ "$(node -v | cut -c2-3)" -lt 22 ]; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
fi
node -v

echo "== 3. dependensi proyek"
cd "$(dirname "$0")/.."
npm install --no-audit --no-fund

echo "== 4. Chromium untuk Remotion"
npx remotion browser ensure

echo "== 5. cek GL dari Mesa"
glxinfo -B 2>/dev/null | sed -n '1,12p' || echo "  (glxinfo tidak tersedia / tanpa X — tidak fatal untuk headless)"

echo
echo "Selesai. Langkah berikutnya: bash scripts/smoke_gl.sh"