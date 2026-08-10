# 10 videoluk kanal testi

**8 Ağustos 2026.** Amaç para kazanmak değil, **ölçüm**: bu oyunun videosu
izleniyor mu? Cevap "evet"se CrazyGames/Poki yolu trafikle desteklenebilir
(Poki'nin kuralı: trafiği sen getirirsen gelir %100 senin). Cevap "hayır"sa
video hattına daha fazla saat gömmeyiz.

Bu bir kanal *kurma* planı değil, **10 atışlık bir deney**. Bitişte karar
verilir.

## Neden bu iş şimdi yapılabilir

Üretim hattı zaten kurulu, yeni kod gerekmiyor:

- 🎬 Kayıt modu: dikey 1080×1920, topu takip eden kamera, en fazla 45 sn
- `./mp4-yap.sh dosya.webm` → Shorts'a hazır mp4 (60 fps)
- `sarki-yap.js` verilen ezgiyi çalan makineyi tasarlar ve **doğrular**
- Enstrüman seçimi (davul/gitar/marimba), alan renkleri, 🧊 3B görünüm
- Paylaşma linki: her videonun altına "makineyi kendin aç" linki konabilir

Yani bir videonun maliyeti: makineyi kur (ya da üreteciden al) → kaydet →
mp4'e çevir → başlık + açıklama. Seslendirme yok, yüz yok, montaj yok.

## Biçim

- **Dikey Shorts**, 20–40 saniye. Kayıt modunun üst sınırı 45 sn.
- **Seslendirme yok.** Ses zaten makinenin kendisi: çarpma = nota,
  yuvarlanma = sürtünme. Anlatım eklemek bu işin tek ayırt edici yanını
  öldürür.
- **Kanal dili İngilizce** (metin zaten yok denecek kadar az; başlık ve
  açıklama İngilizce).
- Her açıklamanın altında oynanabilir link — video izleyicisini oyuncuya
  çevirmenin tek yolu bu, ve arka uç istemiyor.

## Telif — pazarlık konusu değil

Videolarda **yalnızca kamu malı / geleneksel ezgiler**. Content ID melodiyi de
eşleştirir; tanınmış modern bir şarkıyı makineyle çalmak "cover" sayılır ve
gelir başkasına gider. Listedekilerin hepsi kamu malı.

## 10 video

Sıra bilinçli: ilk üçü **tanıdık ezgi** (kanca hazır — insan tanıdığı melodiyi
duyunca kalır), ortadakiler **mekanik gösteri**, son ikisi **etkileşim**.

| # | Video | Ne gösteriyor | Malzeme |
|---|---|---|---|
| 1 | Marble machine plays Twinkle Twinkle | tanıdık ezgi, 14 nota | `sarki-linkleri.md` → hazır |
| 2 | Marble machine plays Jingle Bells | zaten oyunda 7. bölüm | `id: jingle` |
| 3 | Guess the song in 20 seconds | tanıdık ezgi + yorum yemi | üreteciden herhangi biri |
| 4 | Same machine, three instruments | davul → gitar → marimba, aynı görüntü | tek makine, 3 kayıt |
| 5 | 40 dominoes, one ball | kalabalık zincir, ses tavanı yeni düzeldi | elle kurulur |
| 6 | The longest ramp I could build | tek uzun sürtünme sesi ("şşşş") | elle kurulur |
| 7 | Every piece in the game, one run | parça vitrini | elle kurulur |
| 8 | It failed 6 times before this | başarısız denemeler + son çalışan hâli | kayıtları biriktir |
| 9 | Your turn: build one yourself | ekranda link, oyuna çağrı | herhangi bir makine |
| 10 | I built the machine you commented | yorumdan gelen istek | yorumlara bağlı |

**8 numara özellikle önemli:** başarısızlıkları göstermek, bu formatın
"yapay zekâ ürünü içerik" gibi görünmesini engelleyen tek şey. Aynı ders
Solo Stack analizinden de çıktı (`ai-nasil/icerik/yapi-analizi.md`).

## Takvim

Haftada 3 video, sabit gün. **Aynı gün toplu yükleme yok** — spam bot
etiketi getiriyor (bu kural Solo Stack araştırmasından geliyor, tahmin değil).
10 video ≈ 3,5 hafta.

## Başlık kuralı

Faaliyeti değil **sonucu** vaat et, ve ilk 3 kelimede ne olduğu anlaşılsın:

- İyi: `This machine plays Twinkle Twinkle` / `40 dominoes, one ball`
- Kötü: `I made a marble run in my own game engine` (kimin umurunda)

## Ölçüt — deneyin bitişinde bakılacak tek şey

10 video yayınlandıktan **iki hafta sonra**:

- Ortanca izlenme **1.000'in altındaysa**: video hattı kapatılır, oyun
  doğrudan CrazyGames'e verilir, trafik onlardan gelir.
- **1.000–10.000 arasındaysa**: format tutuyor ama kanca zayıf; en çok
  izlenen 2 videonun türü seçilip 10 video daha.
- **10.000 üstündeyse**: hat çalışıyor, Poki'ye kendi trafiğinle gitme
  senaryosu masaya gelir.

Abone sayısı ölçüt değil. Ölçüt izlenme ve linke tıklama.

## Kimde ne var

- **Chios:** makineler, şarkı üretimi, başlık/açıklama metinleri, bu plan.
- **Kullanıcı:** kayıt (sekme önde olmalı — arka planda kayıt iptal oluyor),
  mp4'e çevirme, YouTube'a yükleme. Video başına ~10 dakika.

**Henüz yapılmadı:** kanal açılmadı, ad seçilmedi. İlk 3 videonun makinesi
hazır olduğunda karar verilecek.
