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
    const dazu = x => {
      if (texte.length >= 4 || !Number.isFinite(x)) return;
      if (ganz && !Number.isInteger(H.runde(x, 6))) return;
      if (positiv && x < 0) return;
      const t = fmt(x);
      if (!texte.includes(t)) texte.push(t);
    };
    H.mische(kandidaten).forEach(dazu);
    for (let v = 0; texte.length < 4 && v < 80; v++) {
      dazu(korrekt + H.wahl([-1, 1]) * H.zufall(1, 4) * schritt);
    }
    const o = H.mische(texte);
    return { antworten: o, richtig: o.indexOf(richtigText) };
  },

  optionenText(korrekt, falsche) {
    const texte = [korrekt];
    H.mische(falsche).forEach(t => {
      if (texte.length < 4 && !texte.includes(t)) texte.push(t);
    });
    const o = H.mische(texte);
    return { antworten: o, richtig: o.indexOf(korrekt) };
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
