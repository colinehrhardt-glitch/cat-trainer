const abstaende = l => l.slice(1).map((x, i) => x - l[i]);
const mitVorzeichen = d => (d < 0 ? '−' : '+') + fz(Math.abs(d));
const schritt = (x, d) => `${fz(x)} ${d < 0 ? '−' : '+'} ${fz(Math.abs(d))} = ${fz(x + d)}`;
const VON_LINKS = 'Du hast von links nach rechts gerechnet. Es gilt aber Punkt vor Strich: erst mal und geteilt, dann plus und minus.';
const KLAMMER = 'Du hast die Klammer nicht beachtet. Was in der Klammer steht, rechnest du zuerst.';
const UMGEKEHRT = 'Du hast wie bei einem normalen Dreisatz gerechnet. Hier ist es aber umgekehrt: Wird das eine mehr, wird das andere weniger.';
const GLEICHER = 'Du hast den letzten Abstand einfach wiederholt. Die Abstände ändern sich aber.';
const probe = (b, x, a) => [x, `Mach die Probe: ${fz(b)} × ${fz(x)} = ${fz(b * x)}, nicht ${fz(a)}.`];

function rechnung(term, wert, falsch, erklaerung, format, regeln) {
  return { frage: 'Rechne aus.', term: term + ' = ?', ...H.optionen(wert, falsch, format, Object.assign({ stellen: true }, regeln)), erklaerung };
}

const GRUNDRECHNEN = {
  1: [
    () => {
      const a = H.zufall(15, 79), b = H.zufall(12, 59), z = b - b % 10, w = a + b;
      return rechnung(`${a} + ${b}`, w, [w + 10, w - 10, w + 1, w - 1, w + 2],
        b % 10 ? [`Erst die Zehner: ${a} + ${z} = ${a + z}`, `Dann die Einer: ${a + z} + ${b % 10} = ${w}`] : [`${a} + ${b} = ${w}`]);
    },
    () => {
      const a = H.zufall(41, 99), b = H.zufall(12, a - 11), z = b - b % 10, w = a - b;
      return rechnung(`${a} − ${b}`, w, [w + 10, w - 10, w + 1, w - 1, w + 2],
        b % 10 ? [`Erst die Zehner: ${a} − ${z} = ${a - z}`, `Dann die Einer: ${a - z} − ${b % 10} = ${w}`] : [`${a} − ${b} = ${w}`]);
    },
    () => {
      const a = H.zufall(3, 9), b = H.zufall(4, 9), w = a * b;
      return rechnung(`${a} × ${b}`, w, [[w + a, `Das wäre ${a} × ${b + 1}. Du bist im Einmaleins eine Reihe verrutscht.`], [w - a, `Das wäre ${a} × ${b - 1}. Du bist im Einmaleins eine Reihe verrutscht.`], [w + b, `Das wäre ${a + 1} × ${b}. Du bist im Einmaleins eine Reihe verrutscht.`], [w - b, `Das wäre ${a - 1} × ${b}. Du bist im Einmaleins eine Reihe verrutscht.`], w + 1], [`Einmaleins: ${a} × ${b} = ${w}`]);
    },
    () => {
      const b = H.zufall(3, 9), q = H.zufall(3, 9), a = b * q;
      return rechnung(`${a} ÷ ${b}`, q, [q + 1, q - 1, q + 2, q - 2].map(x => probe(b, x, a)), [`${a} ÷ ${b} = ${q}, denn ${b} × ${q} = ${a}`]);
    }
  ],
  2: [
    () => {
      const a = H.zufall(120, 780), b = H.zufall(110, 690), h = b - b % 100, w = a + b;
      return rechnung(`${a} + ${b}`, w, [w + 100, w - 100, w + 10, w - 10, w + 1],
        b % 100 ? [`Erst die Hunderter: ${a} + ${h} = ${a + h}`, `Dann der Rest: ${a + h} + ${b % 100} = ${w}`] : [`${a} + ${b} = ${w}`]);
    },
    () => {
      const a = H.zufall(400, 990), b = H.zufall(120, a - 60), h = b - b % 100, w = a - b;
      return rechnung(`${a} − ${b}`, w, [w + 100, w - 100, w + 10, w - 10, w - 1],
        b % 100 ? [`Erst die Hunderter: ${a} − ${h} = ${a - h}`, `Dann der Rest: ${a - h} − ${b % 100} = ${w}`] : [`${a} − ${b} = ${w}`]);
    },
    () => {
      const a = H.zufall(1, 9) * 10 + H.zufall(1, 9), b = H.zufall(3, 9), z = a - a % 10, e = a % 10, w = a * b;
      return rechnung(`${a} × ${b}`, w, [[w + b, `Das wäre ${a + 1} × ${b}.`], [w - b, `Das wäre ${a - 1} × ${b}.`], w + 10, [z * b + e, `Du hast nur ${z} × ${b} gerechnet und ${e} dazugezählt. Die ${e} musst du auch mal ${b} nehmen.`], w - 10],
        [`Zerlege ${a} in ${z} + ${e}.`, `${z} × ${b} = ${z * b} und ${e} × ${b} = ${e * b}`, `${z * b} + ${e * b} = ${w}`]);
    },
    () => {
      const b = H.zufall(3, 9), q = H.zufall(12, 45), a = b * q;
      return rechnung(`${a} ÷ ${b}`, q, [q + 1, q - 1, q + 10, q - 10, q + 2].map(x => probe(b, x, a)), [`${a} ÷ ${b} = ${q}, denn ${b} × ${q} = ${a}`]);
    }
  ],
  3: [
    () => {
      const a = H.zufall(4, 40), b = H.zufall(3, 9), c = H.zufall(3, 12), t = [a, '+', b, '×', c], w = a + b * c;
      return rechnung(H.term(t), w, [[(a + b) * c, VON_LINKS], w + b, w - c, w + 1, w + 10], ['Punkt vor Strich: erst malnehmen, dann addieren.', H.rechenweg(t)]);
    },
    () => {
      let a, b, c, d;
      do { a = H.zufall(4, 9); b = H.zufall(5, 9); c = H.zufall(2, 6); d = H.zufall(2, 5); } while (a * b <= c * d);
      const t = [a, '×', b, '−', c, '×', d], w = a * b - c * d;
      return rechnung(H.term(t), w, [[(a * b - c) * d, VON_LINKS], [a * b - c, `Du hast nur ${c} abgezogen. Abgezogen wird aber ${c} × ${d} = ${c * d}.`], w + d, w - c, w + 10], ['Punkt vor Strich: erst beide Malaufgaben, dann abziehen.', H.rechenweg(t)]);
    },
    () => {
      const c = H.zufall(2, 9), b = c * H.zufall(2, 9), a = H.zufall(5, 50), t = [a, '+', b, '÷', c], w = a + b / c;
      return rechnung(H.term(t), w, [[(a + b) / c, VON_LINKS], w + c, w - 1, w + 1, [a + b, `Du hast vergessen, ${b} durch ${c} zu teilen.`]], ['Punkt vor Strich: erst teilen, dann addieren.', H.rechenweg(t)]);
    },
    () => {
      const x = H.zufall(1, 9) * 10 + H.zufall(1, 9), y = H.zufall(10, 99) * 10 + H.zufall(1, 9), w = (x * 10 + y) / 100;
      const fehler = Math.floor(x / 10) + Math.floor(y / 100) + (x % 10 + y % 100) / 100;
      return rechnung(`${fz(x / 10)} + ${fz(y / 100)}`, w, [[fehler, 'Die Kommas standen nicht untereinander. So hast du Zehntel und Hundertstel zusammengezählt.'], w + 0.1, w - 0.1, w + 1, w - 1],
        ['Schreib die Zahlen so, dass die Kommas untereinander stehen.', `${H.zahl(x / 10, 2, true)} + ${H.zahl(y / 100, 2, true)} = ${fz(w)}`], null, { ganz: false });
    },
    () => {
      const a = H.zufall(12, 39), b = H.zufall(11, 19), e = b % 10, w = a * b;
      return rechnung(`${a} × ${b}`, w, [[w + a, `Das wäre ${a} × ${b + 1}.`], [w - a, `Das wäre ${a} × ${b - 1}.`], [a * 10 + e, `Du hast ${a} × 10 gerechnet und nur ${e} dazugezählt. Rechne auch ${a} × ${e}.`], w + 10, w - 10],
        e ? [`Zerlege ${b} in 10 + ${e}.`, `${a} × 10 = ${a * 10} und ${a} × ${e} = ${a * e}`, `${a * 10} + ${a * e} = ${w}`] : [`${a} × ${b} = ${w}`]);
    }
  ],
  4: [
    () => {
      const a = H.zufall(4, 30), b = H.zufall(3, 20), c = H.zufall(3, 9), w = (a + b) * c;
      return rechnung(`(${a} + ${b}) × ${c}`, w, [[a + b * c, KLAMMER], w + c, w - c, w + 10, [a * c + b, `Du hast nur ${a} mal ${c} genommen. Die ganze Klammer muss mal ${c} gerechnet werden.`]], ['Klammer zuerst.', `${a} + ${b} = ${a + b}`, `${a + b} × ${c} = ${w}`]);
    },
    () => {
      const a = H.zufall(3, 12), b = H.zufall(10, 30), c = H.zufall(2, b - 2), w = a * (b - c);
      return rechnung(`${a} × (${b} − ${c})`, w, [[a * b - c, KLAMMER], [w + a, `Das wäre ${a} × ${b - c + 1}.`], [w - a, `Das wäre ${a} × ${b - c - 1}.`], w + 10, [a * c, `Du hast ${a} × ${c} gerechnet. Rechne zuerst die Klammer aus.`]], ['Klammer zuerst.', `${b} − ${c} = ${b - c}`, `${a} × ${b - c} = ${w}`]);
    },
    () => {
      const x = H.zufall(1, 9) * 10 + H.zufall(1, 9);
      const y = Math.random() < 0.5 ? H.zufall(2, 9) : H.zufall(1, 2) * 10 + H.zufall(1, 9);
      const w = x * y / 100;
      return rechnung(`${fz(x / 10)} × ${fz(y / 10)}`, w, [w * 10, w / 10, w + 0.1, w + 1, w - 0.1],
        [`Rechne ohne Komma: ${x} × ${y} = ${x * y}`, `Beide Zahlen haben zusammen 2 Nachkommastellen: ${H.zahl(w, 2, true)}`], null, { ganz: false });
    },
    () => {
      let z, d;
      do { d = H.zufall(3, 8); z = H.zufall(1, d - 1); } while (H.ggt(z, d) !== 1);
      const t = H.zufall(4, 25), g = d * t, w = z * t;
      const weg = [`1/${d} von ${g} = ${g} ÷ ${d} = ${t}`];
      if (z > 1) weg.push(`${z}/${d} von ${g} = ${z} × ${t} = ${w}`);
      return rechnung(`${z}/${d} von ${g}`, w, [[t, `Das ist erst 1/${d}. Du musst das Ergebnis noch mal ${z} nehmen.`], [g - w, `Das ist der Rest, also ${d - z}/${d} von ${g}.`], [w + t, `Das wären ${z + 1}/${d} von ${g}.`], [g / z, `Du hast durch den Zähler ${z} geteilt. Teile durch den Nenner ${d}.`], w + z], weg);
    },
    () => {
      const art = H.zufall(0, 2);
      if (art === 0) {
        const a = H.zufall(5, 40), b = a + H.zufall(3, 40), w = a - b;
        return rechnung(`${a} − ${b}`, w, [-w, w - 10, w + 10, w + 1, w - 1], [`${b} ist größer als ${a}, also wird das Ergebnis negativ.`, `${b} − ${a} = ${b - a}, also ${a} − ${b} = ${fz(w)}`]);
      }
      if (art === 1) {
        const a = H.zufall(3, 12), b = H.zufall(3, 12), w = -a * b;
        return rechnung(`(−${a}) × ${b}`, w, [[-w, 'Minus mal Plus ergibt Minus. Das Ergebnis muss negativ sein.'], w - a, w + b, w + 1, w - 10], ['Minus mal Plus ergibt Minus.', `${a} × ${b} = ${a * b}, also (−${a}) × ${b} = ${fz(w)}`]);
      }
      const a = H.zufall(5, 40), b = H.zufall(5, 40), w = -a - b;
      return rechnung(`−${a} − ${b}`, w, [[-w, `Das Ergebnis ist negativ. Von −${a} geht es noch weiter ins Minus.`], [b - a, `Du hast −${a} + ${b} gerechnet. Minus ${b} heißt aber: noch weiter ins Minus.`], [a - b, `Du hast das Minus vor ${a} übersehen.`], w + 1, w - 10], [`Von −${a} gehst du noch ${b} weiter ins Minus.`, `${a} + ${b} = ${a + b}, also −${a} − ${b} = ${fz(w)}`]);
    }
  ],
  5: [
    () => {
      for (;;) {
        const e = H.zufall(2, 6), k = H.zufall(2, 9), s = e * k, c = H.zufall(1, s - 1), d = s - c, a = H.zufall(3, 12), b = H.zufall(3, 12);
        if (a * b <= s) continue;
        const w = a * b - k;
        return rechnung(`${a} × ${b} − (${c} + ${d}) ÷ ${e}`, w, [[a * b - s, `Du hast vergessen, die Klammer durch ${e} zu teilen.`], [(a * b - s) / e, `Du hast alles durch ${e} geteilt. Geteilt wird nur die Klammer, denn es gilt Punkt vor Strich.`], w + e, w - 1, w + k],
          ['Erst die Klammer, dann Punkt vor Strich.', `${c} + ${d} = ${s}`, `${a} × ${b} = ${a * b} und ${s} ÷ ${e} = ${k}`, `${a * b} − ${k} = ${w}`]);
      }
    },
    () => {
      const q = H.zufall(3, 12), t = H.zufall(2, 9), f = Math.random() < 0.4 ? 100 : 10;
      return rechnung(`${fz(q * t / f)} ÷ ${fz(t / f)}`, q, [q * 10, q / 10, q + 1, q - 1, q * 100],
        [`Nimm beide Zahlen mal ${f}. So verschwindet das Komma beim Teiler.`, `${q * t} ÷ ${t} = ${q}`], null, { ganz: false });
    },
    () => {
      for (;;) {
        const b = H.zufall(2, 6), d = H.zufall(2, 6);
        if (b === d) continue;
        const a = H.zufall(1, b - 1), c = H.zufall(1, d - 1);
        if (H.ggt(a, b) !== 1 || H.ggt(c, d) !== 1) continue;
        const n = H.kgv(b, d), za = a * n / b, zc = c * n / d, z = za + zc;
        const erweitern = 'Beim Erweitern auf den gemeinsamen Nenner ist ein Fehler passiert. Prüfe die neuen Zähler.';
        const kandidaten = [
          [a + c, b + d, 'Du hast Zähler und Nenner einfach zusammengezählt. Bei Brüchen brauchst du zuerst einen gemeinsamen Nenner.'],
          [z + 1, n, erweitern],
          [a * c, b * d, 'Du hast die Brüche malgenommen. Gefragt ist aber die Summe.'],
          [z, b + d, `Der Zähler stimmt, der Nenner nicht. Der gemeinsame Nenner ist ${n}, nicht ${b} + ${d}.`],
          [z - 1, n, erweitern],
          [z + 2, n, erweitern],
          [z, n * 2, `Der Nenner ist doppelt so groß wie nötig. Der gemeinsame Nenner ist ${n}.`]
        ]
          .filter(([p, q]) => p > 0 && p * n !== z * q)
          .map(([p, q, grund]) => [H.bruch(p, q), grund]);
        const richtig = H.bruch(z, n);
        const weg = [`Gemeinsamer Nenner: ${n}`, `${a}/${b} = ${za}/${n} und ${c}/${d} = ${zc}/${n}`, `${za}/${n} + ${zc}/${n} = ${z}/${n}`];
        if (richtig !== `${z}/${n}`) weg.push(`Gekürzt: ${richtig}`);
        return { frage: 'Rechne aus.', term: `${a}/${b} + ${c}/${d} = ?`, ...H.optionenText(richtig, kandidaten), erklaerung: weg };
      }
    },
    () => {
      const a = H.zufall(11, 20), b = H.zufall(2, a - 2), w = a * a - b * b;
      return rechnung(`${a}² − ${b}²`, w, [[(a - b) * (a - b), `Du hast (${a} − ${b})² gerechnet. Rechne zuerst beide Quadrate aus und zieh dann ab.`], w + 1, w - 1, w + 2 * b, [a * 2 - b * 2, 'Du hast mal 2 gerechnet. Hoch 2 heißt aber: die Zahl mal sich selbst.']], [`${a}² = ${a * a} und ${b}² = ${b * b}`, `${a * a} − ${b * b} = ${w}`]);
    }
  ]
};

