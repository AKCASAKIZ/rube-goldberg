#!/bin/bash
# Kayit modunun urettigi .webm dosyasini YouTube Shorts'a uygun dikey mp4'e cevirir.
#   ./mp4-yap.sh ~/Downloads/rube-serbest-1234.webm [cikti.mp4]
# Cikti: 1080x1920, 60 fps, H.264 + sessiz AAC izi (Shorts sessiz videoyu sevmiyor).
set -euo pipefail

giris="${1:?kullanim: ./mp4-yap.sh girdi.webm [cikti.mp4]}"
cikti="${2:-${giris%.*}.mp4}"

command -v ffmpeg >/dev/null || { echo "ffmpeg yok: brew install ffmpeg"; exit 1; }

olcek="scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=0x0e1015,fps=60"
ortak=(-c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -profile:v high -level 4.2
       -c:a aac -b:a 128k -movflags +faststart)

# Kayıtta ses varsa onu koru; yoksa Shorts sessiz videoyu sevmediği için
# sessiz bir ses izi ekle.
if ffprobe -v error -select_streams a -show_entries stream=index -of csv=p=0 "$giris" | grep -q .; then
  ffmpeg -y -i "$giris" -vf "$olcek" "${ortak[@]}" "$cikti"
else
  ffmpeg -y -i "$giris" -f lavfi -i anullsrc=channel_layout=stereo:sample_rate=44100 \
    -vf "$olcek" "${ortak[@]}" -shortest "$cikti"
fi

echo "hazir: $cikti"
