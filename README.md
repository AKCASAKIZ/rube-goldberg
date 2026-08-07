# Rube Goldberg Atölyesi

Tarayıcıda çalışan, bağımlılıksız tek dosyalık Rube Goldberg / bilye yolu
kurma oyunu. Hazır fizik motoru yok — her şey `index.html` içinde.

## Oyna

**https://akcasakiz.github.io/rube-goldberg/** — kurulum yok, tarayıcıda açılır.
`main` dalına her itişte kendiliğinden güncellenir.

Paylaşma linkleri de bu adres üzerinden çalışır: makinenin tamamı URL'nin
`#m=...` kısmında taşınıyor, sunucuya hiçbir şey yazılmıyor.

## Çalıştırma (yerelde)

Çift tıkla yeter (`file://` ile de çalışır). Yerel sunucu istersen:

    cd ~/projects/rube-goldberg && python3 -m http.server 8777
    # http://127.0.0.1:8777/index.html

## Taşı modu — seçim, taşıma, yerleştirme yardımı

| Hareket | Ne yapar |
|---|---|
| Boş alanda sürükle | Seçim dikdörtgeni |
| Seçili yığından birini sürükle | Hepsi birlikte taşınır |
| Ctrl + tıkla | Seçime ekler / çıkarır |
| Ok tuşları | 1 px kaydırır (Shift ile 10 px) |
| Q / E | Seçimi kendi ortası etrafında döndürür (Shift ile 15°) |
| Delete | Seçilenleri siler |
| Shift + sürükle · orta tuş | Görüşü kaydırır |

**Yapışma.** Sürüklenen uç, başka bir parçanın ucuna ya da merkezine 14 px'den
yakınsa tam üstüne oturur; zincir gerçekten birleşir. Aynı x ya da y'ye
yakınsa o eksene hizalanır ve yeşil kılavuz çizgisi çıkar. Nereye yapıştığı
her zaman ekranda görünür.

**Açı yapışması Shift'e bağlı, kendiliğinden değil.** Önce toleranslı ve
otomatikti; ölçüldü: 360 px'lik bir rampada 4 derecelik yuvarlama ucu 25 px
öteye atıyor, yani yardım etmek yerine parçayı elinden alıyordu. Şimdi Shift
basılıyken açı 15 derecenin katına oturuyor — merdiven basamakları birebir
tutuyor. **Alt** bütün yapışmayı kapatır.

## Notalar

Bilye bir parçaya çarptığında o parçanın notası çalıyor; makine kendi
melodisini çalan bir enstrümana dönüşüyor. Nota, parçaya **sağ tıklayarak**
değiştirilir ve parçayla birlikte kaydedilir.

Dizi **C majör diyatonik** — do re mi fa sol la si — dört oktav, **C3'ten
C7'ye 29 nota**. Nota menüsünün her satırı bir oktav; en alttaki tek düğme
(C7) gamı kapatan ince do.

