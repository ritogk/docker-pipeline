FROM ubuntu:20.04

WORKDIR /app
COPY run.sh /app/
RUN chmod +x /app/run.sh

# AWS CLI install
RUN apt-get update && apt-get install -y less vim curl unzip sudo
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
RUN unzip awscliv2.zip
RUN sudo ./aws/install

ENTRYPOINT ["/bin/bash", "-c", "/app/run.sh"]