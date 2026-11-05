#!/bin/sh
# One-time setup in a fresh workspace: run from the folder holding the kit files.
set -e
pip install --break-system-packages -q kokoro-onnx soundfile scipy
mkdir -p models
B=https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0
[ -s models/voices-v1.0.bin ] || curl -sSL -o models/voices-v1.0.bin $B/voices-v1.0.bin
[ -s models/kokoro-v1.0.onnx ] || curl -sSL -o models/kokoro-v1.0.onnx $B/kokoro-v1.0.onnx
ls -la models
which ffmpeg && fc-list | grep -c InterDisplay
