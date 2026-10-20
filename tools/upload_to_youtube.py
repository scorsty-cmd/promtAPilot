#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
🎬 YouTube Cloud Uploader & Scheduler (GitHub Actions Otonom Sürümü)
====================================================================
Bu script Google Drive (veya bulut depolama) üzerindeki videoları otomatik
olarak tarar, indirir, kontrollerini yapar ve YouTube Data API v3 üzerinden
kanala yükleyip zamanlar.

Ortam Değişkenleri (GitHub Secrets):
  - YOUTUBE_CLIENT_ID: Google Cloud OAuth 2.0 Client ID
  - YOUTUBE_CLIENT_SECRET: Google Cloud OAuth 2.0 Client Secret
  - YOUTUBE_REFRESH_TOKEN: Süresiz yenileme yetkisi olan OAuth Refresh Token
  - GDRIVE_FOLDER_ID: Videoların alınacağı Google Drive Klasör ID'si
  - GDRIVE_SERVICE_ACCOUNT_KEY: (Opsiyonel) Drive için Servis Hesabı JSON metni
  - GOOGLE_DRIVE_REFRESH_TOKEN: (Opsiyonel) Drive için ayrı OAuth Refresh Token
  - VIDEO_DOWNLOAD_URL: (Opsiyonel) Doğrudan video indirme bağlantısı
  - YOUTUBE_PRIVACY_STATUS: private / unlisted / public (varsayılan: private)
  - AUTO_SCHEDULE: true / false (varsayılan: true)
