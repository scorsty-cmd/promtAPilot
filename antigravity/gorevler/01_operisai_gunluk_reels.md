# OperisAI Günlük Reels

- Durum (Claude'daki son hali): **AKTİF**
- Zaman (İstanbul saati): **Her gün 08:38**  — cron: `CRON_TZ=Europe/Istanbul 38 8 * * *`
- Claude'da kullanılan model: claude-opus-5-5

> Antigravity için: önce `antigravity/ANTIGRAVITY_UYARLAMA.md` dosyasını oku ve oradaki eşleştirmeleri uygula.
> Aşağıdaki talimat Claude'un bulut oturumu için yazıldı; Claude'a özel araç adları (SendUserFile, Artifact,
> add_repo, vidIQ/Gmail bağlayıcıları vb.) uyarlama dosyasındaki karşılıklarıyla değiştirilmelidir.

---

## ORİJİNAL TALİMAT (değiştirilmeden kopyalandı)

Görev: OperisAI için bugünün Instagram Reels videosunu üret ve kullanıcıya gönder. Paylaşmayı kullanıcı kendisi yapacak; Instagram'a hiçbir şey yükleme. Kullanıcıyla Türkçe konuş.

BAĞLAM
OperisAI, İzmir'de yaşayan kullanıcının yapay zeka otomasyon şirketi. Şu an butik otellere (İzmir, Alaçatı, Çeşme, Urla, Foça, Şirince) 7/24 çok dilli chatbot satmaya çalışıyor; ilk müşterilerini arıyor. Instagram hesabı: @operis_ai. Hedef izleyici: butik otel ve pansiyon sahipleri/müdürleri. Her Reels bir otel sahibinin gerçek bir acısını gösterip botun çözdüğünü göstermeli; genel "yapay zeka" içeriği değil. Kullanıcı videoların jenerik Claude görünümünden farklı, özgün ve profesyonel görünmesini istiyor.

KONU SEÇİMİ
Bugünün tarihine göre (yılın günü mod 12) aşağıdaki listeden bir konu seç, böylece konular dönsün:
0) Booking/OTA komisyonu: misafir siteye gelip cevap alamazsa Booking'e döner; direkt rezervasyon = komisyon yok
1) Misafirlerin en çok sorduğu 5 soru (check-in saati, otopark, kahvaltı, transfer, evcil hayvan) — bot anında cevaplar
2) Gece 03:00'te İngilizce misafir — bot cevap verir, sabah rezervasyon gelmiş
3) Rusça/Arapça konuşan misafir — dil bariyeri biter
4) Yoğun sezonda resepsiyon telefonla boğulurken WhatsApp mesajları bekliyor — bot hepsini aynı anda cevaplar
5) "Otelinizde boş oda var mı?" — bot müsaitlik + fiyat + rezervasyon linki verir
6) Yanlış/eski bilgi riski (ör. fotoğrafta olan ama artık olmayan jakuzi) — bot hep güncel bilgiyi verir
7) Personel izinde/hasta — bot her gün çalışır
8) Sezon dışı ön rezervasyon: kasımda 2027 yazı için soran misafirler
9) Misafir girişten önce sorular (havalimanından ulaşım, erken giriş) — bot çözer, resepsiyon rahatlar
10) Yorumlarda "mesajlara geç cevap verdiler" şikayeti — bot ile bu yorum bir daha gelmez
11) Kurulum ne kadar kolay: otelin bilgileriyle 1 haftada hazır, ücretsiz demo

Rakam uydurma; gerçek istatistik iddia etme. Örnek senaryo dramatizasyonu olduğu belli olmalı. Booking komisyonu için "%15-18 civarı" demek yeterli.

