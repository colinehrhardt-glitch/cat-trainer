function zaehlRaster(zeilen, spalten, ziel, andere) {
  const anzahl = zeilen * spalten;
  const k = H.zufall(Math.round(anzahl * 0.16), Math.round(anzahl * 0.3));
  const plaetze = new Set(H.mische(Array.from({ length: anzahl }, (_, i) => i)).slice(0, k));
  return { k, felder: Array.from({ length: anzahl }, (_, i) => (plaetze.has(i) ? ziel() : andere())) };
}

function d2Zeichen(z, x, y, markiert) {
  let t = markiert ? `<rect x="${x - 12}" y="${y - 25}" width="24" height="50" rx="5" class="hl"/>` : '';
  t += S.text(x, y, z.b, 'kz', 21);
  const striche = (anzahl, y1, y2) => {
    let s = '';
    for (let i = 0; i < anzahl; i++) {
      const dx = anzahl === 1 ? 0 : (i === 0 ? -3.5 : 3.5);
      s += `<line x1="${x + dx}" y1="${y1}" x2="${x + dx}" y2="${y2}" class="ks"/>`;
    }
    return s;
  };
  return t + striche(z.o, y - 22, y - 15) + striche(z.u, y + 15, y + 22);
}

function zeichenzaehlen(n) {
  if (n <= 2) {
    const [ziel, alle, zeilen, spalten] = n === 1
      ? [H.wahl(['8', '6', '3']), ['3', '5', '6', '8', '9', '0'], 5, 8]
      : [H.wahl(['d', 'b']), ['b', 'd', 'p', 'q'], 6, 9];
    const r = zaehlRaster(zeilen, spalten, () => ziel, () => H.wahl(alle.filter(x => x !== ziel)));
    const bild = markiert => {
      let t = '';
      r.felder.forEach((z, i) => {
        const x = 18 + (i % spalten) * 30, y = 20 + Math.floor(i / spalten) * 34;
        if (markiert && z === ziel) t += `<rect x="${x - 12}" y="${y - 14}" width="24" height="28" rx="5" class="hl"/>`;
        t += S.text(x, y, z, 'kz', 22);
      });
      return `<div class="bild-mitte">${S.svg(spalten * 30 + 6, zeilen * 34 + 6, t, 'raster')}</div>`;
    };
    return {
      frage: `Wie oft kommt das Zeichen „${ziel}“ vor?`,
      bild: bild(false),
      ...H.optionen(r.k, [r.k + 1, r.k - 1, r.k + 2, r.k - 2, r.k + 3]),
      erklaerung: [`Das Zeichen „${ziel}“ kommt ${r.k}-mal vor.`, 'Tipp: Zeile für Zeile von links nach rechts zählen.'],
      loesungsbild: bild(true)
    };
  }
  const [zeilen, spalten] = { 3: [4, 10], 4: [5, 12], 5: [6, 14] }[n];
  const ziel = () => {
    const o = H.zufall(0, 2);
    return { b: 'd', o, u: 2 - o };
  };
  const andere = () => {
    for (;;) {
      const b = Math.random() < 0.55 ? 'd' : 'p', o = H.zufall(0, 2), u = H.zufall(0, 2);
      if (o + u === 0) continue;
      if (b === 'd' && o + u === 2) continue;
      return { b, o, u };
    }
  };
  const r = zaehlRaster(zeilen, spalten, ziel, andere);
  const bild = markiert => {
    let t = '';
    r.felder.forEach((z, i) => {
      const x = 16 + (i % spalten) * 26, y = 30 + Math.floor(i / spalten) * 58;
      t += d2Zeichen(z, x, y, markiert && z.b === 'd' && z.o + z.u === 2);
    });
    return `<div class="bild-mitte">${S.svg(spalten * 26 + 6, zeilen * 58 + 4, t, 'raster')}</div>`;
  };
  return {
    frage: 'Wie oft kommt ein „d“ mit genau zwei Strichen vor? Die Striche können oben, unten oder verteilt sein.',
    bild: bild(false),
    ...H.optionen(r.k, [r.k + 1, r.k - 1, r.k + 2, r.k - 2, r.k + 3]),
    erklaerung: [`Gesucht sind nur „d“ mit genau zwei Strichen. Es sind ${r.k}.`, 'Achte auf „p“ mit zwei Strichen und auf „d“ mit drei Strichen. Die zählen nicht.'],
    loesungsbild: bild(true)
  };
}

const VERWECHSLER = { '0': 'O', 'O': '0', '1': 'I', 'I': '1', '5': 'S', 'S': '5', '8': 'B', 'B': '8', '2': 'Z', 'Z': '2', '6': 'G', 'G': '6' };
const SYMBOL_PAARE = { '▲': '△', '△': '▲', '●': '○', '○': '●', '■': '□', '□': '■', '◆': '◇', '◇': '◆' };

