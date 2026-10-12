#!/usr/bin/env bash
# Extrait l'audio d'une vidéo, le compresse (mono 16 kHz, Opus 24 kbit/s)
# et le découpe en morceaux de 20 min (~3,6 Mo chacun, sous la limite Groq).
# Usage: ./1_decouper.sh video.mp4 impots
set -euo pipefail
[ $# -eq 2 ] || { echo "usage: $0 <video> <dossier_sortie>" >&2; exit 1; }
mkdir -p "$2"
ffmpeg -hide_banner -loglevel error -y -i "$1" -vn -ac 1 -ar 16000 \
  -c:a libopus -b:a 24k -f segment -segment_time 1200 -reset_timestamps 1 \
  "$2/part_%03d.ogg"
ls -lh "$2"/part_*.ogg
