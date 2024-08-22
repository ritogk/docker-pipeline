#!/bin/sh

S3_BUCKET=${S3_BUCKET}
S3_INPUT_DIR=${S3_INPUT_DIR}
S3_OUTPUT_DIR=${S3_OUTPUT_DIR}

echo "st"

# 必須パラメータが指定されているかを確認
if [ -z "$S3_BUCKET" ] || [ -z "$S3_INPUT_DIR" ] || [ -z "$S3_OUTPUT_DIR" ]; then
  echo "Error: S3_BUCKET, S3_INPUT_DIR, and S3_OUTPUT_DIR must be specified."
  exit 1
fi

echo "1"

# S3ディレクトリからすべてのMP4ファイルをローカルにダウンロード
aws s3 sync s3://$S3_BUCKET/$S3_INPUT_DIR /app/input/ --exclude "*" --include "*.mp4"

echo "2"

# ダウンロードされた各MP4ファイルを処理
for file in /app/input/*.mp4; do
  filename=$(basename "$file" .mp4)
  output_dir="/app/output/$filename"
  mkdir -p "$output_dir"
  
  # ffmpegを使ってMP4ファイルから画像を抽出
  ffmpeg -i "$file" -vf "fps=1" "$output_dir/frame_%04d.png"
  
  # 画像をS3にアップロード
  aws s3 cp "$output_dir/" s3://$S3_BUCKET/$S3_OUTPUT_DIR/$filename/ --recursive
done

echo "3"

echo "All done!"
