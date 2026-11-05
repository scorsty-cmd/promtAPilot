#!/bin/sh
exec /opt/pw-browsers/chromium --no-sandbox --disable-gpu --disable-gpu-compositing --disable-software-rasterizer "$@"
