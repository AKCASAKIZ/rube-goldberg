/* ------------------------------------------------------------------ *
 *  Tarayicisiz test kosucusu:   node dugum-testi.js
 *
 *  index.html'deki betigi sahte bir DOM'da calistirir, once testler.js
 *  fizik takimini, sonra tasima testlerini kosar. Tarayici konsolunda
 *  `await testleriKos()` ayni fizik testlerini calistirir; bu dosya onu
 *  komut satirindan da kosulabilir yapar.
 *
 *  Sahte DOM her cagriyi yutan bir Proxy: cizim ve arayuz kodu sessizce
 *  calisir, olculen tek sey fizik/veri.
 * ------------------------------------------------------------------ */

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const kok = __dirname;
const kaynak = fs.readFileSync(path.join(kok, "index.html"), "utf8")
  .match(/<script>([\s\S]*)<\/script>/)[1];

const yutucu = new Proxy(function () {}, {
  // left/top SAYI donmeli: fareNok bunlari cikariyor, proxy donseydi
  // koordinat NaN olurdu ve dokunmatik testleri sessizce anlamsizlasirdi.
  get: (t, k) => (k === "width" ? 1000 : k === "height" ? 640
    : k === "left" || k === "top" ? 0 : k === "length" ? 0 : yutucu),
  set: () => true,
  apply: () => yutucu,
  has: () => true,
});

const belge = {
  getElementById: () => yutucu,
  createElement: () => yutucu,
  createTextNode: () => yutucu,
  querySelector: () => yutucu,
  addEventListener: () => {},
  documentElement: {},
  hidden: false,
  title: "",
};

const kutu = {
  document: belge,
  navigator: { language: "en" },
  // Gercek (bellekte) depo: misafir modunun oyuncunun kaydini EZMEDIGINI
  // olcmek icin sart - hep null donen stub'la o test hicbir sey kanitlamaz.
  localStorage: (() => {
    const m = new Map();
    return {
      getItem: k => (m.has(k) ? m.get(k) : null),
      setItem: (k, d) => m.set(k, String(d)),
      removeItem: k => m.delete(k),
    };
  })(),
  performance: { now: () => 0 },
  requestAnimationFrame: () => 0,      // ana dongu hic donmesin
  setTimeout: (f, ms) => setTimeout(f, ms),
  clearTimeout: () => {},
  innerWidth: 1400, innerHeight: 900,
  addEventListener: () => {},          // window.addEventListener (hashchange)
  console,
  URL: { createObjectURL: () => "", revokeObjectURL: () => {} },
  MediaRecorder: function () {},
  // Paylasma linki gercek API'lerle kosuluyor: Blob/Response/deflate akislari
  // Node'da da var, yani sikistirilmis yol da olculuyor - stub konsaydi test
  // yalnizca duz base64 yedegini gorurdu.
  Blob: globalThis.Blob,
  Response: globalThis.Response,
  CompressionStream: globalThis.CompressionStream,
  DecompressionStream: globalThis.DecompressionStream,
  btoa: globalThis.btoa, atob: globalThis.atob,
  TextEncoder: globalThis.TextEncoder, TextDecoder: globalThis.TextDecoder,
  location: { href: "http://yerel/index.html", hash: "" },
  history: { replaceState: () => {} },
};
kutu.window = kutu;
kutu.globalThis = kutu;

/* vm'de top-level const/let baglama nesnesine yazilmaz; testlerin canli
   erisebilmesi icin kopru kuruluyor. FONKSIYON BILDIRIMLERI koprulenmez:
   onlar zaten globalde duruyor, uzerlerine ayni adli getter tanimlanirsa
   getter kendini cagirip sonsuz donguye giriyor. */
