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
  secimler:  { get: () => secimler,  set: x => { secimler = x; } },
  kutuSecim: { get: () => kutuSecim, set: x => { kutuSecim = x; } },
  kaydirma:  { get: () => kaydirma,  set: x => { kaydirma = x; } },
  YAPIS:     { get: () => YAPIS },
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
  g.secimYap([f]);
  g.tasimaBasla({ x: 534, y: 300 }, {});            // sağ uç tutamağı
  bak("uç tutamağı yakalandı", g.tasima && g.tasima.kavrama === "sekil2",
    g.tasima && g.tasima.kavrama);
  g.tasimaSurdur({ x: 500, y: 240 });               // yukarı çek: dikleşsin + uzasın
  bak("tutamak döndürdü", Math.abs(g.tasima.p.yon + Math.PI / 2) < 0.01,
    (f.yon * 57).toFixed(0) + "°");
  bak("tutamak uzattı", Math.abs(f.uzun - 60) < 0.5, f.uzun);
  g.tasimaSurdur({ x: 500, y: 100 });               // sınırın ötesine çek
  bak("uzunluk üst sınırda duruyor", f.uzun === g.PARCALAR.launcher.sekil.enCok, f.uzun);
  g.tasima = null; g.secimYap([]);

  /* ---------- kutu seçimi ve toplu taşıma ---------- */
  g.secili = "tasi";
  g.parcalar = [];
  g.yeniParca(g.PARCALAR.domino.olustur({ x: 200, y: 500 }));
  g.yeniParca(g.PARCALAR.domino.olustur({ x: 260, y: 500 }));
  g.yeniParca(g.PARCALAR.domino.olustur({ x: 800, y: 500 }));   // kutunun dışında
  const [d1, d2, d3] = g.parcalar;

  bak("kutu yalnızca içine düşenleri seçiyor",
    g.kutudakiParcalar({ x: 150, y: 400 }, { x: 320, y: 600 }).length === 2,
    g.kutudakiParcalar({ x: 150, y: 400 }, { x: 320, y: 600 }).length);

  // Uçları kutunun dışında ama gövdesi kutudan geçen rampa da seçilmeli
  g.parcalar = [];
  g.yeniParca(g.PARCALAR.ramp.olustur({ x: 100, y: 500 }, { x: 900, y: 500 }));
  bak("kutuyu kesen uzun rampa seçiliyor",
    g.kutudakiParcalar({ x: 480, y: 460 }, { x: 520, y: 540 }).length === 1);

  // Boş alanda sürükleme kutu açıyor, bırakınca seçime dönüyor
  g.parcalar = [];
  g.yeniParca(g.PARCALAR.domino.olustur({ x: 200, y: 500 }));
  g.yeniParca(g.PARCALAR.domino.olustur({ x: 260, y: 500 }));
  g.secimYap([]);
  g.tasimaBasla({ x: 150, y: 400 }, {});
  bak("boş alanda sürükleme kutu açıyor", !!g.kutuSecim && !g.kaydirma);
  g.birak({ clientX: 0, clientY: 0 });
  bak("bırakınca seçim kutusu kapanıyor", g.kutuSecim === null);

  // Shift ile aynı hareket görüşü kaydırıyor, kutu açmıyor
  g.secimYap([]);
  g.tasimaBasla({ x: 150, y: 400 }, { shiftKey: true });
  bak("Shift görüşü kaydırıyor", !g.kutuSecim && !!g.kaydirma);
  g.kaydirma = null;

  // Toplu taşıma: iki domino birlikte kayıyor, aralarındaki mesafe korunuyor
  const p1 = g.parcalar[0], p2 = g.parcalar[1];
  g.secimYap([p1, p2]);
  const oncekiFark = p2.p.x - p1.p.x;
  g.tasimaBasla({ x: 200, y: 500 }, {});
  bak("seçili yığına basınca toplu taşıma başlıyor",
    !!(g.tasima && g.tasima.coklu), g.tasima && g.tasima.kavrama);
  g.tasimaSurdur({ x: 300, y: 520 });
  bak("iki parça da kaydı", Math.abs(p1.p.x - 300) < 0.01 && Math.abs(p2.p.y - 520) < 0.01,
    `${p1.p.x},${p2.p.y}`);
  bak("aralarındaki mesafe korundu", Math.abs((p2.p.x - p1.p.x) - oncekiFark) < 0.01,
    p2.p.x - p1.p.x);

  // Kenara dayanınca yığın hep birlikte duruyor, biri diğerinin üstüne binmiyor
  g.tasimaSurdur({ x: 5000, y: 520 });
  bak("tahta kenarında yığın bozulmuyor",
    Math.abs((p2.p.x - p1.p.x) - oncekiFark) < 0.01, p2.p.x - p1.p.x);
  bak("yığın tahtanın içinde kaldı", p2.p.x <= 996 && p1.p.x >= 4,
    `${p1.p.x.toFixed(0)}..${p2.p.x.toFixed(0)}`);
  g.tasima = null;

  // Ctrl ile seçime ekleme / çıkarma
  g.secimYap([]);
  g.tasimaBasla({ x: p1.p.x, y: p1.p.y }, { ctrlKey: true });
  bak("Ctrl seçime ekliyor", g.secimler.length === 1 && !g.tasima, g.secimler.length);
  g.tasimaBasla({ x: p1.p.x, y: p1.p.y }, { ctrlKey: true });
  bak("Ctrl ikinci kez seçimden çıkarıyor", g.secimler.length === 0, g.secimler.length);

  // Tek seçimde tutamak var, çok seçimde yok
  g.secimYap([p1, p2]);
  bak("çoklu seçimde tutamak gösterilmiyor", g.secim === null);
  g.secimYap([p1]);
  bak("tek seçimde tutamak sahibi belli", g.secim === p1);
  g.secimYap([]);
  g.secili = "ramp";

  /* ---------- nota dizisi ---------- */
  bak("dizi dört tam oktav + kapanış (29 nota)", g.NOTALAR.length === 29, g.NOTALAR.length);
  // Gam "do"da kapanmalı: hem başı hem sonu C olmalı (do…do)
  bak("dizi do ile başlayıp do ile bitiyor",
    g.NOTALAR[0].ad === "C3" && g.NOTALAR[g.NOTALAR.length - 1].ad === "C7",
    g.NOTALAR[0].ad + "…" + g.NOTALAR[g.NOTALAR.length - 1].ad);
  bak("kapanış do'su tam oktav üstte",
    Math.abs(g.NOTALAR[g.NOTALAR.length - 1].f / g.NOTALAR[21].f - 2) < 0.005,
    (g.NOTALAR[28].f / g.NOTALAR[21].f).toFixed(4));
  for (const n of ["F3", "B3", "F4", "B4", "F5", "B5", "F6", "B6"])
    bak(`${n} dizide var`, g.NOTALAR.some(x => x.ad === n));
  // Her oktav aynı yedi harfle başlıyor: menü satırları oktav oluyor,
  // aynı harf hep aynı sütunda kalıyor.
  bak("her oktavda yedi nota var",
    [0, 7, 14, 21].every(i => g.NOTALAR.slice(i, i + 7).map(x => x.ad[0]).join("") === "CDEFGAB"));
  // Sekiz notalık gam gerçekten kurulabiliyor mu: do re mi fa sol la si do
  bak("do…do sekiz notalık gam dizide var",
    ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"].every(n =>
      g.NOTALAR.some(x => x.ad === n)));
  // Frekanslar oktav başına tam iki katına çıkmalı - yanlış tabloda bu bozulur
  bak("oktav frekansı iki katı",
    [0, 1, 2, 3, 4, 5, 6].every(i =>
      Math.abs(g.NOTALAR[i + 7].f / g.NOTALAR[i].f - 2) < 0.005),
    (g.NOTALAR[7].f / g.NOTALAR[0].f).toFixed(4));

  /* ---------- yerleştirme yardımı (yapışma) ---------- */
  g.secili = "tasi";
  g.parcalar = [];
  g.yeniParca({ tur: "ramp", a: g.v(200, 400), b: g.v(400, 500) });
  g.yeniParca({ tur: "ramp", a: g.v(600, 300), b: g.v(800, 380) });
  const yapisA = g.parcalar[0], yapisB = g.parcalar[1];

  // yapisB'nin a ucunu yapisA'nin b ucunun YAKININA sürükle: tam üstüne oturmalı
  g.secimYap([yapisB]);
  g.tasimaBasla({ x: 600, y: 300 }, {});
  g.tasimaSurdur({ x: 406, y: 496 });               // 7 px uzakta
  bak("uç noktaya yapışıyor",
    Math.abs(yapisB.a.x - 400) < 0.01 && Math.abs(yapisB.a.y - 500) < 0.01,
    `${yapisB.a.x.toFixed(1)},${yapisB.a.y.toFixed(1)}`);
  bak("yapışma izi çiziliyor", !!g.YAPIS.iz.nokta);

  // Alt basılıyken yapışma YOK
  g.YAPIS.kapali = true;
  g.tasimaSurdur({ x: 406, y: 496 });
  bak("Alt yapışmayı kapatıyor",
    Math.abs(yapisB.a.x - 406) < 0.01 && Math.abs(yapisB.a.y - 496) < 0.01,
    `${yapisB.a.x.toFixed(1)},${yapisB.a.y.toFixed(1)}`);
  g.YAPIS.kapali = false;
  g.tasima = null;

  // Uzaktaki nokta yapışmıyor - yapışma yarıçapı 14 px
  g.secimYap([yapisB]);
  g.tasimaBasla({ x: yapisB.a.x, y: yapisB.a.y }, {});
  g.tasimaSurdur({ x: 340, y: 460 });               // yapisA'nin ucundan ~72 px
  bak("uzaktaki nokta yapışmıyor", Math.abs(yapisB.a.x - 340) < 6, yapisB.a.x.toFixed(1));
  g.tasima = null;

  // Açı yapışması YALNIZCA Shift ile
  g.secili = "ramp";
  g.parcalar = [];
  g.surukle = { a: g.v(100, 100), b: g.v(100, 100) };
  let serbestUc = g.surukleUcu({ x: 400, y: 300 }, { shiftKey: false });
  bak("Shift'siz açı serbest",
    Math.abs(serbestUc.x - 400) < 0.01 && Math.abs(serbestUc.y - 300) < 0.01,
    `${serbestUc.x.toFixed(1)},${serbestUc.y.toFixed(1)}`);
  serbestUc = g.surukleUcu({ x: 400, y: 300 }, { shiftKey: true });
  const aci = Math.atan2(serbestUc.y - 100, serbestUc.x - 100) * 180 / Math.PI;
  bak("Shift açıyı 15°'nin katına oturtuyor", Math.abs(aci - 30) < 0.01, aci.toFixed(2) + "°");
  g.surukle = null;
  g.YAPIS.aciTusu = false;

  /* ---------- ok tuşları ve döndürme ---------- */
  g.secili = "tasi";
  g.parcalar = [];
  g.yeniParca(g.PARCALAR.domino.olustur({ x: 300, y: 400 }));
  g.yeniParca(g.PARCALAR.domino.olustur({ x: 400, y: 400 }));
  const [k1, k2] = g.parcalar;
  g.secimYap([k1, k2]);

  g.kaydirSecim(1, 0);
  bak("ok tuşu 1 px kaydırıyor", Math.abs(k1.p.x - 301) < 0.01, k1.p.x);
  g.kaydirSecim(10, 0);
  bak("Shift+ok 10 px kaydırıyor", Math.abs(k1.p.x - 311) < 0.01, k1.p.x);

  // 90° döndürünce yatay dizilim dikey oluyor, parçanın kendi açısı da dönüyor
  const oncekiYon = k1.yon || 0;
  g.dondurSecim(Math.PI / 2);
  bak("döndürme dizilimi çeviriyor",
    Math.abs(k1.p.x - k2.p.x) < 0.01 && Math.abs(k1.p.y - k2.p.y) > 90,
    `dx=${(k2.p.x - k1.p.x).toFixed(1)} dy=${(k2.p.y - k1.p.y).toFixed(1)}`);
  bak("parçanın kendi açısı da döndü",
    Math.abs((k1.yon || 0) - (oncekiYon + Math.PI / 2)) < 0.01, k1.yon);

  // Tahtadan taşacak döndürme HİÇ uygulanmıyor - yığın bozulmamalı
  g.parcalar = [];
  g.yeniParca(g.PARCALAR.domino.olustur({ x: 20, y: 320 }));
  g.yeniParca(g.PARCALAR.domino.olustur({ x: 980, y: 320 }));
  const [u1, u2] = g.parcalar;
  g.secimYap([u1, u2]);
  const aralik = u2.p.x - u1.p.x;
  g.dondurSecim(Math.PI / 2);                        // dikeye dönerse tahta dışına çıkar
  bak("taşacak döndürme uygulanmıyor",
    Math.abs((u2.p.x - u1.p.x) - aralik) < 0.01, u2.p.x - u1.p.x);
  g.secimYap([]);
  g.secili = "ramp";

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

  /* ---- 6. bolum: secerek kopyalama ---- *
     ⧉ aracinda bos alanda surukleme SECMEZ, KOPYALAR. Olculen sey: kutunun
     icindekilerin tamaminin geldigi, aralarindaki mesafenin bozulmadigi ve
     stok yetmiyorsa hicbirinin kopyalanmadigi. */
  console.log("\n--- seçerek kopyalama ---");

  const fare = (x, y) => ({ pointerId: 9, pointerType: "mouse",
                            clientX: x, clientY: y, button: 0 });
  const kutuCiz = (x1, y1, x2, y2) => {
    g.eylemBasla(g.fareNok(fare(x1, y1)), fare(x1, y1));
    g.birak(fare(x2, y2));
  };
  const domino = (x, y) => g.parcalar.push(
    { tur: "domino", p: g.v(x, y), boy: 54, aci: 0, aciHiz: 0 });

  // Onceki cimdik testi gorusu kaydirdi; birakilirsa fare koordinatlari
  // dunya koordinatlarina denk gelmez ve kutu bos cikar.
  g.GORUS.x = 0; g.GORUS.y = 0; g.GORUS.olcek = 1;

  g.bolumKur(SERBEST);
  g.parcalar = [];
  g.secimYap([]);
  g.secili = "cogalt";
  [300, 360, 420].forEach(x => domino(x, 600));
  kutuCiz(280, 560, 440, 640);
  bak("kutu içindeki 3 parça kopyalandı", g.parcalar.length === 6,
    g.parcalar.length + " parça");
  bak("kopyalar seçili geliyor", g.secimler.length === 3,
    g.secimler.length + " seçili");

  // Aradaki mesafe korunmali: her parca ayri kisilirsa yigin dagilir
  const kop = g.secimler.slice().sort((a, b) => a.p.x - b.p.x);
  bak("kopyalar arası mesafe korundu",
    Math.round(kop[1].p.x - kop[0].p.x) === 60 &&
    Math.round(kop[2].p.x - kop[1].p.x) === 60,
    kop.map(p => Math.round(p.p.x)).join(","));
  bak("kopyalar kaymış (üst üste binmiyor)",
    kop[0].p.x > 300 && kop[0].p.y > 600, `${kop[0].p.x},${kop[0].p.y}`);

  // Bos alana kutu: kopyalanacak bir sey yok
  g.parcalar = [];
  g.secimYap([]);
  kutuCiz(100, 100, 200, 200);
  bak("boş kutu parça üretmiyor", g.parcalar.length === 0,
    g.parcalar.length + " parça");

  // Ctrl+D secimi cogaltiyor
  g.parcalar = [];
  domino(300, 600); domino(360, 600);
  g.secimYap(g.parcalar.slice());
  g.cogaltSecim();
  bak("Ctrl+D seçimi çoğaltıyor", g.parcalar.length === 4,
    g.parcalar.length + " parça");

  // Stok yetmezse HICBIRI kopyalanmiyor (yarim yigin birakmak yasak)
  const stoklu = g.BOLUMLER.findIndex(b => b.stok && b.stok.domino > 0 &&
                                           b.stok.domino < 99);
  if (stoklu >= 0) {
    g.bolumKur(stoklu);
    g.parcalar = [];
    const kota = g.BOLUMLER[stoklu].stok.domino;
    for (let i = 0; i < kota; i++) domino(200 + i * 40, 600);
    g.secimYap(g.parcalar.slice());
    g.cogaltSecim();
    bak("stok yetmeyince hiçbiri kopyalanmıyor", g.parcalar.length === kota,
      `kota=${kota}, parça=${g.parcalar.length}`);
  }

  /* ---- 7. bolum: kutuphane + tahtayi bosaltma ---- *
     Olculen sey: adiyla kaydedilen makine geri geliyor mu, hangi BOLUMDE
     aciliyor, ve bosaltma iki adima bolunup geri alinabiliyor mu. */
  console.log("\n--- kütüphane ve boşaltma ---");

  g.localStorage.removeItem("rube-arsiv");
  g.bolumKur(SERBEST);
  g.parcalar = [];
  g.secimYap([]);
  domino(300, 600); domino(360, 600);

  bak("boş adla kaydetmiyor", g.arsivKaydet("   ") === false && g.arsivOku().length === 0);
  bak("adıyla kaydediyor", g.arsivKaydet("merdiven") === true && g.arsivOku().length === 1);
  bak("kayıt bölümü de saklıyor", g.arsivOku()[0].bolum === g.BOLUMLER[SERBEST].id,
    g.arsivOku()[0].bolum);

  // Ayni ad = uzerine yazma, ikinci kayit acilmiyor
  domino(420, 600);
  g.arsivKaydet("merdiven");
  bak("aynı ad üzerine yazıyor",
    g.arsivOku().length === 1 && g.arsivOku()[0].parcalar.length === 3,
    g.arsivOku().length + " kayıt / " + g.arsivOku()[0].parcalar.length + " parça");

  // Baska bolume gecip yukleyince KAYITTAKI bolume donuyor
  g.bolumKur(0);
  g.parcalar = [];
  g.arsivYukle("merdiven");
  bak("yükleyince kendi bölümünde açılıyor", g.bolumNo === SERBEST, "bölüm=" + g.bolumNo);
  bak("yüklenen makine tahtada", g.parcalar.length === 3, g.parcalar.length + " parça");

  // Bos tahta kaydedilmiyor
  g.parcalar = [];
  bak("boş tahta kaydedilmiyor", g.arsivKaydet("bos") === false && g.arsivOku().length === 1);

  g.arsivSilKayit("merdiven");
  bak("kayıt silinebiliyor", g.arsivOku().length === 0);

  // Bosaltma: ilk tiklama SORAR, ikincisi siler
  g.parcalar = [];
  domino(300, 600); domino(360, 600);
  g.temizleTikla();
  bak("ilk tıklama silmiyor, soruyor", g.parcalar.length === 2,
    g.parcalar.length + " parça");
  g.temizleTikla();
  bak("ikinci tıklama boşaltıyor", g.parcalar.length === 0);
  g.temizleGeriAl();
  bak("Ctrl+Z geri getiriyor", g.parcalar.length === 2, g.parcalar.length + " parça");

  console.log(hata ? `\n${hata} test başarısız` : "\nhepsi geçti");
  process.exit(hata ? 1 : 0);
})();
