# CatEva

CatEva is a dependency-free static video page. The repository root is not a
web root: only `public/` is intended to be served by Nginx.

## Project structure

```text
public/                    Browser-facing files and the Nginx document root
  index.html
  assets/
    css/                   Page styles
    js/                    Player behaviour
    images/                Background and poster assets
    icons/                 Favicons
    vendor/videojs/        Pinned Video.js distribution and license
  media/                   Generated HLS stream; ignored by Git
private/video/             Original MP4 sources; ignored by Git
scripts/                   Local media preparation tools
deploy/nginx/              Versioned Nginx deployment example
```

## Local development

Serve only the public directory:

```sh
python3 -m http.server 8765 --bind 127.0.0.1 --directory public
```

Then open `http://127.0.0.1:8765/`.

## Prepare the video stream

The default command reads `private/video/cat.mp4` and writes the ignored HLS
stream to `public/media/`:

```sh
./scripts/prepare-video.sh
```

An alternative source file and website root can be passed explicitly:

```sh
./scripts/prepare-video.sh /srv/cateva-source/cat.mp4 /var/www/cateva/public
```

The script copies the existing H.264/AAC streams into fragmented MP4 HLS
segments without re-encoding. Never place the original MP4 under `public/`.

## Deployment

Point the Nginx `root` at the deployed `public/` directory and merge
`deploy/nginx/cateva.conf.example` into the existing HTTPS server block. Keep
the server's current TLS and domain directives.

Before submitting changes, run:

```sh
node --check public/assets/js/player.js
sh -n scripts/prepare-video.sh
git diff --check
```
