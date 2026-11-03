# Universe Of Animals — Öğrenilenler

## Kurallar (şimdiye kadar)
- Türkçe, soru soran / özdeşlik kuran başlıklar İngilizce ve emoji-only başlıklardan çok daha iyi gitti (Eylül 2026).
- En iyi 3 video kedi videosuydu; köpek videoları 0–10 izlenmede kaldı → kedi ağırlıklı başla, köpeği test et.
- Ortalama izlenme 13 sn → 12–25 sn arası, ilk saniyede hareket, sonda döngü.
- 22 Eki 2026: bu görevin henüz YouTube'a yüklenmiş Short'u yok (release yok, YOUTUBE_TOKEN_JSON_ANIMALS bekleniyor) → izlenme verisi yok; Eylül kuralları geçerli.
- 23 Eki 2026: hâlâ yüklenmiş Short yok → izlenme verisi yok; vidIQ bakiye 0 (29 Eki sıfırlanır).
- Klip: "Videos of cats playing" kategorisi 0 sonuç; "Videos of kittens" 3 sonuç verdi. Commons klipleri yatay → dikeyde hayvan küçük: orta bandı kırpıp yakınlaştır. Marka yazılı (ör. "Pet Plus" yatak) veya yazı/filigran içeren klipleri ele.
- vidIQ: vidiq_get_videos_by_ids aracı kendini "5 kredi/çağrı" olarak gösteriyor ve bakiye 0 (sıfırlanma 29 Eki) → istatistik ancak bakiye varken alınır.
- Klip: Pexels anahtarı yok, sadece Commons çalışıyor. "cat face eyes" gibi serbest aramalar 0 sonuç verdi; `incategory:"Videos of cats"` çalışıyor. Karanlık klipleri ffmpeg eq ile aydınlat (CC BY ise açıklamada "parlaklığı artırıldı" yaz).

- 24 Eki 2026: hâlâ yüklenmiş Short yok, vidIQ bakiye 0 → veri yok. Commons köpek klipleri az: 'Videos of puppies' 0 sonuç; 'Videos of dogs' 4 klip (çoğu marka/yazı/insan yüzü). Eski siyah-beyaz film kliplerinde insan yüzü çıkabilir: kareleri kontrol et, ilgisiz kısımları kes.

- 25 Eki 2026: hâlâ yüklenmiş Short yok, vidIQ bakiye 0 (29 Eki sıfırlanır) → veri yok. Instagram Publish son çalışma ok (@hayvanlaralemleri bağlı). Klip: kareleri bütün klip boyunca kontrol et; hayvanın kafası bazı bölümlerde kare dışına çıkıyor → yüzü görünen aralığı seç (ör. ilk 10 sn). Hikâye fotoğrafı için yatay/bulanık kareyi dikeye büyütme: çirkin çıkarsa düz tasarım kullan. loudnorm tek geçiş -15,7 verdi → +1,6 dB + alimiter ile -13,7 LUFS.
- 29 Eki 2026: vidIQ bakiye hâlâ 0 (sıfırlanma 14:30 UTC) → izlenme verisi yok; YouTube yüklemesi hâlâ yok. Commons'ta 'Videos of cats/kittens' kategorileri tükendi (0 sonuç): serbest arama 'cat filetype:video' 12 yeni klip verdi → bundan sonra bunu kullan. Klibin başında yazı olabilir (start'ı kaydır), klip döngüye girip kavga/ısırma karesi gösterirse end'i uzat.