const prozentText = x => fz(x) + ' %';

const PROZENT = {
  1: [
    () => {
      const p = H.wahl([10, 25, 50]);
      const teiler = 100 / p;
      const g = p === 10 ? 10 * H.zufall(3, 60) : p === 25 ? 4 * H.zufall(4, 50) : 2 * H.zufall(6, 99);
      const w = g / teiler;
      const anteil = { 10: 'ein Zehntel', 25: 'ein Viertel', 50: 'die Hälfte' }[p];
      return {
        frage: `Wie viel sind ${p} % von ${fz(g)}?`,
        ...H.optionen(w, [[w * 2, `Das wären ${2 * p} %.`], [w / 2, `Das wären ${fz(p / 2)} %.`], [g - w, `Das ist der Rest, also ${100 - p} %. Gefragt sind ${p} %.`], w + 10, w - 5]),
        erklaerung: [`${p} % ist ${anteil}.`, `${fz(g)} ÷ ${teiler} = ${fz(w)}`]
      };
    }
  ],
  2: [
    () => {
      const p = H.wahl([5, 15, 20, 30, 40, 75]), g = 20 * H.zufall(2, 30), w = g * p / 100;
      return {
        frage: `Wie viel sind ${p} % von ${fz(g)}?`,
        ...H.optionen(w, [g * p / 1000, [w + g / 20, `Das wären ${p + 5} %.`], [w - g / 20, `Das wären ${p - 5} %.`], [g - w, `Das ist der Rest, also ${100 - p} %. Gefragt sind ${p} %.`], [w * 2, `Das wären ${2 * p} %.`], w + 5]),
        erklaerung: [`1 % von ${fz(g)} = ${fz(g / 100)}`, `${p} % = ${p} × ${fz(g / 100)} = ${fz(w)}`]
      };
    },
    () => {
      const [z, n] = H.wahl([[1, 4], [1, 5], [3, 4], [2, 5], [3, 10], [1, 10], [3, 5], [1, 2], [4, 5], [1, 20], [7, 10], [1, 25]]);
      const k = H.zufall(2, 20), g = n * k, w = z * k, p = z / n * 100;
      return {
        frage: `Wie viel Prozent sind ${fz(w)} von ${fz(g)}?`,
        ...H.optionen(p, [p + 5, p - 5, p + 10, [100 - p, `Das ist der Rest. ${fz(g - w)} von ${fz(g)} sind ${fz(100 - p)} %.`], p * 2, p / 2], prozentText),
        erklaerung: [`${fz(w)} ÷ ${fz(g)} = ${H.zahl(w / g, 2)}`, `${H.zahl(w / g, 2)} sind ${fz(p)} %`]
      };
    }
  ],
  3: [
    () => {
      const p = H.wahl([5, 10, 15, 20, 25, 30, 40, 60, 75]), g = 20 * H.zufall(2, 25), w = g * p / 100;
      return {
        frage: `${fz(w)} sind ${p} %. Wie viel sind 100 %?`,
        ...H.optionen(g, [[g + w, `Das wären ${100 + p} %.`], [g - w, `Das wären ${100 - p} %.`], g / 2, g * 2, g + 20, [w * p, `Du hast ${fz(w)} mal ${p} genommen. Teile zuerst durch ${p}, dann hast du 1 %.`]]),
        erklaerung: [`1 % = ${fz(w)} ÷ ${p} = ${fz(w / p)}`, `100 % = 100 × ${fz(w / p)} = ${fz(g)}`]
      };
    },
    () => {
      const [ding, er] = H.wahl([['Eine Jacke', 'sie'], ['Ein Rucksack', 'er'], ['Ein Zelt', 'es'], ['Ein Paar Schuhe', 'es'], ['Eine Uhr', 'sie'], ['Ein Schlafsack', 'er']]);
      const preis = 20 * H.zufall(2, 20), p = H.wahl([10, 15, 20, 25, 30, 40]), r = preis * p / 100, neu = preis - r;
      return {
        frage: `${ding} kostet ${fe(preis)}. Der Preis wird um ${p} % gesenkt. Was kostet ${er} jetzt?`,
        ...H.optionen(neu, [[preis - p, `Du hast ${p} € abgezogen. Abgezogen werden aber ${p} % vom Preis.`], [r, 'Das ist nur die Ersparnis. Zieh sie noch vom alten Preis ab.'], [preis + r, 'Du hast die Ersparnis dazugezählt. Bei einer Preissenkung ziehst du sie ab.'], neu + 5, neu - 5, neu + 10], fe),
        erklaerung: [`${p} % von ${fe(preis)} = ${fe(r)}`, `${fe(preis)} − ${fe(r)} = ${fe(neu)}`]
      };
    },
    () => {
      const g = 100 * H.zufall(18, 40), p = H.wahl([2, 3, 4, 5, 2.5, 1.5]), r = g * p / 100, neu = g + r;
      return {
        frage: `Ein Gehalt von ${fe(g)} steigt um ${fz(p)} %. Wie hoch ist es danach?`,
        ...H.optionen(neu, [[g + r * 10, 'Beim Prozentwert ist das Komma verrutscht.'], [g - r, 'Du hast die Erhöhung abgezogen. Das Gehalt steigt, also zählst du sie dazu.'], neu + 10, neu - 10, [g + p * 100, `Du hast ${fe(p * 100)} dazugezählt. Richtig sind ${fz(p)} % von ${fe(g)} = ${fe(r)}.`]], fe, { ganz: false }),
        erklaerung: [`1 % von ${fe(g)} = ${fe(g / 100)}`, `${fz(p)} % = ${fz(p)} × ${fe(g / 100)} = ${fe(r)}`, `${fe(g)} + ${fe(r)} = ${fe(neu)}`]
      };
    }
  ],
  4: [
    () => {
      const g = 100 * H.zufall(1, 12), p = H.wahl([4, 5, 8, 12, 14, 15, 20, 25, 30, 40, 60]), d = g * p / 100;
      const steigt = Math.random() < 0.6 || p >= 60;
      const neu = steigt ? g + d : g - d;
      return {
        frage: `Ein Preis ${steigt ? 'steigt' : 'sinkt'} von ${fe(g)} auf ${fe(neu)}. Um wie viel Prozent ${steigt ? 'ist er gestiegen' : 'ist er gesunken'}?`,
        ...H.optionen(p, [[d, 'Das ist die Änderung in Euro. Teile sie noch durch den alten Preis.'], p + 2, p - 2, p + 5, [d / neu * 100, 'Du hast durch den neuen Preis geteilt. Teile durch den alten Preis.']], prozentText),
        erklaerung: [`Änderung: ${fe(Math.max(g, neu))} − ${fe(Math.min(g, neu))} = ${fe(d)}`, 'Teile die Änderung durch den alten Preis.', `${fe(d)} ÷ ${fe(g)} = ${H.zahl(d / g, 2)}, also ${p} %`]
      };
    },
    () => {
      const netto = 50 * H.zufall(2, 40), steuer = netto * 19 / 100, brutto = netto + steuer;
      return {
        frage: `Ein Gerät kostet ohne Mehrwertsteuer ${fe(netto)}. Dazu kommen 19 % Mehrwertsteuer. Was kostet es insgesamt?`,
        ...H.optionen(brutto, [[netto + 19, 'Du hast 19 € dazugezählt. Richtig sind 19 % vom Preis.'], [steuer, 'Das ist nur die Steuer. Zähl sie noch zum Preis dazu.'], brutto + 10, brutto - 10, [netto * 1.9, 'Du hast mal 1,9 gerechnet. 19 % Aufschlag heißt mal 1,19.'], brutto + 19], fe, { ganz: false }),
        erklaerung: [`1 % von ${fe(netto)} = ${fe(netto / 100)}`, `19 % = 19 × ${fe(netto / 100)} = ${fe(steuer)}`, `${fe(netto)} + ${fe(steuer)} = ${fe(brutto)}`]
      };
    }
  ],
  5: [
    () => {
      const p = H.wahl([10, 20, 25, 40, 50]), alt = 20 * H.zufall(3, 30), neu = alt * (100 - p) / 100;
      return {
        frage: `Nach einer Preissenkung um ${p} % kostet ein Gerät ${fe(neu)}. Was hat es vorher gekostet?`,
        ...H.optionen(alt, [[neu * (100 + p) / 100, `Du hast ${p} % auf den neuen Preis aufgeschlagen. Die ${p} % beziehen sich aber auf den alten Preis.`], [neu + p, `Du hast ${p} € dazugezählt, statt mit Prozent zu rechnen.`], alt + 10, alt - 10, [neu * 2, 'Du hast den Preis verdoppelt. Rechne mit dem Anteil, der nach der Senkung übrig bleibt.']], fe, { ganz: false }),
        erklaerung: [`${fe(neu)} sind ${100 - p} % des alten Preises.`, `1 % = ${fe(neu)} ÷ ${100 - p} = ${fe(alt / 100)}`, `100 % = 100 × ${fe(alt / 100)} = ${fe(alt)}`]
      };
    },
    () => {
      const preis = 100 * H.zufall(1, 9), p = H.wahl([10, 20, 25, 50]), hoch = Math.random() < 0.5;
      const z = hoch ? preis * (100 + p) / 100 : preis * (100 - p) / 100;
      const zwei = z * p / 100, ende = hoch ? z - zwei : z + zwei;
      return {
        frage: `Ein Preis von ${fe(preis)} ${hoch ? 'steigt' : 'sinkt'} um ${p} % und ${hoch ? 'sinkt' : 'steigt'} danach wieder um ${p} %. Wie hoch ist er jetzt?`,
        ...H.optionen(ende, [[preis, 'Das ist der Startpreis. Der zweite Schritt bezieht sich auf den neuen Preis, deshalb kommt nicht der alte Preis heraus.'], preis - p, ende - 10, ende + 10, [z, 'Das ist der Preis nach dem ersten Schritt. Der zweite Schritt fehlt noch.']], fe, { ganz: false }),
        erklaerung: [`Nach dem ersten Schritt: ${fe(z)}`, 'Der zweite Schritt bezieht sich auf diesen neuen Preis.', `${p} % von ${fe(z)} = ${fe(zwei)}`, `${fe(z)} ${hoch ? '−' : '+'} ${fe(zwei)} = ${fe(ende)}`]
      };
    },
    () => {
      const k = 1000 * H.zufall(1, 5), p = H.wahl([2, 3, 4, 5, 10]), z1 = k * p / 100, k1 = k + z1, z2 = k1 * p / 100, k2 = k1 + z2;
      return {
        frage: `Du legst ${fe(k)} für 2 Jahre zu ${p} % Zinsen an. Die Zinsen werden mitverzinst. Wie viel Geld hast du nach 2 Jahren?`,
        ...H.optionen(k2, [[k + 2 * z1, 'Du hast zweimal dieselben Zinsen gerechnet. Im zweiten Jahr gibt es auch Zinsen auf die Zinsen.'], k2 + 10, k2 - 10, [k1, 'Das ist das Geld nach einem Jahr. Gefragt sind zwei Jahre.'], k2 + z1], fe, { ganz: false }),
        erklaerung: [`Nach 1 Jahr: ${fe(k)} + ${fe(z1)} = ${fe(k1)}`, `Zinsen im 2. Jahr: ${p} % von ${fe(k1)} = ${fe(z2)}`, `Nach 2 Jahren: ${fe(k1)} + ${fe(z2)} = ${fe(k2)}`]
      };
    }
  ]
};

