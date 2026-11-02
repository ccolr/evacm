# CatEva

CatEva is a dependency-free static video page. The repository root is not a
web root: only `public/` is intended to be served by Nginx.

## Project structure

```text
public/                    Browser-facing files and the Nginx document root
  index.html
  content/                 Internal Shelter, Cat, and Star page profiles
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

## Select the homepage

`public/index.html` is the single homepage switch. Change only
`ACTIVE_HOME_PAGE` to `shelter`, `cat`, or `star`:

```js
const ACTIVE_HOME_PAGE = "shelter";
```

The selected profile is filled into the root page without navigation, so the
browser URL remains `/`. The other profiles are not requested, and the Nginx
resource guard rejects direct browser navigation to `public/content/`.

On each VPS, generate and deploy only the stream matching this key when the
other videos should not exist on that server.

## Prepare the video stream

The default command reads all three MP4 files under `private/video/` and writes
their ignored HLS streams to `public/media/`:

```sh
./scripts/prepare-video.sh
```

Generate only one page's stream by passing its key:

```sh
./scripts/prepare-video.sh shelter
./scripts/prepare-video.sh cat
./scripts/prepare-video.sh star
```

Alternative source and website roots can be passed explicitly:

```sh
./scripts/prepare-video.sh all /srv/cateva-source /var/www/cateva/public
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
