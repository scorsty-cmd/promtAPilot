# Universe Of Animals — Shorts Playbook

Kanal: **Universe Of Animals** (@universeofanimals4356, kanal ID `UCaej4bsMXb0-tgggDZS18aQ`)
Dil: **Türkçe** (başlık, açıklama, seslendirme, ekran yazıları). Kullanıcıyla iletişim de Türkçe.
Yayın: **her gün 1 Short, 19:00 TSİ** (uploader `animals-` etiketli release'i otomatik bu slota zamanlar).

## 1. Neden bu format?
- 25–26 Eylül 2026'da en çok izlenen 3 video (378 / 297 / 153 izlenme) Türkçe, ilişki kurulabilir,
  soru soran veya "kedinin iç sesi" esprili başlıklıydı. İngilizce ve emoji-only başlıklar 0–10 izlenmede kaldı.
- Ortalama izlenme süresi 13 sn, engaged view oranı ~%33 → ilk 1 saniye ve döngü (loop) kritik.
- Büyüyen benzer kanallar klibi düz koymuyor: hikâye, duygu veya seslendirme ekliyor.
- Başkalarının TikTok/Instagram/YouTube kliplerini ASLA kullanma (telif + "yeniden kullanılan içerik").
  Sadece `animal-assets` dalındaki serbest lisanslı klipler (Pexels License, CC0, PD, CC BY).

## 2. Video formülü (12–25 sn, en fazla 35 sn)
Her gün şu üç formatı sırayla döndür (LEARNINGS'teki sonuçlara göre ağırlığı değiştir):
- **A — İç ses:** Hayvanın aklından geçenler, gündelik Türk hayatından espriler
  (Pazartesi sabahı, maaş günü, diyet, anne baba, kargo, misafir, sınav, trafik). 3–5 kısa cümle.
- **B — Bunu biliyor muydun?:** Klipteki hayvanla ilgili doğru, şaşırtıcı bilgi (en az 2 güvenilir kaynakla doğrula,
  efsaneyi gerçek gibi anlatma). 3–4 cümle, son cümle soru.
- **C — Hangisi sensin?:** İki/üç davranışı karşılaştır, sonunda izleyiciye yorumda seçtir.

Kurallar:
- **Hook (üst banner):** 2–6 kelime, merak veya özdeşlik ("Pazartesi sabahı her kedi:", "Kediniz bunu yapıyorsa…").
  Tüm video boyunca ekranda kalır.
- İlk satır en geç 0,5 sn'de başlar; ilk 1 sn'de klipteki en hareketli an görünmeli (klibin `start`'ını buna göre seç).
- Satırlar kısa (en fazla ~8 kelime), konuşma dilinde. Vurgulanacak kelimeyi `*böyle*` yaz (sarı görünür).
- Seslendirme metninde kısaltma, rakam, emoji kullanma; sayıları yazıyla yaz ("on altı saat").
- Son satır ya bir soru (yorum getirir) ya da başa saran bir espri (loop).
- Bitiş kartı: "ABONE OL" + "Her gün yeni komik hayvan videosu"; haftada en az 2 videoda (tercihen B) `promo.json` ürününün `end_card_line` satırı da.
- Müzik: A ve C için `bouncy`, B için `calm`.
- Klip: içerikle gerçekten eşleşen, net, hayvanın yüzü/hareketi görünen klip seç. Önizleme şeritlerine BAK.
  Logo, filigran, okunur yazı, tanınabilir insan yüzü veya hayvana eziyet/tehlike içeren klibi reddet.

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
  5. "Seslendirme yapay zekâ ile üretilmiştir. Müzik kanala özel üretilmiştir."
  6. 3–5 hashtag: #kedi #köpek #komikhayvanlar #hayvanlar #shorts (konuya göre).
- **Etiketler (TAGS):** 8–15 Türkçe etiket + "Universe Of Animals".
- CHAPTERS bölümü boş bırakılabilir ama başlığı yazılmalı (uploader formatı).

## 4. Teslim (cloud)
1. `animal-requests/<YYYYMMDD>-<HHMM>.json` push → "Fetch animal clips" iş akışı klipleri `animal-assets` dalına koyar.
2. Dalı çek, önizlemelere bak, `spec.json` yaz, `PIPER_VOICE=<store>/tts/<tts/VOICE.txt'deki dosya>
   python animals/render_short.py spec.json out/` çalıştır, `contact.jpg`'ye ve en az 6 kareye bak.
3. Release etiketi `animals-<YYYY-MM-DD>-<slug>` (asla "history"/"hidden" içermez). Varlıklar:
   `animals_<YYYY-MM-DD>_<slug>_shorts.mp4`, `thumb_B.jpg`, `YOUTUBE_METADATA.txt`. Önce draft, varlıkları
   kontrol et, sonra yayınla → "Daily YouTube Upload & Schedule" kanala yükler ve 19:00'a zamanlar.

## 4b. Instagram (Antigravity + Buffer yönetir)
- Her gün: 1 Reels (20:00), 1 kaydırmalı gönderi (17:00), 2–3 hikâye (16:00 / 18:30 / 21:30); görev 14:00 civarı bittiği için saatler öğleden sonraya göre.
- Claude dosyaları ve INSTAGRAM_PLAN.json'u release'e koyar; Antigravity planı Buffer'a aynen işler.
- Gönderi Reels'in tekrarı olmaz: ek bilgi, mini rehber veya "hangisi sensin?" verir (kaydedilme ve paylaşılma getirir).
- E-kitap: biyografide link; promo hikâyesi gün aşırı; gönderilerde haftada 3 kez yumuşak "link profilde" satırı.

## 5. E-kitap satışı (DijitalStore / Shopier)
- Ürünler ve hazır metinler `promo.json` içinde. Satış dili yok: tanıtım videonun konusuna doğal bağlanır.
- E-postada her gün o videonun `pinned_comment` metnini ver (kullanıcı yorumu sabitleyebilir; API sabitleme yapamaz).
- Ürün linkine gelen tıklamalar ölçülemiyor; satış artışı için kullanıcıdan Shopier satış sayısını isteme, sadece
  hangi ürünün hangi videolarda gösterildiğini LEARNINGS tablosunda tut.

## 6. Öğrenme döngüsü
- Her çalıştırmada son 7 Short'un izlenme/beğeni/yorum sayısını **ücretsiz** `vidiq_get_videos_by_ids` ile al,
  `animals/LEARNINGS.md` tablosuna yaz; hangi format/hook/hayvan iyi gidiyor, 2–3 madde kural çıkar.
- Haftada bir (Pazartesi) ve sadece vidIQ bakiyesi ≥ 60 ise en fazla 5 kredilik tek rakip analizi
  (`vidiq_outliers` Türkçe/İngilizce hayvan Shorts). Aksi halde WebSearch ile genel trendlere bak.
- Bir sonraki videoda en az 1 somut iyileştirme uygula ve LEARNINGS'e yaz.
