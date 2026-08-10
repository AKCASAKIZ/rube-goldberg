/* ------------------------------------------------------------------ *
 *  Bolum cozulebilirlik testi
 *
 *      node bolum-testi.js            # hepsi
 *      node bolum-testi.js seesaw     # tek bolum
 *
 *  Her bolum icin bir REFERANS COZUM tutuluyor ve motorda kosturuluyor.
 *  Olculen sey "bolum guzel mi" degil, cevabi kesin olan uc soru:
 *
 *    1. Bolum cozulebiliyor mu?  (kazanildi)
 *    2. Cozum bolumun STOGUNA sigiyor mu?  (oyuncuya vermedigin parcayla
 *       cozulen bolum aslinda cozulemez)
 *    3. Uc yildiz gercekten alinabiliyor mu?  (parca hedefi + sure/temiz)
 *
 *  Yildiz hedefi elle secilirse ulasilamaz olabilir; burasi onu yakaliyor.
 *  Referans cozum "tek dogru cozum" degil, VAR OLAN bir cozum: bolumun
 *  duvarlari degisince buradaki koordinatlar da guncellenmeli.
 * ------------------------------------------------------------------ */

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const KOK = __dirname;

function motorKur() {
  const kaynak = fs.readFileSync(path.join(KOK, "index.html"), "utf8")
    .match(/<script>([\s\S]*)<\/script>/)[1];
  const yut = new Proxy(function () {}, {
    get: (t, k) => (k === "width" ? 1000 : k === "height" ? 640
      : k === "left" || k === "top" ? 0 : k === "length" ? 0 : yut),
    set: () => true, apply: () => yut, has: () => true,
  });
  const kutu = {
    document: { getElementById: () => yut, createElement: () => yut,
      createTextNode: () => yut, querySelector: () => yut,
      querySelectorAll: () => [],                 // tahtaPayiTazele icin
      addEventListener: () => {},
      documentElement: { style: { setProperty: () => {} } },
      hidden: false, title: "" },
    navigator: { language: "en" },
    localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
    performance: { now: () => 0 },
    requestAnimationFrame: () => 0, setTimeout: () => {}, clearTimeout: () => {},
    innerWidth: 1400, innerHeight: 900, addEventListener: () => {},
    console, URL: { createObjectURL: () => "", revokeObjectURL: () => "" },
    MediaRecorder: function () {},
    Blob: globalThis.Blob, Response: globalThis.Response,
    CompressionStream: globalThis.CompressionStream,
    DecompressionStream: globalThis.DecompressionStream,
    btoa: globalThis.btoa, atob: globalThis.atob,
    TextEncoder, TextDecoder,
    location: { href: "http://yerel/index.html", hash: "" },
    history: { replaceState: () => {} },
  };
  kutu.window = kutu; kutu.globalThis = kutu;
  vm.createContext(kutu);
  vm.runInContext(kaynak + `
    Object.defineProperties(globalThis, {
      BOLUMLER:{get:()=>BOLUMLER},
      parcalar:{get:()=>parcalar,set:x=>{parcalar=x}},
      bilye:{get:()=>bilye}, ADIM:{get:()=>ADIM}, simT:{get:()=>simT},
      kazanildi:{get:()=>kazanildi}, melodiFazla:{get:()=>melodiFazla},
      basladiT:{get:()=>basladiT},
    });`, kutu);
  return kutu;
}

const v = (x, y) => ({ x, y });

/** Bolumu referans cozumle kos. {kazandi, sure, fazla} dondurur. */
function kos(g, bolumId, coz, azamiSn = 30) {
  const i = g.BOLUMLER.findIndex(b => b.id === bolumId);
  if (i < 0) throw new Error("bilinmeyen bolum: " + bolumId);
  g.bolumKur(i);
  g.parcalar = coz.map(p => ({ ...p }));
  g.basla();
  let t = 0;
  while (t < azamiSn && !g.kazanildi && g.bilye) {
    g.fizikAdimi(g.ADIM); g.parcaAdimi(g.ADIM); t += g.ADIM;
  }
  return { kazandi: g.kazanildi, sure: g.simT - g.basladiT, fazla: g.melodiFazla };
}

