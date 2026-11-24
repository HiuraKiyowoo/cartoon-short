#!/bin/bash
# Setup sekali. Butuh: node>=18, python3, ffmpeg.
set -e; cd "$(dirname "$0")"
npm install && npx playwright install chromium
pip install numpy scipy pillow soundfile            # tambah --break-system-packages jika diminta
# opsional untuk transkrip otomatis (timing.py --asr):
#   pip install sherpa-onnx ; unduh model sherpa-onnx-whisper-small dari github.com/k2-fsa/sherpa-onnx/releases (asr-models)
mkdir -p frames stills out work
echo "OK. Lanjut: baca PLAYBOOK.md"
