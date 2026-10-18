# promtAPilot 🚀

Otonom içerik üretimi, görsel toplama ve YouTube bulut yükleme otomasyon platformu.

## 🎬 YouTube Daily Upload & Schedule Otomasyonu

Bilgisayardan bağımsız olarak Google Drive üzerindeki videoları GitHub Actions üzerinde tarar, standart kontrollerini yapar (Tarih kanalı belgeselleri için en az 8 dakika kuralı) ve YouTube kanalına otomatik yükleyip planlar.

### ⏰ Çalışma Zamanı
- **Otomatik (Cron):** Her gün **07:00 UTC** (Türkiye Saati ile **10:00 TSİ**)
- **Manuel (Workflow Dispatch):** GitHub Actions sekmesinden istenildiği an tek tıkla çalıştırılabilir.

### 🔐 Gerekli GitHub Secrets
GitHub reponuzun **Settings -> Secrets and variables -> Actions** bölümünden aşağıdaki değerleri ekleyin:

| Secret Adı | Açıklama | Zorunlu mu? |
|---|---|---|
| `YOUTUBE_CLIENT_ID` | Google Cloud Console OAuth 2.0 Client ID | **Evet** |
| `YOUTUBE_CLIENT_SECRET` | Google Cloud Console OAuth 2.0 Client Secret | **Evet** |
| `YOUTUBE_REFRESH_TOKEN` | YouTube yetkili OAuth 2.0 Refresh Token | **Evet** (veya `YOUTUBE_TOKEN_JSON`) |
| `YOUTUBE_TOKEN_JSON` | Tüm token dosyasının (`youtube_token.json`) JSON metni | Alternatif (Tek parça olarak) |
| `GDRIVE_FOLDER_ID` | Videoların bulunduğu Google Drive klasör ID'si | **Evet** (Buluttan çekmek için) |
| `GDRIVE_SERVICE_ACCOUNT_KEY` | Google Drive Servis Hesabı JSON anahtarı | Opsiyonel (OAuth yerine Service Account ile erişim için) |
| `GOOGLE_DRIVE_REFRESH_TOKEN` | Google Drive yetkisi olan ayrı OAuth Refresh Token | Opsiyonel |

---

### 📂 Google Drive Klasör Formatı
Google Drive klasörünüze yükleyeceğiniz dosyalar şu şekilde eşleştirilir:
- `video_adi.mp4` *(Zorunlu - Video dosyası)*
- `video_adi.json` *(Opsiyonel - Özel başlık, açıklama, etiket ve shorts parametreleri)*
- `video_adi.jpg` *(Opsiyonel - Özel kapak resmi / thumbnail)*

Örnek `video_adi.json`:
```json
{
  "title": "Stamford Bridge Muharebesi: Tek Başına Bir Orduyu Durduran Viking (1066)",
  "description": "1066 yılında İngiltere'nin kaderini belirleyen epik mücadele...",
  "tags": ["Tarih", "Belgesel", "Vikingler", "1066", "Orta Çağ"],
  "is_shorts": false
}
```

Video yüklendiğinde, Drive üzerindeki dosya otomatik olarak `[YUKLENDI]_video_adi.mp4` olarak güncellenir ve tekrar yüklenmesi engellenir.