const H = {
  zufall(a, b) {
    return a + Math.floor(Math.random() * (b - a + 1));
  },

  wahl(liste) {
    return liste[Math.floor(Math.random() * liste.length)];
  },

  mische(liste) {
    const l = liste.slice();
    for (let i = l.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [l[i], l[j]] = [l[j], l[i]];
    }
    return l;
  },

  runde(x, stellen = 2) {
    const f = Math.pow(10, stellen);
    return Math.round(x * f + (x >= 0 ? 1e-9 : -1e-9)) / f;
  },

  zahl(x, stellen = 2, fest = false) {
    const r = H.runde(x, stellen);
    const t = new Intl.NumberFormat('de-DE', {
      minimumFractionDigits: fest ? stellen : 0,
      maximumFractionDigits: stellen,
      useGrouping: Math.abs(r) >= 10000
    }).format(Math.abs(r));
    return (r < 0 ? '−' : '') + t;
  },

  euro(x) {
    const r = H.runde(x, 2);
    const ganz = Number.isInteger(r);
    const t = new Intl.NumberFormat('de-DE', {
      minimumFractionDigits: ganz ? 0 : 2,
      maximumFractionDigits: 2,
      useGrouping: Math.abs(r) >= 1000
    }).format(Math.abs(r));
    return (r < 0 ? '−' : '') + t + ' €';
  },

  einheit(x, e, stellen = 2) {
    return H.zahl(x, stellen) + ' ' + e;
  },

  dauer(stunden) {
    const min = Math.round(stunden * 60);
    const h = Math.floor(min / 60);
    const m = min % 60;
    if (h === 0) return m + ' min';
    if (m === 0) return h + ' h';
    return h + ' h ' + m + ' min';
  },

  uhr(minuten) {
    const t = ((minuten % 1440) + 1440) % 1440;
    return Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0') + ' Uhr';
  },

  ggt(a, b) {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) [a, b] = [b, a % b];
    return a;
  },

  kgv(a, b) {
    return a / H.ggt(a, b) * b;
  },

  bruch(z, n) {
    const g = H.ggt(z, n);
    return n / g === 1 ? String(z / g) : (z / g) + '/' + (n / g);
  },

  und(liste) {
    return liste.length < 2 ? liste.join('') : liste.slice(0, -1).join(', ') + ' und ' + liste[liste.length - 1];
  },

  optionen(korrekt, kandidaten, format, regeln = {}) {
    const fmt = format || (x => H.zahl(x));
    const ganz = regeln.ganz !== undefined ? regeln.ganz : Number.isInteger(H.runde(korrekt, 6));
    const positiv = regeln.positiv !== undefined ? regeln.positiv : korrekt >= 0;
    const schritt = regeln.schritt || Math.max(1, Math.round(Math.abs(korrekt) / 10));
    const richtigText = fmt(korrekt);
    const texte = [richtigText];
    const gruende = {};
    const werte = {};
    const dazu = (x, grund) => {
      if (texte.length >= 4 || !Number.isFinite(x)) return;
      if (ganz && !Number.isInteger(H.runde(x, 6))) return;
      if (positiv && x < 0) return;
      const t = fmt(x);
      if (texte.includes(t)) return;
      texte.push(t);
      werte[t] = x;
      if (grund) gruende[t] = grund;
    };
    H.mische(kandidaten).forEach(k => (Array.isArray(k) ? dazu(k[0], k[1]) : dazu(k)));
    for (let v = 0; texte.length < 4 && v < 80; v++) {
      dazu(korrekt + H.wahl([-1, 1]) * H.zufall(1, 4) * schritt);
    }
    const auto = typeof regeln.auto === 'function' ? regeln.auto : regeln.auto === false ? null : x => H.abweichung(x, korrekt, format, regeln);
    if (auto) texte.slice(1).forEach(t => { if (!gruende[t]) gruende[t] = auto(werte[t]); });
    const o = H.mische(texte);
    return { antworten: o, richtig: o.indexOf(richtigText), gruende };
  },

  abweichung(x, korrekt, format, regeln = {}) {
    const d = H.runde(x - korrekt, 6), weg = Math.abs(d), richtung = d > 0 ? 'zu groß' : 'zu klein';
    if (korrekt !== 0 && x !== 0) {
      const q = H.runde(x / korrekt, 6);
      if (q === 10 || q === 100 || q === 0.1 || q === 0.01) return 'Das Komma ist verrutscht. Zähle die Stellen nach dem Komma genau.';
      if (q === -1) return 'Das Vorzeichen ist falsch. Prüfe, ob das Ergebnis positiv oder negativ ist.';
      if (q === 2) return 'Dieses Ergebnis ist doppelt so groß wie richtig. Rechne die Schritte im Lösungsweg nach.';
      if (q === 0.5) return 'Dieses Ergebnis ist nur halb so groß wie richtig. Rechne die Schritte im Lösungsweg nach.';
    }
    const mitBetrag = format !== H.uhr && !regeln.ohneBetrag;
    if (!mitBetrag) return `Dieses Ergebnis ist ${richtung}. Rechne die Schritte im Lösungsweg nach.`;
    const betrag = format ? format(weg) : fz(weg);
    const stelle = { 1: 'Einer', 10: 'Zehner', 100: 'Hunderter', 1000: 'Tausender', 0.1: 'Zehntel', 0.01: 'Hundertstel' }[weg];
    return `Das Ergebnis ist um ${betrag} ${richtung}.` + (stelle && regeln.stellen ? ` Prüfe die ${stelle} und den Übertrag.` : ' Rechne die Schritte im Lösungsweg nach.');
  },

  optionenText(korrekt, falsche) {
    const texte = [korrekt];
    const gruende = {};
    H.mische(falsche).forEach(f => {
      const [t, grund] = Array.isArray(f) ? f : [f];
      if (texte.length >= 4 || texte.includes(t)) return;
      texte.push(t);
      if (grund) gruende[t] = grund;
    });
    const o = H.mische(texte);
    return { antworten: o, richtig: o.indexOf(korrekt), gruende };
  },

  rechne(a, op, b) {
    if (op === '+') return a + b;
    if (op === '−') return a - b;
    if (op === '×') return a * b;
    return a / b;
  },

  schritte(tokens) {
    const folge = [tokens];
    let t = tokens;
    while (t.length > 1) {
      let i = t.findIndex((x, k) => k % 2 === 1 && (x === '×' || x === '÷'));
      if (i < 0) i = 1;
      const w = H.rechne(t[i - 1], t[i], t[i + 1]);
      t = t.slice(0, i - 1).concat([w], t.slice(i + 2));
      folge.push(t);
    }
    return folge;
  },

  auswerten(tokens) {
    const folge = H.schritte(tokens);
    for (const t of folge) {
      for (let k = 0; k < t.length; k += 2) {
        if (!Number.isInteger(t[k]) || t[k] < 0) return null;
      }
    }
    return folge[folge.length - 1][0];
  },

  term(tokens) {
    return tokens.map(x => (typeof x === 'number' ? H.zahl(x) : x)).join(' ');
  },

  rechenweg(tokens) {
    return H.schritte(tokens).map(H.term).join(' = ');
  }
};

const fz = x => H.zahl(x);
const fe = x => H.euro(x);
const letzte = (l, k = 1) => l[l.length - k];
