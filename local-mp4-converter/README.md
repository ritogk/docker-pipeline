# README

## image build

```
docker build -t video-frame-extractor .
```

## docker run

```
docker run --rm -v $(pwd)/frames:/app/frames -v $(pwd)/video.mp4:/app/video.mp4 video-frame-extractor
```
