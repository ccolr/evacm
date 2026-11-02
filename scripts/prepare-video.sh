#!/bin/sh

set -eu

script_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
project_root=$(dirname "$script_dir")

input_file="${1:-$project_root/private/video/cat.mp4}"
site_root="${2:-$project_root/public}"
output_dir="$site_root/media/6c1f0b8e"

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "ffmpeg is required to prepare the HLS stream." >&2
  exit 1
fi

if [ ! -f "$input_file" ]; then
  echo "Video source not found: $input_file" >&2
  exit 1
fi

mkdir -p "$output_dir"

ffmpeg -hide_banner -loglevel warning -y \
  -i "$input_file" \
  -map 0:v:0 -map "0:a:0?" \
  -c copy \
  -f hls \
  -hls_time 6 \
  -hls_playlist_type vod \
  -hls_segment_type fmp4 \
  -hls_flags independent_segments \
  -hls_fmp4_init_filename "9a03d4.m4s" \
  -hls_segment_filename "$output_dir/7e2a%05d.m4s" \
  "$output_dir/41d7c9.m3u8"

echo "HLS stream created in $output_dir"
