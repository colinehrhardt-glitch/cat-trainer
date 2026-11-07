const FIG = {
  formen: {
    kreis: k => `<circle cx="50" cy="50" r="25" class="${k}"/>`,
    quadrat: k => `<rect x="27" y="27" width="46" height="46" class="${k}"/>`,
    dreieck: k => `<polygon points="50,22 78,74 22,74" class="${k}"/>`,
    raute: k => `<polygon points="50,19 80,50 50,81 20,50" class="${k}"/>`,
    sechseck: k => `<polygon points="${S.punkte([0, 1, 2, 3, 4, 5].map(i => S.polar(50, 50, 28, Math.PI / 3 * i)))}" class="${k}"/>`,
    pfeil: k => `<polygon points="50,17 75,44 59,44 59,82 41,82 41,44 25,44" class="${k}"/>`,
    fahne: k => `<polygon points="32,17 41,17 76,31 41,46 41,83 32,83" class="${k}"/>`,
    haken: k => `<polygon points="30,19 45,19 45,64 73,64 73,79 30,79" class="${k}"/>`
  },
  namen: { kreis: 'Kreis', quadrat: 'Quadrat', dreieck: 'Dreieck', raute: 'Raute', sechseck: 'Sechseck', pfeil: 'Pfeil', fahne: 'Fahne', haken: 'Winkel', leer: 'leer', hell: 'hell', blau: 'blau' },
  drehFormen: ['pfeil', 'fahne', 'haken'],
  rundFormen: ['kreis', 'quadrat', 'dreieck', 'raute', 'sechseck'],
  fuellungen: ['leer', 'hell', 'blau'],
  klasse: { leer: 'fh', hell: 'fv', blau: 'fa' },
  punkte: [[13, 13], [50, 9], [87, 13], [91, 50], [87, 87], [50, 91], [13, 87], [9, 50]],
  menge: { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8], 7: [0, 2, 3, 4, 5, 6, 8], 8: [0, 1, 2, 3, 5, 6, 7, 8], 9: [0, 1, 2, 3, 4, 5, 6, 7, 8] }
};

function kachel(z) {
  let inhalt = '<rect x="2" y="2" width="96" height="96" rx="9" class="fr"/>';
  const k = FIG.klasse[z.fuellung];
  if (z.art === 'menge') {
    FIG.menge[z.anzahl].forEach(p => {
      const x = 22 + (p % 3) * 28, y = 22 + Math.floor(p / 3) * 28;
      inhalt += `<g transform="translate(${x} ${y}) scale(0.36) translate(-50 -50)">${FIG.formen[z.form](k)}</g>`;
    });
  } else {
    inhalt += `<g transform="rotate(${z.drehung || 0} 50 50)">${FIG.formen[z.form](k)}</g>`;
    if (z.punkt >= 0) {
      const [x, y] = FIG.punkte[z.punkt];
      inhalt += `<circle cx="${x}" cy="${y}" r="6.5" class="fm"/>`;
    }
  }
  return S.svg(100, 100, inhalt, 'figkachel');
}

function kachelSchluessel(z) {
  return [z.art, z.form, z.fuellung, ((z.drehung || 0) % 360 + 360) % 360, z.punkt, z.anzahl].join('|');
}

const mod8 = x => ((x % 8) + 8) % 8;
const mod360 = x => ((x % 360) + 360) % 360;

const FIG_REGEL = {
  drehung(s, start) {
    return {
      attr: 'drehung',
      wert: i => mod360(start + s * i),
      text: `Die Figur dreht sich jedes Mal um ${Math.abs(s)}° ${s > 0 ? 'im' : 'gegen den'} Uhrzeigersinn.`,
      falsch: v => [v - s, v + s, v + 180, v + 90, v - 90].map(mod360)
    };
  },
  punkt(k, start) {
    const w = Math.abs(k);
    return {
      attr: 'punkt',
      wert: i => mod8(start + k * i),
      text: `Der Punkt wandert jedes Mal ${w} ${w === 1 ? 'Feld' : 'Felder'} ${k > 0 ? 'im' : 'gegen den'} Uhrzeigersinn weiter.`,
      falsch: v => [v - k, v + 1, v - 1, v + 4, v + 2].map(mod8)
    };
  },
  zyklus(attr, liste) {
    const alle = attr === 'form' ? Object.keys(FIG.formen).filter(f => !FIG.drehFormen.includes(f)) : FIG.fuellungen;
    const namen = liste.map(x => FIG.namen[x]).join(', ');
    return {
      attr,
      wert: i => liste[i % liste.length],
      text: attr === 'form' ? `Die Formen wiederholen sich immer in derselben Reihenfolge: ${namen}.` : `Die Füllung wiederholt sich immer in derselben Reihenfolge: ${namen}.`,
      falsch: v => alle.filter(x => x !== v)
    };
  },
  anzahl(start, s) {
    return {
      attr: 'anzahl',
      wert: i => start + s * i,
      text: `Die Anzahl ${s > 0 ? 'steigt' : 'sinkt'} jedes Mal um ${Math.abs(s)}.`,
      falsch: v => [v + 1, v - 1, v + s, v - s, v + 2].filter(x => x >= 1 && x <= 9)
    };
  }
};

