const RICHTUNGEN = ['Rechts herum', 'Links herum', 'Hin und her', 'Gar nicht'];
const BUCHST = 'ABCDEFGH';

function zahnradSvg(z) {
  const h = Math.min(7, z.r * 0.24);
  const zaehne = Math.max(8, Math.round(z.r / 3.6));
  const s = 2 * Math.PI / zaehne;
  const p = [];
  for (let i = 0; i < zaehne; i++) {
    const a = i * s + (z.versatz || 0);
    p.push(S.polar(z.x, z.y, z.r - h, a - 0.27 * s), S.polar(z.x, z.y, z.r, a - 0.13 * s), S.polar(z.x, z.y, z.r, a + 0.13 * s), S.polar(z.x, z.y, z.r - h, a + 0.27 * s));
  }
  let t = `<polygon points="${S.punkte(p)}" class="zr"/>`;
  if (z.scheibe) t += `<circle cx="${S.r(z.x)}" cy="${S.r(z.y)}" r="${S.r(z.scheibe)}" class="zs"/>`;
  t += `<circle cx="${S.r(z.x)}" cy="${S.r(z.y)}" r="10" class="zn"/>` + S.text(z.x, z.y, z.name, 'zt', 11);
  if (z.info) t += S.text(z.x, z.y + z.r + 12, z.info, 't2', 11);
  return t;
}

function radSvg(z) {
  return `<circle cx="${S.r(z.x)}" cy="${S.r(z.y)}" r="${S.r(z.r)}" class="zs"/><circle cx="${S.r(z.x)}" cy="${S.r(z.y)}" r="10" class="zn"/>` + S.text(z.x, z.y, z.name, 'zt', 11);
}

function drehpfeil(z, rechts) {
  const R = z.r + 9;
  const a1 = rechts ? -2.6 : -0.55, a2 = rechts ? -0.55 : -2.6;
  const [x1, y1] = S.polar(z.x, z.y, R, a1), [x2, y2] = S.polar(z.x, z.y, R, a2);
  const tx = rechts ? -Math.sin(a2) : Math.sin(a2), ty = rechts ? Math.cos(a2) : -Math.cos(a2);
  const spitze = [x2 + tx * 7, y2 + ty * 7], l = [x2 - ty * 5, y2 + tx * 5], r = [x2 + ty * 5, y2 - tx * 5];
  return `<path d="M${S.r(x1)} ${S.r(y1)} A${R} ${R} 0 0 ${rechts ? 1 : 0} ${S.r(x2)} ${S.r(y2)}" class="pf"/><polygon points="${S.punkte([spitze, l, r])}" class="pfs"/>`;
}

function riemenSvg(a, b, gekreuzt, ra, rb) {
  if (!gekreuzt) return `<path d="M${S.r(a.x)} ${S.r(a.y - ra)}L${S.r(b.x)} ${S.r(b.y - rb)}M${S.r(a.x)} ${S.r(a.y + ra)}L${S.r(b.x)} ${S.r(b.y + rb)}" class="rm"/>`;
  return `<path d="M${S.r(a.x)} ${S.r(a.y - ra)}L${S.r(b.x)} ${S.r(b.y + rb)}M${S.r(a.x)} ${S.r(a.y + ra)}L${S.r(b.x)} ${S.r(b.y - rb)}" class="rm"/>`;
}

function drehrichtungen(anzahl, kanten) {
  const d = new Array(anzahl).fill(0);
  d[0] = 1;
  let fertig = false;
  while (!fertig) {
    fertig = true;
    for (const [i, j, art] of kanten) {
      const soll = art === 'gleich' ? 1 : -1;
      if (d[i] && !d[j]) { d[j] = d[i] * soll; fertig = false; }
      else if (d[j] && !d[i]) { d[i] = d[j] * soll; fertig = false; }
      else if (d[i] && d[j] && d[j] !== d[i] * soll) return null;
    }
  }
  return d;
}

function zahnradReihe(anzahl, x0, y0) {
  const raeder = [];
  let x = x0, y = y0;
  for (let i = 0; i < anzahl; i++) {
    const r = H.zufall(18, 30);
    if (i > 0) {
      const v = raeder[i - 1];
      const abstand = v.r + r - 5;
      const dy = H.zufall(-14, 14);
      y = Math.max(40, Math.min(110, v.y + dy));
      const echtDy = y - v.y;
      x = v.x + Math.sqrt(abstand * abstand - echtDy * echtDy);
    }
    raeder.push({ x, y, r, name: BUCHST[i], versatz: Math.random() });
  }
  return raeder;
}

