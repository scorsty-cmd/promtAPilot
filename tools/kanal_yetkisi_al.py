#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Universe Of Animals kanalı için YouTube yetkisi (YOUTUBE_TOKEN_JSON_ANIMALS) üretir.

Bilgisayarında BİR KEZ çalıştır:
    pip install google-auth-oauthlib google-api-python-client
    python tools/kanal_yetkisi_al.py client_secret.json

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
EXPECTED = "universe of animals"
OUT = "youtube_token_animals.json"


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
        sys.exit("HATA: Bu Universe Of Animals kanalı değil. Tekrar çalıştır ve doğru kanalı seç.")
    if not creds.refresh_token:
        sys.exit("HATA: refresh token gelmedi. Google hesabında uygulama erişimini kaldırıp tekrar dene.")

    with open(OUT, "w", encoding="utf-8") as f:
        f.write(creds.to_json())
    print(f"\nTamam! {OUT} oluşturuldu.")
    print("İçeriğinin tamamını GitHub secret'ı YOUTUBE_TOKEN_JSON_ANIMALS olarak ekle, sonra dosyayı sil.")


if __name__ == "__main__":
    main()