function startAnzahl(s) {
  return s === 1 ? H.zufall(1, 3) : H.zufall(7, 9);
}

function rundZyklus(laenge) {
  return H.mische(FIG.rundFormen).slice(0, laenge);
}

function fuellZyklus(laenge) {
  return H.mische(FIG.fuellungen).slice(0, laenge);
}

const FIGURENREIHEN = [
  {
    von: 1, bis: 2, f: n => ({
      basis: { art: 'form', form: H.wahl(FIG.drehFormen), fuellung: H.wahl(FIG.fuellungen), punkt: -1 },
      regeln: [FIG_REGEL.drehung(H.wahl([-1, 1]) * (n === 1 ? 90 : H.wahl([45, 135])), 45 * H.zufall(0, 7))]
    })
  },
  {
    von: 1, bis: 2, f: n => ({
      basis: { art: 'form', form: H.wahl(FIG.rundFormen), fuellung: H.wahl(['leer', 'blau']), drehung: 0 },
      regeln: [n === 1 ? FIG_REGEL.punkt(2, 2 * H.zufall(0, 3)) : FIG_REGEL.punkt(H.wahl([1, 3, -1, -3]), H.zufall(0, 7))]
    })
  },
  {
    von: 1, bis: 2, f: n => {
      const s = n === 1 ? 1 : -1;
      return { basis: { art: 'menge', form: H.wahl(FIG.rundFormen), fuellung: H.wahl(FIG.fuellungen) }, regeln: [FIG_REGEL.anzahl(startAnzahl(s), s)] };
    }
  },
  {
    von: 1, bis: 2, f: n => ({
      basis: { art: 'form', fuellung: H.wahl(FIG.fuellungen), drehung: 0, punkt: -1 },
      regeln: [FIG_REGEL.zyklus('form', rundZyklus(n === 1 ? 2 : 3))]
    })
  },
  {
    von: 2, bis: 2, f: () => ({
      basis: { art: 'form', form: H.wahl(FIG.rundFormen), drehung: 0, punkt: -1 },
      regeln: [FIG_REGEL.zyklus('fuellung', fuellZyklus(3))]
    })
  },
  {
    von: 3, bis: 3, f: () => ({
      basis: { art: 'form', form: H.wahl(FIG.drehFormen), punkt: -1 },
      regeln: [FIG_REGEL.drehung(H.wahl([-90, 90]), 90 * H.zufall(0, 3)), FIG_REGEL.zyklus('fuellung', fuellZyklus(2))]
    })
  },
  {
    von: 3, bis: 3, f: () => ({
      basis: { art: 'form', fuellung: H.wahl(['leer', 'blau']), drehung: 0 },
      regeln: [FIG_REGEL.punkt(H.wahl([1, 2, -1]), H.zufall(0, 7)), FIG_REGEL.zyklus('form', rundZyklus(H.wahl([2, 3])))]
    })
  },
  {
    von: 3, bis: 3, f: () => ({
      basis: { art: 'menge', form: H.wahl(FIG.rundFormen) },
      regeln: [FIG_REGEL.anzahl(startAnzahl(1), 1), FIG_REGEL.zyklus('fuellung', fuellZyklus(2))]
    })
  },
  {
    von: 4, bis: 4, f: () => ({
      basis: { art: 'form', form: H.wahl(FIG.drehFormen), fuellung: H.wahl(['leer', 'blau']) },
      regeln: [FIG_REGEL.drehung(H.wahl([-45, 45, 135]), 45 * H.zufall(0, 7)), FIG_REGEL.punkt(H.wahl([1, 3, -1]), H.zufall(0, 7))]
    })
  },
  {
    von: 4, bis: 4, f: () => ({
      basis: { art: 'form', drehung: 0, punkt: -1 },
      regeln: [FIG_REGEL.zyklus('form', rundZyklus(3)), FIG_REGEL.zyklus('fuellung', fuellZyklus(2))]
    })
  },
  {
    von: 4, bis: 4, f: () => {
      const s = H.wahl([1, -1]);
      return { basis: { art: 'menge', fuellung: H.wahl(FIG.fuellungen) }, regeln: [FIG_REGEL.anzahl(startAnzahl(s), s), FIG_REGEL.zyklus('form', rundZyklus(3))] };
    }
  },
  {
    von: 5, bis: 5, f: () => ({
      basis: { art: 'form', form: H.wahl(FIG.drehFormen) },
      regeln: [FIG_REGEL.drehung(H.wahl([-90, 45, 135, -45]), 45 * H.zufall(0, 7)), FIG_REGEL.punkt(H.wahl([1, -1, 3]), H.zufall(0, 7)), FIG_REGEL.zyklus('fuellung', fuellZyklus(3))]
    })
  },
  {
    von: 5, bis: 5, f: () => {
      const s = H.wahl([1, -1]);
      return { basis: { art: 'menge' }, regeln: [FIG_REGEL.anzahl(startAnzahl(s), s), FIG_REGEL.zyklus('form', rundZyklus(3)), FIG_REGEL.zyklus('fuellung', fuellZyklus(2))] };
    }
  },
  {
    von: 5, bis: 5, f: () => ({
      basis: { art: 'form', drehung: 0 },
      regeln: [FIG_REGEL.zyklus('form', rundZyklus(3)), FIG_REGEL.punkt(H.wahl([1, 3, -1, 2]), H.zufall(0, 7)), FIG_REGEL.zyklus('fuellung', fuellZyklus(2))]
    })
  }
];

