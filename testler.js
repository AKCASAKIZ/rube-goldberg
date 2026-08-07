/* ------------------------------------------------------------------ *
 *  Fizik testleri. Tarayici konsolunda:  await testleriKos()
 *
 *  Gercek zamani beklemiyor: fizik adimlari elle donduruluyor, yani
 *  sonuclar deterministik ve test aninda bitiyor. rAF dongusunun ayni
 *  anda adim atmamasi icin `calisiyor` kapatiliyor.
 * ------------------------------------------------------------------ */

window.testleriKos = async function () {
  const sonuc = [];
  // Bolum indisi sabit degil (araya melodi bolumleri girdi): id ile bulunuyor.
  const SERBEST = BOLUMLER.findIndex(b => b.id === "3");

  /** Sahneyi kurar, N adim dondurur, olcum nesnesi dondurur. */
  function kos(bolum, kurulum, adim = 2400) {
    ustGizle();
    bolumKur(bolum);
    parcalar = [];
    kurulum();
    basla();
    calisiyor = false;                 // rAF dongusu karismasin
    const olcum = { enYuksek: 1e9, enHizliYukari: 0, enSagX: -1e9, enSolX: 1e9,
                    enBuyukAci: 0 };
    for (let i = 0; i < adim; i++) {
      parcaAdimi(ADIM);
      if (bilye) fizikAdimi(ADIM);
      if (bilye) {
        olcum.enYuksek = Math.min(olcum.enYuksek, bilye.p.y);
        olcum.enHizliYukari = Math.min(olcum.enHizliYukari, bilye.h.y);
        olcum.enSagX = Math.max(olcum.enSagX, bilye.p.x);
        olcum.enSolX = Math.min(olcum.enSolX, bilye.p.x);
      }
      // Aci koşu SONUNDA olculemez: kaldirac topu birakinca dengeye doner,
      // yani son deger her zaman 0'a yakin cikar. Tepe deger olculuyor.
      for (const p of parcalar) {
        if (p.aci !== undefined) olcum.enBuyukAci = Math.max(olcum.enBuyukAci, Math.abs(p.aci));
      }
    }
    olcum.kazanildi = kazanildi;
    olcum.bilye = bilye ? { x: Math.round(bilye.p.x), y: Math.round(bilye.p.y) } : null;
    return olcum;
  }

  function bekle(ad, kosul, ayrinti) {
    sonuc.push({ ad, gecti: !!kosul, ayrinti });
  }

  const rampa = (ax, ay, bx, by) => parcalar.push({ tur: "ramp", a: v(ax, ay), b: v(bx, by) });

  /* 1 - rampa: top yuvarlanip zili caliyor */
  let o = kos(0, () => rampa(60, 150, 700, 430));
  bekle("rampa → top → zil", o.kazanildi, o.bilye);

  /* 2 - domino zinciri zili caliyor */
  o = kos(1, () => {
    rampa(60, 150, 690, 430);
    [745, 785, 825, 865].forEach(x =>
      parcalar.push({ tur: "domino", p: v(x, 610), boy: 54, aci: 0, aciHiz: 0 }));
  });
  const acilar = parcalar.filter(p => p.tur === "domino").map(p => Math.round(p.aci * 57));
  bekle("domino zinciri → zil", o.kazanildi, acilar);

  /* 3 - firlatici topu yukari atiyor */
  o = kos(2, () => {
    rampa(60, 150, 400, 430);
    parcalar.push({ tur: "launcher", p: v(520, 600), parla: 0 });
  });
  bekle("fırlatıcı topu atıyor", o.enHizliYukari < -400, Math.round(o.enHizliYukari));

  /* 4 - tahterevalli topun agirligiyla egiliyor.
     Top dogrudan kaldiracin uzerine dusuyor: rampadan gelen top ucuna
     tegetlerse sekip gidiyor ve kaldirac hic yuklenmiyor. */
  o = kos(2, () => {
    parcalar.push({ tur: "seesaw", p: v(120, 300), yari: 78, aci: 0, aciHiz: 0 });
  }, 1200);
  const egim = Math.round(o.enBuyukAci * 57);
  bekle("tahterevalli eğiliyor", egim > 5, egim + "°");

  /* 5 - trambolin sektiriyor */
  o = kos(SERBEST, () => {
    parcalar.push({ tur: "trampoline", p: v(90, 520), gerginlik: 0 });
  }, 900);
  bekle("trambolin sektiriyor", o.enHizliYukari < -300, Math.round(o.enHizliYukari));

  /* 6 - konveyor topu saga tasiyor: duz dusen top yana kaymali */
  o = kos(SERBEST, () => {
    [120, 220, 320].forEach(x => parcalar.push({ tur: "beltR", p: v(x, 608), faz: 0 }));
  }, 1800);
  bekle("konveyör sağa taşıyor", o.enSagX > 250, Math.round(o.enSagX));

  /* 7 - ufleyici topu yukari itiyor (yukari hiz uretmeli) */
  o = kos(SERBEST, () => {
    parcalar.push({ tur: "fan", p: v(90, 600), faz: 0 });
  }, 900);
  bekle("üfleyici kaldırıyor", o.enHizliYukari < -150, Math.round(o.enHizliYukari));

  /* 8 - miknatis topu kendine cekiyor */
  o = kos(SERBEST, () => {
    parcalar.push({ tur: "magnet", p: v(200, 150) });
  }, 700);
  bekle("mıknatıs çekiyor", o.enSagX > 150, Math.round(o.enSagX));

  /* 9 - doner tabla topu dondugu yone tasiyor.
     Merkezin tam ustune dusen top hicbir yere gitmez (orada yuzey hizi
     sifir); test topu bilerek merkezden kacik dusuyor. */
  o = kos(SERBEST, () => {
    parcalar.push({ tur: "spinR", p: v(60, 400), faz: 0 });
  }, 900);
  bekle("döner tabla sağa taşıyor", o.enSagX > 150, Math.round(o.enSagX));

  /* 10 - ters yonlu tabla topu sola tasiyor (ayni kurulumun aynasi) */
  o = kos(SERBEST, () => {
    parcalar.push({ tur: "spinL", p: v(120, 400), faz: 0 });
  }, 900);
  bekle("ters tabla sola taşıyor", o.enSolX < 60, Math.round(o.enSolX));

  /* 11 - melodi bolumu: notalari SIRAYLA calan makine kazaniyor.
     Rampalar topun yolunda soldan saga siralandigi icin carpma sirasi
     bilinir; notalari hedef melodiye gore veriyoruz. */
  const MELODI1 = BOLUMLER.findIndex(b => b.id === "melodi1");
  o = kos(MELODI1, () => {
    const hedef = BOLUMLER[MELODI1].melodi;
    rampa(60, 150, 330, 300); parcalar[0].nota = hedef[0];
    rampa(300, 330, 620, 470); parcalar[1].nota = hedef[1];
    rampa(600, 500, 900, 600); parcalar[2].nota = hedef[2];
  }, 3000);
  bekle("melodi sırayla çalınınca kazanılıyor", o.kazanildi,
    `${melodiSira}/${BOLUMLER[MELODI1].melodi.length} nota, ${melodiFazla} fazla`);

  /* 12 - yanlis siradaki ayni notalar kazandirmiyor */
  o = kos(MELODI1, () => {
    const hedef = BOLUMLER[MELODI1].melodi;
    rampa(60, 150, 330, 300); parcalar[0].nota = hedef[2];   // ters sira
    rampa(300, 330, 620, 470); parcalar[1].nota = hedef[1];
    rampa(600, 500, 900, 600); parcalar[2].nota = hedef[0];
  }, 3000);
  bekle("ters sırada çalınca kazanılmıyor", !o.kazanildi,
    `${melodiSira}/3 nota, ${melodiFazla} fazla`);

  /* 13 - melodi bolumunde zile degmek kazandirmamali */
  o = kos(MELODI1, () => rampa(60, 150, 930, 560), 3000);
  bekle("melodi bölümünde zil kazandırmıyor", !o.kazanildi, o.bilye);

  /* 14 - yildizlar: az parcayla hizli bitirmek 3 yildiz vermeli */
  o = kos(0, () => rampa(60, 150, 700, 430));
  let y = yildizHesapla();
  bekle("temiz koşu 3 yıldız", o.kazanildi && y && y.sayi === 3,
    y && `${y.sayi} yıldız (parça ${y.parcaTamam}, süre ${y.ikinciTamam})`);

  /* 15 - hedefin ustunde parca kullanmak bir yildiz goturmeli */
  o = kos(0, () => {
    rampa(60, 150, 700, 430);
    [200, 300, 400].forEach(x => rampa(x, 620, x + 40, 620));   // gereksiz parcalar
  });
  y = yildizHesapla();
  bekle("fazla parça yıldız düşürüyor", o.kazanildi && y && y.sayi === 2,
    y && `${y.sayi} yıldız, ${parcalar.length} parça`);

  durdur();
  bolumKur(0);
  // Zil kutlamasi 420 ms gecikmeli aciliyor: testler bitince kalan
  // "Zil caldi" perdesini kapat.
  setTimeout(ustGizle, 700);

  const gecen = sonuc.filter(s => s.gecti).length;
  console.table(sonuc);
  return `${gecen}/${sonuc.length} test geçti\n` +
    sonuc.map(s => `${s.gecti ? "OK  " : "HATA"} ${s.ad}  (${JSON.stringify(s.ayrinti)})`).join("\n");
};
