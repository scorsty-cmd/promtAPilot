# Claude → Antigravity uyarlama kuralları

Bu klasördeki görev talimatları (`gorevler/*.md`) Claude'un bulut oturumları için yazıldı. Antigravity ajanı
bunları çalıştırırken aşağıdaki eşleştirmeleri uygular. Bir talimat ile bu dosya çelişirse **bu dosya geçerlidir**.

Kullanıcı (Fuat) Türkçe konuşur: ona yazılan her mesaj ve e-posta Türkçe olur. Videoların içi, başlıklar,
açıklamalar talimatta hangi dil yazıyorsa o dilde kalır (Hidden Layer, History Sourced, Oddverse: İngilizce;
Universe Of Animals, OperisAI: Türkçe).

## 1. Çalışma yeri
| Claude'da | Antigravity'de |
|---|---|
| Bulut çalışma klasörü (/home/claude, scratchpad) | Kullanıcının bilgisayarında repo klonu: `C:\Users\HP\OneDrive\Masaüstü\Antigravity\promtAPilot_repo` (yoksa `git clone https://github.com/scorsty-cmd/promtapilot`). Geçici dosyalar için repo dışında `C:\Users\HP\Videos\_uretim\<tarih>_<kanal>\` |
| `add_repo` + `git clone --depth 1` | Gerek yok; mevcut klonda `git pull --rebase` |
| `setsid nohup ... < /dev/null &` | Uzun işleri arka planda çalıştır (PowerShell `Start-Process` ya da ayrı terminal) ve log dosyasını izle |
| `/usr/share/fonts/opentype/inter/` gibi Linux yolları | Fontları `antigravity/fonts/` altına indir (Google Fonts, OFL) ve kodda o yolu kullan |
| `python3` | Windows'ta `python` |
| ffmpeg önceden kurulu | `winget install Gyan.FFmpeg` ile bir kez kur |

## 2. Kitler ve skill'ler
| Claude'da | Antigravity'de |
|---|---|
| Artifact "Hidden Layer Video Calendar" (`kit/` dosyaları) | `antigravity/kitler/hidden_layer_kit/` |
| Artifact "History Sourced Toolkit" | `antigravity/kitler/history_sourced_toolkit/` |
| Talimatta "republish the toolkit artifact" | Değişen kit dosyalarını aynı klasöre yaz, commit + push et |
| Skill aracı: `hidden-layer-style`, `history-sourced-style`, `universe-of-animals-style`, `illustrated-story-explainer`, `diy-hack-shorts`, `video-making` | `antigravity/skills/<ad>/SKILL.md` — Antigravity'nin skill klasörüne kurulu olmalı; değilse dosyayı doğrudan oku ve uygula |
| History Sourced karakter kiti | Zaten repoda: `history/one_year_one_body/` |
| Universe Of Animals kiti | Zaten repoda: `animals/` (PLAYBOOK.md, render_edit.py …) |

## 3. Teslim ve bildirim
| Claude'da | Antigravity'de |
|---|---|
| `SendUserFile` | Dosyaları `C:\Users\HP\Videos\<kanal adı>\<YYYY-MM-DD>_<konu>\` klasörüne kaydet (History Sourced için `C:\Users\HP\Videos\history sourced\`). Parçalara bölmeye (28 MB) ve BIRLESTIR .bat'a **gerek yok** — tam dosya bilgisayarda zaten var |
| `SendUserMessage` | Aynı klasöre `RAPOR.txt` (Türkçe) yaz |
| Gmail bağlayıcısı (e-posta gönder / ara) | Antigravity'de Gmail MCP bağlıysa onu kullan. Bağlı değilse e-postayı atla, `RAPOR.txt` yeterli. "Daha önce yapılan konuları Gmail'de ara" adımı yerine repodaki LEARNINGS dosyalarına, `done_topics.txt`'ye ve GitHub release listesine bak |
| Google Drive bağlayıcısı | Atla (zorunlu değil) |

## 4. YouTube'a yükleme — DEĞİŞMİYOR
`tools/queue_publish.py` aynen çalışır: dosyaları `queue/<tag>` dalına iter, GitHub'daki "Queue Upload" iş akışı
videoyu **bulutta** YouTube'a yükler ve release'i oluşturur. Tag kuralları (history-, hiddenlayer-, animals-,
history-shorts-, hiddenlayer-reel-) aynen geçerlidir. Releases API'ye doğrudan yazma yasağı Antigravity için
yoktur ama yine de **yalnızca queue_publish.py** kullan ki kanal ayrımı ve güvenlik kontrolleri çalışsın.

## 5. Ücretli/harici servisler
| Claude'da | Antigravity'de |
|---|---|
| vidIQ bağlayıcısı (outliers, owner insights, video stats) | vidIQ'nun MCP sunucusu Antigravity'ye eklenebiliyorsa onu kullan; yoksa bu adımları web aramasıyla yap. Kredi kuralları aynen geçerli |
| **Hidden Layer Instagram yayını** (`vidiq_video_upload` + `vidiq_instagram_publish_reel`) | vidIQ MCP yoksa: `tools/instagram_publisher.py`'deki Instagram Graph API yöntemini Hidden Layer hesabı için ayrı bir token ile kullan (kullanıcı token'ı GitHub Secrets'a eklemeli) ya da Reel'i klasöre koy ve kullanıcı kendisi paylaşsın |
| AnythingMCP → ElevenLabs (seslendirme) | ElevenLabs API anahtarı ortam değişkeninde (`ELEVENLABS_API_KEY`) ya da ElevenLabs MCP. Yoksa Kokoro (yerel, ücretsiz) |
| Kokoro TTS | Aynı: `pip install kokoro-onnx soundfile scipy` + model dosyaları |
| WebSearch / WebFetch | Antigravity'nin web arama/tarayıcı aracı |

## 6. Yapılmayacaklar (Claude'daki kurallar aynen)
- Başka içerik üreticilerinin videolarını/görsellerini/müziklerini indirme, kopyalama.
- Telif, logo, marka arayüzü, tanınabilir yüz kullanma; uydurma istatistik yazma.
- Bir video için birden fazla kuyruk gönderimi yapma; "KRİTİK GÜVENLİK ENGELİ" hatasını atlatmaya çalışma.
- Şifre, token, API anahtarını koda/repoya yazma (repo **herkese açık**).