function falscheKacheln(antwort, regeln, extra, anzahl) {
  const gesehen = new Set([kachelSchluessel(antwort)]);
  const kandidaten = [];
  regeln.forEach(r => r.falsch(antwort[r.attr]).forEach(v => kandidaten.push(Object.assign({}, antwort, { [r.attr]: v }))));
  const auswahl = [];
  H.mische(kandidaten).concat(extra || []).forEach(z => {
    const k = kachelSchluessel(z);
    if (z.art === 'menge' && !FIG.menge[z.anzahl]) return;
    if (auswahl.length < anzahl && !gesehen.has(k)) {
      gesehen.add(k);
      auswahl.push(z);
    }
  });
  return auswahl;
}

function figurenreihe(n) {
  for (;;) {
    const f = H.wahl(FIGURENREIHEN.filter(x => n >= x.von && n <= x.bis)).f(n);
    const zustand = i => {
      const z = Object.assign({ drehung: 0, punkt: -1, anzahl: 1 }, f.basis);
      f.regeln.forEach(r => { z[r.attr] = r.wert(i); });
      return z;
    };
    const folge = [0, 1, 2, 3, 4].map(zustand);
    const antwort = zustand(5);
    const falsche = falscheKacheln(antwort, f.regeln, [zustand(4), zustand(6)], 3);
    if (falsche.length < 3) continue;
    return {
      frage: 'Welche Figur setzt die Reihe fort?',
      bild: `<div class="kachelreihe">${folge.map(kachel).join('')}<div class="kachel-offen">?</div></div>`,
      ...S.optionen(kachel(antwort), falsche.map(kachel)),
      erklaerung: f.regeln.map(r => r.text)
    };
  }
}

function lateinMuster() {
  const a = H.wahl([1, 2]), b = H.wahl([1, 2]), off = H.zufall(0, 2);
  return (r, c) => (a * r + b * c + off) % 3;
}

const MATRIX_TEXT = {
  zeile: { form: 'In jeder Zeile bleibt die Form gleich.', fuellung: 'In jeder Zeile bleibt die Füllung gleich.' },
  spalte: {
    form: 'In jeder Spalte bleibt die Form gleich.',
    fuellung: w => `Die Füllung hängt von der Spalte ab: ${w.map(x => FIG.namen[x]).join(', ')}.`,
    anzahl: w => `Die Anzahl hängt von der Spalte ab: ${w.join(', ')}.`
  },
  latein: {
    form: w => `In jeder Zeile und jeder Spalte kommt jede Form genau einmal vor: ${w.map(x => FIG.namen[x]).join(', ')}.`,
    fuellung: w => `Jede Füllung (${w.map(x => FIG.namen[x]).join(', ')}) kommt in jeder Zeile und jeder Spalte genau einmal vor.`,
    anzahl: w => `Die Anzahlen ${w.slice().sort((x, y) => x - y).join(', ')} kommen in jeder Zeile und jeder Spalte genau einmal vor.`,
    punkt: () => 'Der Punkt steht in jeder Zeile und jeder Spalte einmal an jeder der drei Stellen.'
  }
};

function matrixRegel(attr, art, werte) {
  const muster = art === 'zeile' ? (r => r) : art === 'spalte' ? ((r, c) => c) : lateinMuster();
  const t = MATRIX_TEXT[art][attr];
  return { attr, wert: (r, c) => werte[muster(r, c)], werte, text: typeof t === 'function' ? t(werte) : t };
}

