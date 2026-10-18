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

---

## 📌 DECISIONS (Mimari ve Otonom Çalışma Kararları)

1. **Bilgisayardan Tam Bağımsızlık (GitHub Actions Runner):**
   - Tüm video tarama, indirme, süre denetimi, YouTube yükleme ve yayın zamanlama süreçleri yerel makineden koparılarak Ubuntu GitHub Actions runner'larına devredildi.
   - Yerel bilgisayar kapalı veya uykuda olsa dahi, her gün saat 07:00 UTC (10:00 TSİ) cron görevi bağımsız olarak çalışır.

2. **Sıfır Hardcoded Secret Prensibi:**
   - Kod, konfigürasyon ve log dosyalarında hiçbir API anahtarı, OAuth client secret veya refresh token tutulmaz.
   - Tüm kimlik doğrulama verileri çalışma anında (runtime) yalnızca GitHub Repository Secrets üzerinden ortam değişkeni olarak çekilir.

3. **Çift Katmanlı Bulut Depolama (Google Drive Fallback):**
   - Google Drive API için yetkili Servis Hesabı veya OAuth Refresh Token varsa tam yetkili Drive v3 API kullanılır (dosyalar işlem sonrası `[YUKLENDI]` olarak etiketlenir).
   - Servis Hesabı veya özel yetki bulunmadığı durumlarda, sistem kilitlenmemesi için otomatik olarak `gdown` paylaşımlı klasör indirme motoruna geçer.

4. **Tarih Kanalı Video Kalite ve Süre Standardı:**
   - Standart belgesel videolarının en az 480 saniye (8 dakika) olması kuralı kod seviyesinde denetlenir; eksik veya kısa süreli videolar sisteme yüklenmeyerek kanal kalitesi garanti altına alınır. Shorts içerikleri bu filtreden muaf tutulur.

5. **Self-Healing ve Otonom Doğrulama Döngüsü:**
   - Her kod veya altyapı değişikliğinden sonra ilgili workflow `workflow_dispatch` API ile tetiklenir, loglar denetlenir ve koşu yeşil (success) olmadan süreç tamamlanmış sayılmaz.