function symbolvergleich(n) {
  const [zeilen, laenge] = { 1: [4, 4], 2: [5, 5], 3: [5, 6], 4: [6, 7], 5: [6, 7] }[n];
  const zeichen = n === 5 ? Object.keys(SYMBOL_PAARE) : n >= 3 ? 'ABDEGHKMNPRSTUZ0125689'.split('') : 'ACEFHKLMNPRTUX3479'.split('');
  const gleich = H.zufall(0, zeilen);
  const gleicheZeilen = new Set(H.mische(Array.from({ length: zeilen }, (_, i) => i)).slice(0, gleich));
  const reihen = Array.from({ length: zeilen }, (_, i) => {
    const links = Array.from({ length: laenge }, () => H.wahl(zeichen));
    const rechts = links.slice();
    let stelle = -1;
    if (!gleicheZeilen.has(i)) {
      const verwechselbar = links.some(z => VERWECHSLER[z]);
      for (;;) {
        const p = H.zufall(0, laenge - 1);
        let art = n <= 2 ? 'ersetzen' : n === 5 ? 'symbol' : n === 4 && Math.random() < 0.4 ? 'tausch' : 'verwechsler';
        if (art === 'verwechsler' && !verwechselbar) art = 'ersetzen';
        if (art === 'tausch') {
          if (p === laenge - 1 || links[p] === links[p + 1]) continue;
          [rechts[p], rechts[p + 1]] = [rechts[p + 1], rechts[p]];
        } else if (art === 'symbol') {
          rechts[p] = SYMBOL_PAARE[links[p]];
        } else if (art === 'verwechsler') {
          if (!VERWECHSLER[links[p]]) continue;
          rechts[p] = VERWECHSLER[links[p]];
        } else {
          const neu = H.wahl(zeichen.filter(z => z !== links[p]));
          rechts[p] = neu;
        }
        stelle = p;
        break;
      }
    }
    return { links, rechts, stelle };
  });
  const bild = markiert => {
    const b = laenge * 17 + 10;
    let t = '';
    reihen.forEach((r, i) => {
      const y = 22 + i * 38;
      const zeichne = (liste, x0, andere) => liste.map((z, k) => {
        const anders = markiert && z !== andere[k];
        return (anders ? `<rect x="${x0 + k * 17 - 1}" y="${y - 14}" width="17" height="28" rx="4" class="hl"/>` : '') + S.text(x0 + k * 17 + 7.5, y, z, 'kz', 20);
      }).join('');
      t += zeichne(r.links, 10, r.rechts) + `<line x1="${b + 12}" y1="${y - 14}" x2="${b + 12}" y2="${y + 14}" class="wt"/>` + zeichne(r.rechts, b + 24, r.links);
      if (markiert) t += S.text(2 * b + 40, y, r.stelle < 0 ? '✓' : '✗', r.stelle < 0 ? 'ok' : 'nok', 18);
    });
    return `<div class="bild-mitte">${S.svg(2 * b + (markiert ? 56 : 30), zeilen * 38 + 6, t, 'vergleich')}</div>`;
  };
  const gleicheNr = reihen.map((r, i) => (r.stelle < 0 ? i + 1 : 0)).filter(Boolean);
  return {
    frage: 'Wie viele Zeilen sind links und rechts genau gleich?',
    bild: bild(false),
    ...H.optionen(gleich, [gleich + 1, gleich - 1, gleich + 2, gleich - 2].filter(x => x >= 0 && x <= zeilen), null, { schritt: 1 }),
    erklaerung: [gleicheNr.length ? `Genau gleich ${gleicheNr.length === 1 ? 'ist Zeile' : 'sind die Zeilen'} ${H.und(gleicheNr.map(String))}.` : 'Keine Zeile ist genau gleich.', 'Vergleiche Zeichen für Zeichen. Achte auf ähnliche Zeichen wie 0 und O oder 8 und B.'],
    loesungsbild: bild(true)
  };
}

const REAKTION = {
  1: { farben: ['blau'], nogo: 0, zeit: 2000, pause: [900, 1900], seite: false },
  2: { farben: ['blau', 'orange'], nogo: 0, zeit: 1800, pause: [800, 1700], seite: false },
  3: { farben: ['blau', 'orange'], nogo: 0, zeit: 1400, pause: [700, 1500], seite: false },
  4: { farben: ['blau', 'orange'], nogo: 0.2, zeit: 1200, pause: [600, 1400], seite: false },
  5: { farben: ['blau', 'orange'], nogo: 0.2, zeit: 1000, pause: [500, 1200], seite: true }
};

function reaktionsSignal(n) {
  const c = REAKTION[n];
  const nogo = Math.random() < c.nogo;
  const farbe = nogo ? 'grau' : H.wahl(c.farben);
  const richtung = H.wahl([-1, 1]);
  return { farbe, richtung, seite: c.seite ? H.wahl([-1, 1]) : 0, ziel: nogo ? 0 : farbe === 'blau' ? richtung : -richtung };
}

function reaktionsPfeil(signal, klein) {
  const k = { blau: 'rb', orange: 'ro', grau: 'rg' }[signal.farbe];
  const pfeil = `<polygon points="10,40 52,8 52,28 110,28 110,52 52,52 52,72" class="${k}" transform="${signal.richtung > 0 ? 'translate(120 0) scale(-1 1)' : ''}"/>`;
  return S.svg(120, 80, pfeil, klein ? 'rpfeil klein' : 'rpfeil');
}
