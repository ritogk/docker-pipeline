FROM jrottenberg/ffmpeg:latest

WORKDIR /app
COPY run.sh /app/
RUN chmod +x /app/run.sh

# tail -fはデバッグ用
# ENTRYPOINT ["/bin/bash", "-c", "/app/run.sh && tail -f /dev/null"]
ENTRYPOINT ["/bin/bash", "-c", "/app/run.sh"]