GÖRSEL KİMLİK (her videoda aynen uygula)
- 1080x1920, 30 fps, 15-20 saniye, H.264 (libx264 -preset veryfast -crf 18, yuv420p), AAC ses.
- Python + PIL ile kare kare çiz, ffmpeg'e rawvideo pipe ile ver.
- Fontlar: /usr/share/fonts/opentype/inter/ — saat/büyük sayılar InterDisplay-Thin, başlıklar InterDisplay-Bold, gövde Inter-Medium, çeviri/alt notlar Inter-Italic.
- Renkler: arka plan (7,11,20), lacivert panel (14,21,38), kart (20,29,50), marka yeşili (34,214,140), beyaz (240,244,250), soluk metin (140,152,175), vurgu amber (255,190,70), misafir balonu (38,52,84), bot balonu koyu yeşil (18,70,52).
- Arka plan: koyu zemin + 90 px aralıklı çok silik grid (12,18,31) + büyük bulanık renk ışıması (gece sahnelerinde lacivert-mor (40,60,140) sağ üstte, gündüz/sonuç sahnelerinde yeşil (20,120,90) sol altta), sahne değişince yumuşak geçiş.
- Logo "Döngü": açık beyaz halka (yaklaşık 300° yay, -60°'den başlar) + yay ucunun hemen ilerisinde yeşil nokta. Yazı: küçük harf "operis" beyaz InterDisplay-SemiBold + yeşil "AI" InterDisplay-Bold. Sol üstte küçük marka işareti (logo + operisAI), kapanışta büyük logo halka çizilerek açılır.
- Animasyonlar: ease-out kübik geçişler, yazılar hafif yukarı kayarak belirir, sohbet balonlarında "yazıyor..." üç nokta animasyonu, bot cevabı harf harf akar, önemli etiketler amber hap (pill) içinde (ör. "Cevap süresi: 3 saniye"). Telefon sohbeti: yuvarlak köşeli telefon çerçevesi, başlıkta logo + "Otel Asistanı" + yeşil "çevrimiçi · 7/24". Yabancı dildeki mesajların altında küçük italik Türkçe çevirisi. Altta ince yeşil ilerleme çubuğu.
- Yapı: (1) 0-3 sn güçlü kanca — büyük yazı/saat, merak uyandıran tek cümle; (2) sorun + bot demosu (telefon sohbeti veya kart animasyonu); (3) sonuç (ör. "Yeni rezervasyon · komisyon yok" bildirim kartı); (4) kapanış: büyük logo, "Butik oteller için / 7/24 çok dilli yapay zeka asistanı", yeşil buton "Ücretsiz demo → DM "DEMO"" (metin butona sığmalı), altında "@operis_ai · İzmir".
- Ses: ffmpeg aevalsrc ile hafif ambiyans (110/164.8/220 Hz düşük sesli sinüs pad, yavaş titreşim), mesaj gelişlerinde kısa "pop" bildirim sesleri, fade in/out, lowpass 4000.
- Her gün kancayı, düzeni ve sahne kurgusunu konuya göre değiştir; aynı videoyu tekrarlama ama kimliği (font, renk, logo) koru.

KONTROL
Videoyu oluşturmadan önce 4-5 önizleme karesi render edip yan yana bir kontak sayfasında incele: taşan yazı, butondan taşan metin, boş kalan büyük alanlar, okunmayan küçük yazı varsa düzelt. Türkçe karakterlerin (ç, ğ, ı, İ, ö, ş, ü) doğru göründüğünü kontrol et. ffprobe ile süreyi doğrula.

TESLİM
1) SendUserFile ile videoyu gönder (status: proactive, display: render), dosya adı: operisai-reels-YYYY-MM-DD.mp4.
2) SendUserMessage ile Türkçe kısa mesaj gönder: bugünün konusu bir cümleyle, kullanıma hazır Instagram açıklaması (2-4 satır, kanca + fayda + "DM'den DEMO yazın" çağrısı), hashtagler (#izmirotel #butikotel #alaçatı #urla #otelcilik #yapayzeka ve konuya uygun 1-2 tane), kapak için önerilen saniye ve konum etiketi önerisi.
Kısa tut; adımları anlatma.
