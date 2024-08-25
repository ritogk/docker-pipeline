#!/bin/sh

echo "Waiting for download to complete..."
while [ ! -f /data/dl_complete ]; do
  echo "Waiting for download to complete..."
  sleep 1
done

echo "Converting video..."
mkdir -p /data/output

if ffmpeg -i /data/huukei.mp4 -vf "fps=1" /data/output/output-%03d.jpg; then
  echo "Images generated!"
  touch /data/converting_complete
else
  echo "Failed to converte video!" >&2
  exit 1
fi