function richtungsWeg(raeder, d, start, kantenText) {
  const wort = x => (x > 0 ? 'rechts' : 'links');
  const kette = raeder.map((z, i) => `${z.name} ${wort(d[i] * start)}`).join(' → ');
  return kantenText.concat([kette]);
}

function zahnradRichtung(n) {
  const start = n >= 4 && Math.random() < 0.4 ? -1 : 1;
  const startText = start > 0 ? 'rechts herum (im Uhrzeigersinn)' : 'links herum (gegen den Uhrzeigersinn)';
  const art = n === 1 ? 'reihe' : n === 2 ? H.wahl(['reihe', 'riemen']) : n === 3 ? H.wahl(['reihe', 'kombi']) : H.wahl(['block', 'kombi', 'reihe', 'block']);
  let raeder, kanten, bild = '', breite = 340, frage, weg;
  if (art === 'reihe') {
    const anzahl = n === 1 ? H.zufall(2, 3) : n === 2 ? H.zufall(3, 5) : H.zufall(5, 7);
    raeder = zahnradReihe(anzahl, 40, 75);
    kanten = raeder.slice(1).map((z, i) => [i, i + 1, 'gegen']);
    breite = raeder[raeder.length - 1].x + raeder[raeder.length - 1].r + 16;
    bild = raeder.map(zahnradSvg).join('');
    weg = ['Ineinandergreifende Zahnräder drehen sich immer gegeneinander.'];
  } else if (art === 'riemen') {
    const r = 26, gekreuzt = Math.random() < 0.5;
    raeder = [{ x: 60, y: 75, r, name: 'A' }, { x: 210, y: 75, r, name: 'B' }];
    kanten = [[0, 1, gekreuzt ? 'gegen' : 'gleich']];
    bild = riemenSvg(raeder[0], raeder[1], gekreuzt, r, r) + raeder.map(radSvg).join('');
    breite = 270;
    weg = [gekreuzt ? 'Ein gekreuzter Riemen kehrt die Drehrichtung um.' : 'Ein gerader Riemen behält die Drehrichtung bei.'];
  } else if (art === 'kombi') {
    const gekreuzt = Math.random() < 0.5;
    const vorne = zahnradReihe(n === 3 ? 2 : 3, 40, 75);
    const letztes = vorne[vorne.length - 1];
    letztes.scheibe = Math.round(letztes.r * 0.6);
    const rad = { x: letztes.x + 130, y: letztes.y, r: letztes.scheibe, name: BUCHST[vorne.length] };
    raeder = vorne.concat([rad]);
    kanten = vorne.slice(1).map((z, i) => [i, i + 1, 'gegen']).concat([[vorne.length - 1, vorne.length, gekreuzt ? 'gegen' : 'gleich']]);
    bild = vorne.map(zahnradSvg).join('') + riemenSvg(letztes, rad, gekreuzt, letztes.scheibe, rad.r) + radSvg(rad);
    breite = rad.x + rad.r + 20;
    weg = ['Ineinandergreifende Zahnräder drehen sich gegeneinander.', `Die Riemenscheibe sitzt auf derselben Achse wie Zahnrad ${letztes.name} und dreht sich mit.`, gekreuzt ? 'Der gekreuzte Riemen kehrt die Drehrichtung um.' : 'Der gerade Riemen behält die Drehrichtung bei.'];
  } else {
    const r = 26, a = 2 * r - 5;
    const mitte = { x: 110, y: 80 };
    raeder = [
      { x: mitte.x - a / 2, y: mitte.y + a * 0.29, r, name: 'A', versatz: Math.random() },
      { x: mitte.x + a / 2, y: mitte.y + a * 0.29, r, name: 'B', versatz: Math.random() },
      { x: mitte.x, y: mitte.y - a * 0.58, r, name: 'C', versatz: Math.random() }
    ];
    kanten = [[0, 1, 'gegen'], [1, 2, 'gegen'], [2, 0, 'gegen']];
    if (Math.random() < 0.6) {
      const b = raeder[1], r2 = H.zufall(18, 26), ab = r + r2 - 5;
      raeder.push({ x: b.x + ab * 0.94, y: b.y + ab * 0.34, r: r2, name: 'D', versatz: Math.random() });
      kanten.push([1, 3, 'gegen']);
    }
    bild = raeder.map(zahnradSvg).join('');
    breite = Math.max(...raeder.map(z => z.x + z.r)) + 20;
    weg = ['Drei Zahnräder greifen im Kreis ineinander.', 'Jedes müsste sich gegen seine beiden Nachbarn drehen. Das geht nicht, deshalb blockiert alles.'];
  }
  const d = drehrichtungen(raeder.length, kanten);
  const ziel = raeder.length - 1;
  const loesung = d ? (d[ziel] * start > 0 ? 0 : 1) : 3;
  if (d) weg = richtungsWeg(raeder, d, start, weg);
  bild += drehpfeil(raeder[0], start > 0);
  const hoehe = Math.max(...raeder.map(z => z.y + z.r)) + 14;
  const oben = Math.min(0, Math.min(...raeder.map(z => z.y - z.r)) - 18);
  return {
    frage: `Rad A dreht sich ${startText}. Wie dreht sich Rad ${raeder[ziel].name}?`,
    bild: `<div class="bild-mitte">${S.svg(breite, hoehe - oben, `<g transform="translate(0 ${-oben})">${bild}</g>`, 'technik')}</div>`,
    antworten: RICHTUNGEN.slice(),
    richtig: loesung,
    erklaerung: weg
  };
}