const DREISATZ = {
  1: [
    () => {
      const [ein, mehr, min, max] = H.wahl([['Heft', 'Hefte', 1, 3], ['Ticket', 'Tickets', 2, 9], ['Batteriepack', 'Batteriepacks', 3, 8], ['Tafel Schokolade', 'Tafeln Schokolade', 1, 3], ['Buch', 'Bücher', 8, 15], ['Kinokarte', 'Kinokarten', 7, 12]]);
      const e = H.zufall(min, max), a = H.zufall(2, 6);
      let b;
      do { b = H.zufall(2, 12); } while (b === a);
      const g = a * e, w = b * e, stueck = k => (k === 1 ? `1 ${ein}` : `${k} ${mehr}`);
      return {
        frage: `${a} ${mehr} kosten ${fe(g)}. Wie viel kosten ${b} ${mehr}?`,
        ...H.optionen(w, [[g + (b - a), `Du hast einfach ${b > a ? `${b - a} € dazugezählt` : `${a - b} € abgezogen`}. Rechne zuerst aus, was 1 ${ein} kostet.`], [g * b, `Du hast den Preis für ${a} ${mehr} mal ${b} genommen. Rechne zuerst aus, was 1 ${ein} kostet.`], [w + e, `Das wäre der Preis für ${stueck(b + 1)}.`], [w - e, `Das wäre der Preis für ${stueck(b - 1)}.`], w + 1], fe),
        erklaerung: [`1 ${ein} kostet ${fe(g)} ÷ ${a} = ${fe(e)}`, `${b} ${mehr} kosten ${b} × ${fe(e)} = ${fe(w)}`]
      };
    }
  ],
  2: [
    () => {
      const [einh, ware] = H.wahl([['kg', 'Äpfel'], ['Liter', 'Milch'], ['Meter', 'Seil'], ['kg', 'Kartoffeln'], ['Liter', 'Diesel']]);
      const u = 5 * H.zufall(7, 56), a = H.zufall(2, 8);
      let b;
      do { b = H.zufall(3, 12); } while (b === a);
      const g = a * u / 100, w = b * u / 100;
      return {
        frage: `${a} ${einh} ${ware} kosten ${fe(g)}. Wie viel kosten ${b} ${einh}?`,
        ...H.optionen(w, [[g + (b - a), `Du hast einfach ${b > a ? `${b - a} € dazugezählt` : `${a - b} € abgezogen`}. Rechne zuerst aus, was 1 ${einh} kostet.`], [w + u / 100, `Das wäre der Preis für ${b + 1} ${einh}.`], [w - u / 100, `Das wäre der Preis für ${b - 1} ${einh}.`], w + 1, w - 0.5, [g * b, `Du hast den Preis für ${a} ${einh} mal ${b} genommen. Rechne zuerst aus, was 1 ${einh} kostet.`]], fe, { ganz: false }),
        erklaerung: [`1 ${einh} kostet ${fe(g)} ÷ ${a} = ${fe(u / 100)}`, `${b} ${einh} kosten ${b} × ${fe(u / 100)} = ${fe(w)}`]
      };
    },
    () => {
      const v = H.zufall(5, 12), s = 50 * H.zufall(3, 16), l = v * s / 100;
      return {
        frage: `Ein Fahrzeug verbraucht ${v} Liter auf 100 km. Wie viele Liter braucht es für ${s} km?`,
        ...H.optionen(l, [[l + v, 'Das wäre der Verbrauch für 100 km mehr.'], [l - v, 'Das wäre der Verbrauch für 100 km weniger.'], v * s / 10, [l + v / 2, 'Das wäre der Verbrauch für 50 km mehr.'], [l * 2, `Das wäre der Verbrauch für ${2 * s} km.`]], x => H.einheit(x, 'l'), { ganz: false }),
        erklaerung: [`Auf 1 km: ${v} l ÷ 100 = ${fz(v / 100)} l`, `Auf ${s} km: ${s} × ${fz(v / 100)} l = ${fz(l)} l`]
      };
    }
  ],
  3: [
    () => {
      for (;;) {
        const t = H.wahl([12, 18, 24, 30, 36, 40, 48, 60, 72]);
        const teiler = [];
        for (let k = 2; k <= 12; k++) if (t % k === 0 && t / k >= 2 && t / k <= 24) teiler.push(k);
        if (teiler.length < 2) continue;
        const a = H.wahl(teiler);
        let b;
        do { b = H.wahl(teiler); } while (b === a);
        const arbeit = H.wahl(['ein Zeltlager aufzubauen', 'einen Lkw zu entladen', 'eine Halle zu streichen', 'einen Graben auszuheben']);
        return {
          frage: `${a} Helfer brauchen ${t / a} Stunden, um ${arbeit}. Wie lange brauchen ${b} Helfer?`,
          ...H.optionen(t / b, [[t / a * b / a, UMGEKEHRT], [t / a + (a - b), 'Du hast nur den Unterschied bei der Zahl der Helfer verrechnet. Rechne aus, wie lange 1 Helfer bräuchte.'], [t / a, `Das ist die Zeit für ${a} Helfer. Gefragt ist die Zeit für ${b} Helfer.`], t / b + 1, t / b - 1, t / b + 2], x => H.einheit(x, 'Stunden')),
          erklaerung: ['Mehr Helfer brauchen weniger Zeit. Das ist ein umgekehrter Dreisatz.', `1 Helfer bräuchte ${a} × ${t / a} = ${t} Stunden.`, `${b} Helfer brauchen ${t} ÷ ${b} = ${t / b} Stunden.`]
        };
      }
    }
  ],
  4: [
    () => {
      for (;;) {
        const p1 = H.wahl([10, 12, 15, 20, 24, 30, 40]), d1 = H.zufall(6, 30), t = p1 * d1;
        const moeglich = [];
        for (let p = 5; p <= 60; p++) if (p !== p1 && t % p === 0 && t / p >= 3 && t / p <= 60) moeglich.push(p);
        if (!moeglich.length) continue;
        const p2 = H.wahl(moeglich), d2 = t / p2;
        return {
          frage: `Ein Vorrat reicht für ${p1} Personen ${d1} Tage. Wie lange reicht er für ${p2} Personen?`,
          ...H.optionen(d2, [[d1 * p2 / p1, UMGEKEHRT], [d1 + p1 - p2, 'Du hast nur den Unterschied bei der Personenzahl verrechnet. Rechne aus, wie lange der Vorrat für 1 Person reicht.'], d2 + 1, d2 - 1, d2 + 2], x => H.einheit(x, 'Tage')),
          erklaerung: [`${p2 > p1 ? 'Mehr' : 'Weniger'} Personen bedeutet ${p2 > p1 ? 'weniger' : 'mehr'} Tage. Das ist ein umgekehrter Dreisatz.`, `Für 1 Person: ${p1} × ${d1} = ${t} Tage`, `Für ${p2} Personen: ${t} ÷ ${p2} = ${d2} Tage`]
        };
      }
    },
    () => {
      for (;;) {
        const v1 = 10 * H.zufall(4, 10), t1 = H.wahl([1.5, 2, 2.5, 3, 4, 5]), s = v1 * t1;
        const moeglich = [];
        for (let v = 30; v <= 130; v += 10) if (v !== v1 && (s * 4) % v === 0 && s / v >= 1) moeglich.push(v);
        if (!moeglich.length) continue;
        const v2 = H.wahl(moeglich), t2 = s / v2;
        return {
          frage: `Bei ${v1} km/h dauert eine Fahrt ${H.dauer(t1)}. Wie lange dauert sie bei ${v2} km/h?`,
          ...H.optionen(t2, [[t1 * v2 / v1, UMGEKEHRT], [t1, 'Das ist die alte Fahrzeit. Bei einer anderen Geschwindigkeit ändert sich die Zeit.'], t2 + 0.5, t2 - 0.25, t2 + 0.25], H.dauer, { ganz: false }),
          erklaerung: [`${v2 > v1 ? 'Schneller' : 'Langsamer'} fahren bedeutet ${v2 > v1 ? 'weniger' : 'mehr'} Zeit.`, `Strecke: ${v1} km/h × ${fz(t1)} h = ${fz(s)} km`, `${fz(s)} km ÷ ${v2} km/h = ${H.dauer(t2)}`]
        };
      }
    }
  ],
  5: [
    () => {
      const r = H.zufall(5, 30), m1 = H.zufall(2, 8), h1 = H.zufall(2, 8);
      let m2, h2;
      do { m2 = H.zufall(2, 12); h2 = H.zufall(2, 10); } while (m2 === m1 || h2 === h1);
      const w1 = m1 * h1 * r, w2 = m2 * h2 * r;
      return {
        frage: `${m1} Maschinen stellen in ${h1} Stunden ${fz(w1)} Teile her. Wie viele Teile stellen ${m2} Maschinen in ${h2} Stunden her?`,
        ...H.optionen(w2, [[w1 * m2 / m1, `Du hast nur die Maschinen umgerechnet. Die Stunden ändern sich auch, von ${h1} auf ${h2}.`], [w1 * h2 / h1, `Du hast nur die Stunden umgerechnet. Die Maschinen ändern sich auch, von ${m1} auf ${m2}.`], w2 + r, w2 - r, w2 + 10 * r]),
        erklaerung: [`1 Maschine in 1 Stunde: ${fz(w1)} ÷ ${m1} ÷ ${h1} = ${r} Teile`, `${m2} Maschinen in ${h2} Stunden: ${r} × ${m2} × ${h2} = ${fz(w2)} Teile`]
      };
    },
    () => {
      for (;;) {
        const a1 = H.zufall(2, 12), a2 = H.zufall(2, 12), g1 = H.zufall(1, 5), g2 = H.zufall(1, 5), c = H.zufall(2, 12) * H.wahl([2, 3, 4, 6]);
        if (a1 === a2 || g1 === g2) continue;
        const d1 = c * g1 / a1, d2 = c * g2 / a2;
        if (!Number.isInteger(d1) || !Number.isInteger(d2) || d1 < 2 || d2 < 2 || d1 > 40 || d2 > 40) continue;
        const ga = n => n === 1 ? '1 Garage' : `${n} Garagen`;
        return {
          frage: `${a1} Arbeiter bauen in ${d1} Tagen ${ga(g1)}. Wie viele Tage brauchen ${a2} Arbeiter für ${ga(g2)}?`,
          ...H.optionen(d2, [[d1 * a2 / a1, 'Du hast die Garagen vergessen und die Arbeiter normal gerechnet. Mehr Arbeiter brauchen aber weniger Zeit.'], [d1 * g2 / g1, 'Du hast nur die Garagen umgerechnet. Die Zahl der Arbeiter ändert sich auch.'], d2 + 1, d2 - 1, d2 + 2], x => H.einheit(x, 'Tage')),
          erklaerung: [`1 Arbeiter bräuchte für 1 Garage ${a1} × ${d1} ÷ ${g1} = ${c} Tage.`, `${a2} Arbeiter für ${ga(g2)}: ${c} × ${g2} ÷ ${a2} = ${d2} Tage`]
        };
      }
    }
  ]
};

