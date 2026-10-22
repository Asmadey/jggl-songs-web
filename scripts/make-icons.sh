#!/bin/sh
# Regenerates the raster favicons from public/favicon.svg (rounded) and scripts/icon-square.svg (full bleed). Needs ImageMagick.
set -e
cd "$(dirname "$0")/.."
r() { magick -background none -density 600 "$1" -resize "$2x$2" "$3"; }
r public/favicon.svg 16 /tmp/f16.png
r public/favicon.svg 32 public/favicon-32.png
r public/favicon.svg 48 /tmp/f48.png
magick /tmp/f16.png public/favicon-32.png /tmp/f48.png public/favicon.ico
r scripts/icon-square.svg 180 public/apple-touch-icon.png
r public/favicon.svg 192 public/icon-192.png
r public/favicon.svg 512 public/icon-512.png
