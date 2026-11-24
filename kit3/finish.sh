#!/bin/bash
# Pakai: ./finish.sh nama_file DURASI_DETIK "Judul"     (jalankan dari folder kit)
# 1 gain linear -> ~-14 LUFS, limiter, H.264 CRF23 + AAC 192k (<30MB utk Telegram/WA), QA freeze/black + contact sheet
set -e; cd "$(dirname "$0")"; NAME="${1:?nama}"; DUR="${2:?durasi}"; TITLE="${3:-$1}"; mkdir -p out
I=$(ffmpeg -nostats -i work/mix.wav -af ebur128=peak=true -f null - 2>&1 | grep -A1 "Integrated loudness" | grep "I:" | awk '{print $2}')
GAIN=$(python3 -c "print(round(-14.0-($I),2))"); echo "integrated $I LUFS -> gain $GAIN dB"
ffmpeg -y -loglevel error -i work/mix.wav -af "volume=${GAIN}dB,alimiter=limit=0.708:level=disabled" -ar 48000 work/final_audio.wav
ffmpeg -y -loglevel error -framerate 30 -i frames/f%04d.jpg -i work/final_audio.wav -c:v libx264 -preset slow -crf 23 -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart -t "$DUR" -metadata title="$TITLE" out/$NAME.mp4
echo "--- loudness"; ffmpeg -nostats -i out/$NAME.mp4 -af ebur128=peak=true -f null - 2>&1 | grep -E "I:|Peak:" | tail -2
echo "--- freeze/black (kosong = bagus)"; ffmpeg -nostats -i out/$NAME.mp4 -vf "freezedetect=n=-60dB:d=0.4,blackdetect=d=0.1:pic_th=0.98" -an -f null - 2>&1 | grep -E "freeze_(start|duration)|black_start" | head -20 || true
ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate,duration -of csv=p=0 out/$NAME.mp4
rm -rf work/qa && mkdir work/qa && ffmpeg -loglevel error -i out/$NAME.mp4 -vf fps=0.5,scale=270:-1 work/qa/f%03d.jpg
python3 sheet.py work/qa out/qa_sheet.jpg 8; ls -la out/$NAME.mp4
