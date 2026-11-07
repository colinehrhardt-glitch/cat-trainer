const V = {
  neg: v => v.map(x => -x),
  gleich: (a, b) => a[0] === b[0] && a[1] === b[1] && a[2] === b[2],
  mal: (m, v) => [0, 1, 2].map(i => m[i][0] * v[0] + m[i][1] * v[1] + m[i][2] * v[2])
};

const DREHUNGEN = (() => {
  const mm = (a, b) => [0, 1, 2].map(i => [0, 1, 2].map(j => a[i][0] * b[0][j] + a[i][1] * b[1][j] + a[i][2] * b[2][j]));
  const basis = [
    [[1, 0, 0], [0, 0, -1], [0, 1, 0]],
    [[0, 0, 1], [0, 1, 0], [-1, 0, 0]],
    [[0, -1, 0], [1, 0, 0], [0, 0, 1]]
  ];
  const alle = [[[1, 0, 0], [0, 1, 0], [0, 0, 1]]];
  const bekannt = new Set([JSON.stringify(alle[0])]);
  for (let i = 0; i < alle.length; i++) {
    basis.forEach(b => {
      const m = mm(b, alle[i]);
      const k = JSON.stringify(m);
      if (!bekannt.has(k)) {
        bekannt.add(k);
        alle.push(m);
      }
    });
  }
  return alle;
})();

const WSYMBOLE = {
  kreis: { sym: 4, name: 'Kreis', d: '<circle r="0.42" class="sv"/>' },
  ring: { sym: 4, name: 'Ring', d: '<circle r="0.42" class="sl"/>' },
  plus: { sym: 4, name: 'Plus', d: '<path d="M-0.5 0H0.5M0 -0.5V0.5" class="sl"/>' },
  kreuz: { sym: 4, name: 'Kreuz', d: '<path d="M-0.38 -0.38L0.38 0.38M0.38 -0.38L-0.38 0.38" class="sl"/>' },
  quadrat: { sym: 4, name: 'Quadrat', d: '<rect x="-0.36" y="-0.36" width="0.72" height="0.72" class="sa"/>' },
  raute: { sym: 4, name: 'Raute', d: '<polygon points="0,-0.52 0.52,0 0,0.52 -0.52,0" class="sl"/>' },
  pfeil: { sym: 1, name: 'Pfeil', d: '<path d="M0 0.52V-0.46M-0.34 -0.12L0 -0.48L0.34 -0.12" class="sl"/>' },
  dreieck: { sym: 1, name: 'Dreieck', d: '<polygon points="0,-0.5 0.46,0.4 -0.46,0.4" class="sv"/>' },
  ecke: { sym: 1, name: 'Eckpunkt', d: '<circle cx="-0.52" cy="-0.52" r="0.22" class="sa"/>' },
  halb: { sym: 1, name: 'Halbfeld', d: '<rect x="-0.72" y="-0.72" width="1.44" height="0.72" class="sa"/>' },
  balken: { sym: 2, name: 'Balken', d: '<rect x="-0.56" y="-0.13" width="1.12" height="0.26" class="sv"/>' },
  tee: { sym: 1, name: 'T', d: '<path d="M-0.46 -0.42H0.46M0 -0.42V0.52" class="sl"/>' }
};
const SYM_RUND = ['kreis', 'ring', 'plus', 'kreuz', 'quadrat', 'raute'];
const SYM_RICHTUNG = ['pfeil', 'dreieck', 'ecke', 'halb', 'balken', 'tee'];

const SICHT = [
  { n: [0, 1, 0], u: [0, 0, -1], r: [1, 0, 0], name: 'oben' },
  { n: [0, 0, 1], u: [0, 1, 0], r: [1, 0, 0], name: 'links' },
  { n: [1, 0, 0], u: [0, 1, 0], r: [0, 0, -1], name: 'rechts' }
];