const kopru = `
Object.defineProperties(globalThis, {
  PARCALAR:  { get: () => PARCALAR },
  BOLUMLER:  { get: () => BOLUMLER },
  melodi:    { get: () => melodi },
  melodiSira:{ get: () => melodiSira },
  melodiFazla:{ get: () => melodiFazla },
  NOTALAR:   { get: () => NOTALAR },
  parcalar:  { get: () => parcalar,  set: x => { parcalar = x; } },
  sabitler:  { get: () => sabitler },
  tasima:    { get: () => tasima,    set: x => { tasima = x; } },
  secim:     { get: () => secim,     set: x => { secim = x; } },
  secili:    { get: () => secili,    set: x => { secili = x; } },
  calisiyor: { get: () => calisiyor, set: x => { calisiyor = x; } },
  bilye:     { get: () => bilye },
  kazanildi: { get: () => kazanildi },
  ADIM:      { get: () => ADIM },
  v:         { get: () => v },
  misafir:   { get: () => misafir,   set: x => { misafir = x; } },
  bolumNo:   { get: () => bolumNo },
  ANAHTAR:   { get: () => ANAHTAR },
  GORUS:     { get: () => GORUS },
  notaHedef: { get: () => notaHedef, set: x => { notaHedef = x; } },
  bekleyen:  { get: () => bekleyen },
  dokunmalar:{ get: () => dokunmalar },
  surukle:   { get: () => surukle,   set: x => { surukle = x; } },
});`;

vm.createContext(kutu);
vm.runInContext(kaynak + kopru, kutu);
vm.runInContext(fs.readFileSync(path.join(kok, "testler.js"), "utf8"), kutu);

const g = kutu;
const SERBEST = g.BOLUMLER.findIndex(b => b.id === "3");
let hata = 0;
const bak = (ad, kosul, ek = "") => {
  console.log((kosul ? "OK   " : "HATA ") + ad + (ek ? "  (" + ek + ")" : ""));
  if (!kosul) hata++;
};

