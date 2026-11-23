#!/bin/bash
# usage: ./finish.sh NAME DURATION_SECONDS "Title"   e.g. ./finish.sh pengadilan_tikus 39.3143 "Pengadilan Tikus"
# one linear gain to ~-14 LUFS, true-peak safe limiter, H.264 CRF23 + AAC, freeze/black QA, qa_sheet.jpg
set -e; cd "$(dirname "$0")"; NAME="$1"; DUR="$2"; TITLE="${3:-$1}"; mkdir -p out
I=$(ffmpeg -nostats -i work/mix.wav -af ebur128=peak=true -f null - 2>&1 | grep -A1 "Integrated loudness" | grep "I:" | awk '{print $2}')
GAIN=$(python3 -c "print(round(-14.0-($I),2))"); echo "integrated $I LUFS -> gain $GAIN dB"
ffmpeg -y -loglevel error -i work/mix.wav -af "volume=${GAIN}dB,alimiter=limit=0.708:level=disabled" -ar 48000 work/final_audio.wav
ffmpeg -y -loglevel error -framerate 30 -i frames/f%04d.jpg -i work/final_audio.wav -c:v libx264 -preset slow -crf 23 -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart -t "$DUR" -metadata title="$TITLE" out/$NAME.mp4
ffmpeg -nostats -i out/$NAME.mp4 -af ebur128=peak=true -f null - 2>&1 | grep -E "I:|Peak:" | tail -2
ffmpeg -nostats -i out/$NAME.mp4 -vf "freezedetect=n=-60dB:d=0.4,blackdetect=d=0.1:pic_th=0.98" -an -f null - 2>&1 | grep -E "freeze_(start|duration)|black_start" | head -20 || true
rm -rf work/qa && mkdir work/qa && ffmpeg -loglevel error -i out/$NAME.mp4 -vf fps=0.5,scale=270:-1 work/qa/f%03d.jpg && python3 sheet.py work/qa out/qa_sheet.jpg 8
