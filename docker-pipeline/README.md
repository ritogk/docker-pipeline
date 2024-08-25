# docker-pipeline

## 使い方

```
cp .env.copy .env
vim .env
# s3に動画を配置
./run.sh
# s3に画像が出力される。
```

コンテナ間の連携には volumn に一時ファイル(dl_complete, converting_complete)を監視して行う。