const MATRIX_ARTEN = {
  1: [
    () => ({ basis: { art: 'menge', form: H.wahl(FIG.rundFormen), fuellung: H.wahl(FIG.fuellungen) }, regeln: [['anzahl', 'spalte', [1, 2, 3]]] }),
    () => ({ basis: { art: 'form', form: H.wahl(FIG.rundFormen) }, regeln: [['fuellung', 'spalte', H.mische(FIG.fuellungen)]] }),
    () => ({ basis: { art: 'form', fuellung: H.wahl(FIG.fuellungen) }, regeln: [['form', 'zeile', rundZyklus(3)]] })
  ],
  2: [
    () => ({ basis: { art: 'form' }, regeln: [['form', 'zeile', rundZyklus(3)], ['fuellung', 'spalte', H.mische(FIG.fuellungen)]] }),
    () => ({ basis: { art: 'menge', fuellung: H.wahl(FIG.fuellungen) }, regeln: [['anzahl', 'spalte', H.wahl([[1, 2, 3], [2, 4, 6], [3, 2, 1]])], ['form', 'zeile', rundZyklus(3)]] })
  ],
  3: [
    () => ({ basis: { art: 'form' }, regeln: [['form', 'latein', rundZyklus(3)], ['fuellung', 'spalte', H.mische(FIG.fuellungen)]] }),
    () => ({ basis: { art: 'menge', fuellung: H.wahl(FIG.fuellungen) }, regeln: [['anzahl', 'latein', H.mische([1, 2, 3])], ['form', 'zeile', rundZyklus(3)]] })
  ],
  4: [
    () => ({ basis: { art: 'form' }, regeln: [['form', 'latein', rundZyklus(3)], ['fuellung', 'latein', H.mische(FIG.fuellungen)]] }),
    () => ({ basis: { art: 'menge', fuellung: H.wahl(FIG.fuellungen) }, regeln: [['anzahl', 'latein', H.mische([1, 2, 3])], ['form', 'latein', rundZyklus(3)]] })
  ],
  5: [
    () => ({ basis: { art: 'form' }, regeln: [['form', 'latein', rundZyklus(3)], ['fuellung', 'latein', H.mische(FIG.fuellungen)], ['punkt', 'latein', H.mische([0, 2, 4, 6]).slice(0, 3)]] }),
    () => ({ basis: { art: 'menge' }, regeln: [['anzahl', 'latein', H.mische([1, 2, 3, 4]).slice(0, 3)], ['form', 'latein', rundZyklus(3)], ['fuellung', 'latein', H.mische(FIG.fuellungen)]] })
  ]
};

function matrix(n) {
  for (;;) {
    const def = H.wahl(MATRIX_ARTEN[n])();
    const regeln = def.regeln.map(([attr, art, werte]) => matrixRegel(attr, art, werte));
    const latein = regeln.filter(r => def.regeln.find(d => d[0] === r.attr)[1] === 'latein');
    if (latein.length > 1) {
      const muster = latein.map(r => [0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => r.werte.indexOf(r.wert(Math.floor(i / 3), i % 3))).join(''));
      if (new Set(muster).size < muster.length) continue;
    }
    const zelle = (r, c) => {
      const z = Object.assign({ drehung: 0, punkt: -1, anzahl: 1, form: 'kreis', fuellung: 'leer' }, def.basis);
      regeln.forEach(g => { z[g.attr] = g.wert(r, c); });
      return z;
    };
    const antwort = zelle(2, 2);
    const fehlRegeln = regeln.map(g => ({
      attr: g.attr,
      falsch: v => {
        const andere = g.werte.filter(x => x !== v);
        if (g.attr === 'form') return andere.concat(FIG.rundFormen.filter(x => x !== v));
        if (g.attr === 'fuellung') return andere.concat(FIG.fuellungen.filter(x => x !== v));
        if (g.attr === 'anzahl') return andere.concat([v + 1, v - 1].filter(x => x >= 1 && x <= 9));
        return andere.concat([mod8(v + 1), mod8(v - 1)]);
      }
    }));
    const extra = [zelle(2, 1), zelle(1, 2), zelle(2, 0)];
    const falsche = falscheKacheln(antwort, fehlRegeln, extra, 3);
    if (falsche.length < 3) continue;
    const felder = [];
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) felder.push(r === 2 && c === 2 ? '<div class="kachel-offen">?</div>' : kachel(zelle(r, c)));
    return {
      frage: 'Welche Figur gehört in das leere Feld?',
      bild: `<div class="matrix">${felder.join('')}</div>`,
      ...S.optionen(kachel(antwort), falsche.map(kachel)),
      erklaerung: regeln.map(g => g.text)
    };
  }
}