function normiere(zellen) {
  const minC = Math.min(...zellen.map(z => z[0]));
  const minR = Math.min(...zellen.map(z => z[1]));
  return zellen.map(([c, r]) => [c - minC, r - minR]).sort((a, b) => a[1] - b[1] || a[0] - b[0]);
}

function formSchluessel(zellen, mitSpiegel) {
  const varianten = [];
  let z = normiere(zellen);
  for (let m = 0; m < (mitSpiegel ? 2 : 1); m++) {
    for (let k = 0; k < 4; k++) {
      z = normiere(z.map(([c, r]) => [-r, c]));
      varianten.push(JSON.stringify(z));
    }
    z = normiere(z.map(([c, r]) => [-c, r]));
  }
  return varianten.sort()[0];
}

function wachse(anzahl, maxSeite) {
  for (;;) {
    const zellen = [[0, 0]];
    const hat = (c, r) => zellen.some(z => z[0] === c && z[1] === r);
    while (zellen.length < anzahl) {
      const [c, r] = H.wahl(zellen);
      const [dc, dr] = H.wahl([[1, 0], [-1, 0], [0, 1], [0, -1]]);
      if (!hat(c + dc, r + dr)) zellen.push([c + dc, r + dr]);
    }
    const n = normiere(zellen);
    if (Math.max(...n.map(z => z[0])) < maxSeite && Math.max(...n.map(z => z[1])) < maxSeite) return n;
  }
}

function falte(zellen) {
  const index = new Map(zellen.map((z, i) => [z[0] + ',' + z[1], i]));
  const rahmen = new Array(zellen.length).fill(null);
  rahmen[0] = { n: [0, 0, 1], u: [0, 1, 0], r: [1, 0, 0] };
  const warte = [0];
  while (warte.length) {
    const i = warte.shift();
    const [c, r] = zellen[i];
    const f = rahmen[i];
    [[1, 0], [-1, 0], [0, -1], [0, 1]].forEach(([dc, dr]) => {
      const j = index.get((c + dc) + ',' + (r + dr));
      if (j === undefined || rahmen[j]) return;
      if (dc === 1) rahmen[j] = { n: f.r, r: V.neg(f.n), u: f.u };
      if (dc === -1) rahmen[j] = { n: V.neg(f.r), r: f.n, u: f.u };
      if (dr === -1) rahmen[j] = { n: f.u, u: V.neg(f.n), r: f.r };
      if (dr === 1) rahmen[j] = { n: V.neg(f.u), u: f.n, r: f.r };
      warte.push(j);
    });
  }
  if (rahmen.some(x => !x)) return null;
  const normalen = new Set(rahmen.map(f => f.n.join(',')));
  return normalen.size === 6 ? rahmen : null;
}

function hatBlock(zellen) {
  const s = new Set(zellen.map(z => z[0] + ',' + z[1]));
  return zellen.some(([c, r]) => s.has((c + 1) + ',' + r) && s.has(c + ',' + (r + 1)) && s.has((c + 1) + ',' + (r + 1)));
}

function kreuzNetz() {
  const a = H.zufall(0, 3), b = H.zufall(0, 3);
  const z = [[0, 1], [1, 1], [2, 1], [3, 1], [a, 0], [b, 2]];
  return Math.random() < 0.5 ? normiere(z) : normiere(z.map(([c, r]) => [r, c]));
}

function zufallsNetz() {
  for (;;) {
    const z = wachse(6, 5);
    if (falte(z)) return z;
  }
}

function netzSvg(zellen, belegung, markiert) {
  const G = 38;
  const breite = (Math.max(...zellen.map(z => z[0])) + 1) * G + 4;
  const hoehe = (Math.max(...zellen.map(z => z[1])) + 1) * G + 4;
  const inhalt = zellen.map(([c, r], i) => {
    const b = belegung && belegung[i];
    const sym = b ? `<g transform="rotate(${b.o * 90}) scale(${G * 0.3})">${WSYMBOLE[b.sym].d}</g>` : '';
    return `<g transform="translate(${c * G + 2 + G / 2} ${r * G + 2 + G / 2})"><rect x="${-G / 2}" y="${-G / 2}" width="${G}" height="${G}" class="${i === markiert ? 'nm' : 'nf'}"/>${sym}</g>`;
  }).join('');
  return S.svg(breite, hoehe, inhalt, 'netz');
}