- 29 Eki 2026: Kullanıcı yapay zekâ sesini yapmacık buldu → komik kurgu motoru (render_edit.py), 30–60 sn derlemeler, sesiz iç ses/sticker, dondurma, ağır çekim tekrar, ses efektleri. Commons araması artık sayfalı (50'şer, 5 sayfa) ve büyük dosyalarda Wikimedia 720p/480p kopyasını indirir. Pexels anahtarı hâlâ yok → derleme için klip az; kullanıcıya hatırlat.

- 30 Eki 2026: vidIQ bakiye 27 (sıfırlanma 29 Kas) → ücretli çağrı yok; hâlâ YouTube ID'si olan animals Short'u yok → izlenme verisi yok. Commons 'cat funny filetype:video' yalnızca 2 sonuç (ikisi kedi değil/uygunsuz), 'kitten filetype:video' 21 sonuç verdi → derleme klipleri bundan + önceki klasörlerden (20261029-1130) çıkar. İlk 30 sn'de tam kare 2-fps karo ile komik anı bulmak işe yarıyor. Ses: tek geçiş -15,5 LUFS → +1,6 dB + alimiter ile -13,1.
- 30 Eki 2026: Instagram (instagram-state): 29 Eki Reel https://www.instagram.com/reel/DfFsaeyDrRI/ , gönderi https://www.instagram.com/p/DfFsiqzmcDG/ ; 28 Eki Reel https://www.instagram.com/reel/DfDGsnXE2GR/ , gönderi https://www.instagram.com/p/DfDG1HxmU90/ ; son çalışma ok, hata yok.

- 31 Eki 2026: vidIQ bakiye 27 (ücretli çağrı yok); YouTube ID'li animals Short'u hâlâ yok → izlenme verisi yok. Instagram 30 Eki: Reel https://www.instagram.com/reel/DfIOlpRCihV/ , gönderi https://www.instagram.com/p/DfIOvjXD-rj/ ; son çalışma ok. Commons 'cat filetype:video' + 'domestic cat filetype:video' 10 klip verdi (yalnız 3'ü derlemeye uygun). queue_publish.py'yi tek kez başlat (iki süreç yarışıyor; yine de tek release oluştu).

- 1 Kas 2026: vidIQ bakiye 2 (ücretli çağrı yok), YouTube ID'li animals Short'u hâlâ yok → izlenme verisi yok. Instagram 31 Eki: Reel https://www.instagram.com/reel/DfKtJNUkatr/ , gönderi https://www.instagram.com/p/DfKtRC_Fk1x/ ; son çalışma ok. Commons 'cat jumping filetype:video' çoğunlukla atlet kliplerı (1900 filmi) verdi, 'cats playing filetype:video' 2 işe yarar kedi klibi (Larry/Chloé, Moomin) → derleme için eski klasörlerden (Burmese yavru) tamamlandı. queue_publish.py: sleep'li ilk çağrıda log boş kalsa da gönderim yapılmıştı; ikinci kez çalıştırma ('dal zaten var' diye reddeder). Ses: tek geçiş -15,2 → +1,3 dB + alimiter(0.89) ile -14,1 LUFS.
- 2 Kas 2026: vidIQ bakiye 2 (ücretli çağrı yok, Pzt rakip analizi atlandı); YouTube ID'li animals Short'u hâlâ yok → izlenme verisi yok. Instagram 1 Kas: Reel https://www.instagram.com/reel/DfNXQe3Cvui/ , gönderi https://www.instagram.com/p/DfNXaUGmKQg/ ; son çalışma ok. Commons 'kitten filetype:video' çoğu uygunsuz (havai fişek, puma); 'cat filetype:video' 4 işe yarar klip verdi (esneyen yavru, siyah kedi, Abyssinian, mama). Yatay/uzak çekim klipler (güvercin, raylı yavrular) derlemeye yaramaz: kedi kareyi doldurmalı. Ses: tek geçiş -15,2 → +1,3 dB + alimiter(0.89) ile -13,1. queue_publish.py --wait ile 2 dk içinde bitti.
- 3 Kas 2026: vidIQ bakiye 2 (ücretli çağrı yok); YouTube ID'li animals Short'u hâlâ yok → izlenme verisi yok. Instagram 2 Kas: Reel https://www.instagram.com/reel/DfQdZ2ojwm-/ ; son çalışma ok. Commons 'cat filetype:video' 5 klipten yalnız 1'i tam uygun (Amelia yoğurma); 'kitten filetype:video' puma yavruları verdi (uygunsuz) → 'kitten' yerine 'cat' varyantları dene. Ses: tek geçiş -15,1 → +1,3 dB + alimiter(0.89) ile -13,1.

## Uygulanan iyileştirmeler
- 2026-10-22: Hook doğrudan izleyiciye soru ("Kedin sana…?") + B formatında bilimsel kaynak açıklamaya yazıldı + 3 klip ile döngüsüz akış (tek klibin başa sarması engellendi).
- 2026-10-23: Tek, baştan sona hareketli klip (iki yavru boğuşuyor) + orta bant 1,3x yakınlaştırıldı (yatay klipte hayvanlar küçük kalıyordu) + Türk aile hayatından özdeşlik hook'u ("Cuma akşamı kardeşimle ben:", kumanda kavgası) + yayın gününe denk gelen konu (Cuma 19:00) + 17 sn'lik kısa süre ve sonda yorum sorusu. Ses -13,8 LUFS'a çekildi.
- 2026-10-24: B formatı köpek (Cumartesi takvimi); bilgi PBS NOVA + ScienceABC ile doğrulandı; klip önceden 1.5x yakınlaştırılıp parlaklığı artırıldı, insan yüzü içeren kısımlar kesildi; ses loudnorm ile -14,6 LUFS; kaydırmalı gönderi de aynı doğrulanmış bilgiyle (5 slayt).
- 2026-10-25: A formatı, Pazar akşamı özdeşliği (yayın günü/saatiyle uyumlu) + yalnızca yüzü net görünen ilk 10 sn klip, kısa 13 sn, gap 0,25 sn ile hızlı tempo, sonda yorum sorusu; kaydırmalı gönderi doğrulanmış haftalık özet (yavaş göz kırpma: Sci Reports 2020 + ScienceDaily; köpek burnu: PBS NOVA + ScienceABC).
- 2026-10-29: B formatı, soru hook'u ('Kedi mırlıyorsa mutlu mu?') + 2 kaynakla doğrulanmış bilgi (Scientific American, Great Pet Care) + döngüsüz tek sakin klip (tımar sahnesi) + Perşembe takvimi: 'kitaptan bir sayfa' gönderisi (kapak + 3 madde) ve kapak tanıtım hikâyesi.
- 2026-10-30: İlk komik derleme (D): 4 klip, 36 sn, AI sesi yok; Cuma günü özdeşliği ('Cuma 18:00 mesai bitti'), 1. klipte ilk saniyede hareket, her klipte dondurma + 4. klipte ağır çekim tekrar, en komik klip (akvaryum pençesi) sona; başlık ≤ 60 karakter (53); kaydırmalı gönderi 4 garip alışkanlık (2'şer kaynakla doğrulandı: LiveScience+VetVerified, phys.org+zooplus, PetMD+The Conversation, VCA+PetMD).
- 2026-10-31: C formatı (Hangi kedi sensin?), 3 numaralı klip, 28,6 sn, AI sesi yok; sonda 'Sen hangisisin? 1, 2, 3?' yorum çağrısı; ses -13,2 LUFS; kaydırmalı gönderi kedi+bebek rehberi (5 adım; Wood Green + PetMD ile doğrulandı) ve cat_baby promo hikâyesi (kapak dosyası yok).
- 2026-11-01: D derleme, 4 klip 36 sn; haftanın günü/saati temalı hook (Pazar gecesi → Pazartesi), 1. klipte ilk saniyede zıplama, her klipte dondurma/iç ses, son klipte dil çıkarma anı dondurma + ağır çekim tekrar; freeze ile çakışan sticker'ı kaldırıp tek metin kullan; kaydırmalı gönderi kedi beden dili 'kaydet' rehberi (PetMD + NAWT ile doğrulandı) ve cat_behaviour kapaklı promo hikâyesi.
- 2026-11-02: D derleme, 4 klip 33 sn; tek günün akışı (sabah/öğle/akşam/maaş) olarak sıralı hikâye (önceki günlerdeki bağımsız espriler yerine anlatı), 1. klipte kedi kameraya yürüyor (ilk saniyede hareket), esneme ağır çekim tekrarı, en komik "mama başında kaçamak bakış" sona; yalnız kareyi dolduran yakın çekimler seçildi; kaydırmalı gönderi kedi kuyruğu rehberi (PetMD + WebVet ile doğrulandı).
- 2026-11-03: A formatı (Salı takvimi), tek klip 20 sn; yüzü kareyi dolduran yoğurma klibi, kedinin yan bakış anı dondurma + ağır çekim tekrar, haftanın günü özdeşliği (alarm / maaş); kaydırmalı gönderi 'hangi kedi tipisin' (etkileşim, olgu iddiası yok), cat_behaviour kapaklı problem→çözüm promo hikâyesi.

## Yayın kaydı
| Tarih | Release etiketi | Format | Hayvan | Başlık | YouTube ID | 24s izlenme | 7g izlenme | Beğeni | Yorum | Instagram (Reel paylaşım tarihi + link) |
|---|---|---|---|---|---|---|---|---|---|---|
| 2026-10-22 | animals-2026-10-22-yavas-goz-kirpma | B | kedi | Kedin sana yavaşça göz kırpıyor mu? 😺 #kedi #kediler | yüklenmedi (YOUTUBE_TOKEN_JSON_ANIMALS yok; queue dalı duruyor) | – | – | – | – | (Antigravity'ye bırakılmıştı) |
| 2026-10-23 | animals-2026-10-23-cuma-aksami-kardesimle | A | kedi (2 yavru) | Cuma akşamı kardeşimle ben 😹 #kedi #komikhayvanlar | yüklenmedi (YOUTUBE_TOKEN_JSON_ANIMALS yok; queue dalı duruyor) | – | – | – | – | 24 Eki: https://www.instagram.com/reel/De4CmwAFUCG/ + gönderi https://www.instagram.com/p/De4CvjLlUN-/ (GitHub) |
| 2026-10-24 | animals-2026-10-24-kopek-burnu | B | köpek | Köpeğin burnu süper güç mü? 🐶 #köpek #hayvanlar #shorts | yüklenmedi (YOUTUBE_TOKEN_JSON_ANIMALS yok; queue dalı duruyor) | – | – | – | – | GitHub Instagram Publish, plan saatlerinde |
| 2026-10-25 | animals-2026-10-25-pazar-aksami-kedi | A | kedi (siyah yavru) | Pazar akşamı her kedi 😹 #kedi #komikhayvanlar #shorts | kuyrukta (Queue Upload sonucu e-postada) | – | – | – | – | GitHub Instagram Publish, plan saatlerinde |
| 2026-10-29 | animals-2026-10-29-mirlama-sirri | B | kedi (tımar) | Kedi mırlıyorsa mutlu mu? 🐱 #kedi #kediler #shorts | yüklenmedi (YouTube bağlı değil) | – | – | – | – | GitHub Instagram Publish, plan saatlerinde |
| 2026-10-30 | animals-2026-10-30-cuma-enerjisi-4-kedi | D | kedi (4 klip) | Cuma enerjisi: 4 kedi 😹 #kedi #komikhayvanlar #shorts | yüklenmedi (YouTube bağlı değil; run 41046917873) | – | – | – | – | GitHub Instagram Publish, plan saatlerinde |
| 2026-10-31 | animals-2026-10-31-hangi-kedi-sensin | C | kedi (3 klip) | Hangi kedi sensin? 😹 #kedi #komikhayvanlar #shorts | yüklenmedi (YouTube bağlı değil; run 41195872346) | – | – | – | – | GitHub Instagram Publish, plan saatlerinde |
| 2026-11-01 | animals-2026-11-01-pazartesi-geliyor-4-kedi | D | kedi (4 klip) | Pazartesi geliyor: 4 kedi 😹 #kedi #komikhayvanlar #shorts | yüklenmedi (YouTube bağlı değil; run 41300880050) | – | – | – | – | GitHub Instagram Publish, plan saatlerinde |
| 2026-11-02 | animals-2026-11-02-pazartesi-4-kedi-hali | D | kedi (4 klip) | Pazartesi günü 4 kedi hâli 😹 #kedi #komikhayvanlar #shorts | yüklenmedi (YouTube bağlı değil; run 41435586453) | – | – | – | – | GitHub Instagram Publish, plan saatlerinde |
| 2026-11-03 | animals-2026-11-03-sali-sabahi-yogurma | A | kedi (yoğuran, 1 klip) | Salı sabahı her kedi 😹 #kedi #komikhayvanlar #shorts | yüklenmedi (YouTube bağlı değil) | – | – | – | – | GitHub Instagram Publish, plan saatlerinde |

## Kullanılmış başlıklar
- Kedin sana yavaşça göz kırpıyor mu? 😺 #kedi #kediler (2026-10-22)
- Cuma akşamı kardeşimle ben 😹 #kedi #komikhayvanlar (2026-10-23)
- Köpeğin burnu süper güç mü? 🐶 #köpek #hayvanlar #shorts (2026-10-24)
- Pazar akşamı her kedi 😹 #kedi #komikhayvanlar #shorts (2026-10-25)
- Kedi mırlıyorsa mutlu mu? 🐱 #kedi #kediler #shorts (2026-10-29)
- Cuma enerjisi: 4 kedi 😹 #kedi #komikhayvanlar #shorts (2026-10-30)
- Hangi kedi sensin? 😹 #kedi #komikhayvanlar #shorts (2026-10-31)
- Pazartesi geliyor: 4 kedi 😹 #kedi #komikhayvanlar #shorts (2026-11-01)
- Pazartesi günü 4 kedi hâli 😹 #kedi #komikhayvanlar #shorts (2026-11-02)
- Salı sabahı her kedi 😹 #kedi #komikhayvanlar #shorts (2026-11-03)
- sizin kediniz de böyle mi😹😹 (eski)
- kutsal bir ayin gerçekleşiyor😹😹😹 (eski)
- şımarık minnoşlar (eski)

## Kullanılmış klipler (tekrar yayınlama)
- commons-124368477 (Ljubljana tekir, merdiven), commons-160191544 (Andra and Billy) — 2026-10-22
- commons-20301970 (Whisky-Iswed, çimde boğuşan iki yavru) — 2026-10-23
- commons-84557962 (SPEURHOND polis köpeği, 1930'lar film) — 2026-10-24
- commons-20128760 (George Miquilena, siyah yavru kedi, CC0) — 2026-10-25
- commons-109487074 (kedi yavruyu yalıyor, PD) — 2026-10-29
- commons-59471454 (zıplayan kedi), commons-149606635 (jumpscare yavru), commons-139288652 (munchkin, kırmızı nokta), commons-59471337 (akvaryum kedisi) — 2026-10-30
- Reddedilen: commons-121875682 (Rus filmi), commons-29606065 (röportaj), commons-74026787 (karanlık), commons-191852272 (insan yüzleri); kalan kullanılmamış: commons-80168679 (Burmese yavru tımar), commons-165956046 (puma yavrusu), commons-110215517 (turuncu yavrular), commons-11136217 (su içen kedi); commons-79784181 (Maršov kedi, yolda küçük kedi); commons-102567961 ("Pet Plus" marka yazısı), commons-18787246 (videoda yazı)
- commons-42812508 (çantadaki kedi), commons-44912755 (kuşa bağıran beyaz kedi), commons-35498016 (kum kabı kedisi) — 2026-10-31; kalan: commons-79013639 (güvercin kovalayan kedi, CC0), commons-44907045 (Tayvan, 90 sn), 20074545, 122683669, 123259847, 121736105
- commons-92838543 (Salto kedi zıplaması), commons-97411267 (Larry & Chloé boğuşma), commons-99462733 (Moomin, çubuk), commons-80168679 (Burmese yavru tımar) — 2026-11-01; kalan: commons-126415176 (kedi yavruları, raylar, küçük), commons-44907045, 20074545, 122683669, 123259847, 121736105
- commons-182639090 (siyah kedi yürüyor, CC0), commons-22623990 (esneyen yavru, PD), commons-49560175 (Abyssinian kanepe, CC BY 2.0), commons-161641517 (mama başındaki kediler, CC BY 4.0) — 2026-11-02; - commons-92930789 (Amelia yoğuran kedi, CC BY 2.0) — 2026-11-03; kalan: commons-194393089 (köy yolu kedileri), commons-161337526 (Owiii/Iis tımar, uzak); reddedilen: commons-143831620 (insan yüzü)
- (eski kalan) commons-79013639 (güvercin, uzak), commons-126415176, commons-44907045, 20074545, 122683669, 123259847, 121736105