function zahnradTempo(n) {
  const Z = [10, 12, 15, 16, 20, 24, 30, 36, 40, 45, 48, 60];
  for (;;) {
    if (n === 5) {
      const [za, zb, zc, zd] = [H.wahl(Z), H.wahl(Z), H.wahl([10, 12, 15, 16, 20]), H.wahl(Z)];
      const na = H.wahl([10, 12, 15, 20, 24, 30, 40, 60]);
      const nb = na * za / zb, nd = nb * zc / zd;
      if (!Number.isInteger(nb) || !Number.isInteger(nd) || nd < 2 || nd > 400 || zd <= zc) continue;
      const ra = za * 0.75 + 8, rb = zb * 0.75 + 8, rc = zc * 0.75 + 6, rd = zd * 0.75 + 8;
      const A = { x: 20 + ra, y: 70, r: ra, name: 'A', info: `${za} Zähne`, versatz: Math.random() };
      const B = { x: A.x + ra + rb - 5, y: 70, r: rb, name: 'B', info: '', versatz: Math.random() };
      const C = { x: B.x, y: B.y, r: rc, name: 'C', versatz: Math.random() };
      const D = { x: B.x + (rc + rd - 5) * 0.8, y: B.y + (rc + rd - 5) * 0.6, r: rd, name: 'D', info: `${zd} Zähne`, versatz: Math.random() };
      if (rc >= rb - 6) continue;
      const bild = [A, B].map(zahnradSvg).join('') + zahnradSvg(D) + zahnradSvg(C) + S.text(B.x, B.y - (rc + rb - 7) / 2, 'B', 'zt', 11) + S.text(B.x, B.y - rb - 10, `B: ${zb} Zähne, C: ${zc} Zähne`, 't2', 11);
      const breite = Math.max(D.x + rd, B.x + rb) + 20, hoehe = D.y + rd + 20;
      return {
        frage: `Zahnrad A dreht sich ${na}-mal pro Minute. Die Zahnräder B und C sitzen fest auf derselben Achse. Wie oft dreht sich D pro Minute?`,
        bild: `<div class="bild-mitte">${S.svg(breite, hoehe + 10, `<g transform="translate(0 20)">${bild}</g>`, 'technik')}</div>`,
        ...H.optionen(nd, [nb, na * za / zd, nd * 2, nd / 2, nd + 5], x => fz(x) + '-mal'),
        erklaerung: ['Zähne × Umdrehungen ist bei zwei Zahnrädern gleich.', `A → B: ${na} × ${za} ÷ ${zb} = ${fz(nb)}-mal pro Minute`, `C dreht sich wie B: ${fz(nb)}-mal`, `C → D: ${fz(nb)} × ${zc} ÷ ${zd} = ${fz(nd)}-mal pro Minute`]
      };
    }
    const za = H.wahl(Z), zc = H.wahl(Z.filter(z => z !== za));
    const na = H.wahl([6, 10, 12, 15, 20, 24, 30, 40, 60]);
    const nc = na * za / zc;
    if (!Number.isInteger(nc) || nc < 2 || nc > 300) continue;
    const mitte = n === 4;
    const zb = mitte ? H.wahl([12, 15, 20]) : null;
    const ra = za * 0.75 + 8, rc = zc * 0.75 + 8, rb = mitte ? zb * 0.75 + 8 : 0;
    const A = { x: 20 + ra, y: 75, r: ra, name: 'A', info: `${za} Zähne`, versatz: Math.random() };
    const raeder = [A];
    if (mitte) raeder.push({ x: A.x + ra + rb - 5, y: 75, r: rb, name: 'B', info: `${zb} Zähne`, versatz: Math.random() });
    const v = raeder[raeder.length - 1];
    raeder.push({ x: v.x + v.r + rc - 5, y: 75, r: rc, name: mitte ? 'C' : 'B', info: `${zc} Zähne`, versatz: Math.random() });
    const ziel = raeder[raeder.length - 1];
    const breite = ziel.x + rc + 20, hoehe = 75 + Math.max(...raeder.map(z => z.r)) + 28;
    const weg = ['Zähne × Umdrehungen ist bei ineinandergreifenden Zahnrädern gleich.'];
    if (mitte) weg.push('Das mittlere Zahnrad ändert nur die Drehrichtung, nicht die Geschwindigkeit am Ende.');
    weg.push(`A: ${na} Umdrehungen × ${za} Zähne = ${na * za}`, `${ziel.name}: ${na * za} ÷ ${zc} Zähne = ${fz(nc)}-mal pro Minute`);
    const top = Math.max(...raeder.map(z => z.r)) - 75 + 10;
    return {
      frage: `Zahnrad A dreht sich ${na}-mal pro Minute. Wie oft dreht sich Zahnrad ${ziel.name} pro Minute?`,
      bild: `<div class="bild-mitte">${S.svg(breite, hoehe + Math.max(0, top), `<g transform="translate(0 ${Math.max(0, top)})">${raeder.map(zahnradSvg).join('')}</g>`, 'technik')}</div>`,
      ...H.optionen(nc, [na * zc / za, na, nc * 2, nc + 10, mitte ? na * za / zb : nc - 5], x => fz(x) + '-mal'),
      erklaerung: weg
    };
  }
}

