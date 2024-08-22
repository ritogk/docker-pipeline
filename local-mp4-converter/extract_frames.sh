#!/bin/bash

# 動画ファイルのパス
VIDEO_PATH="/app/video.mp4"

# 出力ディレクトリ
OUTPUT_DIR="/app/frames"

# 出力ディレクトリを作成
mkdir -p "$OUTPUT_DIR"

# FFmpegを使用して動画から画像を抽出
ffmpeg -i "$VIDEO_PATH" -vf "fps=1" "$OUTPUT_DIR/frame_%04d.png"

# 処理結果を通知
echo "Images extracted to $OUTPUT_DIR"
