const SL_ALLTAG = ['Piloten', 'Sportler', 'Musiker', 'Taucher', 'Läufer', 'Köche', 'Fahrer', 'Maler', 'Schwimmer', 'Leser', 'Sänger', 'Bergsteiger', 'Angler', 'Tänzer', 'Gärtner', 'Sammler'];
const SL_FANTASIE = ['Glarben', 'Muken', 'Tirbel', 'Fosen', 'Wapper', 'Quinden', 'Zabeln', 'Sneffen', 'Brokel', 'Daxen', 'Morken', 'Pflinen'];
const SL_KEINE = 'Keine der Schlussfolgerungen ist richtig.';

const SL_MODELLE = (() => {
  const alle = Array.from({ length: 128 }, (_, m) => m);
  const belegt = alle.filter(m => [1, 2, 4].every(bit => [1, 2, 3, 4, 5, 6, 7].some(r => (m >> (r - 1)) & 1 && r & bit)));
  return { alle, belegt };
})();

function slGilt(s, m) {
  const bx = 1 << s.x, by = 1 << s.y;
  const regionen = [1, 2, 3, 4, 5, 6, 7].filter(r => (m >> (r - 1)) & 1);
  if (s.f === 'A') return regionen.every(r => !(r & bx) || (r & by));
  if (s.f === 'E') return regionen.every(r => !(r & bx) || !(r & by));
  if (s.f === 'I') return regionen.some(r => (r & bx) && (r & by));
  return regionen.some(r => (r & bx) && !(r & by));
}

function slFolgt(praemissen, schluss, modelle) {
  return modelle.filter(m => praemissen.every(p => slGilt(p, m))).every(m => slGilt(schluss, m));
}

function slSatz(s, namen) {
  const x = namen[s.x], y = namen[s.y];
  return { A: `Alle ${x} sind ${y}.`, E: `Alle ${x} sind keine ${y}.`, I: `Einige ${x} sind ${y}.`, O: `Einige ${x} sind keine ${y}.` }[s.f];
}

function slErklaerung(praemissen, schluss, namen) {
  const teil = praemissen.find(p => p.f === 'I' || p.f === 'O');
  const allg = praemissen.find(p => p.f === 'A' || p.f === 'E');
  if (!schluss) {
    const weg = ['Keine der vier Schlussfolgerungen muss immer gelten.'];
    if (praemissen.every(p => p.f === 'I' || p.f === 'O')) weg.push('Aus zwei „Einige“-Aussagen folgt nie etwas sicher.');
    else if (praemissen.every(p => p.f === 'E' || p.f === 'O')) weg.push('Aus zwei verneinten Aussagen folgt nie etwas sicher.');
    else weg.push(`Die Aussagen legen nicht fest, wie ${namen[0]} und ${namen[2]} zusammenhängen.`);
    weg.push('Tipp: Zeichne die drei Gruppen als Kreise und suche einen Fall, in dem die Schlussfolgerung nicht stimmt.');
    return weg;
  }
  const zeuge = {};
  zeuge[teil.x] = true;
  zeuge[teil.y] = teil.f === 'I';
  if (allg.f === 'A') {
    if (zeuge[allg.x] === true) zeuge[allg.y] = true;
    else if (zeuge[allg.y] === false) zeuge[allg.x] = false;
  } else {
    if (zeuge[allg.x] === true) zeuge[allg.y] = false;
    else if (zeuge[allg.y] === true) zeuge[allg.x] = false;
  }
  const dritter = [0, 1, 2].find(t => t !== teil.x && t !== teil.y);
  const nicht = b => (b ? '' : 'keine ');
  return [
    `„${slSatz(teil, namen)}“ heißt: Es gibt ${namen[teil.x]}, die ${nicht(zeuge[teil.y])}${namen[teil.y]} sind.`,
    `Wegen „${slSatz(allg, namen)}“ sind diese ${namen[teil.x]} ${zeuge[dritter] ? 'auch' : 'also keine'} ${namen[dritter]}.`,
    `Diese sind also ${nicht(zeuge[0])}${namen[0]} und ${nicht(zeuge[2])}${namen[2]}.`,
    `Deshalb gilt immer: ${slSatz(schluss, namen)}`
  ];
}

function schlussfolgerung(n) {
  const begriffe = n <= 2 ? SL_ALLTAG : n === 3 ? H.wahl([SL_ALLTAG, SL_FANTASIE]) : SL_FANTASIE;
  const willKeine = Math.random() < [0.2, 0.25, 0.25, 0.3, 0.35][n - 1];
  for (;;) {
    const namen = H.mische(begriffe).slice(0, 3);
    const p1 = Object.assign({ f: H.wahl(['A', 'E', 'I', 'O']) }, Math.random() < 0.6 ? { x: 1, y: 2 } : { x: 2, y: 1 });
    const p2 = Object.assign({ f: H.wahl(['A', 'E', 'I', 'O']) }, Math.random() < 0.6 ? { x: 0, y: 1 } : { x: 1, y: 0 });
    const praemissen = [p1, p2];
    const schluesse = ['A', 'I', 'E', 'O'].map(f => ({ f, x: 0, y: 2 }));
    const status = schluesse.map(s => [slFolgt(praemissen, s, SL_MODELLE.alle), slFolgt(praemissen, s, SL_MODELLE.belegt)]);
    if (status.some(([a, b]) => a !== b)) continue;
    const gueltig = status.map((s, i) => (s[0] ? i : -1)).filter(i => i >= 0);
    if (gueltig.length > 1) continue;
    const keine = gueltig.length === 0;
    if (keine !== willKeine) continue;
    const reihenfolge = n >= 4 && Math.random() < 0.5 ? [p2, p1] : [p1, p2];
    return {
      frage: 'Welche Schlussfolgerung muss immer gelten?',
      text: reihenfolge.map(p => slSatz(p, namen)).join('\n'),
      antworten: schluesse.map(s => slSatz(s, namen)).concat([SL_KEINE]),
      richtig: keine ? 4 : gueltig[0],
      reihenfolgeFest: true,
      erklaerung: slErklaerung(reihenfolge, keine ? null : schluesse[gueltig[0]], namen)
    };
  }
}