const TEXTAUFGABEN = [
  {
    von: 1, bis: 2, f: () => {
      const [ding, dinge] = H.wahl([['Brötchen', 'Brötchen'], ['Apfel', 'Äpfel'], ['Brezel', 'Brezeln'], ['Banane', 'Bananen']]);
      const [zweit] = H.wahl([['eine Flasche Wasser'], ['einen Saft'], ['eine Zeitung']]);
      const anz = H.zufall(2, 5), p = 5 * H.zufall(6, 18), q = 10 * H.zufall(8, 25), summe = anz * p + q;
      const schein = [500, 1000, 2000].find(s => s >= summe + 50), r = schein - summe;
      return {
        frage: `Du kaufst ${anz} ${dinge} zu je ${fe(p / 100)} und ${zweit} für ${fe(q / 100)}. Du zahlst mit ${fe(schein / 100)}. Wie viel Geld bekommst du zurück?`,
        ...H.optionen(r / 100, [[(schein - p - q) / 100, `Du hast nur 1 ${ding} gerechnet. Du kaufst aber ${anz}.`], [summe / 100, 'Das ist der Preis für den Einkauf. Gefragt ist das Rückgeld.'], (r + 10) / 100, (r - 10) / 100, (r + 100) / 100], fe, { ganz: false }),
        erklaerung: [`${dinge}: ${anz} × ${fe(p / 100)} = ${fe(anz * p / 100)}`, `Zusammen: ${fe(anz * p / 100)} + ${fe(q / 100)} = ${fe(summe / 100)}`, `Rückgeld: ${fe(schein / 100)} − ${fe(summe / 100)} = ${fe(r / 100)}`]
      };
    }
  },
  {
    von: 1, bis: 2, f: n => {
      const start = 5 * H.zufall(72, 240);
      const dauer = n === 1 ? 5 * H.zufall(3, 11) : 5 * H.zufall(13, 47);
      const ende = start + dauer, h = Math.floor(dauer / 60), m = dauer % 60;
      let weg;
      if (h > 0) {
        weg = [`Erst die Stunden: ${H.uhr(start)} + ${h} h = ${H.uhr(start + 60 * h)}`];
        if (m) weg.push(`Dann die Minuten: ${H.uhr(start + 60 * h)} + ${m} min = ${H.uhr(ende)}`);
      } else {
        const bis = 60 - start % 60;
        weg = dauer > bis
          ? [`Bis ${H.uhr(start + bis)} sind es ${bis} Minuten.`, `Es bleiben noch ${dauer - bis} Minuten: ${H.uhr(ende)}`]
          : [`${H.uhr(start)} + ${dauer} min = ${H.uhr(ende)}`];
      }
      return {
        frage: n === 1
          ? `Ein Bus fährt um ${H.uhr(start)} ab und ist ${dauer} Minuten unterwegs. Wann kommt er an?`
          : `Ein Zug fährt um ${H.uhr(start)} ab. Die Fahrt dauert ${H.dauer(dauer / 60)}. Wann kommt er an?`,
        ...H.optionen(ende, [[ende - 60, 'Du hast eine Stunde zu wenig gerechnet.'], [ende + 60, 'Du hast eine Stunde zu viel gerechnet.'], [ende + 10, 'Das sind 10 Minuten zu viel.'], [ende - 10, 'Das sind 10 Minuten zu wenig.'], [ende + 5, 'Das sind 5 Minuten zu viel.']], H.uhr),
        erklaerung: weg
      };
    }
  },
  {
    von: 1, bis: 2, f: () => {
      const reihen = H.zufall(3, 9), je = H.zufall(4, 12), kaputt = H.zufall(2, 9), alle = reihen * je, rest = alle - kaputt;
      return {
        frage: `In einer Kiste stehen ${reihen} Reihen mit je ${je} Flaschen. ${kaputt} Flaschen sind zerbrochen. Wie viele Flaschen sind noch ganz?`,
        ...H.optionen(rest, [[alle, 'Das sind alle Flaschen. Die zerbrochenen musst du noch abziehen.'], [alle + kaputt, 'Du hast die zerbrochenen Flaschen dazugezählt. Sie müssen abgezogen werden.'], rest + 1, rest - 1, rest - reihen]),
        erklaerung: [`Flaschen: ${reihen} × ${je} = ${alle}`, `Noch ganz: ${alle} − ${kaputt} = ${rest}`]
      };
    }
  },
  {
    von: 2, bis: 3, f: () => {
      const v = 10 * H.zufall(4, 12), t = H.wahl([1.5, 2, 2.5, 3, 3.5, 4]), s = v * t;
      if (Math.random() < 0.5) {
        return {
          frage: `Ein Fahrzeug fährt ${H.dauer(t)} lang mit ${v} km/h. Wie weit kommt es?`,
          ...H.optionen(s, [[v * Math.floor(t), 'Du hast die halbe Stunde vergessen.'], [s + v / 2, 'Das wäre eine halbe Stunde mehr.'], [s - v / 2, 'Das wäre eine halbe Stunde weniger.'], s + 10, [s + v, 'Das wäre eine Stunde mehr.']], x => H.einheit(x, 'km')),
          erklaerung: ['Strecke = Geschwindigkeit × Zeit', `${v} km/h × ${fz(t)} h = ${fz(s)} km`]
        };
      }
      const falsch = [t + 0.5, t - 0.5, t + 0.25, t + 1];
      if (t % 1) falsch.push([Math.floor(t) + 50 / 60, 'Du hast 0,5 Stunden als 50 Minuten gelesen. Eine halbe Stunde sind 30 Minuten.']);
      return {
        frage: `Ein Fahrzeug fährt mit ${v} km/h. Wie lange braucht es für ${fz(s)} km?`,
        ...H.optionen(t, falsch, H.dauer, { ganz: false }),
        erklaerung: ['Zeit = Strecke ÷ Geschwindigkeit', `${fz(s)} km ÷ ${v} km/h = ${fz(t)} h = ${H.dauer(t)}`]
      };
    }
  },
  {
    von: 2, bis: 3, f: () => {
      for (;;) {
        const k = H.wahl([4, 5]), schnitt = H.zufall(8, 20), werte = [];
        for (let i = 0; i < k - 1; i++) werte.push(schnitt + H.zufall(-6, 6));
        const letzter = k * schnitt - werte.reduce((a, b) => a + b, 0);
        if (letzter < 2 || letzter > 30) continue;
        werte.push(letzter);
        const summe = k * schnitt;
        return {
          frage: `Bei ${k === 4 ? 'vier' : 'fünf'} Tests erreichst du ${H.und(werte.map(String))} Punkte. Wie hoch ist dein Durchschnitt?`,
          ...H.optionen(schnitt, [schnitt + 1, schnitt - 1, schnitt + 2, [summe / (k - 1), `Du hast durch ${k - 1} geteilt. Es sind aber ${k} Tests.`], schnitt - 2], x => H.einheit(x, 'Punkte')),
          erklaerung: [`Summe: ${werte.join(' + ')} = ${summe}`, `Durchschnitt: ${summe} ÷ ${k} = ${schnitt} Punkte`]
        };
      }
    }
  },
  {
    von: 2, bis: 3, f: () => {
      const rate = 5 * H.zufall(4, 30), n = H.zufall(3, 12), an = 50 * H.zufall(1, 8), preis = an + n * rate;
      const ding = H.wahl(['Ein Fahrrad', 'Ein Handy', 'Ein Laptop', 'Ein Sofa']);
      return {
        frage: `${ding} kostet ${fe(preis)}. Du zahlst ${fe(an)} an. Den Rest zahlst du in ${n} gleichen Raten. Wie hoch ist eine Rate?`,
        ...H.optionen(rate, [[preis / n, 'Du hast die Anzahlung vergessen. Zieh sie zuerst vom Preis ab.'], [(preis + an) / n, 'Du hast die Anzahlung dazugezählt. Sie wird abgezogen.'], rate + 5, rate - 5, rate + 10], fe, { ganz: false }),
        erklaerung: [`Rest: ${fe(preis)} − ${fe(an)} = ${fe(preis - an)}`, `Eine Rate: ${fe(preis - an)} ÷ ${n} = ${fe(rate)}`]
      };
    }
  },
  {
    von: 3, bis: 4, f: () => {
      for (;;) {
        const v = H.wahl([3, 4, 4.5, 5, 6]), t = H.wahl([2, 2.5, 3, 3.5, 4, 4.5, 5, 6]), s = v * t;
        if ((s * 2) % 1) continue;
        const pause = H.wahl([15, 20, 30, 45, 60]), gesamt = t + pause / 60;
        return {
          frage: `Eine Gruppe marschiert ${fz(s)} km mit ${fz(v)} km/h. Unterwegs macht sie insgesamt ${pause} Minuten Pause. Wie lange ist sie insgesamt unterwegs?`,
          ...H.optionen(gesamt, [[t, 'Das ist nur die Gehzeit. Die Pause fehlt noch.'], gesamt + 0.5, gesamt - 0.25, [t + 2 * pause / 60, 'Du hast die Pause doppelt gezählt.'], gesamt + 0.25], H.dauer, { ganz: false }),
          erklaerung: [`Gehzeit: ${fz(s)} km ÷ ${fz(v)} km/h = ${H.dauer(t)}`, `Mit Pause: ${H.dauer(t)} + ${pause} min = ${H.dauer(gesamt)}`]
        };
      }
    }
  },
  {
    von: 3, bis: 4, f: () => {
      const v = H.zufall(5, 9), s = 100 * H.zufall(2, 8), preis = H.zufall(15, 20) / 10, liter = v * s / 100, kosten = liter * preis;
      return {
        frage: `Ein Auto verbraucht ${v} Liter auf 100 km. Ein Liter Benzin kostet ${fe(preis)}. Was kostet eine Fahrt über ${s} km?`,
        ...H.optionen(kosten, [[v * preis, 'Das sind nur die Kosten für 100 km.'], [kosten + v * preis, 'Das wären die Kosten für 100 km mehr.'], kosten - 2 * preis, kosten + 5, kosten - 5], fe, { ganz: false }),
        erklaerung: [`Verbrauch: ${s / 100} × ${v} l = ${liter} l`, `Kosten: ${liter} × ${fe(preis)} = ${fe(kosten)}`]
      };
    }
  },
  {
    von: 3, bis: 3, f: () => {
      const k = 100 * H.zufall(10, 60), p = H.wahl([1, 1.5, 2, 2.5, 3, 4]), z = k * p / 100;
      return {
        frage: `Du legst ${fe(k)} für ein Jahr zu ${fz(p)} % Zinsen an. Wie viel Zinsen bekommst du?`,
        ...H.optionen(z, [z * 10, z / 10, [z + k / 100, `Das wären ${fz(p + 1)} % Zinsen.`], [k + z, 'Das ist das ganze Guthaben. Gefragt sind nur die Zinsen.'], [z - k / 200, `Das wären ${fz(p - 0.5)} % Zinsen.`]], fe, { ganz: false }),
        erklaerung: p === 1 ? [`1 % von ${fe(k)} = ${fe(z)}`] : [`1 % von ${fe(k)} = ${fe(k / 100)}`, `${fz(p)} % = ${fz(p)} × ${fe(k / 100)} = ${fe(z)}`]
      };
    }
  },
  {
    von: 3, bis: 5, f: () => {
      for (;;) {
        const k = H.wahl([3, 4, 5]), m = H.zufall(2, k - 1), s = H.zufall(4, 20), j = s * (k - m) / (m - 1), alt = k * s;
        if (!Number.isInteger(j) || j < 2 || j > 30 || alt < 25 || alt > 60) continue;
        const [eltern, kind] = H.wahl([['Ein Vater', 'sein Sohn'], ['Eine Mutter', 'ihre Tochter'], ['Ein Vater', 'seine Tochter'], ['Eine Mutter', 'ihr Sohn']]);
        const mal = { 2: 'doppelt', 3: 'dreimal', 4: 'viermal' }[m];
        return {
          frage: `${eltern} ist heute ${k}-mal so alt wie ${kind}. In ${j} Jahren ist ${eltern.endsWith('Vater') ? 'er' : 'sie'} nur noch ${mal} so alt. Wie alt ist ${kind} heute?`,
          ...H.optionen(s, [[alt, `Das ist das Alter ${eltern.endsWith('Vater') ? 'des Vaters' : 'der Mutter'}. Gefragt ist das Kind.`], s + 1, s - 1, s + 2, [j, 'Das ist die Zahl der Jahre aus der Frage, nicht das Alter.']], x => H.einheit(x, 'Jahre')),
          erklaerung: [
            `Alter des Kindes heute: x. Dann ist ${eltern.endsWith('Vater') ? 'der Vater' : 'die Mutter'} ${k}x.`,
            `In ${j} Jahren: ${k}x + ${j} = ${m} × (x + ${j})`,
            k - m === 1 ? `${k}x + ${j} = ${m}x + ${m * j}, also x = ${s} Jahre` : `${k}x + ${j} = ${m}x + ${m * j}, also ${k - m}x = ${(m - 1) * j} und x = ${s} Jahre`,
            `Probe: heute ${s} und ${alt} Jahre, in ${j} Jahren ${s + j} und ${alt + j} Jahre.`
          ]
        };
      }
    }
  },
  {
    von: 4, bis: 5, f: () => {
      const v1 = 10 * H.zufall(4, 10), v2 = 10 * H.zufall(4, 10), t = H.wahl([1, 1.5, 2, 2.5, 3, 4]), s = (v1 + v2) * t;
      return {
        frage: `Zwei Fahrzeuge sind ${fz(s)} km voneinander entfernt. Sie fahren aufeinander zu, eines mit ${v1} km/h, das andere mit ${v2} km/h. Nach welcher Zeit treffen sie sich?`,
        ...H.optionen(t, [[s / v1, 'Du hast nur ein Fahrzeug beachtet. Beide fahren aufeinander zu, also zählen beide Geschwindigkeiten.'], [s / v2, 'Du hast nur ein Fahrzeug beachtet. Beide fahren aufeinander zu, also zählen beide Geschwindigkeiten.'], t + 0.5, t - 0.5, [t * 2, 'Das ist doppelt so lang. Beide fahren gleichzeitig.']], H.dauer, { ganz: false }),
        erklaerung: [`Sie kommen sich pro Stunde ${v1} km + ${v2} km = ${v1 + v2} km näher.`, `${fz(s)} km ÷ ${v1 + v2} km/h = ${H.dauer(t)}`]
      };
    }
  },
  {
    von: 4, bis: 5, f: () => {
      const [a, b] = H.mische(H.wahl([[6, 3], [12, 4], [10, 15], [6, 12], [20, 30], [4, 12], [24, 8], [18, 9], [10, 40], [5, 20], [3, 6], [8, 24]]));
      const t = a * b / (a + b);
      const pumpe = Math.random() < 0.5;
      return {
        frage: pumpe
          ? `Pumpe A füllt einen Tank in ${a} Stunden, Pumpe B in ${b} Stunden. Wie lange brauchen beide zusammen?`
          : `Lena streicht einen Zaun allein in ${a} Stunden, Ben in ${b} Stunden. Wie lange brauchen beide zusammen?`,
        ...H.optionen(t, [[(a + b) / 2, 'Du hast den Durchschnitt genommen. Zusammen geht es aber schneller als jeder allein.'], [Math.abs(a - b), 'Der Unterschied der Zeiten hilft hier nicht. Rechne aus, wie viel beide zusammen pro Stunde schaffen.'], [Math.min(a, b) / 2, 'Das würde nur stimmen, wenn beide gleich schnell wären.'], t + 1, t - 1], H.dauer, { ganz: false }),
        erklaerung: [`Pro Stunde schafft ${pumpe ? 'Pumpe A' : 'Lena'} 1/${a} und ${pumpe ? 'Pumpe B' : 'Ben'} 1/${b} der Arbeit.`, `Zusammen: 1/${a} + 1/${b} = ${H.bruch(a + b, a * b)} pro Stunde`, `Also brauchen beide ${H.dauer(t)}.`]
      };
    }
  },
  {
    von: 4, bis: 5, f: () => {
      const k = H.zufall(3, 5), a1 = H.zufall(10, 18), a2 = a1 + H.zufall(1, 3), noetig = (k + 1) * a2 - k * a1;
      return {
        frage: `Nach ${k} Tests hast du im Schnitt ${a1} Punkte. Wie viele Punkte brauchst du im nächsten Test, um auf einen Schnitt von ${a2} zu kommen?`,
        ...H.optionen(noetig, [[a2 + (a2 - a1), 'Du hast den Unterschied nur einmal dazugezählt. Er fehlt aber bei allen bisherigen Tests.'], [a2, 'Mit dem Ziel-Schnitt allein steigt der Durchschnitt nicht. Du musst die fehlenden Punkte ausgleichen.'], noetig + 1, noetig - 1, noetig + 2], x => H.einheit(x, 'Punkte')),
        erklaerung: [`Bisher: ${k} × ${a1} = ${k * a1} Punkte`, `Ziel: ${k + 1} × ${a2} = ${(k + 1) * a2} Punkte`, `Im nächsten Test: ${(k + 1) * a2} − ${k * a1} = ${noetig} Punkte`]
      };
    }
  },
  {
    von: 5, bis: 5, f: () => {
      for (;;) {
        const m1 = H.zufall(1, 5), m2 = H.zufall(1, 5), p1 = H.zufall(4, 12), p2 = p1 + H.zufall(2, 9), summe = m1 * p1 + m2 * p2, menge = m1 + m2;
        if ((summe * 100) % menge) continue;
        const preis = summe / menge;
        return {
          frage: `Du mischst ${m1} kg Nüsse zu ${fe(p1)} pro kg mit ${m2} kg Nüssen zu ${fe(p2)} pro kg. Was kostet 1 kg der Mischung?`,
          ...H.optionen(preis, [[(p1 + p2) / 2, 'Du hast den Durchschnitt der Preise genommen. Die Mengen sind aber verschieden.'], preis + 1, preis - 1, preis + 0.5, [summe, 'Das ist der Preis für die ganze Mischung. Teile ihn noch durch die Menge.']], fe, { ganz: false }),
          erklaerung: [`Gesamtpreis: ${m1} × ${fe(p1)} + ${m2} × ${fe(p2)} = ${fe(summe)}`, `Gesamtmenge: ${m1} kg + ${m2} kg = ${menge} kg`, `Preis pro kg: ${fe(summe)} ÷ ${menge} = ${fe(preis)}`]
        };
      }
    }
  }
];

