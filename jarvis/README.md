# 🤖 J.A.R.V.I.S. — Kişisel Yapay Zeka Asistanı

Bilgisayarınızda çalışan, Claude (Opus 5.5) tabanlı, **gerçekten iş yapan** bir asistan. Sadece cevap vermez — komut çalıştırır, dosyalarınızı düzenler, program açar, internette araştırır, ekranınızı görür ve sizi hatırlar.

## ✨ Yetenekler

| Alan | Neler yapabilir |
|---|---|
| 💻 Terminal | cmd / PowerShell / bash komutları, program kurma (winget, pip, npm), git, derleme, arka plan işlemleri |
| 🐍 Python | Hesaplama, veri işleme, Excel/CSV, otomasyon betikleri |
| 📁 Dosyalar | Tüm klasörlere erişim: okuma, yazma, düzenleme, arama (ad + içerik), kopyalama, taşıma, silme |
| 🚀 Uygulamalar | Program, dosya, klasör ve web sitesi açma |
| 🖥 Sistem | CPU / RAM / disk / pil bilgisi, işlemleri listeleme ve sonlandırma, pano |
| 👁 Ekran | Ekran görüntüsü alıp ne gördüğünü yorumlama (hata çözme vb.) |
| 🌐 İnternet | Web araması ve sayfa okuma — güncel haber, kur, hava, dokümantasyon |
| 🧠 Hafıza | Adınızı, tercihlerinizi, projelerinizi oturumlar arasında hatırlar |
| 🎙 Ses | Opsiyonel: mikrofonla konuşma, sesli yanıt (Türkçe) |

Uzun sohbetlerde bağlam otomatik özetlenir (compaction), cevaplar canlı akar, Jarvis'in ne düşündüğü soluk yazıyla görünür.

## 🔐 Yetki Modları

| Mod | Davranış |
|---|---|
| `guvenli` | Okuma dışındaki her işlemde onay ister |
| `akilli` *(varsayılan)* | Yalnızca silme, taşıma, işlem sonlandırma, mevcut dosyanın üzerine yazma ve tehlikeli komutlarda onay ister |
| `tam` | **Tam yetki** — hiçbir şey sormaz, her işi kendisi yapar |

> Tam yetki modunda bile disk biçimlendirme (`format C:`), sistem sürücüsünü komple silme, `diskpart`, `bcdedit` gibi **geri dönüşü olmayan** komutlar için tek bir onay sorulur. Bu, bir yanlış anlamanın bilgisayarınızı silmesini önleyen son emniyet kemeridir.

Her işlem `~/.jarvis/actions.log` dosyasına kaydedilir — Jarvis'in ne yaptığını her zaman görebilirsiniz.

## 🚀 Kurulum (Windows)

1. [Python 3.10+](https://www.python.org/downloads/) kurun (kurulumda **"Add Python to PATH"** işaretli olsun).
2. [console.anthropic.com](https://console.anthropic.com/settings/keys) adresinden bir API anahtarı alın.
3. `jarvis` klasöründe **`kurulum.bat`** dosyasına çift tıklayın. Açılan `.env` dosyasına anahtarınızı yazıp kaydedin.
4. **`jarvis.bat`** ile başlatın.

Tam yetkiyle başlatmak için kısayol oluşturup hedefin sonuna `--mod tam` ekleyin, ya da terminalde:

```bat
jarvis.bat --mod tam
```

> Program Files gibi yönetici izni gereken klasörlerde işlem yapacaksa `jarvis.bat`'a sağ tıklayıp **Yönetici olarak çalıştır** deyin.

### macOS / Linux

```bash
cd jarvis
./jarvis.sh          # ilk çalıştırmada kurar
nano .env            # ANTHROPIC_API_KEY yazın
./jarvis.sh --mod tam
```

## 💬 Kullanım

```
Siz › İndirilenler klasörümü dosya türlerine göre düzenle
Siz › Bilgisayarım neden yavaş? En çok RAM kullanan 5 programı göster
Siz › Masaüstüne bugünkü dolar/euro kuru ve İstanbul hava durumuyla bir not bırak
Siz › Ekranıma bak, bu hata ne anlama geliyor ve nasıl düzeltirim?
Siz › D:\Projeler içindeki tüm .py dosyalarında "TODO" geçen yerleri bul
Siz › VS Code ve Spotify'ı aç
Siz › Benim adım Ali, videolarım D:\Videolar klasöründe — bunu unutma
```

Tek seferlik görev: `python jarvis.py "Masaüstündeki ekran görüntülerini Resimler\Ekran klasörüne taşı"`

**Sohbet komutları:** `/mod guvenli|akilli|tam` · `/hafiza` · `/yeni` · `/yardim` · `/cikis`
Çalışan bir işlemi durdurmak için **Ctrl+C**.

### 🎙 Sesli mod

```bat
.venv\Scripts\pip install SpeechRecognition pyaudio pyttsx3
jarvis.bat --ses
```

Enter'a basıp konuşun; Jarvis yanıtı sesli okur. (Konuşma tanıma için internet gerekir. Türkçe ses için Windows Ayarlar → Zaman ve Dil → Konuşma bölümünden Türkçe ses paketi ekleyin.)

## ⚙️ Ayarlar (`.env`)

| Değişken | Varsayılan | Açıklama |
|---|---|---|
| `ANTHROPIC_API_KEY` | — | Zorunlu |
| `JARVIS_USER_NAME` | `efendim` | Jarvis size nasıl hitap etsin |
| `JARVIS_MODE` | `akilli` | `guvenli` / `akilli` / `tam` |
| `JARVIS_MODEL` | `claude-opus-5-5` | Daha hızlı/ucuz için `claude-sonnet-5-5` |
| `JARVIS_EFFORT` | `high` | Düşünme derinliği: `low` … `max` |
| `JARVIS_HOME` | `~/.jarvis` | Hafıza, kayıt ve ekran görüntüleri klasörü |

## 🗂 Yapı

```
jarvis/
├── jarvis.py              # Başlatıcı ve sohbet arayüzü
├── jarvis_core/
│   ├── agent.py           # Claude ajan döngüsü, kişilik (sistem istemi)
│   ├── tools.py           # Bilgisayar araçları (komut, dosya, uygulama, sistem, ekran)
│   ├── permissions.py     # Yetki modları, tehlikeli komut tespiti, işlem kaydı
│   ├── memory.py          # Kalıcı hafıza
│   └── voice.py           # Sesli mod
├── kurulum.bat / jarvis.bat / jarvis.sh
└── .env.example
```

## 💰 Maliyet

Jarvis Anthropic API'yi kullanır ve kullanım başına ücretlendirilir (Opus 5.5: girişte 1M token başına $4, çıkışta $20). Tekrarlanan bağlam önbelleğe alındığı için sohbetler ucuzlar. Daha düşük maliyet için `.env` içinde `JARVIS_MODEL=claude-sonnet-5-5` veya `JARVIS_EFFORT=medium` kullanabilirsiniz.