/* ---- referans cozumler ------------------------------------------- *
 *  Her biri: bolumun stoguyla kurulabilen, kazanan bir makine.
 * ------------------------------------------------------------------ */

const ramp = (x1, y1, x2, y2, nota) =>
  ({ tur: "ramp", a: v(x1, y1), b: v(x2, y2), ...(nota ? { nota } : {}) });
const parca = (tur, x, y, ek = {}) => ({ tur, p: v(x, y), ...ek });

const COZUMLER = {};

/* "1 · Isinma" — 2 rampa, top zemine inip zile yuvarlaniyor.
   Zil zeminden 44 px yuksekte ve top yaricapi 13: zeminde yuvarlanan topun
   merkezi zile 31 px kaliyor, yani zemin seviyesi zili CALIYOR. */
COZUMLER["0"] = [
  ramp(79, 205, 564, 419),
  ramp(507, 427, 888, 587),
];

/* "2 · Domino" — 2 rampa + 4 domino.
   !! Zincir HAVADA kuruluyor (taban y=560), zemine degil. Sebebi olculdu:
   devrilen domino neredeyse yatay duruyor (ucu tabandan yalnizca ~4 px
   yukarida), yani zemine (y=610) dikilen bir dominonun ucu zile (y=566)
   en iyi ihtimalle 40 px kaliyor - zil 30 px'te caliyor, yani zemin
   zinciriyle bu bolum COZULEMEZ. Ikinci rampa topu zincir hizasina tasiyor. */
COZUMLER["1"] = [
  ramp(75, 185, 467, 350),
  ramp(466, 390, 655, 549),
  parca("domino", 686, 560),
  parca("domino", 734, 560),
  parca("domino", 782, 560),
  parca("domino", 830, 560),
];

/* "3 · Ziplat" — 2 rampa + firlatici.
   Top duvarin ustunden (tepe y=300) gecip firlaticiya dusuyor, firlatici
   820 px/s ile yukari atiyor (=224 px yukselme) ve zile variyor.
   !! Bolum yalnizca 2 rampayla da cozuluyor (olculdu: 13,45 sn) - bkz. README
   "Bilinen sinirlar". Firlaticili yol 7,6 sn, yani 13 sn'lik yildiz hedefini
   tutan yol bu. */
COZUMLER["2"] = [
  ramp(87, 106, 399, 227),
  ramp(215, 228, 745, 273),
  parca("launcher", 792, 360),
];

/* "4 · Ilk melodi" — 3 rampa, uc uca. C4 E4 G4.
   !! TEMIZLIK KALIBI: rampalar birbirinin UCUNDAN basliyor. Ayrik rampalarda
   top serbest dusup sekiyor ve ayni parcaya 0,09 sn'den gec gelen ikinci
   carpma AYRI VURUS sayiliyor (carpmaOlayi) - o da yanlis nota, yani "fazla".
   Olculdu: ayrik yerlesimle 1025 kazanan adayin 0'i temizdi, uc uca
   baglayinca temiz kosu cikti. */
COZUMLER["melodi1"] = [
  ramp(79, 112, 226, 320, "C4"),
  ramp(226, 320, 482, 512, "E4"),
  ramp(482, 512, 743, 569, "G4"),
];

/* "5 · Bes nota" — 4 rampa + 1 domino. G4 E4 C5 G4 C4.
   Stokta 4 rampa var, melodi 5 nota istiyor: son notayi domino veriyor.
   Kalip jingle makinesinden alindi - neredeyse yatay kisa rampalar, her biri
   oncekinin ucundan ~26 px asagida. Melodi bolumunde zile varmak gerekmiyor:
   kazanma kosulu notalarin sirasi. */