function wuerfelSvg(sicht) {
  const K = 30, cx = 60, cy = 64;
  const p = v => [(v[0] - v[2]) * 0.866 * K, -(v[1] - (v[0] + v[2]) / 2) * K];
  const inhalt = SICHT.map((s, i) => {
    const pc = p(s.n), pr = p(s.r), pu = p(V.neg(s.u));
    const m = [pr[0], pr[1], pu[0], pu[1], pc[0] + cx, pc[1] + cy].map(S.r).join(' ');
    const a = sicht[i];
    return `<g transform="matrix(${m})"><rect x="-1" y="-1" width="2" height="2" class="wf${i === 0 ? ' wo' : ''}"/><g transform="rotate(${a.o * 90}) scale(0.6)">${WSYMBOLE[a.sym].d}</g></g>`;
  }).join('');
  return S.svg(120, 128, inhalt, 'wuerfel');
}

function symbolSvg(sym) {
  return S.svg(60, 60, `<rect x="4" y="4" width="52" height="52" rx="6" class="nf"/><g transform="translate(30 30) scale(16)">${WSYMBOLE[sym].d}</g>`, 'symbol-bild');
}

function baueWuerfel(zellen, belegung) {
  const rahmen = falte(zellen);
  return zellen.map((z, i) => {
    const f = rahmen[i];
    return { sym: belegung[i].sym, n: f.n, up: [f.u, f.r, V.neg(f.u), V.neg(f.r)][belegung[i].o] };
  });
}

function sichtAuf(wuerfel, m) {
  return SICHT.map(s => {
    const f = wuerfel.find(w => V.gleich(V.mal(m, w.n), s.n));
    const up = V.mal(m, f.up);
    return { sym: f.sym, o: [s.u, s.r, V.neg(s.u), V.neg(s.r)].findIndex(v => V.gleich(v, up)) };
  });
}

function sichtSchluessel(sicht) {
  return sicht.map(x => x.sym + ':' + (x.o % (4 / WSYMBOLE[x.sym].sym))).join('|');
}

function belege(zellen, anzahlRichtung) {
  const symbole = H.mische(H.mische(SYM_RUND).slice(0, 6 - anzahlRichtung).concat(H.mische(SYM_RICHTUNG).slice(0, anzahlRichtung)));
  return zellen.map((z, i) => ({ sym: symbole[i], o: WSYMBOLE[symbole[i]].sym === 4 ? 0 : H.zufall(0, 3) }));
}

function gegenueberPaare(wuerfel) {
  const paare = [];
  const fertig = new Set();
  wuerfel.forEach(w => {
    if (fertig.has(w.sym)) return;
    const g = wuerfel.find(x => V.gleich(x.n, V.neg(w.n)));
    fertig.add(w.sym);
    fertig.add(g.sym);
    paare.push(`${WSYMBOLE[w.sym].name} und ${WSYMBOLE[g.sym].name}`);
  });
  return paare;
}