function zeichenGrund(tokens, ziel) {
  return `Mit diesen Zeichen rechnest du ${H.rechenweg(tokens)}. Gesucht ist aber ${fz(ziel)}.`;
}

function rechenzeichen(n) {
  const OPS = ['+', '−', '×', '÷'];
  if (n <= 2) {
    for (;;) {
      const op = H.wahl(OPS);
      let a, b;
      if (op === '+') { a = n === 1 ? H.zufall(2, 20) : H.zufall(15, 150); b = n === 1 ? H.zufall(2, 20) : H.zufall(15, 150); }
      if (op === '−') { a = n === 1 ? H.zufall(6, 30) : H.zufall(40, 200); b = H.zufall(2, a - 2); }
      if (op === '×') { a = n === 1 ? H.zufall(2, 9) : H.zufall(11, 25); b = H.zufall(2, 9); }
      if (op === '÷') { b = n === 1 ? H.zufall(2, 9) : H.zufall(3, 12); a = b * (n === 1 ? H.zufall(2, 9) : H.zufall(6, 20)); }
      const c = H.rechne(a, op, b);
      if (OPS.filter(o => H.auswerten([a, o, b]) === c).length !== 1) continue;
      return {
        frage: 'Welches Rechenzeichen fehlt?',
        zeichen: { teile: [a, '?', b], ergebnis: c },
        antworten: OPS.slice(),
        richtig: OPS.indexOf(op),
        gruende: Object.fromEntries(OPS.filter(o => o !== op).map(o => [o, zeichenGrund([a, o, b], c)])),
        reihenfolgeFest: true,
        erklaerung: [`${fz(a)} ${op} ${fz(b)} = ${fz(c)}`, 'Mit den anderen Zeichen kommt etwas anderes heraus.']
      };
    }
  }
  const anzahl = n === 5 ? 3 : 2, max = n === 4 ? 20 : 10;
  let kombis = [[]];
  for (let i = 0; i < anzahl; i++) kombis = kombis.flatMap(k => OPS.map(o => k.concat(o)));
  const verflechte = (zahlen, ops) => zahlen.flatMap((z, i) => (i < ops.length ? [z, ops[i]] : [z]));
  for (;;) {
    const zahlen = Array.from({ length: anzahl + 1 }, () => H.zufall(2, max));
    const werte = kombis.map(k => H.auswerten(verflechte(zahlen, k)));
    const eindeutig = werte.map((w, i) => i).filter(i => werte[i] !== null && werte.filter(w => w === werte[i]).length === 1);
    const mitPunkt = eindeutig.filter(i => kombis[i].some(o => o === '×' || o === '÷') && kombis[i].some(o => o === '+' || o === '−'));
    const auswahl = mitPunkt.length && Math.random() < 0.7 ? mitPunkt : eindeutig;
    if (!auswahl.length) continue;
    const ziel = H.wahl(auswahl);
    const andere = H.mische(kombis.filter((k, i) => i !== ziel)).slice(0, 3);
    const optionen = H.mische([kombis[ziel]].concat(andere));
    return {
      frage: 'Welche Rechenzeichen fehlen?',
      zeichen: { teile: verflechte(zahlen, Array(anzahl).fill('?')), ergebnis: werte[ziel] },
      antworten: optionen.map(k => H.und(k)),
      richtig: optionen.indexOf(kombis[ziel]),
      gruende: Object.fromEntries(andere.map(k => [H.und(k), zeichenGrund(verflechte(zahlen, k), werte[ziel])])),
      erklaerung: ['Es gilt Punkt vor Strich.', H.rechenweg(verflechte(zahlen, kombis[ziel]))]
    };
  }
}