function zahnraeder(n) {
  return n >= 3 && Math.random() < 0.45 ? zahnradTempo(n) : zahnradRichtung(n);
}

function wippeSvg(links, rechts, kraftPfeil) {
  const M = 182, D = 32, Y = 92;
  let t = `<rect x="${M - 5 * D - 14}" y="${Y}" width="${10 * D + 28}" height="8" rx="3" class="wb"/><polygon points="${M},${Y + 8} ${M - 16},${Y + 38} ${M + 16},${Y + 38}" class="wd"/>`;
  for (let d = 1; d <= 5; d++) {
    [-1, 1].forEach(s => {
      t += `<line x1="${M + s * d * D}" y1="${Y + 8}" x2="${M + s * d * D}" y2="${Y + 14}" class="wt"/>` + S.text(M + s * d * D, Y + 24, d, 't2', 11);
    });
  }
  const box = (seite, g) => {
    const x = M + seite * g.d * D;
    const h = 26;
    const unbekannt = g.text === '?';
    return `<rect x="${x - 14}" y="${Y - h}" width="28" height="${h}" rx="3" class="${unbekannt ? 'wu' : 'wg'}"/>` + S.text(x, Y - h / 2, g.text, unbekannt ? 'wut' : 'wgt', g.text.length > 4 ? 9 : 11);
  };
  links.forEach(g => { t += box(-1, g); });
  rechts.forEach(g => { t += box(1, g); });
  if (kraftPfeil) {
    const x = M + kraftPfeil.d * D;
    t += `<path d="M${x} ${Y - 46}V${Y - 6}" class="pf"/><polygon points="${x},${Y - 1} ${x - 6},${Y - 11} ${x + 6},${Y - 11}" class="pfs"/>` + S.text(x + 14, Y - 40, 'F', 'zt', 13);
  }
  return `<div class="bild-mitte">${S.svg(2 * M, 140, t, 'technik')}</div>`;
}

