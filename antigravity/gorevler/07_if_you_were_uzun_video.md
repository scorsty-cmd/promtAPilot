# "If You Were…" — 8 dakikalık karakter animasyonu (Sokrates / Einstein / Truva tarzı)

> Antigravity için: önce `antigravity/ANTIGRAVITY_UYARLAMA.md` dosyasını oku. Bu dosya, Claude'un yaptığı
> `era/episodes/ep03_socrates` ve `era/episodes/ep04_einstein` videolarının **aynı yöntemle** nasıl yapılacağını anlatır.
> Şablon olarak HER ZAMAN en son bölümü kopyala (şu an: `era/episodes/ep04_einstein`).

## 1. Ne üretiliyor
- 8:00–8:30 dakikalık, 1920x1080, İngilizce, 2D çizgi karakter animasyonu (Remotion + SVG).
- İzleyici "you" (sen) karakteri: o dönemde/dünyada yaşayan sıradan biri. 10 bölüm.
- Sahnelerin **en az %55'i karakterler arası konuşma**, her karakterin kendi Kokoro sesi var, ağızlar sese göre oynar.
- İlk 10–15 saniye: en çarpıcı an (kanca). Kanal adı, "bu videoda" gibi giriş YOK.
- Sonda izleyiciye soru + COMMENT/SUBSCRIBE kartı.
- Her video bir öncekinden somut olarak daha iyi olmalı: `era/README.md` içindeki "backlog" listesinden en az 1–2 maddeyi uygula ve README'ye log satırı ekle.

## 2. Klasör yapısı (şablondan kopyala)
```
tts.py        -> senaryo (L listesi: key, bölüm, konuşan, metin, ara) + sesler -> public/vo.wav, src/timeline.json, src/mouth.json
audio.py      -> özgün müzik + efektler (numpy ile sentez) -> public/mix.wav (-14 LUFS)
src/chars.tsx -> karakter rigi (kıyafet, saç, ifade, oturma/diz çökme, el hareketi) + CAST listesi
src/sets.tsx  -> dekorlar (arka planlar)
src/egraphics.tsx (veya ggraphics) -> bilgi grafikleri (sürekli hareketli olmalı)
src/shots.tsx -> sahne listesi: sc({a: S('anahtar'), bg, actors, cams, ex}) ve gfx(Grafik, S('anahtar'))
src/Video.tsx -> başlık kartı, bölüm kartları, yer/yıl damgası, altyazı, bitiş kartı, ses
runall.sh     -> 4 parça halinde render (yarıda kalırsa kaldığı yerden devam eder)
```

## 3. Adımlar
1. Kurulum (bir kere): `node 20+`, `python3`, `ffmpeg`, Google Chrome.
   `pip install kokoro-onnx soundfile scipy numpy` ve `npm i` (şablon klasöründe).
   Kokoro model dosyaları: https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/
   (`kokoro-v1.0.onnx` ve `voices-v1.0.bin` -> `models/` klasörüne).
2. Şablonu yeni klasöre kopyala: `era/episodes/ep05_<konu>`.
3. **Araştır** (web): tarihler, sayılar, gerçek alıntılar. Efsaneyi efsane diye söyle, uydurma alıntı yazma.
4. **Senaryo** `tts.py` içinde. `python3 tts.py` çalıştır: toplam 470–490 sn ve "dialogue share" ≥ 0.55 olmalı.
   Kısa kalırsa diyalog ekle (anlatıcı değil). Sesler: anlatıcı `am_michael`, sen `am_liam`, diğerleri farklı Kokoro sesleri.
5. **Karakterler**: `chars.tsx` CAST'e yeni kıyafet/saç/aksesuar ekle. `node tstill.mjs Sheet` ile karakter sayfasını PNG al ve bak.
6. **Dekor + grafik + sahneler**: her 4–6 saniyede yeni kadraj; diyalogda kamera otomatik (geniş / yakın / iki kişi).
   Uzun anlatıcı cümlelerinde `cams: { key: (T,t) => ({x, y, z}) }` ile kamera hareketi ver (donuk kalmasın).
7. **Kontrol kareleri**: `node stills.mjs 5 30 60 ...` + `python3 sheet16.py stills/a1.jpg 5 30 60 ...` -> 16'lı kontak sayfasına bak; üst üste binen yazı, kadraj dışı karakter, yanlış prop varsa düzelt.
8. **Ses**: `python3 audio.py` (-14 LUFS çıkmalı).
9. **Render**: `./runall.sh` (2 CPU'da ~2 saat). Sonra:
   `ffmpeg -f concat -safe 0 -i chunks/list.txt -i public/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest out/final.mp4`
10. **Kalite kontrol**: `python3 antigravity/tools/kalite_kontrol.py out/final.mp4 --profile long` -> "SONUÇ: GEÇTİ" olmadan teslim etme.
    Donuk bölüm uyarısı gelirse o sahneye kamera hareketi ekle, sadece o aralığı yeniden render et.
11. Kapak (Thumb.tsx, 1280x720), `subtitles_en.srt`, `youtube_metadata.txt` (başlık, açıklama, bölüm zamanları, kaynaklar, etiketler).
12. Kaynak kodu `era/episodes/ep05_<konu>/` altına commit et (video dosyalarını değil), `era/README.md` log + backlog güncelle.
13. İstersen 3 dikey Shorts: `ep03_socrates/shorts/` içindeki yöntem (altyazısız temiz render + 9:16 çerçeve).

## 4. Kurallar
- YouTube'a uygun: kan, vahşet yok. Savaş/ölüm sahneleri siluet, uzaktan çekim veya kesme ile.
- Gerçek kişilerin fotoğrafı/logosu kullanılmaz; hepsi çizim.
- Repo herkese açık: şifre, token, kişisel bilgi asla commit edilmez.
- Her videoda farklı görsel stil (Sokrates: kırmızı figür vazo; Einstein: sepya + tebeşir tahtası; Truva: Miken freski).

## 5. Antigravity'ye yapıştırılacak hazır komut (örnek konu)
```
promtAPilot reposundaki antigravity/gorevler/07_if_you_were_uzun_video.md dosyasını baştan sona oku ve aynen uygula.
Şablon: era/episodes/ep04_einstein (en son bölüm hangisiyse onu kullan).
Konu: "If the Whole World Turned Into Zombies" — dünya zombi olsaydı sen nasıl hayatta kalırdın.
Bu kurgu bir konu: "MYTH/EVIDENCE" yerine gerçek bilimle karşılaştır (salgın hesapları, gıda/su, hangi şehirler güvenli,
gerçek parazit örnekleri: ophiocordyceps "zombi karınca mantarı", kuduz). Korku olsun ama kan/vahşet olmasın.
8 dakika, 10 bölüm, en az %55 karakter diyaloğu, ilk 10 saniyede güçlü kanca.
era/README.md backlog'undan en az 2 madde uygula. Kalite kontrol GEÇTİ olmadan bitirme.
Bana her şeyi Türkçe anlat.
```
