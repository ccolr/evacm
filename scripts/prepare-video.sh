#!/bin/sh

set -eu

script_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
project_root=$(dirname "$script_dir")

profile="${1:-all}"
source_root="${2:-$project_root/private/video}"
site_root="${3:-$project_root/public}"

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "ffmpeg is required to prepare the HLS streams." >&2
  exit 1
fi

prepare_stream() {
  input_file="$1"
  output_dir="$2"
  manifest_name="$3"
  init_name="$4"
  segment_prefix="$5"

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
    -hls_fmp4_init_filename "$init_name" \
    -hls_segment_filename "$output_dir/${segment_prefix}%05d.m4s" \
    "$output_dir/$manifest_name"

  echo "HLS stream created in $output_dir"
}

prepare_shelter() {
  prepare_stream "$source_root/shelter.mp4" "$site_root/media/1d74a2c9" \
    "5b90e1.m3u8" "02c4af.m4s" "a18f"
}

prepare_cat() {
  prepare_stream "$source_root/cat.mp4" "$site_root/media/6c1f0b8e" \
    "41d7c9.m3u8" "9a03d4.m4s" "7e2a"
}

prepare_star() {
  prepare_stream "$source_root/star.mp4" "$site_root/media/b37e9a40" \
    "c82d51.m3u8" "4f1a0c.m4s" "d903"
}

case "$profile" in
  shelter) prepare_shelter ;;
  cat) prepare_cat ;;
  star) prepare_star ;;
  all)
    prepare_shelter
    prepare_cat
    prepare_star
    ;;
  *)
    echo "Usage: $0 [all|shelter|cat|star] [source-root] [site-root]" >&2
    exit 1
    ;;
esac
