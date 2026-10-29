# Universe Of Animals — Shorts Playbook

Kanal: **Universe Of Animals** (@universeofanimals4356, kanal ID `UCaej4bsMXb0-tgggDZS18aQ`)
Dil: **Türkçe** (başlık, açıklama, seslendirme, ekran yazıları). Kullanıcıyla iletişim de Türkçe.
Yayın: **her gün 1 Short (30–60 sn derleme ağırlıklı), 19:00 TSİ** (uploader `animals-` etiketli release'i otomatik bu slota zamanlar).

## 1. Neden bu format?
- 25–26 Eylül 2026'da en çok izlenen 3 video (378 / 297 / 153 izlenme) Türkçe, ilişki kurulabilir,
  soru soran veya "kedinin iç sesi" esprili başlıklıydı. İngilizce ve emoji-only başlıklar 0–10 izlenmede kaldı.
- Ortalama izlenme süresi 13 sn, engaged view oranı ~%33 → ilk 1 saniye ve döngü (loop) kritik.
- Büyüyen benzer kanallar klibi düz koymuyor: hikâye, duygu veya seslendirme ekliyor.
- Başkalarının TikTok/Instagram/YouTube kliplerini ASLA kullanma (telif + "yeniden kullanılan içerik").
  Sadece `animal-assets` dalındaki serbest lisanslı klipler (Pexels License, CC0, PD, CC BY).

## 2. Video formülü — komik kurgu (29 Eki 2026'dan itibaren)
Kullanıcı (29 Eki 2026): "Yapay zekâ sesi çok yapmacık; komik editler yap, komik kedi videolarını birleştir,
1 dakikaya kadar uzun olabilir; benim sesimi de kullanabilirsin." → Varsayılan artık **AI seslendirmesiz komik kurgu**.
Motor: `animals/render_edit.py` (docstring'deki spec). Görünüm: universe-of-animals-style (krem/mandalina sticker,
kakao çerçeve, Bricolage Grotesque; üstte başlık, ortada büyütülmüş video, alt-orta sticker'lar).

Formatlar:
- **D — Komik derleme (ana format):** "Kedilerin en dramatik 5 anı", "Kediler fizik kurallarını tanımıyor",
  "Kedi kardeşler vs. sabır" gibi tek temalı başlık. 4–6 klip, numaralı (`number`), toplam **30–60 sn**.
  Her klipte: iç ses (`inner`) veya özdeşlik sticker'ı ("Annem markete gidince biz:"), en komik anda bir
  dondurma (`freeze` + metin + ses efekti) VEYA ağır çekim tekrarı (`replay`), uygun ses efekti.
  En güçlü an 1. klipte, ilk 1 sn içinde (hook); en komik/şaşırtıcı klip sona (izleyiciyi tutar).
- **A — İç ses (tek klip, 12–25 sn):** aynı motor, tek klip; 2–4 sticker/iç ses, bir dondurma veya tekrar.
- **B — Bunu biliyor muydun? (haftada en fazla 1–2):** doğal Türkçe sinir ağı sesi — klip isteğine
  `"tts": [{"name": "l1", "text": "...", "voice": "tr-TR-EmelNeural"}]` ekle (iş akışı `<id>/tts_l1.mp3` üretir,
  `tr-TR-AhmetNeural` da var); render_edit'te `voice` olayı + aynı cümle sticker olarak. tts üretilemezse
  sesi tamamen bırak, bilgiyi sticker'larla ver (eski robotik Piper sesine geri dönme).
- **C — Hangisi sensin?:** 2–3 klip numaralı, sonda "Sen hangisisin? 1, 2, 3 — yorumlara yaz".

Haftalık sıra (İstanbul günü): Pzt D · Sal A · Çar D · Per B · Cum D · Cmt C · Paz D.
D günü için klip isteğinde 2 öğe × n=5 iste; kullanılmamış uygun klip 4'ten azsa o gün A veya C yap.

Kurgu kuralları:
- Espri Türk gündelik hayatından ve hayvanın "iç sesinden" gelir (anne, market, maaş, Pazartesi, kardeş, misafir,
  diyet, sınav). Sticker metni ≤ 8 kelime, emoji yok (font çizemez). Kurulum krem, punchline mandalina.
- Yazılar hayvanın yüzünü kapatmasın: `y` ile oynat (varsayılan 1300; video penceresi y≈330–1710).
- Klip başına en fazla 1 dondurma + 1 tekrar; ses efektini espriyle eşleştir (bonk=çarpma, scratch=şok,
  dun=dram, boing=zıplama, slide_up=heves, ding=fikir, drumroll=gerilim, rewind otomatik).
- Klibin kendi sesi (miyav vb.) varsa `clip_audio: 0.5–0.8`; insan konuşması/yabancı müzik varsa 0.
- Müzik `bouncy` (D/A/C), `calm` (B); `music_vol` 0.18–0.25.
- Bitiş kartı: "ABONE OL" + "Her gün yeni komik hayvan videosu" (+ promo günlerinde `promo`).
- Kontrol: contact.jpg + en az 8 kare (her dondurma/tekrar anı dahil), Türkçe karakterler, yüz kapanmıyor,
  ses -14 LUFS civarı (±1,5).

Kullanıcının kendi sesi (`animals/voice/`):
- Kullanıcının gönderdiği kayıtlar buraya konur; "Transcribe owner voice" iş akışı her kayıt için
  `<ad>.json` / `<ad>.txt` (cümle ve kelime zamanları) üretir. Videoda `voice` olayıyla bir cümleyi kes,
  `caption` ile aynı cümleyi sticker yap. Haftada en fazla 2–3 videoda, video başına 1–2 cümle; aynı cümleyi
  7 gün içinde tekrar kullanma (LEARNINGS'e yaz).
- `kullanici_ses_01` (24 Eki) bir ChatGPT anlatımı: hayvan videosuna uyan cümleler sadece
  "Birinci adım." (13.30–14.25, 29 Eki derlemesinde kullanıldı) ve "Ekranı kısaca tanıyalım." (24.50–25.90).
  Hayvanlara özel yeni kayıtlar geldikçe onları tercih et.

Klip seçimi: içerikle eşleşen, net, hayvanın yüzü/hareketi görünen klip. Önizleme şeritlerine BAK.
Logo, filigran, okunur yazı, tanınabilir insan yüzü veya hayvana eziyet/tehlike/kavga içeren klibi reddet.
Eski format (`render_short.py`, Piper sesi) artık kullanılmaz; sadece motor bozulursa yedek.

## 3. Başlık, açıklama, etiket
- **Başlık:** Türkçe, ≤ 60 karakter, en fazla 1 emoji, sonunda 2–3 hashtag. Kalıplar:
  soru ("Sizin kediniz de böyle mi?"), özdeşlik ("Maaş yatınca ben:"), merak ("Kediler neden kutuya bayılır?").
  Daha önce kullanılmış başlığı tekrar etme (LEARNINGS'teki listeye bak).
- **Açıklama (YOUTUBE_METADATA.txt DESCRIPTION):**
  1. satır: videonun tek cümlelik özeti + soru.
  2. `promo.json`'dan videodaki hayvana uygun ürünün `description_block` metnini HER videoda olduğu gibi ekle
     (kedi → cat_behaviour, kedi+bebek/aile → cat_baby, köpek → dog_care, diğer → cat_behaviour).
  3. "🐾 Her gün 19:00'da yeni komik hayvan videosu — abone olmayı unutma!"
  4. Klip kaynağı (manifest'ten): "Görüntü: <creator> / <Pexels | Wikimedia Commons> (<lisans>)" — CC BY ise
     manifest'teki `attribution` metnini aynen yaz.
  5. "Müzik ve ses efektleri kanala özel üretilmiştir." (+ B formatında: "Seslendirme yapay zekâ ile üretilmiştir.")
  6. 3–5 hashtag: #kedi #köpek #komikhayvanlar #hayvanlar #shorts (konuya göre).
- **Etiketler (TAGS):** 8–15 Türkçe etiket + "Universe Of Animals".
- CHAPTERS bölümü boş bırakılabilir ama başlığı yazılmalı (uploader formatı).

## 4. Teslim (cloud)
1. `animal-requests/<YYYYMMDD>-<HHMM>.json` push → "Fetch animal clips" iş akışı klipleri `animal-assets` dalına koyar.
2. Dalı çek, önizlemelere bak, `spec.json` yaz, `python animals/render_edit.py spec.json out/` çalıştır,
   `contact.jpg`'ye ve en az 8 kareye bak.
3. Release etiketi `animals-<YYYY-MM-DD>-<slug>` (asla "history"/"hidden" içermez). Varlıklar:
   `animals_<YYYY-MM-DD>_<slug>_shorts.mp4`, `thumb_B.jpg`, `YOUTUBE_METADATA.txt`. Önce draft, varlıkları
   kontrol et, sonra yayınla → "Daily YouTube Upload & Schedule" kanala yükler ve 19:00'a zamanlar.

## 4b. Instagram (GitHub "Instagram Publish" iş akışı otomatik paylaşır)
- Her gün: 1 Reels (20:00), 1 kaydırmalı gönderi (17:00), 2–3 hikâye (16:00 / 18:30 / 21:30); görev 14:00 civarı bittiği için saatler öğleden sonraya göre.
- Claude dosyaları ve INSTAGRAM_PLAN.json'u kuyruk üzerinden release'e koyar; "Instagram Publish (Universe Of Animals)" iş akışı (tools/instagram_publisher.py) resmi Instagram API ile @hayvanlaralemleri'ye plan saatlerinde paylaşır (16:05/17:05/18:35/20:05/21:35 kontrol). 6 saatten geç hikâye atlanır; geç kalan Reels/gönderi bir sonraki çalışmada paylaşılır. Sonuçlar: instagram-state dalında instagram/state.json ve last_run.json. Gerekli: IG_ACCESS_TOKEN (pazar günleri yenilenir) ve IG_MEDIA_PAT (~22 Oca 2027'de süresi dolar).
- Gönderi Reels'in tekrarı olmaz: ek bilgi, mini rehber veya "hangisi sensin?" verir (kaydedilme ve paylaşılma getirir).
- E-kitap: biyografide link; promo hikâyesi ve "kitaptan bir sayfa" gönderisi bölüm 5.2 takvimine göre (haftada 4 promo hikâyesi).

## 5. E-kitap pazarlaması (DijitalStore / Shopier) — ÖNCELİKLİ HEDEF
Kullanıcının isteği (21 Eki 2026): e-kitap satışına iyi odaklan, profesyonel pazarlama yap, ilgi çek.
Yaklaşım: **önce değer, sonra teklif.** İnsanlar kitabı reklamdan değil, "bu sayfa kedimi gerçekten anlamamı
sağlıyor" hissinden alır. Her içerik kitabın konularından birine kapı açar; satış dili abartısız ve dürüst olur.

### 5.1 İçerik sütunları (kitapların konularından)
- **Kedi Davranışları Bilimi** (ana ürün, 49,99 TL): kuyruk/kulak/göz beden dili, miyavlama ve mırlamanın
  anlamları, garip alışkanlıklar (kutu, yoğurma, hediye getirme, 3'te koşturma), stres işaretleri,
  davranış sorunları (tırmalama, kum dışına yapma, gece miyavlaması), yavru/yaşlı/çok kedili ev.
- **Evde Köpek Bakım Rehberi** (49,99 TL): temel eğitim, beslenme, oyun, sağlık rutinleri, ev düzeni.
- **Kediler ve Bebekler** (99,99 TL): bebek gelmeden kediyi hazırlama, hijyen, uyku düzeni, güvenli tanıştırma
  (sağlık iddiasında çok dikkatli ol: tıbbi tavsiye verme, "doktorunuza danışın" de).

### 5.2 Haftalık pazarlama takvimi (gün = yayın günü, İstanbul)
| Gün | Reels/Short | Kaydırmalı gönderi | Hikâye 3 (promo) |
|---|---|---|---|
| Pzt | A (komik iç ses) | **Rehber**: "Kedinin kuyruğu ne diyor? 5 işaret" gibi kaydedilecek içerik | Yok |
| Sal | B (bilgi) — sonunda "kitapta daha fazlası" | Hangisi sensin? (etkileşim) | **Problem→çözüm**: "Kedin gece miyavlıyor mu?" + kitap kapağı |
| Çar | C (hangisi sensin) | **Mini vaka**: bir davranış sorunu, 4 adımda çözüm yolu | Yok |
| Per | B (bilgi) | **Kitaptan bir sayfa tadında**: 3 ipucu + "devamı e-kitapta" son slaytı + kapak | **Kapak tanıtımı**: ne öğreneceksin (3 madde) |
| Cum | A (komik) | Eğlenceli liste ("Kedilerin 7 garip alışkanlığı") | Yok |
| Cmt | B (köpek veya kedi-bebek) | **Köpek ya da kedi-bebek rehberi** (diğer iki kitaba kapı) | **İlgili kitabın tanıtımı** |
| Paz | A/C | Haftanın özeti / "kaydet" rehberi | **Hafta sonu hatırlatma**: "Link profilde" |
- Promo hikâyesi haftada 4 gün (Sal, Per, Cmt, Paz); diğer günler değer + etkileşim. Aynı ürün art arda
  iki promo gününde kullanılmaz (Sal kedi davranış → Per kedi davranış olabilir ama Cmt köpek/kedi-bebek).
- YouTube Short açıklamasında ilgili ürünün `description_block`'u HER gün; bitiş kartı promo satırı Sal/Per/Cmt.

### 5.3 Profesyonel tanıtım kuralları
- **Kapak görseli kullan**: `animals/covers/<ürün anahtarı>.jpg` varsa promo hikâyesi ve "kitaptan bir sayfa"
  gönderisinin son slaytında make_social.py'nin `cover` alanıyla göster. Yoksa kapaksız tasarım + e-postada
  kullanıcıya kapak görselini göndermesini hatırlat.
- Promo metni yapısı: **dert (soru) → bilgi kırıntısı → kitapta ne var (3 kısa madde) → net çağrı ("Link profilde")**.
  Örnek: "Kedin neden sana bakıp yavaşça göz kırpıyor? → Bu bir güven işaretidir → Kitapta: beden dili rehberi,
  miyavlama sözlüğü, 20+ gerçek vaka → Link profilde 📘".
- Sadece ürün sayfasında yazan bilgileri söyle (Shopier açıklaması: beden dili, miyavlama/mırlama, garip
  alışkanlıklar, stres, davranış sorunları, 20+ vaka, kişilik testi, QR'lı uzman videoları; fiyat 49,99 TL).
  **Uydurma yorum, sahte müşteri, sahte aciliyet ("son 2 saat!") veya olmayan indirim YOK.** Gerçek bir indirim
  kodu ancak kullanıcı promo.json'a eklerse kullanılır.
- Fiyatı haftada en fazla 1 kez söyle ("bir kahve fiyatına" gibi karşılaştırmayla, dürüst).
- Her gün e-postada o günün `pinned_comment` metnini ver; YouTube'da kullanıcı sabitler.

### 5.4 Ölçüm
- Tıklama ölçülemiyor: e-postada kullanıcıdan haftada bir (Pazar) Shopier satış sayısını yazmasını iste
  ve kullanıcı cevap verirse LEARNINGS'e "Satış" satırı olarak işle; hangi hafta hangi içerik türü öne
  çıkarıldıysa yanına not et. Satışa en çok eşlik eden içerik türünü sonraki haftalarda artır.

## 6. Öğrenme döngüsü
- Her çalıştırmada son 7 Short'un izlenme/beğeni/yorum sayısını **ücretsiz** `vidiq_get_videos_by_ids` ile al,
  `animals/LEARNINGS.md` tablosuna yaz; hangi format/hook/hayvan iyi gidiyor, 2–3 madde kural çıkar.
- Haftada bir (Pazartesi) ve sadece vidIQ bakiyesi ≥ 60 ise en fazla 5 kredilik tek rakip analizi
  (`vidiq_outliers` Türkçe/İngilizce hayvan Shorts). Aksi halde WebSearch ile genel trendlere bak.
- Bir sonraki videoda en az 1 somut iyileştirme uygula ve LEARNINGS'e yaz.