function hebel(n) {
  for (;;) {
    if (n === 1 || n === 4 || (n === 2 && Math.random() < 0.5)) {
      const anzahlLinks = n === 4 ? 2 : 1;
      const links = [];
      const plaetze = H.mische([1, 2, 3, 4, 5]);
      for (let i = 0; i < anzahlLinks; i++) links.push({ m: H.zufall(1, n === 1 ? 8 : 12), d: plaetze[i] });
      const moment = links.reduce((s, g) => s + g.m * g.d, 0);
      const d2 = H.zufall(1, 5);
      const m2 = moment / d2;
      if (!Number.isInteger(m2) || m2 < 1 || m2 > 60 || (anzahlLinks === 1 && links[0].d === d2)) continue;
      const linksText = links.map(g => `${g.m} kg × ${g.d}`).join(' + ');
      return {
        frage: 'Wie schwer muss das Gewicht rechts sein, damit die Wippe im Gleichgewicht ist?',
        bild: wippeSvg(links.map(g => ({ d: g.d, text: g.m + ' kg' })), [{ d: d2, text: '?' }]),
        ...H.optionen(m2, [links.reduce((s, g) => s + g.m, 0), moment, m2 + 1, m2 * 2, m2 - 1].filter(x => x !== m2), x => H.einheit(x, 'kg')),
        erklaerung: ['Hebelgesetz: Gewicht × Abstand ist links und rechts gleich.', `Links: ${linksText} = ${moment}`, `Rechts: ? × ${d2} = ${moment}, also ${moment} ÷ ${d2} = ${m2} kg`]
      };
    }
    if (n === 2) {
      const m1 = H.zufall(2, 12), d1 = H.zufall(1, 5), m2 = H.zufall(2, 12);
      const d2 = m1 * d1 / m2;
      if (!Number.isInteger(d2) || d2 < 1 || d2 > 5 || d2 === d1 || m1 === m2) continue;
      return {
        frage: `An welche Position rechts muss das ${m2}-kg-Gewicht, damit die Wippe im Gleichgewicht ist?`,
        bild: wippeSvg([{ d: d1, text: m1 + ' kg' }], []),
        ...H.optionen(d2, [d1, 6 - d2, d2 + 1, d2 - 1].filter(x => x >= 1 && x <= 5 && x !== d2), x => 'Position ' + x),
        erklaerung: ['Hebelgesetz: Gewicht × Abstand ist links und rechts gleich.', `Links: ${m1} kg × ${d1} = ${m1 * d1}`, `Rechts: ${m2} kg × ? = ${m1 * d1}, also ${m1 * d1} ÷ ${m2} = ${d2}`]
      };
    }
    if (n === 3 || (n === 5 && Math.random() < 0.5)) {
      const anz = n === 3 ? [1, 2] : [2, 3];
      const seite = k => {
        const p = H.mische([1, 2, 3, 4, 5]);
        return Array.from({ length: k }, (_, i) => ({ m: H.zufall(1, 9), d: p[i] }));
      };
      const links = seite(H.wahl(anz)), rechts = seite(H.wahl(anz));
      if (Math.random() < 0.3) {
        const ml = links.reduce((s, g) => s + g.m * g.d, 0), rest = rechts.slice(1).reduce((s, g) => s + g.m * g.d, 0);
        const m = (ml - rest) / rechts[0].d;
        if (!Number.isInteger(m) || m < 1 || m > 12) continue;
        rechts[0].m = m;
      }
      const ml = links.reduce((s, g) => s + g.m * g.d, 0), mr = rechts.reduce((s, g) => s + g.m * g.d, 0);
      const loesung = ml > mr ? 0 : mr > ml ? 1 : 2;
      const t = l => l.map(g => `${g.m} × ${g.d}`).join(' + ');
      return {
        frage: 'Welche Seite der Wippe senkt sich?',
        bild: wippeSvg(links.map(g => ({ d: g.d, text: g.m + ' kg' })), rechts.map(g => ({ d: g.d, text: g.m + ' kg' }))),
        antworten: ['Die linke Seite', 'Die rechte Seite', 'Keine, sie bleibt im Gleichgewicht', 'Das hängt von der Länge der Wippe ab'],
        richtig: loesung,
        erklaerung: ['Rechne für jede Seite Gewicht × Abstand und addiere.', `Links: ${t(links)} = ${ml}`, `Rechts: ${t(rechts)} = ${mr}`, loesung === 2 ? 'Beide Seiten sind gleich, also Gleichgewicht.' : `Die ${loesung === 0 ? 'linke' : 'rechte'} Seite ist größer und senkt sich.`]
      };
    }
    const last = H.wahl([200, 300, 400, 480, 600, 800, 900, 1200]), d1 = H.zufall(1, 2), d2 = H.zufall(3, 5);
    const f = last * d1 / d2;
    if (!Number.isInteger(f)) continue;
    return {
      frage: `Eine Last von ${last} N liegt links an Position ${d1}. Mit welcher Kraft F musst du rechts an Position ${d2} drücken, um sie im Gleichgewicht zu halten?`,
      bild: wippeSvg([{ d: d1, text: last + ' N' }], [], { d: d2 }),
      ...H.optionen(f, [last, last * d2 / d1, f * 2, f + 50, last - f], x => H.einheit(x, 'N')),
      erklaerung: ['Hebelgesetz: Kraft × Kraftarm = Last × Lastarm.', `${last} N × ${d1} = ${last * d1}`, `F × ${d2} = ${last * d1}, also F = ${last * d1} ÷ ${d2} = ${fz(f)} N`, 'Je länger der Kraftarm, desto weniger Kraft brauchst du.']
    };
  }
}

