# ベースイメージとして公式のFFmpegイメージを使用
FROM jrottenberg/ffmpeg:latest

# 作業ディレクトリを設定
WORKDIR /app

# 抽出するためのスクリプトをコンテナにコピー
COPY extract_frames.sh /app/

# スクリプトに実行権限を付与
RUN chmod +x /app/extract_frames.sh

# デフォルトのコマンドを設定
# 一旦コンテナが停止しないようファイルを監視
# ENTRYPOINT ["/bin/bash", "-c", "/app/extract_frames.sh && tail -f /dev/null"]
ENTRYPOINT ["/bin/bash", "-c", "/app/extract_frames.sh"]