const OP = {
  '+': (x, w) => x + w,
  '−': (x, w) => x - w,
  '×': (x, w) => x * w,
  '÷': (x, w) => x / w
};
const opText = o => o[0] + fz(o[1]);
const opSchritt = (x, o) => `${fz(x)} ${o[0]} ${fz(o[1])} = ${fz(OP[o[0]](x, o[1]))}`;

function zyklus(start, ops, laenge) {
  const folge = [start];
  for (let i = 0; folge.length < laenge; i++) {
    const o = ops[i % ops.length];
    folge.push(OP[o[0]](letzte(folge), o[1]));
  }
  return folge;
}

function zyklusReihe(start, ops, laenge) {
  const folge = zyklus(start, ops, laenge);
  const naechste = ops[(laenge - 2) % ops.length];
  const l = letzte(folge, 2);
  const a = letzte(folge);
  const andere = ops.filter(o => o !== naechste).map(o => [OP[o[0]](l, o[1]), `Du hast ${opText(o)} gerechnet. Als Nächstes ist aber ${opText(naechste)} dran.`]);
  return {
    folge,
    falsch: andere.concat([a + 1, a - 1, a + 2, a - 2]),
    erklaerung: [
      ops.length === 2
        ? `Es wird abwechselnd ${opText(ops[0])} und ${opText(ops[1])} gerechnet.`
        : `Die Rechenschritte wiederholen sich: ${ops.map(opText).join(', ')}.`,
      `Als Nächstes kommt ${opText(naechste)}: ${opSchritt(l, naechste)}`
    ]
  };
}