function flaschenzugSvg(n, lastText) {
  const d = 22, x0 = 40, yo = 46, yu = 150;
  const xs = Array.from({ length: n + 1 }, (_, i) => x0 + i * d);
  let t = `<rect x="${x0 - 24}" y="8" width="${n * d + 70}" height="8" class="wd"/><line x1="${x0 - 16}" y1="16" x2="${x0 + n * d + 40}" y2="16" class="wt"/>`;
  const oben = [], unten = [];
  for (let k = n; k >= 1; k -= 2) oben.push([xs[k - 1], xs[k]]);
  for (let k = n - 1; k >= 1; k -= 2) unten.push([xs[k - 1], xs[k]]);
  oben.forEach(([a, b]) => { t += `<line x1="${(a + b) / 2}" y1="16" x2="${(a + b) / 2}" y2="${yo}" class="fs"/>`; });
  for (let i = 0; i < n; i++) t += `<line x1="${xs[i]}" y1="${yo}" x2="${xs[i]}" y2="${yu}" class="fl"/>`;
  t += `<line x1="${xs[n]}" y1="${yo}" x2="${xs[n]}" y2="${yu + 40}" class="fl"/><polygon points="${xs[n]},${yu + 52} ${xs[n] - 6},${yu + 40} ${xs[n] + 6},${yu + 40}" class="pfs"/>` + S.text(xs[n] + 14, yu + 44, 'F', 'zt', 13);
  oben.forEach(([a, b]) => { t += `<circle cx="${(a + b) / 2}" cy="${yo}" r="${d / 2}" class="fr2"/><circle cx="${(a + b) / 2}" cy="${yo}" r="2.5" class="fp2"/>`; });
  const block = unten.length || n % 2 === 1;
  const ux = unten.length ? unten.map(([a, b]) => (a + b) / 2) : [xs[0]];
  const minX = Math.min(...ux, xs[0]) - 8, maxX = Math.max(...ux, n % 2 ? xs[0] : 0) + 8;
  unten.forEach(([a, b]) => { t += `<circle cx="${(a + b) / 2}" cy="${yu}" r="${d / 2}" class="fr2"/><circle cx="${(a + b) / 2}" cy="${yu}" r="2.5" class="fp2"/>`; });
  if (n % 2 === 0) t += `<line x1="${xs[0]}" y1="16" x2="${xs[0]}" y2="${yo}" class="fl"/><circle cx="${xs[0]}" cy="16" r="3" class="fp2"/>`;
  unten.forEach(([a, b]) => { t += `<line x1="${(a + b) / 2}" y1="${yu}" x2="${(a + b) / 2}" y2="${yu + d / 2 + 4}" class="fs"/>`; });
  const lx = block ? (minX + maxX) / 2 : xs[0];
  if (unten.length) t += `<line x1="${minX}" y1="${yu + d / 2 + 4}" x2="${maxX}" y2="${yu + d / 2 + 4}" class="fl"/>`;
  const lastY = yu + d / 2 + 4;
  t += `<line x1="${lx}" y1="${unten.length ? lastY : yu}" x2="${lx}" y2="${lastY + 10}" class="fl"/><rect x="${lx - 30}" y="${lastY + 10}" width="60" height="34" rx="4" class="wg"/>` + S.text(lx, lastY + 27, lastText, 'wgt', 12);
  return `<div class="bild-mitte">${S.svg(Math.max(xs[n] + 40, lx + 40), lastY + 52, t, 'technik flaschenzug')}</div>`;
}

