# README

## ビルド

```
docker build -t aws-video-frame-extractor .
```

## local でテスト

```
docker run --rm -e S3_BUCKET=docker-rito-sample-bucket \
-e S3_INPUT_DIR=input \
-e S3_OUTPUT_DIR=output \
-e AWS_ACCESS_KEY_ID=xxxxxxxxxxxxx \
-e AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxx \
-e AWS_DEFAULT_REGION=ap-northeast-1 \
aws-video-frame-extractor
```

## タスク起動

```
aws ecs run-task \
    --cluster mp4-converter-cluster \
    --task-definition mp4-converter-task-define \
    --overrides '{
        "containerOverrides": [
            {
                "name": "mp4-converter-container",
                "environment": [
                    {
                        "name": "S3_BUCKET",
                        "value": "docker-rito-sample-bucket"
                    },
                    {
                        "name": "S3_INPUT_DIR",
                        "value": "input"
                    },
                    {
                        "name": "S3_OUTPUT_DIR",
                        "value": "output"
                    }
                ]
            }
        ]
    }'

```