Ara oktavlarda kapanış zaten vardı (B3'ten sonra C4 gelir), ama üst uç
B6'da kesiliyordu — "do re mi fa sol la si" deyip son "do"yu söylememek
gibi. C7 onu tamamlıyor.

> Başta pentatonikti (F ve B yoktu): topun parçalara hangi sırayla
> çarpacağını denetleyemediğin için, hangi iki nota yan yana düşerse düşsün
> uyumlu olsun isteniyordu. 7 Ağustos 2026'da tam diziye geçildi — karşılığı
> şu: tam dizi olmadan tanıdık ezgilerin çoğu **kurulamıyordu**,
> `sarki-yap.js` F ya da B görünce "dizide olmayan nota" deyip çıkıyordu.

## Parçalar

| Parça | Ne yapar |
|---|---|
| Rampa | Sürükleyerek çizilir; kısa tıklama düz rampa koyar |
| Domino | Devrilir, komşusunu devirir, ucu zile değerse zili çalar |
| Tahterevalli | Ortadan mafsallı kaldıraç, topun ağırlığıyla eğilir |
| Fırlatıcı | Üstüne **düşen** topu yukarı atar (yavaş topu atmaz) |
| Trambolin | Geldiği yönün tersine sektirir; yandan da çalışır |
| Konveyör ▶ / ◀ | Üstündeki topu yatay taşır |
| Üfleyici | Üstündeki dar sütunda topu yukarı üfler (~300 px menzil) |
| Mıknatıs | 170 px menzilde topu kendine çeker |
| Döner Tabla ↻ / ↺ | Kendi merkezinde döner; üstündeki topu döndüğü yöne taşır, ucunda savurur |

**⧉ Çoğalt** bir parçayı açısı, boyu ve notasıyla kopyalar: ya palet
aracını seçip parçaya tıkla (kopya imlece yapışır, bırakınca yerleşir) ya da
parçaya **sağ tıklayıp** nota menüsünün altındaki düğmeyi kullan. Bölümde
stok bittiyse çoğaltmaz. Kopyalama parça türünü bilmez — `noktalari()` ile
hangi alanların nokta olduğunu bulup hepsini kaydırır, yani yeni parça türü
ayrıca kod istemez.

**✋ Taşı** aracı yerleştirilmiş parçaları düzenler: gövdesinden sürüklersen
parça bütün hâlde kayar, üstüne tıklarsan **seçilir** ve tutamakları (beyaz
node'lar) çıkar. Tutamağı sürüklemek aynı anda **döndürür ve uzatır**:

| Parça | Tutamak |
|---|---|
| Rampa | İki uç ayrı ayrı serbest |
| Fırlatıcı / Trambolin / Konveyör / Üfleyici | Eksenin iki ucu — döndürür + boyunu değiştirir |
| Döner Tabla | Eksenin iki ucu — başlangıç açısını ve yarıçapı verir |
| Domino | Tabanı sabit, uçtaki tek tutamak eğimi ve boyu ayarlar |
| Tahterevalli | İki uç, sadece boy (açı fiziğin kendi değişkeni) |
| Mıknatıs | Turuncu tutamak menzili büyütür/küçültür |

Döndürme fiziğe de işliyor: fırlatıcı kendi yüzünün normali boyunca atar,
konveyör kendi ekseninde taşır (eğik bant topu yokuş yukarı sürükler),
üfleyici baktığı yöne üfler, döner tabla verilen açıdan dönmeye başlar.
Parçalar tahta dışına taşamaz, ölçüler
`sekil.enAz`/`enCok` arasında sınırlanır, notalar korunur.

**Döner tabla** ince bir çubuk olduğu için hızı ve tutuşu keyfî seçilemiyor:
yanlış değerde düşen top çubuğun arasından sızıp hiç değmiyor. `TABLA_HIZ`
(5.5 rad/s) ve `TABLA_TUTUS` (30), topun farklı kaçıklıklarla düştüğü
durumlar taranarak seçildi — her açıda yakalayıp savuran tek aday buydu.
Değiştirirken aynı taramayı tekrarla.

## Yıldızlar

Zorluk bölümü geçilmez yaparak değil **yıldızla** konuyor: bitirmek bir
yıldız, bölümün `yildiz.parca` hedefinin altında kalmak ikincisi,
`yildiz.sure` içinde bitirmek (melodi bölümlerinde `temiz: true` → fazla
çarpma olmaması) üçüncüsü. Yeni oyuncu bölümü geçebiliyor, iyi oyuncu
peşine düşecek bir şey buluyor.

Kazanma ekranı eksik yıldızın *ne için* olduğunu yazıyor, bölüm düğmesinde
en iyi derece görünüyor. En iyi sonuç `rube-yildiz-<id>` altında saklanıyor;
`yildiz` alanı olmayan bölümde (Serbest) yıldız hesaplanmaz.

Zil ve melodi bölümlerinin ortak kazanma yolu `kazan()`. Yeni bir kazanma
koşulu eklerken oraya bağla, yoksa yıldız/kayıt/perde işlerini tekrar
yazmak gerekir.

Hedef değerler oyun oynanarak değil kabaca seçildi — bölümleri kendin
çözünce fazla kolay/zor gelenleri `BOLUMLER[i].yildiz` içinden ayarla.

## Melodi bölümleri

Bazı bölümlerin hedefi zil değil **melodi**: makinenin parçaları hedef
notaları doğru sırayla çalmalı (`BOLUMLER[i].melodi`). Hedef, tahtanın
üstünde şerit olarak çiziliyor — arayüze değil **tuvale**, böylece kayıt
videosunda da görünüyor ve izleyen makinenin neyi çalmaya çalıştığını
anlıyor. Çalınanlar dolu, sırası gelen mavi çerçeveli.

Kurallar:

- Melodiyi yalnızca **oyuncunun koyduğu** parçalar besler; zemine/duvara
  çarpma notaya sayılmaz. `fizikAdimi` bu yüzden sabitleri ve parçaları
  ayrı geziyor.
- Beklenen nota gelince imleç ilerler. **Başka bir nota oyunu bozmaz**, ama
  "fazla" sayılır ve madalyayı düşürür (0 fazla = altın, ≤2 = gümüş, üstü
  bronz). Sıfırlamak yerine fazla saymak bilinçli tercih: tek bir sekme
  bütün kuruluşu çöpe atarsa oyun öğretici değil cezalandırıcı oluyor.
- Melodi bölümlerinde zil sadece süsleme, kazandırmaz.

Çarpma olayı sesten bağımsız üretiliyor (`carpmaOlayi` true dönerse vuruş
olmuştur): ses kapalıyken de melodi çalışır.

## Yakınlaştırma

Tekerlek imlecin altındaki noktayı sabit tutarak yakınlaştırır (0,5×–4×);
sol şeritteki ➖ / 🔍 / ➕ düğmeleri de aynı işi yapar, 🔍 %100'e döner.
Yakınken **✋ Taşı** aracıyla boş tahtayı sürüklemek görüşü kaydırır.

Yakınlaştırma yalnızca ekrana basarken uygulanan bir dönüşüm (`GORUS`):
`ciz()` her zaman dünya koordinatlarında çizer, dönüşümü `ekranaCiz()`
uygular. **Kayıt modu bu dönüşümü görmez** — video her zaman tüm tahtayı
çerçeveler, oyuncunun o an ne kadar yakınlaştırdığından bağımsız. Fare
koordinatı `fareNok()` içinde ekrandan dünyaya çevriliyor; yakalama
yarıçapları da ölçeğe bölünüyor ki uzaklaşınca tutamağı tutmak zorlaşmasın.

## Menü şeritleri

Menüler normalde 56 px'lik ince şeritler (yalnızca ikonlar); fare üzerine
gelince açılıp tahtanın **üstüne biniyorlar**. Üstüne binmek önemli: panel
genişlerken tuval yeniden ölçeklenmiyor, oyun zıplamıyor.

Açılırken düğmelerin dikeyde kayması yasak — imleç bir düğmeye yaklaşırken
düğme altından kayarsa yanlış düğmeye basılır. Bunun için: düğme yüksekliği
sabit (32 px), panel başlıkları `visibility` ile gizleniyor (`display:none`
ile değil), renk daireleri iki durumda da 2 sütun, sayaç ve dil seçici ise
en sonda durduğu için tamamen kaldırılabiliyor. Yeni bir panel eklerken bu
kuralı bozma: **kapalı ve açık durumda düğme merkezleri aynı y'de kalmalı.**

İkinci kural, birincisinden daha pahalıya patladı: **hiçbir şey sessizce
kırpılmamalı.** Bir ara şeride `max-height` + `overflow-y:auto` konmuş, üstüne
kaydırma çubuğu da gizlenmişti; sığmayan Taşı/Çoğalt/Sil düğmeleri hem
kesiliyor hem de kesildiğine dair *hiçbir iz* bırakmıyordu — düğmeler
silinmiş gibi görünüyordu. Artık şerit kırpılmıyor: ne kadar uzunsa o kadar
uzun, sığmazsa sayfa kayar. Aynı tuzağın yatay hâli de var — renk ızgarası
(2×24 + boşluk = 54 px) şeride sığmadığı için kesiliyordu; `--serit` bu
yüzden 72 px. Daraltırsan renkler sessizce kesilir.

Sığdırma işi **küçültmeyle** yapılıyor, gizlemeyle değil: `max-height`
medya sorguları düğme yüksekliğini, aralıkları ve dolguları pencere
yüksekliğine göre kademeli indiriyor (860 / 770 / 690 px). Ölçüler iki
durumda da (kapalı/açık) aynı, yani açılırken düğme kayması yine 0.
Ölçüldü: görünür yükseklik ~690 px ve üstünde hiçbir bölümde taşma yok.

Düğmeler "balon": yuvarlak, üstten ışık alan, alt kenarında koyu gövde
gölgesi olan. Basma hissi renkten değil **geometriden** geliyor — düğme
aşağı iniyor ve gövde gölgesi kısalıyor. Gövde gölgesi 4 px aşağı taştığı
için şeritteki aralık ona göre ayarlı.

7 bölüm var: Isınma / Domino / Zıplat / **İlk melodi** / **Beş nota** /
**Jingle Bells** / Serbest. Bölüm çevirileri `SOZLUK[dil].bolum` içinde
**konuma bağlı bir dizi** — araya bölüm eklerken dört yeri birden (BOLUMLER +
en/de/fr) aynı sıraya getir, yoksa bölüm adları kayar. Bölümlerde parça stoğu sınırlı, Serbest'te sınırsız. Kurulan düzen bölüm bazında `localStorage`'a
kaydediliyor. Boşluk: çalıştır/durdur · R: sıfırla · sağ tık: nota seç ·
✋ ile taşı, 🗑 ile sil · 🔗 ile kurduğunu link olarak paylaş.

## Ses: vuruş, yuvarlanma, enstrüman

Ses fizikten doğuyor; iki ayrı olay var:

- **Vuruş** — top bir parçaya *çarptığında*. Perde parçanın notası, sertlik
  çarpma hızından (`c.vn`) gelir.
- **Yuvarlanma** — top yüzeye değip *kayarken*. Ayrı bir nota değil: tek,
  sürekli bir sürtünme sesi (döngülü gürültü + bant geçiren), yüksekliği ve
  tizliği topun **teğetsel** hızını izliyor.

Böylece domino zinciri "tak tak tak" ederken uzun rampa "şşşş" diye
duyuluyor. Her temas ikisini birden besleyebilir: `carpmaSesi` hızın normal
bileşenini vuruşa, teğetsel bileşenini yuvarlanmaya yollar.

Yuvarlanma için her temasta yeni ses başlatılmıyor — tek bir sürekli ses
var, kazancı her karede `yuvarlanmaGuncelle()` ile besleniyor. Değer sıfıra
çekilmiyor, **söndürülüyor** (`*= 0.55`): top yüzeyde hafifçe zıplarken temas
bir iki kare kopuyor ve sert sıfırlama sesi kesik kesik yapıyordu.

### Enstrüman

Sağ şeritten seçiliyor, `localStorage`'a yazılıyor:

| Enstrüman | Vuruş nasıl üretiliyor |
|---|---|
| 🥁 Davul | Sinüsün perdesi ilk anda hızla düşüyor + gürültü transiyenti — kick/tom/hi-hat/zil |
| 🎸 Gitar | Karplus-Strong: gürültü patlaması gecikme hattında dolaşırken tizini kaybeder |
| 🎹 Marimba | Temel + 4. harmonik (önce sönüyor) + çok kısa tokmak vuruşu |

Her enstrüman aynı **karakter adlarını** tanır (`celik`, `naylon`, `bas`,
`susturma`, `armonik`), o yüzden parça→tını eşlemesi (`TINI`) enstrüman
değişince de geçerli kalıyor: mıknatıs davulda kick, gitarda kalın tel,
marimbada uzun çubuk olur. Yeni enstrüman eklemek = `CALGILAR`'a bir satır +
bir `uret(f, kar, sr)` fonksiyonu; normalleştirme, kırpma önleme ve
önbellekleme ortak (`vurusSesi`).

Ses WebAudio ile üretiliyor, örnek dosyası yok. 🔊 düğmesi sesi kapatır.
Kayıt modunda hem vuruşlar hem yuvarlanma videoya gömülüyor
(`MediaStreamDestination` kanalı akışa ekleniyor).

### Gitar sentezinde iki tuzak

Parametre oynarken tekrar düşülmesin:

- **Gürültü patlamasının ortalaması sıfırlanmalı.** Döngüdeki alçak geçiren
  süzgeç DC'yi aynen geçirdiği için kalan sapma sesi yavaş sönen bir uğultuya
  bindiriyor, perde bulanıklaşıyordu. Ayrıca çıkışta DC engelleyici var.
- **Sönüm süzgeci frekanstan bağımsız olamaz.** Sabit bir süzgeç tiz notayı
  anında öldürüyordu (gürültü saniyede *f* kez dolaşıyor); mıknatıs ve
  üfleyici üst oktavda tamamen sessizdi. Tel kayıp katsayısı değil **süre**
  tanımlıyor, süzgeç her nota için ikili aramayla çözülüyor.

Perde, süzgecin faz gecikmesi hesaba katılarak akort ediliyor
(`suzgecGecikme`); sapma tüm dizide 0-2 sent.

> Akort ölçerken otokorelasyonun **tam sayı gecikme** çözünürlüğüne dikkat:
> üst oktavda tek örneklik adım ~45 sente denk geliyor, tepeye parabol
> oturtmadan bakılırsa olmayan bir akort hatası görünüyor.

### Notalar

Her parçanın bir notası var; yerleştirilen parçalara sırayla pentatonik
dizideki notalar atanıyor (`NOTALAR`, C4→D6). Parçaya **sağ tıkla** nota
menüsü açılır; seçilen nota parçayla birlikte `localStorage`'a yazılır ve
duruyorken parçanın üstünde etiket olarak görünür. Zil çalınca aşağıdan
yukarı sıyrılan bir akor duyulur.

## Alan rengi

Tahtanın bütün rengi tek yerden geliyor: `ZEMINLER`. Temalar 6 Ağustos'ta
belirgin şekilde **açıldı** (gece teması artık siyaha yakın değil, arduvaz
mavisi) — ızgara ve ufuk çizgileri de görünür oldu. Sağ paneldeki renk
daireleri temayı değiştirir (Gece / Okyanus / Orman / Gün batımı / Kâğıt),
seçim `localStorage`'a yazılır. Bir tema; taban rengini, düz görünümün kılavuz
çizgilerini, 3B degradeyi, perspektif ızgarasını, bilyeyi ve nota rozetinin
zeminini verir — yeni tema eklemek `ZEMINLER`'e bir satır. Parça kodları renk
sabiti taşımaz, zemini `Z()` üzerinden okur; kayıt tuvali de aynı temayı
kullanır, yani video seçilen renkte çıkar.

Kâğıt teması açık zeminli: bilye rengi de temadan geldiği için beyaz top
kaybolmuyor, koyuya dönüyor.

Şeritler 1120 px altında kapanıyor: paneller tahtanın altına inip yatay bara
dönüyor, parça paleti tahtanın altında kalsın diye `.sol { order: 2 }`.

## 3B görünüm

🧊 3D düğmesi ayrı bir motor açmıyor — aynı 2B sahne derinlikli çiziliyor:
perspektif ızgara + degrade zemin, parçalar kaydırılmış koyu kopyalarla
"kalınlık" kazanıyor, bilyeye küresel degrade ve yere düşen gölge ekleniyor.
Yeni parça eklerken 3B için ekstra kod yazmak gerekmiyor; ayarlar
`UC_KAT`/`UC_DX`/`UC_DY`.

**Nasıl çiziliyor (ve neden böyle):** ilk sürüm her katman için bütün
parçaları yeniden çiziyor ve üstüne `ctx.filter` kuruyordu — 24 parçalı bir
sahnede kare **3,86 ms** sürüyordu (2B'nin 11 katı) ve oyun gözle görülür
ağırlaşıyordu. Şimdi:

1. Parçalar **bir kez** yardımcı bir tuvale çiziliyor (hedefle birebir aynı
   dönüşümle — yakınlaştırma ve kayıt kamerası dahil).
2. Koyulaştırma tek geçişte, `source-atop` ile örtü basarak. `ctx.filter`
   tamamen kalktı: her çizim işleminde ayrı bir süzgeç geçişi başlatıyordu,
   asıl yük oydu.
3. Katmanlar tuval **kendi üzerine** kopyalanarak birikiyor; her kopyada
   katman sayısı ikiye katlanıyor, yani 8 katman 3 kopyada çıkıyor. Tam
   ekran kopyası dolgu-hızı maliyeti — sayısı önemli. `UC_KAT` bu yüzden
   **ikinin kuvveti olmalı.**

Sonuç: kare **0,11 ms** — yaklaşık 35 kat. Ölçüm `ekranaCiz()`'i döngüde
çağırıp ortalama alıyor; ısınma turu şart, ilk blok JIT maliyetini yiyor ve
2B'yi 3B'den yavaş gösterebiliyor.

## Örnekler paneli

Sağ şeritte, enstrümanın altında **Örnekler** bölümü: hazır makineler tek
tıklamayla açılıyor. Şu an bir tane var — 🔔 Jingle Bells.

Her örnek bir **paylaşma kodu** (`ORNEKLER` dizisi) — yani ayrı bir biçim
yok, oyuncuların birbirine yolladığı kodun aynısı. Yeni örnek eklemek:
makineyi kur, **🔗 Link paylaş** de, linkteki `#m=` sonrasını `ORNEKLER`'e
yapıştır. `sarki-yap.js` de tam bu kodu basıyor.

Örnek **misafir modunda** açılıyor: oyuncunun o bölümdeki kendi makinesi
bozulmuyor, isterse "Kendime kaydet" diyor.

Bu, planlanan galerinin arka uç istemeyen hâli: başkalarının makinelerini
listelemek sunucu ister, seçilmiş bir vitrin istemez.

## Şarkı makineleri (`sarki-yap.js`)

    node sarki-yap.js "E4 E4 E4 E4 E4 E4 E4 G4 C4 D4 E4" --uzun 2,5 --bolum jingle

Verilen nota dizisini **çalan** bir makine tasarlar, motorda koşturarak
doğrular ve paylaşma linkini basar. Makine ancak diziyi tamamen, doğru
sırayla ve **fazladan vuruş olmadan** çalarsa kabul ediliyor — gözle
tasarlayıp "herhalde çalar" demek yerine ölçüm.

`--uzun a,b` o indislerdeki notalardan *sonra* uzun boşluk bırakır (Jingle
Bells'te 3. ve 6. nota uzun → `--uzun 2,5`).

**Tasarım:** aşağı inen bir rampa merdiveni. Top her basamağa bir kez düşer
(vuruş = nota), üzerinde kayar, ucundan düşüp bir sonrakine geçer. İki tuzak
pahalıya patladı, ikisi de çözülü:

1. **Top tam uca düşerse orada kalır.** Uç noktada normal dik yukarı bakıyor,
   teğetsel kuvvet sıfır — top mızrak ucunda dengede duruyor ve makine hiç
   başlamıyor. İlk iki tasarım tam bu yüzden durdu. Çözüm: her basamak bir
   öncekinin bittiği noktanın gerisinden başlıyor (`tasma`).
2. **Top indikçe hızlanır.** Sabit boyda basamaklarla ritim hızlanarak
   bitiyordu (ölçüldü: 1,35 sn → 0,36 sn). Çözüm: basamaklar aşağı indikçe
   **uzuyor** (`artis`), geçiş süresi sabit kalıyor.

Ritim puanı üç şeyi birden ölçüyor: kısa aralıkların düzlüğü, **en kötü**
sapma (tek bir 0,11 sn'lik boşluk ezgiyi tökezletiyor, ortalama bunu
gizliyordu), uzun/kısa oranı (~2) ve tempo (kısa aralık 0,30–0,50 sn).

**Notalar pentatonik** (`NOTALAR`, C D E G A). Dizide olmayan nota istenirse
araç kullanılabilir notaları listeleyip duruyor — yani her ezgi kurulamaz.

> **Telif:** Jingle Bells (1857) kamu malı. Tanınmış modern şarkılar
> **değil** — melodiyi bir oyunda çalmak da düzenleme sayılır ve YouTube'da
> Content ID eşleştirir. Video hattı için kamu malı/geleneksel ezgilerde kal.

## Dokunmatik

Masaüstü şemasının üç dayanağı telefonda **yok**: sağ tık, hover, tekerlek.
Karşılıkları:

| Masaüstü | Dokunmatik |
|---|---|
| Sağ tık → nota menüsü | **Uzun basma** (500 ms) |
| Tekerlek → yakınlaştırma | **Çimdik** (iki parmak) |
| Hover → menü şeridi açılır | `@media (hover:none)` → şerit **açık durur** |

Girdi zaten `pointer` olaylarında olduğu için sürükleme dokunmatikte
çalışıyordu; eksik olan bu üçüydü.

**Parmakta işlem `pointerdown`'da başlamıyor.** Basmanın tap mı, sürükleme mi,
uzun basma mı olduğu o anda belli değil: bekletilip anlaşılınca `eylemBasla()`
çağrılıyor. Farede böyle bir belirsizlik yok, o yol aynen duruyor — iki yol da
aynı `eylemBasla`/`hareket`/`birak` üçlüsünü kullanıyor, yani araç davranışı
tek yerde.

Sürükleme başlarken işlem **başlangıç noktasından** başlatılıyor, parmağın o
anki yerinden değil; yoksa çizilen rampa eşiği aşan mesafe kadar kısalıyor.

**İkinci parmak başlamış her şeyi geri alıyor** (`surukle`, `tasima`,
`kaydirma`, bekleyen dokunuş). Yoksa çimdik yaparken tahtaya parça bırakılıyor
ya da duran parça kayıyor.

### Yakalama toleransı

Tolerans dünya biriminde tutuluyor ama oyuncu **ekrandaki** mesafeyi yaşıyor.
Dünyayı ekranda küçülten iki şey var: yakınlaştırma (`GORUS.olcek`) ve tuvalin
CSS ile küçültülmesi. İkincisi telefonda acımasız — 1000 px'lik tahta 354 px'e
sığıyor, yani 20 birimlik tolerans **7 ekran pikseli** oluyor, parmakla
tutulmaz. `yakalamaPayi` artık ikisini de hesaba katıyor (`min(1, …)` ile:
tolerans yalnızca büyür, hiç küçülmez) ve kaba imleçte 2,2 ile çarpıyor.

Ölçüldü (390 px genişlikte, gerçek tarayıcı): ekran ölçeği 0,354 · tolerans
56,6 dünya birimi = **20 ekran pikseli**; dokunmatik cihazda 2,2 çarpanıyla
~44 px.

## Paylaşma linki

**🔗 Link paylaş** kurulu makineyi bir URL'e çevirip panoya kopyalar. Sunucu
yok: makine URL'nin **hash'ine** gömülüyor.

Hash bilerek seçildi — sunucuya hiç gönderilmez, yani arka uç olmadan çalışır,
`file://` ile de çalışır ve sunucuların URL uzunluğu sınırlarına takılmaz.
Yük `{sürüm, bölüm id, parçalar}` JSON'u; `deflate-raw` ile sıkıştırılıp
base64url'e çevriliyor. Tipik 3 parçalık makine **~190 karakterlik** link
oluyor. `CompressionStream` olmayan tarayıcıda sıkıştırma atlanıyor, link
uzuyor ama çalışıyor — bayrak kodun ilk karakterinde (`1` sıkıştırılmış,
`0` düz).

Link **iki yoldan** açılıyor: sayfa yüklenirken (`baglantidanAc`) ve sayfa
zaten açıkken hash değişince (`hashchange`). İkincisi şart — açık bir sayfanın
adres çubuğuna link yapıştırmak sayfayı **yeniden yüklemez**, yalnızca hash'i
değiştirir. Dinlemezsek link sessizce hiçbir şey yapmıyordu; ölçüldü, tam
böyle oluyordu.

### Misafir modu — oyuncunun kaydı kutsal

Linkle açılan makine **misafir modunda** gösteriliyor: `kaydet()` susuyor,
yani oyuncunun o bölümde kendi kurduğu makinenin üstüne yazılmıyor. Tahtanın
üstünde kendini gizlemeyen bir şerit çıkıyor ve iki yol sunuyor: **Kendime
kaydet** (bilerek üstüne yaz) ya da **Kendi makineme dön**. Bölüm
değiştirmek de misafirlikten çıkarıyor.

Kural: **link açmak yıkıcı bir işlem olamaz.** "Makinem gitti" bu özellikte
yapılabilecek en pahalı hata.

### Gelen veri yabancı veri

`makineSuz()` linkten geleni doğrudan motora vermiyor. Her parça
`PARCALAR[tur].olustur()` ile **sıfırdan** kuruluyor, sonra yalnızca
doğrulanmış alanlar (`p`/`a`/`b`, `yon`, `uzun`, `nota`) üzerine yazılıyor —
böylece nesnenin şekli motorun beklediği şekil oluyor, linkte ne yazarsa
yazsın. Koordinatlar tahtaya kısılıyor, `uzun` parçanın `enAz`/`enCok`
sınırına çekiliyor, nota `NOTALAR` dışındaysa alınmıyor, bilinmeyen parça
türü ve bilinmeyen bölüm id'si reddediliyor, parça sayısı `PAYLAS_AZAMI`
(300) ile tavanlanıyor.

Neden bu kadar sıkı: tek bir `NaN` koordinat fiziği sessizce kilitler ve hata
linkte değil **oyunda** arıyormuş gibi görünür.

`PAYLAS_SURUM` yükü versiyonluyor. Biçimi değiştirirsen artır — eski linkler
sessizce yanlış çözülmek yerine "bozuk link" mesajı alır.

Ekrandaki link kutusu makine her değiştiğinde gizleniyor (`baglantiGizle`,
`kaydet`'ten çağrılıyor): link URL'e gömülü olduğu için değişiklikle birlikte
güncellenmiyor, ekranda kalırsa oyuncu artık var olmayan bir düzenin linkini
paylaşır.

**Galeri henüz yok.** Paylaşma linki arka uç istemiyor ama galeri istiyor:
başkalarının makinelerini listelemek için bir yere yazılmaları gerek. Ya
bir sunucu ya da oyunun içine gömülü seçilmiş bir vitrin.

## Kayıt modu (dikey video)

**🎬 Kayıt (dikey)** düğmesi makineyi baştan çalıştırıp aynı sahneyi gizli bir
1080×1920 tuvale, topu takip eden bir kamerayla yeniden çizer ve `.webm`
indirir. Kamera önce tüm tahtayı gösterir (~1,6 sn), sonra topa zoomlar.

Fizik burada `requestAnimationFrame`'in dt'sine değil sabit 1/60 sn adıma
bağlı; yani video makinenin FPS'inden bağımsız. Ayarlar `KAYIT` sabitinde
(süreler, takip yüksekliği, üst sınır 45 sn).

**Sekme önde olmalı.** Arka plan sekmesinde rAF durur ama MediaRecorder gerçek
saatle damga vurur — kayıt donar ya da ağır çekim çıkar. Bu yüzden arka plana
geçilirse kayıt iptal ediliyor, gizli sekmede hiç başlamıyor.

mp4'e çevirme (Shorts'a hazır 1080×1920, 60 fps, sessiz ses izli):

    ./mp4-yap.sh ~/Downloads/rube-bolum1-1234567890.webm

## Diller

Arayüz 4 dilli: **İngilizce (varsayılan)**, Türkçe, Almanca, Fransızca. Seçim
sağ üstteki açılır listede, `localStorage`'a yazılıyor.

Çeviriler `SOZLUK` nesnesinde (`ui`, `parca`, `bolum`). `PARCALAR` ve
`BOLUMLER` içindeki Türkçe metinler **yedek**: çeviri yoksa oyun onlara düşer,
yani yeni parça çevirisiz de çalışır — sadece Türkçe görünür. Yeni bir dil
eklemek = `DILLER`'e bir satır + `SOZLUK`'a bir blok.

## Yeni parça eklemek

Motor hiçbir parça türünü **ismen bilmez**. `index.html` içindeki `PARCALAR`
kayıt defterine tek blok eklemek yeterli — motor kancaları kendisi çağırır,
palet düğmesi kendiliğinden çıkar:

```js
trambolin2: {
  ad: "Süper Trambolin", renk: "#ff8fab", palet: true,
  ipuc: "Palette ve ipucu satırında görünecek metin",
  olustur: a => ({ tur: "trambolin2", p: a }),        // yerlestirme
  geometri: p => [v(p.p.x-40, p.p.y), v(p.p.x+40, p.p.y)],  // null = katı değil
  carpma(p, c, dt) { /* top değdiğinde */ },
  adim(p, dt, ort) { /* kendi hareketi; ort = {parcalar, bilye, zil, zilCal} */ },
  ciz(p) { /* her kare */ },
  sifirla(p) { /* çalıştır/durdur anında ilk hale dön */ },
  // döndürülüp uzatılabilsin istiyorsan:
  sekil: { uzun: 40, enAz: 20, enCok: 110, doner: true },
}
```

**Şekil sözleşmesi:** parçanın açısı `p.yon` (radyan, 0 = yatay), yarı boyu
`p.uzun`. İkisi de opsiyonel — yoksa `sekil.uzun` ve 0 kullanılır, yani eski
kayıtlar bozulmaz. Şu yardımcılardan geçen parça döndürülünce **davranışı da
döner**, ekstra kod gerekmez:

- `eksen(p)` — parçanın kendi ekseni, `dikey(p)` — yüzeyinin normali
- `ucNoktalar(p)` — eksen boyunca iki uç; çoğu parçanın `geometri`si bu
- `yerelde(p, u => …)` — çizimi parçanın yerel eksenine taşır (`u` = yarı boy)

`sekil.mod` tutamak düzenini seçer: varsayılan merkez (iki uç), `"taban"`
(domino gibi tek uç), `"menzil"` (mıknatıs gibi yarıçap). `doner: false`
tutamağı sadece boy değiştirmeye indirger.

Sonra bölümün `stok` alanına anahtarı ekle (`null` = sınırsız) ve — istersen —
`SOZLUK`'taki her dilin `parca` bölümüne `{ad, ipuc}` yaz.

Aynı koddan üretilen kardeş parçalar (sağ/sol konveyör, ↻/↺ döner tabla)
`ceviriGrup: "belt"` diyerek ortak bir çeviri bloğunu paylaşır: kendi
bloğunda bulunmayan alan oradan gelir, yani ipucunu bir kez yazmak yeter.

## Testler

`testler.js` fizik adımlarını gerçek zamanı beklemeden elle döndürür, yani
deterministik ve anında biter. Tarayıcı konsolunda:

```js
const kod = await fetch('testler.js').then(r => r.text()); (0, eval)(kod);
await testleriKos();
```

Tarayıcı açmadan aynı testleri (+ taşıma testlerini) koşmak için:

    node dugum-testi.js

`dugum-testi.js` index.html'deki betiği sahte bir DOM'da (her çağrıyı yutan
Proxy) çalıştırır; çizim/arayüz sessizce döner, ölçülen tek şey fizik ve veri.

Sahte DOM'da iki şey bilerek **gerçek**: `localStorage` bellekte gerçek bir
depo (hep `null` dönen stub'la "misafir modu kaydı ezmiyor" testi hiçbir şey
kanıtlamaz) ve `Blob`/`Response`/`CompressionStream` Node'un kendi API'leri
(stub konsa test yalnızca düz base64 yedeğini görürdü, sıkıştırılmış yolu
hiç ölçmezdi).

Köprüde **fonksiyon bildirimi köprüleme**: `const`/`let` bağlama nesnesine
yazılmadığı için köprü gerekiyor, ama fonksiyonlar zaten globalde duruyor —
üzerlerine aynı adlı getter tanımlanırsa getter kendini çağırıp sonsuz
döngüye giriyor.

Şu an **68/68 geçiyor** — 15 fizik + 9 taşıma + 10 döndürme/uzatma +
21 paylaşma linki + 13 dokunmatik. Paylaşma testleri fiziği değil **bozuk/kötü niyetli bir
linkin reddedilip reddedilmediğini** ölçüyor: NaN koordinat, tahta dışı
koordinat, aşırı uzunluk, uydurma nota, bilinmeyen parça/bölüm/sürüm, 5000
parçalık şişirme — ve misafir modunun oyuncunun kaydını ezmediği.
Dokunmatik testleri tap / sürükleme / uzun basma ayrımının doğru yapıldığını
ve ikinci parmağın başlamış işlemi iptal ettiğini ölçüyor. Fizik
tarafı: rampa→zil, domino zinciri→zil, fırlatıcı, tahterevalli, trambolin,
konveyör, üfleyici, mıknatıs, döner tabla (sağ ve sol) ve melodi modu
(sırayla çalınca kazanır, ters sırada kazanmaz, zil kazandırmaz) ve
yıldızlar (temiz koşu 3 yıldız, fazla parça bir yıldız düşürür).

Testlerde bölüm indisi **sabit yazılmaz**: araya bölüm girince kayar.
`BOLUMLER.findIndex(b => b.id === "3")` gibi id ile bulunuyor — kayıt
anahtarı da (`ANAHTAR`) aynı id'ye bağlı, o yüzden bölüm sırası
değiştiğinde oyuncunun kurduğu makineler kendi bölümünde kalıyor.

İki test tuzağı (tekrar düşülmesin):
- **Açıyı koşu sonunda ölçme.** Kaldıraç topu bıraktıktan sonra dengeye
  döner; son değer daima ~0 çıkar. Tepe değer ölçülüyor.
- **Topu rampayla parçanın üstüne göndermek kırılgan.** Uca teğet gelen top
  sekip gidiyor ve parça hiç yüklenmiyor; testlerde top doğrudan parçanın
  üzerine bırakılıyor.
- **Döner tablada topu merkezin tam üstüne düşürme.** Orada yüzey hızı sıfır,
  parça çalışsa da hiçbir şey olmuyor gibi görünür; test topu bilerek
  merkezden kaçık düşürüyor.

## Bilinen sınırlar

- Domino **hangi taraftan dokunulduğuna** göre devriliyor; tepesine düşen top
  onu geriye devirebiliyor. Fiziksel olarak makul, bölüm tasarımında hesaba
  katılmalı.
- Parçalar tek bir **doğru parçası**; kutu/çokgen yok.
- Top tek; aynı anda birden fazla bilye yok.
- Tahterevalli döndürülemiyor (açısı fiziğin kendi değişkeni), mıknatıs
  yönsüz — ikisinde tutamak sadece ölçü değiştiriyor.
- Döner tabla ince bir çubuk: çok hızlı gelen top nadiren arasından sızıp
  hiç değmeden geçebiliyor. Motor parça başına tek doğru parçası desteklediği
  için çok kanatlı çark yapılamıyor.
- Kayıt sırasında sekme önde durmalı (yukarıya bak).
- Paylaşma linki makineyi taşır, **ilerlemeyi taşımaz**: yıldızlar, dil, tema
  ve enstrüman alıcının kendi ayarlarında kalır.
- Misafir şeridi açıkken sayfa ~48 px uzuyor; çok kısa ekranlarda dikey
  kaydırmayı erken tetikleyebilir.
- Telefonda tahta ~354 px'e sığıyor: oynanır ama dar. Tuval ölçüsü (1000×640)
  hâlâ sabit; gerçek mobil deneyim için bölüm tasarımının dikeye uyarlanması
  ayrı bir iş.
- Uzun basma süresi (500 ms) ve kayma eşiği (10 birim) `DOKUN` sabitinde;
  gerçek cihazda oynanarak ayarlanmadı.
- Kontrol şeridi Örnekler bölümüyle birlikte uzadı: 1500×950'de alt ucu
  (sayaç + dil seçici) görünür alanın dışında kalıyor, sayfa kayıyor.
  Kırpılan bir şey yok ama yeni bölüm eklemeden önce iki şeridin yükünü
  dengele.
- Çok kısa ekranlarda (görünür yükseklik ~600 px altı) şeritler tahtadan
  uzun kalıyor ve sayfa dikey kaydırmaya giriyor. Kırpılan bir şey yok, ama
  yeni panel eklemeden önce iki şeridin yükünü dengele.
- Kayıt çıktısı webm; mp4 için ffmpeg şart (`brew install ffmpeg`).