COZUMLER["melodi2"] = [
  ramp(48, 99, 112, 107, "G4"),
  ramp(83, 125, 149, 133, "E4"),
  ramp(120, 152, 192, 160, "C5"),
  ramp(163, 178, 225, 186, "G4"),
  { tur: "domino", p: v(251, 256), aci: 0, aciHiz: 0, nota: "C4" },
];

/* "6 · Jingle Bells" — 11 rampa.
   Uretilmedi, VAR OLANDAN alindi: index.html'deki ORNEKLER dizisinin
   paylasma kodu koduCoz ile acildi. Yani oyunun oyuncuya "ornek" diye
   sundugu makinenin ta kendisi; bozulursa ornek de bozulmus demektir. */
COZUMLER["jingle"] = [
  ramp(46, 100, 96, 108, "E4"),
  ramp(72, 126, 130, 134, "E4"),
  ramp(106, 152, 172, 160, "E4"),
  ramp(148, 258, 242, 266, "E4"),
  ramp(218, 284, 300, 292, "E4"),
  ramp(276, 310, 366, 318, "E4"),
  ramp(342, 416, 460, 424, "E4"),
  ramp(436, 442, 542, 450, "G4"),
  ramp(518, 468, 632, 476, "C4"),
  ramp(608, 494, 730, 502, "D4"),
  ramp(706, 520, 836, 528, "E4"),
];

/* "3" (Serbest) referans cozum ALMIYOR: yildiz hedefi yok, stok sinirsiz -
   olculecek bir sey yok. */

/* ---- kosum ------------------------------------------------------- */

let gecen = 0, kalan = 0;
function ol(ad, kosul, ek = "") {
  if (kosul) { gecen++; console.log(`OK   ${ad}${ek ? "  (" + ek + ")" : ""}`); }
  else { kalan++; console.log(`HATA ${ad}${ek ? "  (" + ek + ")" : ""}`); }
}

function main() {
  const g = motorKur();
  const istenen = process.argv[2];
  const idler = Object.keys(COZUMLER).filter(id => !istenen || id === istenen);
  if (!idler.length) { console.log("cozumu olan bolum yok"); return; }

  for (const id of idler) {
    const b = g.BOLUMLER.find(x => x.id === id);
    const coz = COZUMLER[id];
    console.log(`\n--- ${b ? b.ad : id} ---`);

    // 2. stok: cozum bolumun verdigi parcalarla kurulabiliyor mu?
    const sayim = {};
    coz.forEach(p => { sayim[p.tur] = (sayim[p.tur] || 0) + 1; });
    const stokTamam = Object.entries(sayim).every(([tur, n]) => {
      const st = b.stok[tur];
      return st === null || (st !== undefined && n <= st);
    });
    ol("cozum bolumun stoguna siğiyor", stokTamam, JSON.stringify(sayim));

    // 1. cozulebiliyor mu?
    const r = kos(g, id, coz);
    ol("cozulebiliyor", r.kazandi, r.kazandi ? `${r.sure.toFixed(1)} sn` : "kazanamadi");
    if (!r.kazandi) continue;

    // 3. uc yildiz ulasilabilir mi?
    const h = b.yildiz;
    if (h) {
      ol("parca hedefi tutuyor", coz.length <= h.parca, `${coz.length} ≤ ${h.parca}`);
      if (h.temiz) ol("temiz kosu mumkun", r.fazla === 0, `fazla ${r.fazla}`);
      else ol("sure hedefi tutuyor", r.sure <= h.sure, `${r.sure.toFixed(1)} ≤ ${h.sure} sn`);
    }
  }

  console.log(kalan ? `\n${kalan} basarisiz, ${gecen} gecti` : `\nhepsi gecti (${gecen})`);
  if (kalan) process.exit(1);
}

module.exports = { motorKur, kos, ramp, parca, v, COZUMLER };
if (require.main === module) main();