"""

from __future__ import annotations

import datetime
import io
import json
import os
import re
import subprocess
import sys
import tempfile
import urllib.request
from typing import Any

# Windows ve Linux runner UTF-8 desteği
try:
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload, MediaIoBaseDownload

YOUTUBE_SCOPES = [
    "https://www.googleapis.com/auth/youtube.upload",
    "https://www.googleapis.com/auth/youtube.readonly",
]

DRIVE_SCOPES = [
    "https://www.googleapis.com/auth/drive.readonly",
    "https://www.googleapis.com/auth/drive",
]

MIN_DOCUMENTARY_DURATION_SEC = 480.0  # 8 dakika (Tarih kanalı standardı)


def get_env_var(name: str, default: str | None = None) -> str | None:
    """Ortam değişkenini temizleyip döndürür."""
    val = os.environ.get(name)
    if val:
        return val.strip()
    return default


def get_youtube_credentials() -> Credentials:
    """Ortam değişkenlerinden YouTube OAuth credentials objesi üretir."""
    # 1. Tam JSON formatında verilmişse
    token_json_str = get_env_var("YOUTUBE_TOKEN_JSON") or get_env_var("GOOGLE_TOKEN_JSON")
    if token_json_str:
        try:
            token_data = json.loads(token_json_str)
            creds = Credentials.from_authorized_user_info(token_data, YOUTUBE_SCOPES)
            if creds.expired and creds.refresh_token:
                creds.refresh(Request())
            return creds
        except Exception as e:
            print(f"[UYARI] YOUTUBE_TOKEN_JSON ayrıştırılamadı: {e}. Ayrı değişkenler kontrol ediliyor...")

    # 2. Ayrı anahtarlar olarak verilmişse
    client_id = get_env_var("YOUTUBE_CLIENT_ID") or get_env_var("GOOGLE_CLIENT_ID")
    client_secret = get_env_var("YOUTUBE_CLIENT_SECRET") or get_env_var("GOOGLE_CLIENT_SECRET")
    refresh_token = get_env_var("YOUTUBE_REFRESH_TOKEN")

    if not client_id or not client_secret or not refresh_token:
        missing = []
        if not client_id:
            missing.append("YOUTUBE_CLIENT_ID (veya GOOGLE_CLIENT_ID)")
        if not client_secret:
            missing.append("YOUTUBE_CLIENT_SECRET (veya GOOGLE_CLIENT_SECRET)")
        if not refresh_token:
            missing.append("YOUTUBE_REFRESH_TOKEN")
        raise RuntimeError(f"❌ YouTube kimlik bilgileri eksik! GitHub Secrets kontrol edilmeli: {', '.join(missing)}")

    creds = Credentials(
        token=None,
        refresh_token=refresh_token,
        token_uri="https://oauth2.googleapis.com/token",
        client_id=client_id,
        client_secret=client_secret,
        scopes=YOUTUBE_SCOPES,
    )
    creds.refresh(Request())
    return creds


def get_drive_service():
    """Google Drive servisini oluşturur (OAuth veya Servis Hesabı ile)."""
    # 1. Servis hesabı JSON'ı varsa
    sa_json = get_env_var("GDRIVE_SERVICE_ACCOUNT_KEY")
    if sa_json:
        try:
            from google.oauth2 import service_account
            sa_data = json.loads(sa_json)
            creds = service_account.Credentials.from_service_account_info(sa_data, scopes=DRIVE_SCOPES)
            return build("drive", "v3", credentials=creds)
        except Exception as e:
            print(f"[UYARI] GDRIVE_SERVICE_ACCOUNT_KEY kullanılamadı: {e}")

    # 2. Drive OAuth refresh token veya ortak Google refresh token
    drive_refresh = get_env_var("GOOGLE_DRIVE_REFRESH_TOKEN") or get_env_var("YOUTUBE_REFRESH_TOKEN")
    client_id = get_env_var("GOOGLE_CLIENT_ID") or get_env_var("YOUTUBE_CLIENT_ID")
    client_secret = get_env_var("GOOGLE_CLIENT_SECRET") or get_env_var("YOUTUBE_CLIENT_SECRET")

    if drive_refresh and client_id and client_secret:
        try:
            creds = Credentials(
                token=None,
                refresh_token=drive_refresh,
                token_uri="https://oauth2.googleapis.com/token",
                client_id=client_id,
                client_secret=client_secret,
                scopes=DRIVE_SCOPES,
            )
            creds.refresh(Request())
            return build("drive", "v3", credentials=creds)
        except Exception as e:
            print(f"[BİLGİ] Drive OAuth yetkisi yok ({e}). Genel indirme moduna geçilecek.")

    return None


def calculate_next_publish_time() -> tuple[str, str]:
    """Salı 22:00 TSİ (19:00 UTC) veya Cumartesi 17:00 TSİ (14:00 UTC) için en yakın yayın zamanını döner."""
    now = datetime.datetime.now(datetime.timezone.utc)
    candidates = []
    for day_diff in range(1, 14):
        target = now + datetime.timedelta(days=day_diff)
        if target.weekday() == 1:  # Salı 19:00 UTC (22:00 TSİ)
            dt = target.replace(hour=19, minute=0, second=0, microsecond=0)
            candidates.append((dt, "Salı 22:00 TSİ"))
        elif target.weekday() == 5:  # Cumartesi 14:00 UTC (17:00 TSİ)
            dt = target.replace(hour=14, minute=0, second=0, microsecond=0)
            candidates.append((dt, "Cumartesi 17:00 TSİ"))

    selected_dt, label = candidates[0]
    iso_str = selected_dt.strftime("%Y-%m-%dT%H:%M:%SZ")
    return iso_str, f"{label} ({selected_dt.strftime('%d.%m.%Y')})"


def measure_video_duration(video_path: str) -> float:
    """ffprobe veya ffmpeg ile video süresini (saniye) ölçer."""
    for tool in ["ffprobe", "ffmpeg"]:
        try:
            if tool == "ffprobe":
                cmd = [
                    "ffprobe", "-v", "error", "-show_entries",
                    "format=duration", "-of", "default=noprint_wrappers=1:nokey=1",
                    video_path
                ]
                res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
                if res.returncode == 0 and res.stdout.strip():
                    return float(res.stdout.strip())
            else:
                cmd = ["ffmpeg", "-i", video_path]
                res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
                m = re.search(r"Duration:\s*(\d+):(\d+):(\d+\.\d+)", res.stderr)
                if m:
                    h, mn, s = m.groups()
                    return int(h) * 3600 + int(mn) * 60 + float(s)
        except Exception:
            continue
    return 0.0


def download_file_from_gdrive(service, file_id: str, dest_path: str):
    """Google Drive API ile dosyayı hedefe indirir."""
    request = service.files().get_media(fileId=file_id)
    with io.FileIO(dest_path, "wb") as fh:
        downloader = MediaIoBaseDownload(fh, request, chunksize=1024 * 1024 * 10)
        done = False
        while not done:
            status, done = downloader.next_chunk()
            if status:
                print(f"  İndiriliyor: %{int(status.progress() * 100)}...", end="\r", flush=True)
    print("\n✅ Dosya başarıyla indirildi.")


def download_via_gdown(folder_id: str, dest_dir: str):
    """gdown kullanarak paylaşılan Google Drive klasöründeki dosyaları indirir."""
    import gdown
    folder_url = f"https://drive.google.com/drive/folders/{folder_id}"
    print(f"📥 gdown ile klasör taranıyor: {folder_url}")
    gdown.download_folder(url=folder_url, output=dest_dir, quiet=False, use_cookies=False)


def get_candidate_video_from_cloud(work_dir: str) -> dict[str, Any]:
    """
    Buluttan (GitHub Release Asset, Local Path, Google Drive veya Direct URL) yüklenecek videoyu çeker.
    """
    # 0. Öncelik: GitHub Release üzerinden indirilmiş veya yerel video verilmişse
    local_env_path = get_env_var("LOCAL_VIDEO_PATH")
    local_files = [
        os.path.join(work_dir, f) for f in os.listdir(work_dir)
        if any(f.lower().endswith(ext) for ext in [".mp4", ".mov", ".mkv"])
    ] if os.path.exists(work_dir) else []

    if local_env_path and os.path.exists(local_env_path):
        target_video = local_env_path
        scan_dir = os.path.dirname(local_env_path)
    elif local_files:
        target_video = local_files[0]
        scan_dir = work_dir
    else:
        target_video = None
        scan_dir = None

    if target_video:
        print(f"📦 Yerel / GitHub Release videosu bulundu: {target_video}")
        base_name = os.path.splitext(os.path.basename(target_video))[0]
        
        # Kapak resmi ara
        thumb_path = None
        for ext in [".jpg", ".jpeg", ".png"]:
            cand_thumb = os.path.join(scan_dir, f"{base_name}{ext}")
            if os.path.exists(cand_thumb):
                thumb_path = cand_thumb
                break
        if not thumb_path:
            # Genel thumb_B.jpg veya benzeri ara
            for f in os.listdir(scan_dir):
                if ("thumb" in f.lower() or "kapak" in f.lower()) and any(f.lower().endswith(ext) for ext in [".jpg", ".jpeg", ".png"]):
                    thumb_path = os.path.join(scan_dir, f)
                    break

        # Metadata ara (.json veya YOUTUBE_METADATA.txt)
        meta_title = base_name.replace("_", " ").title()
        meta_desc = f"{meta_title}\n\nFull animated history documentary.\n#History #Documentary"
        meta_tags = ["History", "Documentary", "Educational"]
        is_shorts = "shorts" in base_name.lower()

        meta_json_path = os.path.join(scan_dir, f"{base_name}.json")
        meta_txt_path = os.path.join(scan_dir, "YOUTUBE_METADATA.txt")

        if os.path.exists(meta_json_path):
            try:
                with open(meta_json_path, "r", encoding="utf-8") as jf:
                    jdata = json.load(jf)
                    meta_title = jdata.get("title", meta_title)
                    meta_desc = jdata.get("description", meta_desc)
                    meta_tags = jdata.get("tags", meta_tags)
                    is_shorts = jdata.get("is_shorts", is_shorts)
            except Exception as e:
                print(f"[UYARI] JSON metadata okunamadı: {e}")
        elif os.path.exists(meta_txt_path):
            try:
                with open(meta_txt_path, "r", encoding="utf-8") as tf:
                    t_content = tf.read()
                t_m = re.search(r"TITLE.*?:?\n([^\n]+)", t_content)
                if t_m: meta_title = t_m.group(1).strip()
                d_m = re.search(r"DESCRIPTION:\n(.*?)(?=\nCHAPTERS:|\nTAGS:|\nUPLOAD NOTES:)", t_content, re.DOTALL)
                c_m = re.search(r"CHAPTERS:\n(.*?)(?=\nTAGS:|\nUPLOAD NOTES:)", t_content, re.DOTALL)
                tg_m = re.search(r"TAGS:\n(.*?)(?=\nUPLOAD NOTES:|$)", t_content, re.DOTALL)
                
                desc_body = d_m.group(1).strip() if d_m else ""
                chaps = c_m.group(1).strip() if c_m else ""
                meta_desc = f"{desc_body}\n\nTIMESTAMPS:\n{chaps}".strip()
                if tg_m:
                    meta_tags = [t.strip() for t in tg_m.group(1).split(",") if t.strip()]
            except Exception as e:
                print(f"[UYARI] TXT metadata okunamadı: {e}")

        return {
            "video_path": target_video,
            "title": meta_title,
            "description": meta_desc,
            "tags": meta_tags,
            "thumbnail_path": thumb_path,
            "is_shorts": is_shorts,
            "drive_file_id": None,
        }

    # 1. Öncelik: Doğrudan URL verilmişse (workflow_dispatch veya secret)
    direct_url = get_env_var("VIDEO_DOWNLOAD_URL")
    if direct_url:
        print(f"🌐 Doğrudan bağlantıdan video indiriliyor: {direct_url}")
        target_video = os.path.join(work_dir, "cloud_video.mp4")
        urllib.request.urlretrieve(direct_url, target_video)
        return {
            "video_path": target_video,
            "title": "Uploaded Video " + datetime.datetime.now().strftime("%Y-%m-%d"),
            "description": "Uploaded automatically via GitHub Actions.\n\n#Shorts #History #Documentary",
            "tags": ["History", "Documentary", "Educational"],
            "thumbnail_path": None,
            "is_shorts": False,
            "drive_file_id": None,
        }

    # 2. Öncelik: Google Drive Klasörü
    folder_id = get_env_var("GDRIVE_FOLDER_ID")
    if not folder_id:
        raise RuntimeError("❌ Yüklenecek video bulunamadı! Ne yerel dosya/Release var, ne de GDRIVE_FOLDER_ID tanımlı.")

    drive_service = get_drive_service()

    if drive_service:
        print(f"📁 Google Drive API ile klasör taranıyor (Folder ID: {folder_id})...")
        query = f"'{folder_id}' in parents and trashed = false"
        results = drive_service.files().list(
            q=query,
            fields="files(id, name, mimeType, size)",
            orderBy="createdTime"
        ).execute()
        files = results.get("files", [])

        # Video dosyalarını bul (adında [YUKLENDI] olmayan)
        video_candidates = [
            f for f in files
            if any(f["name"].lower().endswith(ext) for ext in [".mp4", ".mov", ".mkv"])
            and not f["name"].startswith("[YUKLENDI]")
            and not f["name"].startswith("[UPLOADED]")
        ]

        if not video_candidates:
            print("ℹ️ Google Drive klasöründe yüklenecek yeni video bulunamadı.")
            return {}

        target_file = video_candidates[0]
        print(f"🎯 Sıradaki video bulundu: {target_file['name']} (ID: {target_file['id']})")

        video_path = os.path.join(work_dir, target_file["name"])
        download_file_from_gdrive(drive_service, target_file["id"], video_path)

        base_name = os.path.splitext(target_file["name"])[0]

        # Varsa metadata .json dosyasını bul ve indir
        metadata = {}
        json_file = next((f for f in files if f["name"].lower() == f"{base_name.lower()}.json"), None)
        if json_file:
            json_path = os.path.join(work_dir, json_file["name"])
            download_file_from_gdrive(drive_service, json_file["id"], json_path)
            try:
                with open(json_path, "r", encoding="utf-8") as jf:
                    metadata = json.load(jf)
            except Exception as e:
                print(f"[UYARI] Metadata json okunamadı: {e}")

        # Varsa kapak resmini (.jpg, .png) bul ve indir
        thumb_path = None
        thumb_file = next((f for f in files if f["name"].lower() in [f"{base_name.lower()}.jpg", f"{base_name.lower()}.png"]), None)
        if thumb_file:
            thumb_path = os.path.join(work_dir, thumb_file["name"])
            download_file_from_gdrive(drive_service, thumb_file["id"], thumb_path)

        title = metadata.get("title") or base_name.replace("_", " ").title()
        desc = metadata.get("description") or (
            f"{title}\n\n"
            "Full animated documentary on historical events and legendary sagas.\n"
            "Produced with tactical maps, period art, and authentic narration.\n\n"
            "#History #Documentary #MedievalHistory #MilitaryHistory"
        )
        tags = metadata.get("tags") or ["History", "Documentary", "Educational", "Medieval"]
        is_shorts = metadata.get("is_shorts", "shorts" in base_name.lower())

        return {
            "video_path": video_path,
            "title": title,
            "description": desc,
            "tags": tags,
            "thumbnail_path": thumb_path,
            "is_shorts": is_shorts,
            "drive_file_id": target_file["id"],
            "drive_service": drive_service,
            "original_name": target_file["name"],
        }

    else:
        # Drive API yetkisi yoksa gdown ile genel klasör indir
        print("📥 Drive API yetkisi bulunamadı, gdown ile klasör çekiliyor...")
        download_via_gdown(folder_id, work_dir)

        # Klasördeki dosyaları tara
        all_files = []
        for root, _, filenames in os.walk(work_dir):
            for fn in filenames:
                all_files.append(os.path.join(root, fn))

        video_candidates = [
            f for f in all_files
            if any(f.lower().endswith(ext) for ext in [".mp4", ".mov", ".mkv"])
            and not os.path.basename(f).startswith("[YUKLENDI]")
            and not os.path.basename(f).startswith("[UPLOADED]")
        ]

        if not video_candidates:
            print("ℹ️ İndirilen klasörde yüklenecek yeni video bulunamadı.")
            return {}

        video_path = video_candidates[0]
        base_name = os.path.splitext(os.path.basename(video_path))[0]

        # Metadata
        metadata = {}
        json_path = os.path.splitext(video_path)[0] + ".json"
        if os.path.exists(json_path):
            try:
                with open(json_path, "r", encoding="utf-8") as jf:
                    metadata = json.load(jf)
            except Exception:
                pass

        # Thumbnail
        thumb_path = None
        for ext in [".jpg", ".png", ".jpeg"]:
            candidate_thumb = os.path.splitext(video_path)[0] + ext
            if os.path.exists(candidate_thumb):
                thumb_path = candidate_thumb
                break

        title = metadata.get("title") or base_name.replace("_", " ").title()
        desc = metadata.get("description") or f"{title}\n\n#History #Documentary"
        tags = metadata.get("tags") or ["History", "Documentary"]
        is_shorts = metadata.get("is_shorts", "shorts" in base_name.lower())

        return {
            "video_path": video_path,
            "title": title,
            "description": desc,
            "tags": tags,
            "thumbnail_path": thumb_path,
            "is_shorts": is_shorts,
            "drive_file_id": None,
            "drive_service": None,
            "original_name": os.path.basename(video_path),
        }


def mark_gdrive_video_as_uploaded(service, file_id: str, old_name: str, video_id: str):
    """Yüklenen videoyu Google Drive üzerinde [YUKLENDI] olarak yeniden adlandırır."""
    if not service or not file_id:
        return
    try:
        new_name = f"[YUKLENDI]_{old_name}"
        service.files().update(
            fileId=file_id,
            body={"name": new_name, "description": f"Uploaded to YouTube: https://youtu.be/{video_id}"}
        ).execute()
        print(f"🏷️ Google Drive dosyası güncellendi: {new_name}")
    except Exception as e:
        print(f"[UYARI] Google Drive dosya adı güncellenemedi: {e}")


def main():
    print("=" * 70)
    print("🚀 YOUTUBE CLOUD UPLOADER (GITHUB ACTIONS)")
    print("=" * 70)

    # 1. YouTube API bağlantısı
    print("\n[1/4] YouTube API Kimlik Doğrulaması yapılıyor...")
    creds = get_youtube_credentials()
    youtube = build("youtube", "v3", credentials=creds)

    try:
        ch_resp = youtube.channels().list(part="snippet", mine=True).execute()
        ch_title = ch_resp["items"][0]["snippet"]["title"] if ch_resp.get("items") else "Kanal"
        print(f"✅ Bağlı YouTube Kanalı: {ch_title}")
    except Exception as e:
        print(f"⚠️ Kanal bilgisi alınamadı: {e}")

    # 2. Buluttan video temini
    print("\n[2/4] Bulut deposundan video taranıyor ve indiriliyor...")
    with tempfile.TemporaryDirectory() as work_dir:
        candidate = get_candidate_video_from_cloud(work_dir)
        if not candidate:
            print("\n✨ Yüklenecek yeni video yok. Otomasyon başarıyla tamamlandı.")
            return

        video_path = candidate["video_path"]
        title = candidate["title"]
        description = candidate["description"]
        tags = candidate["tags"]
        thumbnail_path = candidate.get("thumbnail_path")
        is_shorts = candidate.get("is_shorts", False)

        # 3. Süre ve Standart Denetimi
        print("\n[3/4] Video kontrolleri ve standart denetimi yapılıyor...")
        duration = measure_video_duration(video_path)
        print(f"  Dosya: {os.path.basename(video_path)}")
        print(f"  Ölçülen Süre: {duration:.1f} sn ({duration/60:.2f} dk)")
        print(f"  Format: {'Shorts' if is_shorts else 'Ana Video / Belgesel'}")

        if not is_shorts and duration > 0 and duration < MIN_DOCUMENTARY_DURATION_SEC:
            err_msg = (
                f"❌ YÜKLEME REDDEDİLDİ: '{os.path.basename(video_path)}' süresi {duration:.1f} saniye!\n"
                f"Tarih Kanalı Otomasyonu Standardı gereği ana videolar EN AZ "
                f"{MIN_DOCUMENTARY_DURATION_SEC:.0f} saniye (8 dakika) olmalıdır."
            )
            print(f"\n{err_msg}\n")
            raise ValueError(err_msg)

        # Yayın planı
        auto_schedule = get_env_var("AUTO_SCHEDULE", "true").lower() == "true"
        privacy_status = get_env_var("YOUTUBE_PRIVACY_STATUS", "private")

        body: dict[str, Any] = {
            "snippet": {
                "title": title[:100],
                "description": description,
                "tags": tags,
                "categoryId": "27",  # Education
            },
            "status": {
                "selfDeclaredMadeForKids": False,
            }
        }

        schedule_label = "Manuel / Anında"
        if auto_schedule:
            publish_at_utc, schedule_label = calculate_next_publish_time()
            body["status"]["privacyStatus"] = "private"
            body["status"]["publishAt"] = publish_at_utc
            print(f"📅 Otomatik Yayın Planı: {schedule_label} (UTC: {publish_at_utc})")
        else:
            body["status"]["privacyStatus"] = privacy_status
            print(f"🔒 Gizlilik Durumu: {privacy_status}")

        # 4. YouTube Yükleme
        print(f"\n[4/4] YouTube'a yükleniyor: {title}...")
        media = MediaFileUpload(
            video_path,
            chunksize=1024 * 1024 * 8,  # 8 MB chunk
            resumable=True,
            mimetype="video/mp4"
        )

        request = youtube.videos().insert(
            part="snippet,status",
            body=body,
            media_body=media
        )

        response = None
        while response is None:
            status, response = request.next_chunk()
            if status:
                percent = int(status.progress() * 100)
                print(f"  Yükleme ilerlemesi: %{percent}...", end="\r", flush=True)

        video_id = response.get("id")
        video_url = f"https://youtu.be/{video_id}"
        print(f"\n\n🎉 VİDEO BAŞARIYLA YÜKLENDİ!")
        print(f"🔗 Video URL: {video_url}")
        print(f"🆔 Video ID:  {video_id}")

        # Kapak resmi yükleme
        if thumbnail_path and os.path.exists(thumbnail_path):
            print(f"🖼️ Kapak resmi yükleniyor: {os.path.basename(thumbnail_path)}...")
            try:
                m_thumb = MediaFileUpload(thumbnail_path, mimetype="image/jpeg")
                youtube.thumbnails().set(videoId=video_id, media_body=m_thumb).execute()
                print("✅ Kapak resmi başarıyla ayarlandı!")
            except Exception as e:
                print(f"⚠️ Kapak resmi yüklenemedi (Kanal doğrulaması gerekebilir): {e}")

        # Drive dosyasını [YUKLENDI] olarak işaretle
        if candidate.get("drive_service") and candidate.get("drive_file_id"):
            mark_gdrive_video_as_uploaded(
                candidate["drive_service"],
                candidate["drive_file_id"],
                candidate["original_name"],
                video_id
            )

        # GitHub Actions Step Summary (Rapor Oluşturma)
        summary_file = os.environ.get("GITHUB_STEP_SUMMARY")
        if summary_file:
            try:
                with open(summary_file, "a", encoding="utf-8") as f:
                    f.write(f"### 🎬 YouTube Otomatik Yükleme Raporu\n\n")
                    f.write(f"- **Başlık:** {title}\n")
                    f.write(f"- **Video ID:** `{video_id}`\n")
                    f.write(f"- **Video Linki:** [{video_url}]({video_url})\n")
                    f.write(f"- **Planlanan Yayın:** {schedule_label}\n")
                    f.write(f"- **Süre:** {duration:.1f} saniye\n")
                    f.write(f"- **Kanal:** {ch_title}\n\n")
            except Exception:
                pass


if __name__ == "__main__":
    main()