function wuerfelAufgabe(n) {
  for (;;) {
    const zellen = n <= 3 ? kreuzNetz() : zufallsNetz();
    const belegung = belege(zellen, [0, 0, 2, 4, 6][n - 1]);
    const wuerfel = baueWuerfel(zellen, belegung);
    const moeglich = new Set(DREHUNGEN.map(m => sichtSchluessel(sichtAuf(wuerfel, m))));
    const richtig = sichtAuf(wuerfel, H.wahl(DREHUNGEN));
    const gegenueber = s => {
      const w = wuerfel.find(x => x.sym === s);
      return wuerfel.find(x => V.gleich(x.n, V.neg(w.n))).sym;
    };
    const arten = n === 1 ? ['gegen'] : n === 2 ? ['gegen', 'tausch'] : ['gegen', 'tausch', 'dreh', 'dreh'];
    const falsche = [];
    const schluessel = new Set([sichtSchluessel(richtig)]);
    for (let v = 0; v < 120 && falsche.length < 3; v++) {
      const s = sichtAuf(wuerfel, H.wahl(DREHUNGEN)).map(x => Object.assign({}, x));
      const art = H.wahl(arten);
      if (art === 'gegen') {
        const [i, j] = H.mische([0, 1, 2]);
        s[i] = { sym: gegenueber(s[j].sym), o: H.zufall(0, 3) };
      }
      if (art === 'tausch') {
        const [i, j] = H.mische([0, 1, 2]);
        [s[i], s[j]] = [s[j], s[i]];
      }
      if (art === 'dreh') {
        const k = [0, 1, 2].filter(x => WSYMBOLE[s[x].sym].sym < 4);
        if (!k.length) continue;
        const i = H.wahl(k);
        s[i].o = (s[i].o + H.wahl([1, 2, 3])) % 4;
      }
      if (new Set(s.map(x => x.sym)).size < 3) continue;
      const k = sichtSchluessel(s);
      if (moeglich.has(k) || schluessel.has(k)) continue;
      schluessel.add(k);
      falsche.push(s);
    }
    if (falsche.length < 3) continue;
    const name = i => WSYMBOLE[richtig[i].sym].name;
    const weg = [`Gegenüber liegen: ${gegenueberPaare(wuerfel).join('; ')}.`, 'Gegenüberliegende Seiten sind nie gleichzeitig zu sehen.'];
    if (n >= 3) weg.push('Achte auch darauf, in welche Richtung die Zeichen an den Kanten zeigen.');
    weg.push(`Der richtige Würfel zeigt oben ${name(0)}, links ${name(1)} und rechts ${name(2)}.`);
    return {
      frage: 'Welcher Würfel lässt sich aus dieser Faltvorlage falten?',
      bild: `<div class="bild-mitte">${netzSvg(zellen, belegung)}</div>`,
      ...S.optionen(wuerfelSvg(richtig), falsche.map(wuerfelSvg)),
      erklaerung: weg
    };
  }
}

function faltvorlage(n) {
  if (n >= 4) {
    for (;;) {
      const zellen = n === 4 ? kreuzNetz() : zufallsNetz();
      const belegung = belege(zellen, 0);
      const wuerfel = baueWuerfel(zellen, belegung);
      const markiert = H.zufall(0, 5);
      const ziel = wuerfel[markiert];
      const gegen = wuerfel.find(x => V.gleich(x.n, V.neg(ziel.n))).sym;
      const andere = H.mische(wuerfel.map(w => w.sym).filter(s => s !== ziel.sym && s !== gegen)).slice(0, 3);
      return {
        frage: 'Welches Zeichen liegt nach dem Falten gegenüber der blauen Fläche?',
        bild: `<div class="bild-mitte">${netzSvg(zellen, belegung, markiert)}</div>`,
        ...S.optionen(symbolSvg(gegen), andere.map(symbolSvg)),
        erklaerung: [`Gefaltet liegen sich gegenüber: ${gegenueberPaare(wuerfel).join('; ')}.`, 'Tipp: In einer geraden Reihe liegt das übernächste Feld gegenüber.']
      };
    }
  }
  const richtig = n <= 2 ? kreuzNetz() : zufallsNetz();
  const formen = new Set([formSchluessel(richtig, true)]);
  const falsche = [];
  while (falsche.length < 3) {
    const z = wachse(6, 5);
    if (falte(z)) continue;
    if (n === 1 && !hatBlock(z)) continue;
    if (n === 3 && hatBlock(z)) continue;
    const k = formSchluessel(z, true);
    if (formen.has(k)) continue;
    formen.add(k);
    falsche.push(z);
  }
  const weg = ['Nur diese Vorlage lässt sich zu einem Würfel falten.', 'Bei den anderen liegen beim Falten zwei Flächen übereinander, oder eine Seite bleibt offen.'];
  if (n === 1) weg.push('Vier Felder im Quadrat (2 × 2) können nie Teil einer Würfel-Faltvorlage sein.');
  return {
    frage: 'Aus welcher Faltvorlage lässt sich ein Würfel falten?',
    ...S.optionen(netzSvg(richtig), falsche.map(z => netzSvg(z))),
    erklaerung: weg
  };
}