function verschachtelt(r1, r2, laenge) {
  const n1 = Math.ceil(laenge / 2), n2 = Math.floor(laenge / 2);
  const a = zyklus(r1[0], [r1[1]], n1), b = zyklus(r2[0], [r2[1]], n2);
  const folge = Array.from({ length: laenge }, (_, i) => (i % 2 === 0 ? a[i / 2] : b[(i - 1) / 2]));
  const erste = (laenge - 1) % 2 === 0;
  const eigene = erste ? a : b, fremde = erste ? b : a, eigenOp = erste ? r1[1] : r2[1], fremdOp = erste ? r2[1] : r1[1];
  const antwort = letzte(eigene);
  return {
    folge,
    falsch: [[OP[fremdOp[0]](letzte(fremde), fremdOp[1]), `Das ist die nächste Zahl der anderen Reihe. Gesucht ist die nächste Zahl von Reihe ${erste ? 1 : 2}.`], antwort + 1, antwort - 1, [OP[eigenOp[0]](antwort, eigenOp[1]), 'Du bist in der Reihe einen Schritt zu weit gegangen.'], antwort + 2],
    erklaerung: [
      'Zwei Reihen wechseln sich ab.',
      `Reihe 1: ${a.slice(0, erste ? -1 : undefined).map(fz).join(', ')} (immer ${opText(r1[1])})`,
      `Reihe 2: ${b.slice(0, erste ? undefined : -1).map(fz).join(', ')} (immer ${opText(r2[1])})`,
      `Als Nächstes kommt Reihe ${erste ? 1 : 2}: ${opSchritt(letzte(eigene, 2), eigenOp)}`
    ]
  };
}

