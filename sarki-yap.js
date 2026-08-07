/* ------------------------------------------------------------------ *
 *  Sarki makinesi ureteci
 *
 *      node sarki-yap.js "E4 E4 E4 E4 E4 E4 E4 G4 C4 D4 E4" --uzun 2,5
 *
 *  Verilen nota dizisini CALAN bir makine tasarlar, motorda kosturarak
 *  DOGRULAR ve paylasma linkini basar. Gozle tasarlayip "herhalde calar"
 *  demek yerine olcum: makine ancak dizinin tamamini dogru sirayla ve
 *  fazladan vurus olmadan calarsa kabul ediliyor.
 *
 *  --uzun a,b   : bu notalardan SONRA uzun bosluk (0'dan sayan indisler).
 *                 Jingle Bells'te 3. ve 6. nota uzun -> "--uzun 2,5".
 *  --bolum id   : hangi bolumde kurulacak (varsayilan: serbest, id "3")
 *
 *  TASARIM: asagi inen bir rampa merdiveni. Top her basamaga bir kez
 *  duser (vurus = nota), uzerinde kayar, ucundan dusup bir sonrakine gecer.
 *  Iki tuzak pahaliya patladi, ikisi de burada cozulu:
 *
 *  1. Top tam UCA duserse orada dengede kalir (uc noktada normal dik
 *     yukari, tegetsel kuvvet sifir) ve makine hic baslamaz. Bu yuzden
 *     her basamak bir oncekinin bittigi noktanin GERISINDEN basliyor
 *     (`tasma`), top egimli kisma dusuyor.
 *  2. Top indikce hizlanir; sabit boyda basamaklarla ritim hizlanarak
 *     bitiyordu (olculdu: 1,35 sn -> 0,36 sn). Bu yuzden basamaklar
 *     asagi indikce UZUYOR (`artis`) - gecis suresi sabit kaliyor.
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
      addEventListener: () => {}, documentElement: {}, hidden: false, title: "" },
    navigator: { language: "en" },
    localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
    performance: { now: () => 0 },
    requestAnimationFrame: () => 0, setTimeout: () => {}, clearTimeout: () => {},
    innerWidth: 1400, innerHeight: 900, addEventListener: () => {},
    console, URL: { createObjectURL: () => "", revokeObjectURL: () => {} },
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
      BOLUMLER:{get:()=>BOLUMLER}, NOTALAR:{get:()=>NOTALAR},
      parcalar:{get:()=>parcalar,set:x=>{parcalar=x}},
      bilye:{get:()=>bilye}, ADIM:{get:()=>ADIM}, simT:{get:()=>simT},
      kazanildi:{get:()=>kazanildi},
    });`, kutu);
  return kutu;
}

/** Makineyi kos, calinan notalari (sirasi ve zamaniyla) dondur. */
function cal(g, bolumNo, parcalar, azamiSn = 25) {
  g.bolumKur(bolumNo);
  g.parcalar = parcalar.map(p => ({ ...p }));
  const c = [];
  g.melodiVurus = p => c.push({ nota: p.nota, t: g.simT });
  g.basla();
  let t = 0;
  while (t < azamiSn && g.bilye) { g.fizikAdimi(g.ADIM); g.parcaAdimi(g.ADIM); t += g.ADIM; }
  return c;
}

function merdiven(notalar, { boy0, artis, ara, dusus, tasma, ekAra, ekBoy, uzun }) {
  const p = [];
  let x = 46, y = 100;
  for (let i = 0; i < notalar.length; i++) {
    const boy = boy0 + i * artis + (uzun.includes(i - 1) ? ekBoy : 0);
    if (x + boy > 985 || y + dusus > 585) return null;       // tahtaya sigmadi
    p.push({ tur: "ramp", a: { x, y }, b: { x: x + boy, y: y + dusus }, nota: notalar[i] });
    x += boy - tasma;
    y += ara + (uzun.includes(i) ? ekAra : 0);
  }
  return p;
}

/* Ritim puani (kucuk = iyi). Uc sey birden olculuyor, cunku ucu de tek
   basina yaniltiyor:
     duzluk  - kisa araliklarin dagilimi. Ortalama iyi gorunurken tek bir
               0,11 sn'lik bosluk ezgiyi tokezletiyor, o yuzden EN KOTU
               sapma da cezalandiriliyor (yalnizca std yetmiyordu).
     oran    - uzun notalar kisalarin ~2 kati olmali.
     tempo   - kisa aralik 0,30-0,50 sn araliginda olmali. Disari cikinca
               ezgi ya kosuyor ya suruyor; ikisi de tanınmayi zorlastiriyor. */