function figurSvg(zellen, winkel) {
  const G = 20;
  const cx = zellen.reduce((s, z) => s + z[0], 0) / zellen.length + 0.5;
  const cy = zellen.reduce((s, z) => s + z[1], 0) / zellen.length + 0.5;
  const inhalt = zellen.map(([c, r]) => `<rect x="${S.r((c - cx) * G)}" y="${S.r((r - cy) * G)}" width="${G}" height="${G}" class="pz"/>`).join('');
  return S.svg(140, 140, `<g transform="translate(70 70) rotate(${winkel})">${inhalt}</g>`, 'drehfigur');
}

function zusammenhaengend(zellen) {
  const s = new Set(zellen.map(z => z[0] + ',' + z[1]));
  const besucht = new Set([zellen[0][0] + ',' + zellen[0][1]]);
  const warte = [zellen[0]];
  while (warte.length) {
    const [c, r] = warte.pop();
    [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dc, dr]) => {
      const k = (c + dc) + ',' + (r + dr);
      if (s.has(k) && !besucht.has(k)) {
        besucht.add(k);
        warte.push([c + dc, r + dr]);
      }
    });
  }
  return besucht.size === zellen.length;
}

function drehfigur(n) {
  const groesse = [5, 6, 6, 7, 8][n - 1];
  const schritte = n <= 2 ? [90, 180, 270] : n === 3 ? [45, 90, 135, 180, 225, 270, 315] : [30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330];
  for (;;) {
    const vorlage = wachse(groesse, 4);
    const spiegel = normiere(vorlage.map(([c, r]) => [-c, r]));
    const eigen = formSchluessel(vorlage, false);
    if (eigen === formSchluessel(spiegel, false)) continue;
    const winkel = H.wahl(schritte);
    const winkelFalsch = H.mische(schritte.concat([0])).slice(0, 3);
    const falsche = winkelFalsch.map(w => figurSvg(spiegel, w));
    let verschoben = false;
    if (n === 5) {
      for (let v = 0; v < 50 && !verschoben; v++) {
        const z = vorlage.slice();
        z.splice(H.zufall(0, z.length - 1), 1);
        const [c, r] = H.wahl(z);
        const [dc, dr] = H.wahl([[1, 0], [-1, 0], [0, 1], [0, -1]]);
        if (z.some(x => x[0] === c + dc && x[1] === r + dr)) continue;
        z.push([c + dc, r + dr]);
        const nz = normiere(z);
        if (!zusammenhaengend(nz) || formSchluessel(nz, true) === formSchluessel(vorlage, true)) continue;
        if (Math.max(...nz.map(x => x[0])) > 4 || Math.max(...nz.map(x => x[1])) > 4) continue;
        falsche[2] = figurSvg(nz, H.wahl(schritte));
        verschoben = true;
      }
    }
    const weg = [`Richtig ist die Vorlage, um ${winkel}° im Uhrzeigersinn gedreht.`, 'Gespiegelte Figuren lassen sich durch Drehen nicht mit der Vorlage zur Deckung bringen.'];
    if (verschoben) weg.push('Bei einer Figur ist außerdem ein Feld verschoben.');
    return {
      frage: 'Welche Figur ist die Vorlage, nur gedreht und nicht gespiegelt?',
      bild: `<div class="vorlage"><div class="label">Vorlage</div>${figurSvg(vorlage, 0)}</div>`,
      ...S.optionen(figurSvg(vorlage, winkel), falsche),
      erklaerung: weg
    };
  }
}
