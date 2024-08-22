# ベースイメージとして公式のFFmpegイメージを使用
FROM jrottenberg/ffmpeg:latest

# 作業ディレクトリを設定
WORKDIR /app

# 抽出するためのスクリプトをコンテナにコピー
COPY run.sh /app/

# スクリプトに実行権限を付与
RUN chmod +x /app/run.sh

# AWS CLI install
RUN apt-get update && apt-get install -y less vim curl unzip sudo
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
RUN unzip awscliv2.zip
RUN sudo ./aws/install

# ENTRYPOINT ["/bin/bash", "-c", "/app/run.sh && tail -f /dev/null"]
ENTRYPOINT ["/bin/bash", "-c", "/app/run.sh"]
