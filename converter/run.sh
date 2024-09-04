#!/bin/sh

echo "Waiting for download to complete..."
while [ ! -f /storage/dl_complete ]; do
  echo "Waiting for download to complete..."
  sleep 1
done

echo "Converting videos..."
mkdir -p /storage/output

for video_file in /storage/input/*.mp4; do
  if [ -f "$video_file" ]; then
    base_name=$(basename "$video_file" .mp4)
    output_dir="/storage/output/${base_name}"
    mkdir -p "${output_dir}"

    if ffmpeg -i "$video_file" -vf "fps=1" "${output_dir}/output-%03d.jpg"; then
      echo "Images generated for $video_file!"
    else
      echo "Failed to convert $video_file!" >&2
      exit 1
    fi
  fi
done

touch /storage/converting_complete