function flaschenzuege(n) {
  const auswahl = { 1: [1, 2], 2: [2, 3, 4], 3: [2, 3, 4], 4: [4, 5, 6], 5: [3, 4, 5, 6] }[n];
  for (;;) {
    const s = H.wahl(auswahl);
    const kg = n >= 4 && Math.random() < 0.6;
    const last = kg ? H.wahl([30, 40, 60, 90, 120, 150, 180]) * 10 : H.wahl([120, 240, 300, 360, 480, 600, 720, 900, 1200]);
    const lastText = kg ? `${last / 10} kg` : `${last} N`;
    const seil = n === 3 || (n >= 4 && Math.random() < 0.4);
    if (seil) {
      const hub = H.wahl([1, 1.5, 2, 3, 4]);
      return {
        frage: `Die Last soll ${fz(hub)} m angehoben werden. Wie viel Seil musst du am Ende F ziehen?`,
        bild: flaschenzugSvg(s, lastText),
        ...H.optionen(hub * s, [hub, hub * (s + 1), hub * (s - 1), hub * s / 2, hub * 2], x => H.einheit(x, 'm'), { ganz: false }),
        erklaerung: [`Die Last hängt an ${s} Seilstücken.`, `Jedes Seilstück muss um ${fz(hub)} m kürzer werden.`, `${s} × ${fz(hub)} m = ${fz(hub * s)} m Seil`]
      };
    }
    const f = last / s;
    if (!Number.isInteger(f)) continue;
    const weg = s === 1
      ? ['Eine feste Rolle lenkt die Kraft nur um.', `Du brauchst die volle Kraft: ${last} N.`]
      : [`Zähle die Seilstücke, an denen die Last hängt: ${s}.`, 'Die Last verteilt sich gleichmäßig auf alle Seilstücke.', `${last} N ÷ ${s} = ${f} N`];
    if (kg) weg.unshift(`${last / 10} kg wiegen etwa ${last} N (1 kg ≈ 10 N).`);
    return {
      frage: `Mit welcher Kraft F musst du ziehen, um die Last zu halten? Reibung und Gewicht der Rollen zählen nicht.${kg ? ' Rechne mit 1 kg ≈ 10 N.' : ''}`,
      bild: flaschenzugSvg(s, lastText),
      ...H.optionen(f, [last, last / (s + 1), last / (s - 1 || 2), f * 2, last / 2], x => H.einheit(x, 'N')),
      erklaerung: weg
    };
  }
}

