#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Universe Of Animals (YOUTUBE_TOKEN_JSON_ANIMALS) veya Hidden Layer
(YOUTUBE_TOKEN_JSON_HIDDEN_LAYER) kanalı için YouTube yetkisi üretir.

Bilgisayarında kanal başına BİR KEZ çalıştır:
    pip install google-auth-oauthlib google-api-python-client
    python tools/kanal_yetkisi_al.py client_secret.json                      (Universe Of Animals)
    python tools/kanal_yetkisi_al.py client_secret.json --kanal hiddenlayer  (Hidden Layer)

- client_secret.json: diğer kanallar için kullandığın Google Cloud OAuth istemci dosyası
  (yoksa: YOUTUBE_CLIENT_ID ve YOUTUBE_CLIENT_SECRET ortam değişkenlerini ayarla, dosya verme).
- Tarayıcı açılınca scorsty@gmail.com ile giriş yap ve kanal seçiminde
  "Universe Of Animals" kanalını seç.
- Script bağlanan kanalın adını kontrol eder; yanlış kanalsa token vermez.
- Çıkan youtube_token_animals.json dosyasının TÜM içeriğini GitHub'da
  promtAPilot → Settings → Secrets and variables → Actions → New repository secret
  adı: YOUTUBE_TOKEN_JSON_ANIMALS olarak yapıştır. Sonra dosyayı sil.
"""
import json
import os
import sys

from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

SCOPES = [
    "https://www.googleapis.com/auth/youtube.upload",
    "https://www.googleapis.com/auth/youtube.readonly",
    "https://www.googleapis.com/auth/youtube.force-ssl",  # açıklama güncelleme ve yorum için
]
KANALLAR = {
    "animals": ("universe of animals", "Universe Of Animals", "youtube_token_animals.json", "YOUTUBE_TOKEN_JSON_ANIMALS"),
    "hiddenlayer": ("hidden layer", "Hidden Layer", "youtube_token_hidden_layer.json", "YOUTUBE_TOKEN_JSON_HIDDEN_LAYER"),
}
_kanal = "animals"
if "--kanal" in sys.argv:
    i = sys.argv.index("--kanal")
    _kanal = sys.argv[i + 1] if i + 1 < len(sys.argv) else ""
    del sys.argv[i:i + 2]
if _kanal not in KANALLAR:
    sys.exit(f"--kanal şunlardan biri olmalı: {', '.join(KANALLAR)}")
EXPECTED, KANAL_ADI, OUT, SECRET = KANALLAR[_kanal]


def main():
    if len(sys.argv) > 1 and os.path.exists(sys.argv[1]):
        flow = InstalledAppFlow.from_client_secrets_file(sys.argv[1], SCOPES)
    else:
        cid = os.environ.get("YOUTUBE_CLIENT_ID")
        csec = os.environ.get("YOUTUBE_CLIENT_SECRET")
        if not (cid and csec):
            sys.exit("client_secret.json yolunu ver ya da YOUTUBE_CLIENT_ID / YOUTUBE_CLIENT_SECRET ayarla.")
        flow = InstalledAppFlow.from_client_config(
            {"installed": {"client_id": cid, "client_secret": csec,
                           "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                           "token_uri": "https://oauth2.googleapis.com/token",
                           "redirect_uris": ["http://localhost"]}}, SCOPES)

    creds = flow.run_local_server(port=0, prompt="consent", access_type="offline")
    yt = build("youtube", "v3", credentials=creds)
    items = yt.channels().list(part="snippet", mine=True).execute().get("items", [])
    title = items[0]["snippet"]["title"] if items else "?"
    print(f"Bağlanan kanal: {title}")
    if EXPECTED not in title.lower():
        sys.exit(f"HATA: Bu {KANAL_ADI} kanalı değil. Tekrar çalıştır ve doğru kanalı seç.")
    if not creds.refresh_token:
        sys.exit("HATA: refresh token gelmedi. Google hesabında uygulama erişimini kaldırıp tekrar dene.")

    with open(OUT, "w", encoding="utf-8") as f:
        f.write(creds.to_json())
    print(f"\nTamam! {OUT} oluşturuldu.")
    print(f"İçeriğinin tamamını GitHub secret'ı {SECRET} olarak ekle, sonra dosyayı sil.")


if __name__ == "__main__":
    main()
