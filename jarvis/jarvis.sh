#!/usr/bin/env bash
cd "$(dirname "$0")"
if [ ! -d .venv ]; then
  python3 -m venv .venv && .venv/bin/pip install -q -r requirements.txt
  [ -f .env ] || cp .env.example .env
  echo "Kurulum tamam. .env dosyasına ANTHROPIC_API_KEY yazın ve tekrar çalıştırın."; exit 0
fi
exec .venv/bin/python jarvis.py "$@"
