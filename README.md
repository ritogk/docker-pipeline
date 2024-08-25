# docker-pipeline-script

docker 間を連携して動作するパイプラインスクリプト  
メイン処理の Dockerfile を他の人に書いてもらう時に使う。

## pipeline の流れ

1. s3 から動画をダウンロード(controller-container)
2. 動画から画像を生成(converter-container)
3. 画像を s3 にアップロード(controller-container)

## 使い方

```
cp .env.copy .env
vim .env
# パイプライン起動
./run.sh
```

コンテナ間の連携には volume に一時ファイル(dl_complete, converting_complete)を作成して各コンテナで監視して行う。