const PHYSIK = {
  1: [
    () => {
      const r = H.wahl([10, 20, 50, 100]), i = H.wahl([1, 2, 3, 5]), u = r * i;
      return { frage: `Durch einen Widerstand von ${r} Ω fließt ein Strom von ${i} A. Wie hoch ist die Spannung?`, ...H.optionen(u, [r + i, r / i, u * 2, u / 2], x => H.einheit(x, 'V'), { ganz: false }), erklaerung: ['Spannung = Widerstand × Stromstärke (U = R × I)', `${r} Ω × ${i} A = ${u} V`] };
    }
  ],
  2: [
    () => {
      const r = H.wahl([10, 20, 40, 50, 100, 200]), i = H.wahl([0.1, 0.2, 0.5, 1, 2]), u = H.runde(r * i, 2);
      if (Math.random() < 0.5) return { frage: `An einem Widerstand von ${r} Ω liegen ${fz(u)} V. Wie groß ist die Stromstärke?`, ...H.optionen(i, [u * r, r / u, i * 10, i * 2, i / 2], x => H.einheit(x, 'A'), { ganz: false }), erklaerung: ['Stromstärke = Spannung ÷ Widerstand (I = U ÷ R)', `${fz(u)} V ÷ ${r} Ω = ${fz(i)} A`] };
      return { frage: `Bei ${fz(u)} V fließt ein Strom von ${fz(i)} A. Wie groß ist der Widerstand?`, ...H.optionen(r, [u * i, i / u, r * 2, r / 2, r + 10], x => H.einheit(x, 'Ω'), { ganz: false }), erklaerung: ['Widerstand = Spannung ÷ Stromstärke (R = U ÷ I)', `${fz(u)} V ÷ ${fz(i)} A = ${r} Ω`] };
    }
  ],
  3: [
    () => {
      const i = H.wahl([0.5, 1, 2, 4, 5, 10]), p = 230 * i;
      return { frage: `Ein Gerät an 230 V nimmt ${fz(i)} A auf. Wie groß ist seine Leistung?`, ...H.optionen(p, [230 / i, 230 + i, p * 2, p / 2], x => H.einheit(x, 'W'), { ganz: false }), erklaerung: ['Leistung = Spannung × Stromstärke (P = U × I)', `230 V × ${fz(i)} A = ${fz(p)} W`] };
    },
    () => {
      const a = H.wahl([10, 20, 30, 47, 50, 100]), b = H.wahl([10, 20, 33, 40, 60, 100]);
      return { frage: `Zwei Widerstände mit ${a} Ω und ${b} Ω sind in Reihe geschaltet. Wie groß ist der Gesamtwiderstand?`, ...H.optionen(a + b, [Math.abs(a - b), a * b, (a + b) / 2, a + b + 10], x => H.einheit(x, 'Ω'), { ganz: false }), erklaerung: ['In Reihe werden Widerstände addiert.', `${a} Ω + ${b} Ω = ${a + b} Ω`] };
    }
  ],
  4: [
    () => {
      const [a, b] = H.wahl([[6, 3], [12, 4], [10, 15], [6, 12], [20, 30], [4, 12], [24, 8], [10, 40], [5, 20], [60, 30]]);
      const g = a * b / (a + b);
      return { frage: `Zwei Widerstände mit ${a} Ω und ${b} Ω sind parallel geschaltet. Wie groß ist der Gesamtwiderstand?`, ...H.optionen(g, [a + b, (a + b) / 2, Math.abs(a - b), Math.min(a, b)], x => H.einheit(x, 'Ω'), { ganz: false }), erklaerung: ['Parallel gilt: Gesamtwiderstand = (R1 × R2) ÷ (R1 + R2)', `(${a} × ${b}) ÷ (${a} + ${b}) = ${a * b} ÷ ${a + b} = ${fz(g)} Ω`, 'Der Gesamtwiderstand ist immer kleiner als der kleinste Einzelwiderstand.'] };
    },
    () => {
      let p, h, ct;
      do { p = H.wahl([0.5, 1, 1.5, 2, 2.5, 3]); h = H.wahl([2, 3, 4, 5, 6, 8, 10]); ct = H.wahl([25, 30, 35, 40]); } while (!Number.isInteger(p * h * ct));
      const kwh = p * h, kosten = kwh * ct / 100;
      return { frage: `Ein Heizlüfter mit ${fz(p)} kW läuft ${h} Stunden. Eine Kilowattstunde kostet ${ct} Cent. Was kostet das?`, ...H.optionen(kosten, [p * ct / 100, kwh * ct, kosten * 2, kosten + 1], fe, { ganz: false }), erklaerung: ['Energie = Leistung × Zeit', `${fz(p)} kW × ${h} h = ${fz(kwh)} kWh`, `${fz(kwh)} × ${ct} ct = ${fe(kosten)}`] };
    }
  ],
  5: [
    () => {
      const a1 = H.wahl([2, 4, 5, 10]), k = H.wahl([5, 8, 10, 20, 25]), a2 = a1 * k, f1 = H.wahl([50, 100, 150, 200]);
      return { frage: `Bei einer hydraulischen Presse hat der kleine Kolben ${a1} cm², der große ${a2} cm². Auf den kleinen drückst du mit ${f1} N. Welche Kraft entsteht am großen Kolben?`, ...H.optionen(f1 * k, [f1 / k, f1 + a2, f1 * a1, f1 * k / 2], x => H.einheit(x, 'N'), { ganz: false }), erklaerung: ['Der Druck ist in der Flüssigkeit überall gleich.', `Der große Kolben ist ${k}-mal so groß wie der kleine.`, `${f1} N × ${k} = ${fz(f1 * k)} N`] };
    },
    () => {
      const v = H.wahl([36, 54, 72, 90, 108]), ms = v / 3.6;
      return { frage: `Ein Fahrzeug fährt ${v} km/h. Wie viele Meter legt es pro Sekunde zurück?`, ...H.optionen(ms, [v / 6, v * 3.6, ms + 5, ms * 2], x => H.einheit(x, 'm'), { ganz: false }), erklaerung: ['1 km/h = 1000 m ÷ 3600 s, also km/h ÷ 3,6 = m/s', `${v} ÷ 3,6 = ${fz(ms)} m pro Sekunde`] };
    }
  ]
};

function physik(n) {
  return H.wahl(PHYSIK[n])();
}