const TEMPO_ALT = 0.30, TEMPO_UST = 0.50;
function ritimPuani(aralik, uzun) {
  const kisa = aralik.filter((_, i) => !uzun.includes(i));
  const uz = aralik.filter((_, i) => uzun.includes(i));
  const ok = kisa.reduce((s, x) => s + x, 0) / (kisa.length || 1);
  const std = Math.sqrt(kisa.reduce((s, x) => s + (x - ok) ** 2, 0) / (kisa.length || 1)) / ok;
  const enKotu = Math.max(...kisa.map(x => Math.abs(x - ok))) / ok;
  const tempo = ok < TEMPO_ALT ? (TEMPO_ALT - ok) / TEMPO_ALT
              : ok > TEMPO_UST ? (ok - TEMPO_UST) / TEMPO_UST : 0;
  const oran = uz.length
    ? Math.abs((uz.reduce((s, x) => s + x, 0) / uz.length) / ok - 2) : 0;
  return std + enKotu + oran + 2 * tempo;
}

function tasarla(g, bolumNo, notalar, uzun) {
  const hedef = notalar.join(" ");
  const adaylar = [];
  for (const boy0 of [50, 60, 70, 80])
  for (const artis of [4, 8, 12, 16])
  for (const ara of [26, 30, 34, 38])
  for (const dusus of [8, 10, 12, 16])
  for (const tasma of [24, 34])
  for (const ekAra of uzun.length ? [40, 60, 80, 100] : [0])
  for (const ekBoy of uzun.length ? [0, 20, 40] : [0]) {
    const t = merdiven(notalar, { boy0, artis, ara, dusus, tasma, ekAra, ekBoy, uzun });
    if (!t) continue;
    const c = cal(g, bolumNo, t);
    if (c.map(x => x.nota).join(" ") !== hedef) continue;     // dizi yanlis ya da eksik
    const aralik = c.slice(1).map((x, n) => x.t - c[n].t);
    adaylar.push({ t, puan: ritimPuani(aralik, uzun), aralik,
                   sure: c[c.length - 1].t - c[0].t });
  }
  adaylar.sort((a, b) => a.puan - b.puan);
  return adaylar;
}

async function main() {
  const arg = process.argv.slice(2);
  const dizi = (arg.find(a => !a.startsWith("--")) || "").trim();
  if (!dizi) {
    console.log('Kullanim: node sarki-yap.js "E4 E4 E4 G4 C4" [--uzun 2,5] [--bolum jingle]');
    process.exit(1);
  }
  const uzunArg = arg[arg.indexOf("--uzun") + 1];
  const uzun = arg.includes("--uzun") ? uzunArg.split(",").map(Number) : [];
  const bolumId = arg.includes("--bolum") ? arg[arg.indexOf("--bolum") + 1] : "3";

  const g = motorKur();
  const notalar = dizi.split(/\s+/);
  const gecersiz = notalar.filter(n => !g.NOTALAR.some(x => x.ad === n));
  if (gecersiz.length) {
    console.log("Dizide olmayan nota:", gecersiz.join(", "));
    console.log("Kullanilabilir:", g.NOTALAR.map(n => n.ad).join(" "));
    process.exit(1);
  }
  const bolumNo = g.BOLUMLER.findIndex(b => b.id === bolumId);
  if (bolumNo < 0) { console.log("Bolum yok:", bolumId); process.exit(1); }

  console.log(`${notalar.length} nota · bolum "${g.BOLUMLER[bolumNo].ad}" · uzun notalar: ${uzun.join(",") || "yok"}`);
  console.log("tasarim araniyor…");
  const adaylar = tasarla(g, bolumNo, notalar, uzun);
  console.log(`diziyi DOGRU calan tasarim: ${adaylar.length}`);
  if (!adaylar.length) {
    console.log("\nBulunamadi. Deneyebilecekleriniz:");
    console.log("  - daha az nota (11 nota tahtaya sigan ust sinira yakin)");
    console.log("  - --uzun vermeden dene (ek bosluklar yeri daraltiyor)");
    process.exit(2);
  }
  const en = adaylar[0];
  console.log(`secilen: ritim puani ${en.puan.toFixed(2)} · melodi ${en.sure.toFixed(2)} sn`);
  console.log("araliklar:", en.aralik.map(a => a.toFixed(2)).join(" "));

  g.bolumKur(bolumNo);
  g.parcalar = en.t.map(p => ({ ...p }));
  const kod = await g.makineKodu();
  fs.writeFileSync(path.join(KOK, "son-sarki.json"), JSON.stringify(en.t, null, 2));
  console.log("\nson-sarki.json yazildi ·", en.t.length, "rampa");
  console.log("\nPaylasma linki (tarayicida ac):");
  console.log("file://" + path.join(KOK, "index.html") + "#m=" + kod);
}

if (require.main === module) main();
module.exports = { motorKur, cal, tasarla, merdiven };