(async () => {
  /* ---- 1. bolum: index.html'deki fizik takimi ---- */
  const fizik = await g.testleriKos();
  console.log(fizik.replace(/^/gm, ""));
  if (!/^(\d+)\/\1 /.test(fizik)) hata++;

  /* ---- 2. bolum: tasima ---- */
  console.log("\n--- taşıma ---");
  g.bolumKur(SERBEST);
  g.parcalar = [];
  g.secili = "tasi";

  g.yeniParca(g.PARCALAR.ramp.olustur({ x: 200, y: 200 }, { x: 400, y: 300 }));
  const r = g.parcalar[0];
  g.tasimaBasla({ x: 300, y: 250 }, {});
  bak("rampa ortasından tutuluyor", g.tasima && g.tasima.kavrama === "butun");
  g.tasimaSurdur({ x: 350, y: 250 });
  g.tasimaSurdur({ x: 350, y: 280 });
  bak("rampa bütün halde kaydı",
    r.a.x === 250 && r.a.y === 230 && r.b.x === 450 && r.b.y === 330,
    JSON.stringify([r.a, r.b]));
  g.tasima = null;

  g.tasimaBasla({ x: 450, y: 330 }, {});
  bak("rampanın ucu tutuluyor", g.tasima && g.tasima.kavrama === "b");
  g.tasimaSurdur({ x: 500, y: 400 });
  bak("sadece b ucu oynadı",
    r.a.x === 250 && r.a.y === 230 && r.b.x === 500 && r.b.y === 400,
    JSON.stringify([r.a, r.b]));
  g.tasima = null;

  g.yeniParca(g.PARCALAR.domino.olustur({ x: 100, y: 600 }));
  const d = g.parcalar[1];
  g.tasimaBasla({ x: 100, y: 590 }, {});
  bak("tek noktalı parça tutuluyor", !!g.tasima);
  g.tasimaSurdur({ x: -900, y: 590 });
  bak("tahta dışına çıkmıyor", d.p.x >= 0 && d.p.x <= 1000, "x=" + d.p.x);
  g.tasima = null;

  g.tasimaBasla({ x: 990, y: 40 }, {});
  bak("boş noktada tutmuyor", g.tasima === null);
  bak("nota taşımada korunuyor", r.nota === "C4" && d.nota === "D4", r.nota + "," + d.nota);

  // Tasidiktan sonra geometri saglam mi: makine hala zili caliyor mu?
  g.parcalar = [
    g.PARCALAR.ramp.olustur({ x: 40, y: 140 }, { x: 520, y: 380 }),
    g.PARCALAR.ramp.olustur({ x: 480, y: 420 }, { x: 900, y: 560 }),
  ];
  g.tasimaBasla({ x: 280, y: 260 }, {});
  g.tasimaSurdur({ x: 280, y: 245 });
  g.tasima = null;
  g.basla();
  g.calisiyor = false;                       // adimlari elle donduruyoruz
  for (let i = 0; i < 54000 && g.bilye && !g.kazanildi; i++) {
    g.parcaAdimi(g.ADIM);
    if (g.bilye) g.fizikAdimi(g.ADIM);
  }
  bak("taşınmış rampalarla zil çalıyor", g.kazanildi === true,
    g.bilye ? "top tahtada" : "top düştü");

  /* ---- 3. bölüm: döndürme ve uzatma ---- */
  console.log("\n--- döndürme / uzatma ---");
  g.bolumKur(SERBEST);

  /** Parçayı tek başına koyup topu belirtilen yere bırakır, N adım döndürür. */
  function kos(parca, topNok, adim = 60) {
    g.parcalar = [parca];
    g.basla();
    g.calisiyor = false;
    g.bilye.p.x = topNok.x; g.bilye.p.y = topNok.y;
    g.bilye.h.x = topNok.hx || 0; g.bilye.h.y = topNok.hy || 0;
    for (let i = 0; i < adim && g.bilye; i++) {
      g.parcaAdimi(g.ADIM);
      if (g.bilye) g.fizikAdimi(g.ADIM);
    }
    return g.bilye;
  }

  // Tutamağı sürüklemek hem döndürüyor hem uzatıyor
  g.parcalar = [];
  g.yeniParca(g.PARCALAR.launcher.olustur({ x: 500, y: 300 }));
  const f = g.parcalar[0];
  g.secim = f;
  g.tasimaBasla({ x: 534, y: 300 }, {});            // sağ uç tutamağı
  bak("uç tutamağı yakalandı", g.tasima && g.tasima.kavrama === "sekil2",
    g.tasima && g.tasima.kavrama);
  g.tasimaSurdur({ x: 500, y: 240 });               // yukarı çek: dikleşsin + uzasın
  bak("tutamak döndürdü", Math.abs(g.tasima.p.yon + Math.PI / 2) < 0.01,
    (f.yon * 57).toFixed(0) + "°");
  bak("tutamak uzattı", Math.abs(f.uzun - 60) < 0.5, f.uzun);
  g.tasimaSurdur({ x: 500, y: 100 });               // sınırın ötesine çek
  bak("uzunluk üst sınırda duruyor", f.uzun === g.PARCALAR.launcher.sekil.enCok, f.uzun);
  g.tasima = null; g.secim = null;

  // Döndürülmüş fırlatıcı yana atıyor: yon=90° → yüzü +x'e bakar, topu
  // sağdan gelip çarpmalı (normalin ters yönünde yaklaşan top fırlar).
  let b = kos({ tur: "launcher", p: g.v(500, 400), yon: Math.PI / 2, uzun: 34, parla: 0 },
    { x: 520, y: 400, hx: -300 }, 30);
  bak("döndürülmüş fırlatıcı yana atıyor", b && b.h.x > 600, b && Math.round(b.h.x));

  // Eğik konveyör topu kendi ekseni boyunca (yokuş yukarı) sürüklüyor
  b = kos({ tur: "beltR", p: g.v(400, 400), yon: -0.4, uzun: 60, faz: 0 },
    { x: 400, y: 400 - 9 }, 40);
  bak("eğik konveyör yokuş yukarı taşıyor", b && b.h.x > 100 && b.h.y < 0,
    b && `hx=${Math.round(b.h.x)} hy=${Math.round(b.h.y)}`);

  // Döndürülmüş üfleyici yana üflüyor (yon = -90° → normal -x)
  b = kos({ tur: "fan", p: g.v(600, 300), yon: -Math.PI / 2, uzun: 46, faz: 0 },
    { x: 480, y: 300 }, 120);
  bak("döndürülmüş üfleyici yana üflüyor", b && b.h.x < -200, b && Math.round(b.h.x));

  // Mıknatıs menzili büyüyünce daha uzaktan çekiyor
  const uzak = { x: 400, y: 300 };
  b = kos({ tur: "magnet", p: g.v(650, 300) }, uzak, 120);         // varsayılan 170
  const yakinCekim = b ? b.h.x : 0;
  b = kos({ tur: "magnet", p: g.v(650, 300), uzun: 320 }, uzak, 120);
  bak("menzil büyüyünce uzaktan çekiyor", yakinCekim === 0 && b && b.h.x > 60,
    `170→${Math.round(yakinCekim)}, 320→${b && Math.round(b.h.x)}`);

  // Domino eğik dikilebiliyor: sıfırla açıyı yon'a döndürüyor
  const dom = { tur: "domino", p: g.v(300, 600), yon: 0.3, uzun: 54, aci: 0, aciHiz: 0 };
  g.PARCALAR.domino.sifirla(dom);
  const uc = g.PARCALAR.domino.geometri(dom)[1];
  bak("domino eğik duruyor", Math.abs(dom.aci - 0.3) < 1e-9 && uc.x > 300 && uc.y < 600,
    `(${Math.round(uc.x)},${Math.round(uc.y)})`);

  // Eski kayıtlar (yon/uzun alanı yok) varsayılan ölçüyle çalışıyor
  bak("eski kayıt varsayılana düşüyor",
    g.PARCALAR.trampoline.geometri({ tur: "trampoline", p: g.v(100, 100) })[1].x === 140);

  /* ---- 4. bolum: paylasma linki ---- *
     Link YABANCI VERI. Burada olculen sey fizik degil, bozuk/kotu niyetli
     bir linkin motoru NaN'a dusurmeden ya da oyuncunun kaydini ezmeden
     reddedilip reddedilmedigi. */
  console.log("\n--- paylaşma linki ---");

  g.bolumKur(SERBEST);
  g.parcalar = [];
  g.yeniParca(g.PARCALAR.ramp.olustur({ x: 120, y: 200 }, { x: 380, y: 320 }));
  g.yeniParca(g.PARCALAR.domino.olustur({ x: 500, y: 600 }));
  g.parcalar[1].nota = "G4";
  const kod = await g.makineKodu();

  bak("kod sıkıştırılmış üretiliyor", kod[0] === "1", `${kod.length} karakter`);
  bak("kod URL'de güvenli", /^[01][A-Za-z0-9_-]+$/.test(kod));

  let c = await g.koduCoz(kod);
  bak("kod geri çözülüyor", !!c && c.parcalar.length === 2);
  bak("bölüm korunuyor", c && c.bolum === SERBEST);
  bak("geometri korunuyor", c && c.parcalar[0].a.x === 120 && c.parcalar[0].b.y === 320,
    c && JSON.stringify([c.parcalar[0].a, c.parcalar[0].b]));
  bak("nota korunuyor", c && c.parcalar[1].nota === "G4", c && c.parcalar[1].nota);

  // Sikistirilmamis yol (eski/eksik tarayici) da ayni sonucu vermeli
  const duz = "0" + Buffer.from(JSON.stringify(
    { s: 1, b: "3", p: [{ tur: "domino", p: { x: 200, y: 600 }, nota: "C5" }] }
  )).toString("base64url");
  c = await g.koduCoz(duz);
  bak("düz base64 yolu da çözülüyor", !!c && c.parcalar[0].nota === "C5");

  // --- bozuk / kotu niyetli girdiler ---
  bak("çöp kod reddediliyor", (await g.koduCoz("1zzzz")) === null);
  bak("boş kod reddediliyor", (await g.koduCoz("")) === null);
  const bozukKod = s => "0" + Buffer.from(JSON.stringify(s)).toString("base64url");
  bak("bilinmeyen sürüm reddediliyor",
    (await g.koduCoz(bozukKod({ s: 99, b: "3", p: [] }))) === null);
  bak("bilinmeyen bölüm reddediliyor",
    (await g.koduCoz(bozukKod({ s: 1, b: "yok", p: [{ tur: "domino", p: { x: 1, y: 1 } }] }))) === null);
  bak("bilinmeyen parça atılıyor",
    (await g.koduCoz(bozukKod({ s: 1, b: "3", p: [{ tur: "hacker", p: { x: 1, y: 1 } }] }))) === null);

  c = await g.koduCoz(bozukKod({ s: 1, b: "3", p: [
    { tur: "domino", p: { x: NaN, y: 600 } },                     // NaN: atılmalı
    { tur: "domino", p: { x: 1e9, y: -1e9 } },                    // tahta dışı: kısılmalı
  ] }));
  bak("NaN koordinat atılıyor", !!c && c.parcalar.length === 1);
  bak("tahta dışı koordinat kısılıyor",
    c && c.parcalar[0].p.x === 1000 && c.parcalar[0].p.y === 0,
    c && `(${c.parcalar[0].p.x},${c.parcalar[0].p.y})`);

  c = await g.koduCoz(bozukKod({ s: 1, b: "3", p: [
    { tur: "trampoline", p: { x: 500, y: 300 }, uzun: 99999, nota: "ZZ9" },
  ] }));
  bak("aşırı uzunluk sınıra kısılıyor",
    c && c.parcalar[0].uzun === g.PARCALAR.trampoline.sekil.enCok, c && c.parcalar[0].uzun);
  bak("uydurma nota alınmıyor", c && c.parcalar[0].nota !== "ZZ9");

  const cok = await g.koduCoz(bozukKod({ s: 1, b: "3",
    p: Array.from({ length: 5000 }, () => ({ tur: "domino", p: { x: 5, y: 5 } })) }));
  bak("parça sayısı tavanla sınırlı", cok && cok.parcalar.length === 300,
    cok && cok.parcalar.length);

  // --- misafir modu oyuncunun kaydini EZMEMELI ---
  g.bolumKur(SERBEST);
  g.parcalar = [];
  g.yeniParca(g.PARCALAR.domino.olustur({ x: 700, y: 600 }));
  g.kaydet();
  const benimki = JSON.parse(g.localStorage.getItem(g.ANAHTAR(SERBEST)));
  bak("kendi makinem kaydedildi", benimki.length === 1);

  g.misafirAc({ bolum: SERBEST, parcalar: g.makineSuz(
    [{ tur: "domino", p: { x: 100, y: 600 } }, { tur: "domino", p: { x: 200, y: 600 } }]) });
  bak("misafir makinesi yüklendi", g.parcalar.length === 2 && !!g.misafir);
  g.kaydet();
  bak("misafirken kayıt yazmıyor",
    JSON.parse(g.localStorage.getItem(g.ANAHTAR(SERBEST))).length === 1);

  g.misafirKapat(false);
  bak("bırakınca kendi makineme dönüyorum", g.parcalar.length === 1 && !g.misafir,
    g.parcalar.length + " parça");

  g.misafirAc({ bolum: SERBEST, parcalar: g.makineSuz(
    [{ tur: "domino", p: { x: 100, y: 600 } }, { tur: "domino", p: { x: 200, y: 600 } }]) });
  g.misafirKapat(true);
  bak("sahiplenince kayda yazılıyor",
    !g.misafir && JSON.parse(g.localStorage.getItem(g.ANAHTAR(SERBEST))).length === 2);

  // Bolum degistirmek misafirlikten cikarmali, yoksa kaydet() sonsuza susar
  g.misafirAc({ bolum: SERBEST, parcalar: g.makineSuz(
    [{ tur: "domino", p: { x: 100, y: 600 } }]) });
  g.bolumKur(0);
  bak("bölüm değişince misafirlik bitiyor", !g.misafir);

  /* ---- 5. bolum: dokunmatik ---- *
     Parmakta islem pointerdown'da BASLAMIYOR (tap/surukleme/uzun basma
     ayrimi icin bekletiliyor). Olculen sey bu ayrimin dogru yapildigi. */
  console.log("\n--- dokunmatik ---");

  const dok = (id, x, y) => ({ pointerId: id, pointerType: "touch",
                               clientX: x, clientY: y, button: 0 });
  const bekle = ms => new Promise(r => setTimeout(r, ms));

  g.bolumKur(SERBEST);
  g.parcalar = [];
  g.secili = "domino";

  // Kisa dokunus = parca koy
  g.dokunBasla(dok(1, 300, 600));
  bak("dokunuşta parça HEMEN konmuyor", g.parcalar.length === 0 && !!g.bekleyen);
  g.dokunBitir(dok(1, 300, 600));
  bak("kısa dokunuş parçayı koyuyor", g.parcalar.length === 1,
    g.parcalar.length + " parça");

  // Uzun basma = nota menusu (parca koymadan)
  g.notaHedef = null;
  g.dokunBasla(dok(1, 300, 600));
  await bekle(620);
  bak("uzun basma nota menüsünü açıyor", g.notaHedef === g.parcalar[0]);
  bak("uzun basma parça koymuyor", g.parcalar.length === 1, g.parcalar.length + " parça");
  g.dokunBitir(dok(1, 300, 600));
  bak("uzun basmadan sonra bırakmak parça koymuyor", g.parcalar.length === 1);

  // Surukleme = rampa ciz (duz degil)
  g.parcalar = [];
  g.secili = "ramp";
  g.dokunBasla(dok(1, 100, 100));
  g.dokunOynat(dok(1, 400, 300));
  bak("parmak kayınca sürükleme başlıyor", !!g.surukle);
  g.dokunBitir(dok(1, 400, 300));
  const r2 = g.parcalar[0];
  bak("sürükleme çizilen rampayı veriyor",
    r2 && r2.a.x === 100 && r2.b.x === 400 && r2.b.y === 300,
    r2 && JSON.stringify([r2.a, r2.b]));

  // Rampada kisa dokunus DUZ rampa koymali (surukle acik kalmamali)
  g.parcalar = [];
  g.dokunBasla(dok(1, 500, 300));
  g.dokunBitir(dok(1, 500, 300));
  bak("rampada kısa dokunuş düz rampa koyuyor",
    g.parcalar.length === 1 && g.parcalar[0].a.y === g.parcalar[0].b.y);
  bak("dokunuş sonrası sürükleme kapanıyor", !g.surukle);

  // Ikinci parmak: baslamis islemi iptal edip cimdige geciyor
  g.parcalar = [];
  g.secili = "domino";
  g.dokunBasla(dok(1, 300, 600));
  g.dokunBasla(dok(2, 600, 600));
  bak("ikinci parmak bekleyen işlemi iptal ediyor", !g.bekleyen);
  g.dokunBitir(dok(1, 300, 600));
  g.dokunBitir(dok(2, 600, 600));
  bak("çimdik parça bırakmıyor", g.parcalar.length === 0, g.parcalar.length + " parça");

  // Cimdik yakinlastiriyor
  g.GORUS.olcek = 1;
  g.dokunBasla(dok(1, 400, 300));
  g.dokunBasla(dok(2, 500, 300));      // arasi 100
  g.dokunOynat(dok(2, 600, 300));      // arasi 200 -> 2 kat
  bak("çimdik yakınlaştırıyor", g.GORUS.olcek > 1.5, "ölçek=" + g.GORUS.olcek.toFixed(2));
  g.dokunBitir(dok(1, 400, 300));
  g.dokunBitir(dok(2, 600, 300));
  bak("parmaklar kalkınca çimdik bitiyor", g.dokunmalar.size === 0);
  g.GORUS.olcek = 1;

  console.log(hata ? `\n${hata} test başarısız` : "\nhepsi geçti");
  process.exit(hata ? 1 : 0);
})();
