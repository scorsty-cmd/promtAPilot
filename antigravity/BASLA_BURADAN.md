# Claude'dan Antigravity'ye geçiş — buradan başla

Bu klasörde Claude'da kurulu tüm video otomasyonlarının talimatları, üretim kitleri ve kanal stil kuralları var.
Antigravity bu klasörü okuyup aynı görevleri kendi zamanlanmış görevleri olarak kurabilir.

## İçindekiler
| Klasör / dosya | Ne var |
|---|---|
| `gorevler/` | Claude'daki 6 zamanlanmış görevin talimatları, kelimesi kelimesine |
| `kitler/hidden_layer_kit/` | Hidden Layer uzun video + Reels üretim kodu (render, ses, kapak, playbook) |
| `kitler/history_sourced_toolkit/` | History Sourced harita/portre motoru, ses, altyazı, eski bölümlerin sahneleri |
| `skills/` | Kanalların görsel kimlik kuralları (font, renk, kurgu) |
| `ANTIGRAVITY_UYARLAMA.md` | Claude'a özel araçların Antigravity'deki karşılıkları |
| `KALITE_REHBERI.md` | Videoların kalitesinin nereden geldiği: en yeni motorlar, çalışma döngüsü, yasaklar |
| `tools/kalite_kontrol.py` | Yayından önce otomatik kalite kontrolü (süre, ses seviyesi, donuk bölüm, ilk kare) + kontrol görselleri |

## Kalite nasıl korunur
Antigravity'deki yapay zekâ "eğitilemez" (modelin kendisi değiştirilemez), ama kaliteyi zaten modelin
kafası değil şu üç şey belirliyor ve üçü de repoda:
1. **Render motorları** (kod): Reels için `reels/renderer/reel2_v16.py`, uzun video için `videos/renderer/v3/`,
   History Sourced için `history/one_year_one_body/`. Her yeni video bunların en yenisinden başlar.
2. **Öğrenilen kurallar**: her kanalın LEARNINGS dosyası — hangi kanca tuttu, hangi hata bir daha yapılmayacak.
3. **Kontrol döngüsü**: önce tek tek kareler çizilip bakılır, sorunlar düzeltilir, sonra video render edilir;
   en sonda `kalite_kontrol.py` geçmezse video yayınlanmaz.
`KALITE_REHBERI.md` Antigravity'ye bunları adım adım anlatıyor.

## Görev takvimi (İstanbul saati)
| Görev | Ne zaman | Claude'daki durum |
|---|---|---|
| OperisAI günlük Reels (sana gönderilir, sen paylaşırsın) | Her gün 08:38 | Aktif |
| Hidden Layer Instagram Reel + YouTube Shorts | Her gün 16:49 | Aktif |
| Hidden Layer uzun video | Perşembe 08:48 | Aktif |
| History Sourced uzun video | Pazartesi + Perşembe 08:57 | Aktif |
| History Sourced Shorts | Salı, Perşembe, Cumartesi 13:47 | Aktif |
| Universe Of Animals günlük Short | Her gün 13:58 | Duraklatılmış |

## Adımlar
1. Antigravity'de repo klasörünü aç: `C:\Users\HP\OneDrive\Masaüstü\Antigravity\promtAPilot_repo`
   ve `git pull` yap (ya da Antigravity'ye "repoyu güncelle" de).
2. Aşağıdaki kutudaki metni olduğu gibi Antigravity'nin ajan sohbetine yapıştır.
3. Antigravity bir görevi ilk kez kurduğunda **elle bir kez çalıştırıp** sonucu kontrol et
   (video klasöre geldi mi, YouTube'a planlandı mı).
4. Hepsi en az bir kez Antigravity'de sorunsuz çalıştıktan sonra Claude üyeliğini iptal et.

## Antigravity'ye yapıştırılacak metin
```
Read antigravity/BASLA_BURADAN.md, antigravity/ANTIGRAVITY_UYARLAMA.md, antigravity/KALITE_REHBERI.md
and every file in antigravity/gorevler/. Add KALITE_REHBERI.md as a permanent rule for every video task:
always start from the newest engine it lists, render preview stills and look at them before the full
render, and never publish a video that fails antigravity/tools/kalite_kontrol.py.
These are my video automations that ran as scheduled tasks in Claude. Recreate them in Antigravity:

1. Install the skills in antigravity/skills/ into your skills location (show me first if anything
   in them looks risky). Install ffmpeg, Python packages (kokoro-onnx, soundfile, scipy, numpy,
   pillow, opencv-python-headless) and Node for Remotion if missing.
2. For each ACTIVE task in antigravity/gorevler/, create a scheduled task with the same time
   (Europe/Istanbul) whose instruction is that file's ORIGINAL instruction, applying the mapping
   rules in ANTIGRAVITY_UYARLAMA.md (local folders instead of SendUserFile, antigravity/kitler/ instead
   of the Claude artifacts, tools/queue_publish.py stays the only way to upload to YouTube).
   Do not create the paused Universe Of Animals task; just tell me it is ready to enable.
3. Tell me which steps cannot work in Antigravity (for example vidIQ, Gmail, Instagram publishing,
   ElevenLabs) and what I need to connect or which token I need to add for each.
4. Run the OperisAI task once now as a test and save the video to C:\Users\HP\Videos\OperisAI\.
Never put passwords, tokens or API keys into the repo — it is public.
Talk to me in Turkish.
```

## Bilmen gerekenler
- **Bilgisayar kapalıyken:** Antigravity görevleri senin bilgisayarında çalışır; bilgisayar kapalı ya da
  uykudaysa video üretimi o saatte yapılmaz. YouTube'a yükleme kısmı (GitHub "Queue Upload") ise bulutta
  çalıştığı için etkilenmez — video kuyruğa girdiği anda bilgisayarı kapatabilirsin.
- **Bağlayıcılar:** Claude'da vidIQ, Gmail, ElevenLabs (AnythingMCP), Canva gibi bağlantılar vardı.
  Bunlar Antigravity'ye kendiliğinden geçmez; Antigravity hangilerinin gerektiğini sana söyleyecek.
- **Hidden Layer Instagram:** Reels Claude'da vidIQ üzerinden yayınlanıyordu. Antigravity'de vidIQ
  bağlanamazsa Reel klasöre kaydedilir ve sen paylaşırsın, ya da hayvan sayfasındaki gibi GitHub
  üzerinden otomatik yayın kurulur (Instagram token'ı GitHub Secrets'a eklenmeli).
- **Repo herkese açık:** Bu klasöre şifre, token ya da kişisel bilgi konmadı; sen de koyma.