const REIHEN = [
  {
    von: 1, bis: 2, f: n => {
      const d = n === 1 ? H.zufall(2, 9) : H.zufall(6, 19), ab = Math.random() < 0.3;
      const s = ab ? H.zufall(d * 7 + 1, d * 7 + 40) : H.zufall(1, 40), schrittweite = ab ? -d : d;
      const folge = Array.from({ length: 7 }, (_, i) => s + schrittweite * i), a = letzte(folge);
      return {
        folge,
        falsch: [[a + schrittweite, 'Das ist die übernächste Zahl. Gesucht ist nur die nächste.'], a + 1, a - 1, a + 2, a - 2, a + 10],
        erklaerung: [`Jede Zahl ist um ${d} ${ab ? 'kleiner' : 'größer'} als die vorige.`, schritt(letzte(folge, 2), schrittweite)]
      };
    }
  },
  {
    von: 1, bis: 3, f: n => {
      const q = n === 1 ? 2 : H.wahl([2, 3]), halb = n >= 2 && q === 2 && Math.random() < 0.3;
      const s = q === 2 ? H.zufall(1, 6) : H.zufall(1, 4), laenge = q === 2 ? 7 : 6;
      let folge = Array.from({ length: laenge }, (_, i) => s * Math.pow(q, i));
      if (halb) folge = folge.reverse();
      const a = letzte(folge), l = letzte(folge, 2), v = letzte(folge, 3);
      if (halb) {
        return {
          folge,
          falsch: [[l - (v - l), 'Du hast den letzten Abstand wiederholt. Hier wird aber jedes Mal halbiert.'], a + 1, a - 1, l - 2, a + 2],
          erklaerung: ['Jede Zahl ist halb so groß wie die vorige.', `${fz(l)} ÷ 2 = ${fz(a)}`]
        };
      }
      return {
        folge,
        falsch: [[l + (l - v), `Du hast den letzten Abstand wiederholt. Hier wird aber jedes Mal mit ${q} malgenommen.`], [a + l, 'Du hast die letzten beiden Zahlen zusammengezählt. Das ist hier nicht die Regel.'], a - 1, a + 1, a + q, [l * (q + 1), `Du hast mit ${q + 1} malgenommen statt mit ${q}.`]],
        erklaerung: [`Jede Zahl wird mit ${q} malgenommen.`, `${fz(l)} × ${q} = ${fz(a)}`]
      };
    }
  },
  {
    von: 2, bis: 4, f: n => {
      const inc = n === 2 ? 1 : n === 3 ? H.wahl([1, 2]) : H.wahl([2, 3, 4]), d0 = H.zufall(1, 4), s = H.zufall(1, 20);
      const folge = [s];
      for (let i = 0; i < 6; i++) folge.push(folge[i] + d0 + inc * i);
      const dd = abstaende(folge), a = letzte(folge), l = letzte(folge, 2);
      return {
        folge,
        falsch: [[l + letzte(dd, 2), GLEICHER], [a + inc, `Der Abstand ist zu groß. Er wächst jedes Mal nur um ${inc}.`], a - inc, a + 1, a - 1],
        erklaerung: [`Die Abstände wachsen jeweils um ${inc}: ${dd.slice(0, -1).map(mitVorzeichen).join(', ')}.`, `Nächster Abstand: ${mitVorzeichen(letzte(dd))}, also ${schritt(l, letzte(dd))}`]
      };
    }
  },
  {
    von: 2, bis: 3, f: () => {
      const a = H.zufall(3, 9), b = H.zufall(1, a - 1), s = H.zufall(b + 2, 30);
      const ops = Math.random() < 0.5 ? [['+', a], ['−', b]] : [['−', b], ['+', a]];
      return zyklusReihe(s, ops, H.wahl([7, 8]));
    }
  },
  {
    von: 3, bis: 4, f: n => {
      const b = n === 3 ? 2 : H.wahl([2, 3]), a = H.zufall(1, 6), s = H.zufall(1, b === 3 ? 3 : 6);
      const ops = Math.random() < 0.5 ? [['×', b], ['+', a]] : [['+', a], ['×', b]];
      return zyklusReihe(s, ops, 7);
    }
  },
  {
    von: 4, bis: 5, f: () => {
      const c = H.zufall(1, 5), s = H.zufall(c + 1, 9);
      return zyklusReihe(s, [['×', 2], ['−', c]], H.wahl([7, 8]));
    }
  },
  {
    von: 5, bis: 5, f: () => {
      for (;;) {
        const ops = H.mische([['+', H.zufall(1, 5)], ['×', 2], ['−', H.zufall(1, 3)]]);
        const r = zyklusReihe(H.zufall(2, 6), ops, H.wahl([8, 9]));
        if (r.folge.every((x, i) => i === 0 || x > 0)) return r;
      }
    }
  },
  {
    von: 3, bis: 5, f: n => {
      const q = n === 5 ? H.wahl([2, 3]) : 2, d0 = q === 3 ? H.zufall(1, 2) : H.zufall(1, 3), s = H.zufall(1, 15), laenge = q === 3 ? 6 : 7;
      const folge = [s];
      for (let i = 0; i < laenge - 1; i++) folge.push(folge[i] + d0 * Math.pow(q, i));
      const dd = abstaende(folge), a = letzte(folge), l = letzte(folge, 2);
      return {
        folge,
        falsch: [[l + letzte(dd, 2), GLEICHER], [l * q, `Du hast die letzte Zahl mit ${q} malgenommen. ${q === 2 ? 'Verdoppelt' : 'Verdreifacht'} werden aber die Abstände.`], a + 1, a - 1, l + 2 * letzte(dd, 2) + 1],
        erklaerung: [`Die Abstände werden jedes Mal ${q === 2 ? 'verdoppelt' : 'verdreifacht'}: ${dd.slice(0, -1).map(mitVorzeichen).join(', ')}.`, `Nächster Abstand: ${mitVorzeichen(letzte(dd))}, also ${schritt(l, letzte(dd))}`]
      };
    }
  },
  {
    von: 3, bis: 4, f: n => {
      const k = H.zufall(1, 7), c = n === 3 ? 0 : H.wahl([1, -1, 2, 3]), m = k + 6;
      const folge = Array.from({ length: 7 }, (_, i) => (k + i) * (k + i) + c);
      const dd = abstaende(folge), a = letzte(folge), l = letzte(folge, 2);
      const zusatz = c === 0 ? '' : ` ${c > 0 ? '+' : '−'} ${Math.abs(c)}`;
      return {
        folge,
        falsch: [[l + letzte(dd, 2), GLEICHER], a + 1, a - 1, [(m + 1) * (m + 1) + c, 'Du hast eine Quadratzahl übersprungen.'], a + 2],
        erklaerung: [
          c === 0 ? 'Das sind Quadratzahlen.' : `Das sind Quadratzahlen ${c > 0 ? 'plus' : 'minus'} ${Math.abs(c)}.`,
          `${k}²${zusatz} = ${fz(folge[0])}, ${k + 1}²${zusatz} = ${fz(folge[1])} und so weiter.`,
          `Als Nächstes: ${m}²${zusatz} = ${fz(a)}`
        ]
      };
    }
  },
  {
    von: 3, bis: 4, f: () => {
      const d2 = H.zufall(1, 4);
      return verschachtelt([H.zufall(1, 20), ['+', H.wahl([2, 3, 4, 5, 10])]], [H.zufall(20, 60), Math.random() < 0.6 ? ['−', d2] : ['+', d2]], H.wahl([8, 9]));
    }
  },
  {
    von: 3, bis: 4, f: () => {
      const P = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71];
      const i = H.zufall(0, 8), folge = P.slice(i, i + 7), a = letzte(folge), l = letzte(folge, 2), dd = abstaende(folge);
      return {
        folge,
        falsch: [l + 2, l + letzte(dd, 2), a + 2, a + 1, a - 1].map(x => [x, P.includes(x) ? `${x} ist zwar eine Primzahl, aber nicht die nächste nach ${l}.` : `${x} ist keine Primzahl, denn es lässt sich durch ${[2, 3, 5, 7].find(t => x % t === 0)} teilen.`]),
        erklaerung: ['Das sind Primzahlen. Sie lassen sich nur durch 1 und durch sich selbst teilen.', `Nach ${l} kommt die Primzahl ${a}.`]
      };
    }
  },
  {
    von: 4, bis: 5, f: () => {
      const a0 = H.zufall(1, 5), b0 = H.zufall(a0, a0 + 4), folge = [a0, b0];
      while (folge.length < 8) folge.push(letzte(folge) + letzte(folge, 2));
      const a = letzte(folge), l = letzte(folge, 2), v = letzte(folge, 3);
      return {
        folge,
        falsch: [[l + (l - v), 'Du hast den letzten Abstand wiederholt. Hier ist aber jede Zahl die Summe der beiden Zahlen davor.'], [l * 2, `Du hast ${fz(l)} verdoppelt. Zähle stattdessen die beiden letzten Zahlen zusammen.`], a + 1, a - 1, a + v],
        erklaerung: ['Jede Zahl ist die Summe der beiden Zahlen davor.', `${fz(v)} + ${fz(l)} = ${fz(a)}`]
      };
    }
  },
  {
    von: 4, bis: 5, f: () => {
      for (;;) {
        const q = H.wahl([2, 2, 3]), r = H.wahl([-2, -1, 1, 2, 3]), s = H.zufall(2, 6), laenge = q === 2 ? 7 : 6;
        const folge = [s];
        while (folge.length < laenge) folge.push(letzte(folge) * q + r);
        if (!folge.every((x, i) => i === 0 || x > folge[i - 1])) continue;
        const a = letzte(folge), l = letzte(folge, 2), v = letzte(folge, 3);
        return {
          folge,
          falsch: [[l * q, `Du hast nur mit ${q} malgenommen. Danach ${r > 0 ? `kommt noch ${r} dazu` : `wird noch ${-r} abgezogen`}.`], [l * q + 2 * r, `Du hast ${Math.abs(r)} doppelt ${r > 0 ? 'dazugezählt' : 'abgezogen'}.`], [l + (l - v), GLEICHER], a + 1, a - 1],
          erklaerung: [`Jede Zahl wird mit ${q} malgenommen, dann ${r > 0 ? `kommt ${r} dazu` : `wird ${-r} abgezogen`}.`, `${fz(l)} × ${q} ${r > 0 ? '+' : '−'} ${Math.abs(r)} = ${fz(a)}`]
        };
      }
    }
  },
  {
    von: 5, bis: 5, f: () => {
      const s = H.zufall(1, 3), folge = [s];
      for (let f = 2; folge.length < 6; f++) folge.push(letzte(folge) * f);
      const a = letzte(folge), l = letzte(folge, 2);
      return {
        folge,
        falsch: [[l * 5, 'Du hast den letzten Faktor wiederholt. Der Faktor wächst aber jedes Mal um 1.'], [l * 7, 'Du hast einen Faktor übersprungen. Als Nächstes kommt ×6.'], a + l, a - l, a / 2],
        erklaerung: ['Der Faktor wächst jedes Mal um 1: ×2, ×3, ×4, ×5.', `Als Nächstes kommt ×6: ${fz(l)} × 6 = ${fz(a)}`]
      };
    }
  },
  {
    von: 5, bis: 5, f: () => {
      const k = H.zufall(1, 3), s = H.zufall(1, 20), folge = [s];
      for (let i = 0; i < 6; i++) folge.push(folge[i] + (k + i) * (k + i));
      const dd = abstaende(folge), a = letzte(folge), l = letzte(folge, 2);
      return {
        folge,
        falsch: [[l + letzte(dd, 2), GLEICHER], [l + 2 * letzte(dd, 2) - letzte(dd, 3), 'Du hast angenommen, dass die Abstände gleichmäßig wachsen. Die Abstände sind aber Quadratzahlen.'], a + 1, a - 1, a + 2],
        erklaerung: [`Die Abstände sind Quadratzahlen: ${dd.slice(0, -1).map(mitVorzeichen).join(', ')}.`, `Nächster Abstand: ${mitVorzeichen(letzte(dd))} (${k + 5}²), also ${schritt(l, letzte(dd))}`]
      };
    }
  },
  {
    von: 5, bis: 5, f: () => {
      const k = H.zufall(1, 3), m = k + 5, folge = Array.from({ length: 6 }, (_, i) => Math.pow(k + i, 3));
      const dd = abstaende(folge), a = letzte(folge), l = letzte(folge, 2);
      return {
        folge,
        falsch: [[l + letzte(dd, 2), GLEICHER], [m * m, `Das ist ${m}². Gesucht ist ${m}³.`], a + 1, a - m, a + m],
        erklaerung: ['Das sind Kubikzahlen, also Zahlen hoch 3.', `${k}³ = ${fz(folge[0])}, ${k + 1}³ = ${fz(folge[1])} und so weiter.`, `Als Nächstes: ${m}³ = ${fz(a)}`]
      };
    }
  },
  {
    von: 5, bis: 5, f: () => {
      const d = H.zufall(2, 5);
      return verschachtelt([H.zufall(1, 3), ['×', 2]], [H.zufall(30, 60), Math.random() < 0.6 ? ['−', d] : ['+', d]], H.wahl([8, 9]));
    }
  }
];

function zahlenreihe(n) {
  const passende = REIHEN.filter(r => n >= r.von && n <= r.bis);
  for (;;) {
    const r = H.wahl(passende).f(n);
    if (!r.folge.every(x => Number.isInteger(x) && Math.abs(x) < 100000)) continue;
    const gezeigt = r.folge.slice(0, -1);
    return {
      frage: 'Welche Zahl kommt als Nächstes?',
      reihe: gezeigt,
      ...H.optionen(letzte(r.folge), r.falsch, null, { positiv: gezeigt.every(x => x >= 0), auto: x => `Diese Zahl ist um ${fz(Math.abs(x - letzte(r.folge)))} zu ${x > letzte(r.folge) ? 'groß' : 'klein'}. Wende die Regel noch einmal genau an.` }),
      erklaerung: r.erklaerung
    };
  }
}
