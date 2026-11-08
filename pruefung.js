const PRUEFUNG_ZEITEN = {
  rechtschreibung: 25, analogien: 30, wortbedeutung: 30, englisch: 30, wortfluessigkeit: 45,
  grundrechnen: 45, prozent: 75, dreisatz: 90, textaufgaben: 120, rechenzeichen: 60,
  zahlenreihen: 75, figurenreihen: 75, matrizen: 90, schlussfolgerungen: 75,
  wuerfel: 75, faltvorlagen: 60, drehfiguren: 45, figurenzusammensetzen: 90,
  zahnraeder: 45, hebel: 60, flaschenzuege: 60, physik: 45,
  zeichenzaehlen: 60, symbolvergleich: 45, merkfaehigkeit: 30,
  allgemeinwissen: 20, bundeswehr: 20
};

const PRUEFUNG_LAENGEN = {
  kurz: { name: 'Kurz', minuten: 20, proBereich: 3, signale: 8 },
  mittel: { name: 'Mittel', minuten: 45, proBereich: 6, signale: 12 },
  lang: { name: 'Lang', minuten: 90, proBereich: 12, signale: 20 }
};

const PRUEFUNG_ARTEN = {
  kc: {
    name: 'CAT wie im Karrierecenter',
    text: 'Alle sieben Bereiche nacheinander am Computer. Jeder Teil beginnt mit einer Anleitung und zwei Beispielen.',
    zeitFaktor: 1,
    niveauPlus: 0
  },
  koeln: {
    name: 'Computertest wie in Köln',
    text: 'So üben Offizierbewerber für das Assessmentcenter für Führungskräfte in Köln: alle sieben Bereiche, höheres Startniveau und mehr Zeit für schwere Aufgaben.',
    zeitFaktor: 1.5,
    niveauPlus: 1
  }
};

const KOELN_STATIONEN = ['Biografischer Fragebogen', 'Computertest (wird hier geübt)', 'Persönlichkeitsfragebogen', 'Sporttest', 'Gruppenaufgabe', 'Interview', 'Ärztliche Untersuchung'];

const LAUFBAHNEN = [
  { id: 'mannschaften', name: 'Mannschaften', grenze: 2.0 },
  { id: 'feldwebel', name: 'Unteroffizier / Feldwebel', grenze: 2.8 },
  { id: 'offizier', name: 'Offizier', grenze: 3.5 },
  { id: 'ksk-feldwebel', name: 'KSK als Feldwebel', grenze: 3.2 },
  { id: 'ksk-offizier', name: 'KSK als Offizier', grenze: 3.9 }
];

const BEREICH_TIPPS = {
  sprache: 'Übe Rechtschreibung, Analogien und Englisch kurz und oft. Lies jeden Tag ein paar Seiten.',
  mathe: 'Rechne jeden Tag 10 Minuten ohne Taschenrechner, vor allem Prozent und Dreisatz.',
  logik: 'Suche bei Reihen und Matrizen eine Regel pro Merkmal: Anzahl, Form, Drehung, Füllung.',
  raum: 'Gegenüberliegende Würfelseiten siehst du nie gleichzeitig. Drehe Figuren im Kopf in kleinen Schritten.',
  technik: 'Lerne die Grundregeln: Zahnräder drehen gegeneinander, Hebelgesetz, Seilstücke zählen.',
  konzentration: 'Trainiere kurz und oft: Zeichen zählen, Symbole vergleichen, Ausweise merken und Reaktion.',
  wissen: 'Lies Nachrichten und lerne die Grundlagen zu Staat, Geschichte und Bundeswehr.'
};

let pr = null;

function pruefungsArt() {
  const z = daten.profil && daten.profil.ziel;
  return z === 'offizier' || z === 'ksk-offizier' ? 'koeln' : 'kc';
}

function prBereich() {
  return BEREICHE[pr.bi];
}

function prStartNiveau() {
  return Math.min(5, startNiveau() + PRUEFUNG_ARTEN[pr.art].niveauPlus);
}

function prZeit(typ) {
  return Math.min(180, Math.round((PRUEFUNG_ZEITEN[typ] || 60) * PRUEFUNG_ARTEN[pr.art].zeitFaktor));
}

function startePruefung() {
  pr = {
    art: pruefungsArt(),
    laenge: daten.einstellungen.pruefungLaenge || 'mittel',
    start: Date.now(),
    bi: 0,
    phase: 'einweisung',
    ergebnisse: [],
    reaktion: [],
    reaktionFertig: false,
    gesehen: new Set(),
    warteschlange: [],
    teil: null,
    aktuell: null,
    bsp: null
  };
  zeige('pruefung');
}

function prAnleitung() {
  const b = prBereich();
  const typen = b.typen.filter(mischbar);
  const bspTypen = H.mische(typen).slice(0, 2);
  if (bspTypen.length === 1) bspTypen.push(bspTypen[0]);
  pr.bsp = { liste: bspTypen.map((t, i) => neueAufgabe(t, i + 1, new Set())), i: 0, wahl: null, gemerkt: false };
  pr.teil = { typen, beutel: [], niveau: prStartNiveau(), nr: 0, anzahl: PRUEFUNG_LAENGEN[pr.laenge].proBereich };
  pr.warteschlange = [];
  pr.phase = 'anleitung';
  zeige('pruefung');
}

function prNaechste() {
  const t = pr.teil;
  if (t.nr >= t.anzahl) {
    prTeilEnde();
    return;
  }
  let a;
  if (pr.warteschlange.length) {
    a = pr.warteschlange.shift();
  } else {
    if (!t.beutel.length) t.beutel = H.mische(t.typen);
    a = neueAufgabe(t.beutel.pop(), t.niveau, pr.gesehen);
    pr.warteschlange = folgeAufgaben(a, t.anzahl - t.nr - 1);
  }
  t.nr++;
  const jetzt = Date.now();
  pr.aktuell = { aufgabe: a, wahl: null, fertig: false, merkPhase: !!a.merken, merkEnde: a.merken ? jetzt + a.merken.sekunden * 1000 : 0, start: jetzt, limit: prZeit(a.typ) * 1000 };
  pr.phase = 'aufgabe';
  zeige('pruefung');
}

function prBestaetigen(zeitAus) {
  const a = pr && pr.aktuell;
  if (!a || a.merkPhase || a.fertig || pr.phase !== 'aufgabe') return;
  if (!zeitAus && a.wahl === null) return;
  a.fertig = true;
  const richtig = a.wahl === a.aufgabe.richtig;
  const ms = Math.min(Date.now() - a.start, a.limit);
  pr.ergebnisse.push({ bereich: prBereich().id, typ: a.aufgabe.typ, niveau: a.aufgabe.niveau, richtig, ms, aufgabe: a.aufgabe, gewaehlt: a.wahl, zeitAus: a.wahl === null });
  daten.verlauf.push({ b: prBereich().id, t: a.aufgabe.typ, n: a.aufgabe.niveau, r: richtig ? 1 : 0, ms, d: Date.now(), m: 'p' });
  speichern();
  pr.teil.niveau = Math.max(1, Math.min(5, pr.teil.niveau + (richtig ? 1 : -1)));
  prNaechste();
}

function prTeilEnde() {
  if (prBereich().id === 'konzentration' && !pr.reaktionFertig) {
    pr.phase = 'reaktion-anleitung';
    zeige('pruefung');
    return;
  }
  pr.bi++;
  if (pr.bi >= BEREICHE.length) prAbschluss();
  else prAnleitung();
}

function niveauAus(liste) {
  if (!liste.length) return null;
  const summe = liste.reduce((s, x) => s + x.niveau + (x.richtig ? 0.5 : -0.5), 0);
  return Math.max(1, Math.min(5, summe / liste.length));
}

function prAbschluss() {
  const bereiche = BEREICHE.map(b => {
    const l = pr.ergebnisse.filter(x => x.bereich === b.id);
    let niveau = niveauAus(l);
    if (b.id === 'konzentration' && pr.reaktion.length) {
      const rNiveau = niveauAus(pr.reaktion.map(x => ({ niveau: x.niveau, richtig: !!x.r })));
      niveau = niveau === null ? rNiveau : (niveau + rNiveau) / 2;
    }
    const ok = pr.reaktion.filter(x => x.art === 'ok');
    return {
      id: b.id,
      name: b.name,
      n: l.length,
      r: l.filter(x => x.richtig).length,
      niveau: niveau === null ? 1 : niveau,
      tempo: l.length ? Math.round(l.reduce((s, x) => s + x.ms, 0) / l.length / 1000) : 0,
      reaktion: b.id === 'konzentration' && ok.length ? Math.round(ok.reduce((s, x) => s + x.ms, 0) / ok.length) : null
    };
  });
  const gesamt = bereiche.reduce((s, b) => s + b.niveau, 0) / bereiche.length;
  pr.ergebnis = { d: Date.now(), art: pr.art, laenge: pr.laenge, ziel: daten.profil.ziel, gesamt, punkte: Math.round((gesamt - 1) / 4 * 100), dauer: Math.round((Date.now() - pr.start) / 60000), bereiche };
  daten.pruefungen.push({ d: pr.ergebnis.d, art: pr.art, laenge: pr.laenge, ziel: pr.ergebnis.ziel, gesamt: Math.round(gesamt * 100) / 100, punkte: pr.ergebnis.punkte, bereiche: bereiche.map(b => ({ id: b.id, n: b.n, r: b.r, niveau: Math.round(b.niveau * 100) / 100 })) });
  speichern();
  pr.phase = 'ende';
  zeige('pruefung-ergebnis');
}

function laufbahnStatus(gesamt, grenze) {
  if (gesamt >= grenze) return { klasse: 'gut', text: 'reicht wahrscheinlich' };
  if (gesamt >= grenze - 0.3) return { klasse: 'knapp', text: 'knapp' };
  return { klasse: 'schlecht', text: 'reicht noch nicht' };
}

function prAufgabeHtml(a, wahl) {
  const knoepfe = a.antworten.map((t, i) => `<button class="antwort${wahl === i ? ' gewaehlt' : ''}" data-aktion="pr-wahl" data-wert="${i}" aria-pressed="${wahl === i}"><span class="buchstabe">${BUCHSTABEN[i]}</span>${antwortInhalt(a, i)}</button>`).join('');
  const lang = !a.term && !a.reihe && !a.zeichen && !a.bild && !a.text;
  const art = a.svg ? ' antworten-bild' : a.antworten.every(t => t.length <= 3) ? ' antworten-kurz' : '';
  return `<div class="aufgabe-layout"><div class="aufgabe-links"><div class="frage${lang ? ' frage-text' : ''}">${esc(a.frage)}</div>${aufgabeBild(a)}</div><div class="aufgabe-rechts"><div class="antworten${art}">${knoepfe}</div>
    <div class="knoepfe pr-weiter"><button class="knopf primaer" data-aktion="pr-weiter"${wahl === null ? ' disabled' : ''}>Weiter</button></div></div></div>`;
}

function prKopf(rechts) {
  const b = prBereich();
  return `<header class="kopf"><button class="symbol" data-aktion="pr-abbrechen" aria-label="Prüfung abbrechen">${SYMBOLE.schliessen}</button><div class="kopf-titel">Teil ${pr.bi + 1} von ${BEREICHE.length} · ${esc(b.name)}</div>${rechts || '<span class="symbol-platz"></span>'}</header>`;
}

function prRestText() {
  const a = pr.aktuell;
  const rest = Math.max(0, a.limit - (Date.now() - a.start));
  return zeitText(rest + 999);
}

Object.assign(ANSICHTEN, {
  'pruefung-start'() {
    const art = PRUEFUNG_ARTEN[pruefungsArt()];
    const laenge = daten.einstellungen.pruefungLaenge || 'mittel';
    const segmente = Object.entries(PRUEFUNG_LAENGEN).map(([id, l]) => `<button class="segment segment-gross${id === laenge ? ' aktiv' : ''}" data-aktion="pr-laenge" data-wert="${id}" aria-pressed="${id === laenge}">${l.name}<span>ca. ${l.minuten} Min.</span></button>`).join('');
    const ziel = ZIELE.find(z => z.id === daten.profil.ziel);
    const koeln = pruefungsArt() === 'koeln'
      ? `<section class="gruppe"><h2 class="label">Was in Köln außerdem dazugehört</h2><ul class="stationen">${KOELN_STATIONEN.map(s => `<li>${esc(s)}</li>`).join('')}</ul><p class="klein">Das Verfahren dauert meist zwei Tage. Die App übt nur den Computertest.</p></section>`
      : '';
    return kopf('Prüfung', ['gehe', 'start']) + `<main class="seite">
      <section class="einleitung"><div class="label">Für dein Ziel: ${esc(ziel ? ziel.name : '')}</div><h1>${esc(art.name)}</h1><p>${esc(art.text)}</p></section>
      ${koeln}
      <section class="gruppe"><h2 class="label">Länge</h2><div class="segmente">${segmente}</div></section>
      <section class="gruppe"><h2 class="label">Regeln</h2><ul class="regeln">
        <li>Jede Aufgabe hat ein Zeitlimit.</li>
        <li>Die Aufgaben werden schwerer, wenn du richtig antwortest, und leichter, wenn nicht.</li>
        <li>Du kannst nicht zurückspringen.</li>
        <li>Lösungen und Erklärungen gibt es erst am Ende.</li>
        <li>Wenn du abbrichst, wird die Prüfung nicht gewertet.</li>
      </ul></section>
      <p class="hinweis">Das Ergebnis ist eine Schätzung. Die echten Grenzwerte sind nicht öffentlich.</p>
      <div class="knoepfe"><button class="knopf primaer" data-aktion="pr-start">Weiter zur Einweisung</button></div>
    </main>`;
  },

  pruefung() {
    if (pr.phase === 'einweisung') {
      return kopf('Einweisung', ['pr-abbrechen']) + `<main class="seite">
        <section class="einleitung"><h1>Einweisung</h1>
          <p>Du arbeitest allein am Computer. Lies jede Anleitung genau.</p>
          <p>Tippe eine Antwort an und bestätige mit „Weiter“. Bis dahin kannst du deine Wahl ändern.</p>
          <p>Läuft die Zeit ab, zählt die gewählte Antwort. Hast du nichts gewählt, gilt die Aufgabe als falsch.</p>
          <p>Die Aufgaben passen sich an dich an. Schwere Aufgaben gegen Ende sind ein gutes Zeichen.</p>
        </section>
        <div class="knoepfe"><button class="knopf primaer" data-aktion="pr-beginnen">Prüfung beginnen</button></div>
      </main>`;
    }
    const b = prBereich();
    if (pr.phase === 'anleitung') {
      const bsp = pr.bsp.liste[pr.bsp.i];
      const fertig = pr.bsp.wahl !== null;
      const merkOffen = bsp.merken && !pr.bsp.gemerkt;
      const typen = H.und(b.typen.filter(mischbar).map(typName)) + (b.id === 'konzentration' ? ' und zum Schluss der Reaktionstest' : '');
      const sekunden = [...new Set(b.typen.filter(mischbar).map(prZeit))];
      const zeitHinweis = sekunden.length > 1 ? `${Math.min(...sekunden)} bis ${Math.max(...sekunden)} Sekunden` : `${sekunden[0]} Sekunden`;
      const knopf = fertig ? `<div class="knoepfe"><button class="knopf primaer" data-aktion="pr-bsp-weiter">${pr.bsp.i === 0 ? 'Noch ein Beispiel' : 'Teil starten'}</button></div>` : '';
      return prKopf() + `<main class="seite">
        <section class="einleitung"><div class="label">Anleitung</div><h1>${esc(b.name)}</h1>
          <p>In diesem Teil: ${esc(typen)}.</p>
          <p>Du hast pro Aufgabe ${zeitHinweis} Zeit. Die Beispiele haben kein Zeitlimit und zählen nicht.</p>
        </section>
        <section class="beispiel">
          <div class="label">${pr.bsp.i === 0 ? 'Beispiel' : 'Noch ein Beispiel'} · ${esc(typName(bsp.typ))}</div>
          ${merkOffen ? merkHtml(bsp.merken, null, 'pr-bsp-gemerkt', 'Weiter zur Frage') : aufgabeHtml(bsp, pr.bsp.wahl, 'pr-bsp', fertig ? rueckmeldungHtml(bsp, pr.bsp.wahl, '') : '')}
        </section>
        ${knopf}
        <div class="knoepfe"><button class="knopf leise" data-aktion="pr-bsp-ueberspringen">Beispiele überspringen und Teil starten</button></div>
      </main>`;
    }
    if (pr.phase === 'reaktion-anleitung') {
      const regeln = [[{ farbe: 'blau', richtung: 1 }, 'Rechts tippen'], [{ farbe: 'orange', richtung: 1 }, 'Links tippen'], [{ farbe: 'grau', richtung: -1 }, 'Nicht tippen']]
        .map(([s, t]) => `<div class="rk-regel">${reaktionsPfeil(s, true)}<span>${t}</span></div>`).join('');
      return prKopf() + `<main class="seite">
        <section class="einleitung"><div class="label">Anleitung</div><h1>Reaktionstest</h1>${TYPEN.reaktion.erklaerung.map(p => `<p>${esc(p)}</p>`).join('')}</section>
        <section class="beispiel"><div class="label">So funktioniert es</div><div class="rk-regeln">${regeln}</div></section>
        <div class="knoepfe"><button class="knopf primaer" data-aktion="pr-reaktion">Reaktionstest starten (${PRUEFUNG_LAENGEN[pr.laenge].signale} Signale)</button></div>
      </main>`;
    }
    const a = pr.aktuell;
    const t = pr.teil;
    const meta = `<div class="meta"><span>Aufgabe ${t.nr} von ${t.anzahl} · ${esc(typName(a.aufgabe.typ))}</span></div>`;
    if (a.merkPhase) {
      const rest = Math.max(0, Math.ceil((a.merkEnde - Date.now()) / 1000));
      return prKopf(`<div class="uhr">Merken</div>`) + `<div class="balken" aria-hidden="true"><span style="width:0"></span></div>
        <main class="seite">${meta}<div class="merk-kopf"><div class="frage">Präge dir diese Ausweise ein. Danach werden sie ausgeblendet.</div><div class="merk-zeit" id="merk-zeit">${rest} s</div></div>${a.aufgabe.merken.html}</main>`;
    }
    const anteil = Math.max(0, 1 - (Date.now() - a.start) / a.limit);
    return prKopf(`<div class="uhr" id="pr-zeit" aria-label="Restzeit">${prRestText()}</div>`) + `<div class="balken zeitbalken" aria-hidden="true"><span id="pr-balken" style="width:${anteil * 100}%"></span></div>
      <main class="seite">${meta}${prAufgabeHtml(a.aufgabe, a.wahl)}</main>`;
  },

  'pruefung-ergebnis'() {
    const e = pr.ergebnis;
    const zielId = e.ziel;
    const ziel = ZIELE.find(z => z.id === zielId);
    const zielBahn = LAUFBAHNEN.find(l => l.id === zielId);
    const status = zielBahn ? laufbahnStatus(e.gesamt, zielBahn.grenze) : null;
    const zielText = status
      ? { gut: `Für dein Ziel ${ziel.name} reicht dieses Ergebnis nach unserer Schätzung wahrscheinlich.`, knapp: `Für dein Ziel ${ziel.name} ist es knapp. Mit gezieltem Üben wirst du sicherer.`, schlecht: `Für dein Ziel ${ziel.name} reicht es nach dieser Schätzung noch nicht. Arbeite vor allem an den Bereichen unten.` }[status.klasse]
      : '';
    const zeigen = LAUFBAHNEN.filter(l => !l.id.startsWith('ksk') || l.id === zielId);
    const bahnen = zeigen.map(l => {
      const s = laufbahnStatus(e.gesamt, l.grenze);
      return `<div class="wert"><span>${esc(l.name)}</span><span class="status ${s.klasse}">${s.text}</span></div>`;
    }).join('');
    const hinweise = [];
    const abschluss = daten.profil.abschluss;
    if ((zielId === 'offizier' || zielId === 'ksk-offizier') && !['abi', 'fachabi', 'studium'].includes(abschluss)) hinweise.push('Für die Offizierlaufbahn wird in der Regel Abitur oder Fachhochschulreife verlangt.');
    if ((zielId === 'feldwebel' || zielId === 'ksk-feldwebel') && ['ohne', 'haupt'].includes(abschluss)) hinweise.push('Für Feldwebel wird in der Regel ein Realschulabschluss oder ein Hauptschulabschluss mit Berufsausbildung verlangt.');
    if (zielId && zielId.startsWith('ksk')) hinweise.push('Beim KSK zählen zusätzlich Sport, ein eigenes Auswahlverfahren und deine Persönlichkeit. Das prüft die App nicht.');
    if (e.bereiche.some(b => b.niveau < 1.8)) hinweise.push('Ein sehr schwacher Bereich kann auch bei gutem Gesamtwert Probleme machen.');
    const schwach = e.bereiche.slice().sort((x, y) => x.niveau - y.niveau).slice(0, 3);
    const bereichZeilen = e.bereiche.map(b => `<div class="wert"><span>${esc(b.name)}</span><span>${b.n ? `${b.r} von ${b.n} · ` : ''}Niveau ${H.zahl(b.niveau, 1)}${b.reaktion ? ` · ${b.reaktion} ms` : ''}</span></div>`).join('');
    const tipps = schwach.map(b => `<div class="tipp"><div class="tipp-titel">${esc(b.name)} <span class="text-2">Niveau ${H.zahl(b.niveau, 1)}</span></div><p>${esc(BEREICH_TIPPS[b.id])}</p><button class="knopf" data-aktion="pr-ueben" data-wert="${b.id}">Jetzt üben</button></div>`).join('');
    const nachlesen = BEREICHE.map(b => {
      const l = pr.ergebnisse.filter(x => x.bereich === b.id);
      if (!l.length) return '';
      const zeilen = l.map(x => {
        const a = x.aufgabe;
        const titel = a.term || a.text || (a.reihe ? a.reihe.map(z => H.zahl(z)).join(', ') + ', ?' : a.zeichen ? a.zeichen.teile.map(z => (z === '?' ? '?' : H.zahl(z))).join(' ') + ' = ' + H.zahl(a.zeichen.ergebnis) : a.frage);
        const deine = x.gewaehlt === null ? 'keine (Zeit abgelaufen)' : a.svg ? BUCHSTABEN[x.gewaehlt] : a.antworten[x.gewaehlt];
        const richtigText = a.svg ? BUCHSTABEN[a.richtig] : a.antworten[a.richtig];
        return `<details class="fehler"><summary><span class="${x.richtig ? 'ok-zeichen' : 'nok-zeichen'}">${x.richtig ? '✓' : '✗'}</span> ${esc(titel)}</summary><div class="fehler-inhalt">
          ${a.term || a.reihe || a.zeichen || a.text ? `<p>${esc(a.frage)}</p>` : ''}
          ${a.bild ? `<div class="bild">${a.bild}</div>` : ''}
          ${a.svg ? `<div class="fehler-bilder">${x.gewaehlt !== null ? `<div><div class="label">Deine Antwort</div>${a.antworten[x.gewaehlt]}</div>` : ''}<div><div class="label">Richtig</div>${a.antworten[a.richtig]}</div></div>` : ''}
          <p>Deine Antwort: ${esc(deine)}<br>Richtig: <strong>${esc(richtigText)}</strong></p>
          <ol class="weg">${a.erklaerung.map(z => `<li>${esc(z)}</li>`).join('')}</ol>
          ${a.loesungsbild ? `<div class="bild">${a.loesungsbild}</div>` : ''}
        </div></details>`;
      }).join('');
      return `<details class="bereich-nachlesen"><summary>${esc(b.name)} · ${l.filter(x => x.richtig).length} von ${l.length}</summary><div class="fehlerliste">${zeilen}</div></details>`;
    }).join('');
    return kopf('Ergebnis') + `<main class="seite">
      <section class="ergebnis"><div class="label">${esc(PRUEFUNG_ARTEN[e.art].name)} · ${esc(PRUEFUNG_LAENGEN[e.laenge].name)}</div><div class="ergebnis-zahl">${e.punkte} Punkte</div><div class="text-2">von 100 · Gesamtniveau ${H.zahl(e.gesamt, 1)} · ${e.dauer} Min.</div></section>
      ${status ? `<section class="ziel-urteil ${status.klasse}"><div class="label">Dein Ziel</div><p>${esc(zielText)}</p></section>` : ''}
      <section class="gruppe"><h2 class="label">Einschätzung nach Laufbahn</h2><div class="werte">${bahnen}</div></section>
      ${hinweise.length ? `<section class="gruppe">${hinweise.map(h => `<p class="klein">${esc(h)}</p>`).join('')}</section>` : ''}
      <section class="gruppe"><h2 class="label">Bereiche</h2><div class="werte">${bereichZeilen}</div></section>
      <section class="gruppe"><h2 class="label">Das solltest du bis zum Test verbessern</h2><div class="tipps">${tipps}</div></section>
      <section class="gruppe"><h2 class="label">Aufgaben und Lösungen</h2><div class="fehlerliste">${nachlesen}</div></section>
      <p class="hinweis">Alle Einschätzungen sind Schätzungen dieser inoffiziellen App. Die echten Grenzwerte der Bundeswehr sind nicht öffentlich.</p>
      <div class="knoepfe">
        <button class="knopf primaer" data-aktion="gehe" data-wert="pruefung-start">Neue Prüfung</button>
        <button class="knopf leise" data-aktion="gehe" data-wert="start">Zur Startseite</button>
      </div>
    </main>`;
  }
});

Object.assign(AKTIONEN, {
  'pr-laenge'(w) {
    daten.einstellungen.pruefungLaenge = w;
    speichern();
    render();
  },

  'pr-start'() {
    startePruefung();
  },

  'pr-beginnen'() {
    prAnleitung();
  },

  'pr-bsp'(w) {
    const bsp = pr.bsp.liste[pr.bsp.i];
    if (pr.bsp.wahl !== null || (bsp.merken && !pr.bsp.gemerkt)) return;
    pr.bsp.wahl = Number(w);
    render();
    zeigeRueckmeldung();
  },

  'pr-bsp-gemerkt'() {
    pr.bsp.gemerkt = true;
    render();
  },

  'pr-bsp-weiter'() {
    if (pr.bsp.i === 0) {
      pr.bsp = Object.assign(pr.bsp, { i: 1, wahl: null, gemerkt: false });
      zeige('pruefung');
      return;
    }
    prNaechste();
  },

  'pr-bsp-ueberspringen'() {
    prNaechste();
  },

  'pr-wahl'(w) {
    const a = pr && pr.aktuell;
    if (!a || a.fertig || a.merkPhase) return;
    a.wahl = Number(w);
    render();
  },

  'pr-weiter'() {
    prBestaetigen(false);
  },

  'pr-reaktion'() {
    starteReaktion(false, {
      niveau: prStartNiveau(),
      anzahl: PRUEFUNG_LAENGEN[pr.laenge].signale,
      titel: `Teil ${pr.bi + 1} von ${BEREICHE.length} · `,
      fertig: ergebnisse => {
        pr.reaktion = ergebnisse;
        pr.reaktionFertig = true;
        prTeilEnde();
      }
    });
  },

  'pr-abbrechen'() {
    if (rk && rk.pruefung) clearTimeout(rk.timer);
    const vorher = rk && rk.pruefung ? rk.phase : null;
    if (rk && rk.pruefung && ['warten', 'signal', 'rueck'].includes(rk.phase)) {
      rk.phase = 'pause';
      zeichneReaktion();
    }
    frageNach({
      titel: 'Prüfung abbrechen?',
      text: 'Die Prüfung wird dann nicht gewertet.',
      ja: 'Abbrechen',
      nein: 'Weitermachen',
      gefahr: true,
      weiter: () => {
        pr = null;
        if (rk) rk = null;
        zeige('start');
      },
      zurueck: () => {
        if (vorher && rk && rk.phase === 'pause') rkNaechstes();
      }
    });
  },

  'pr-ueben'(w) {
    auswahl.bereich = w;
    zeige('bereich');
  }
});

NACH_RENDER.push(() => {
  if (ansicht.name !== 'pruefung' || !pr || pr.phase !== 'aufgabe') return;
  uhr = setInterval(() => {
    const a = pr && pr.aktuell;
    if (!a || ansicht.name !== 'pruefung' || pr.phase !== 'aufgabe' || a.fertig) return;
    if (a.merkPhase) {
      const rest = Math.max(0, Math.ceil((a.merkEnde - Date.now()) / 1000));
      const el = document.getElementById('merk-zeit');
      if (el) el.textContent = rest + ' s';
      if (rest <= 0) {
        a.merkPhase = false;
        a.start = Date.now();
        render();
      }
      return;
    }
    const vergangen = Date.now() - a.start;
    const zeit = document.getElementById('pr-zeit');
    const balken = document.getElementById('pr-balken');
    if (zeit) zeit.textContent = prRestText();
    if (balken) {
      balken.style.width = Math.max(0, 100 * (1 - vergangen / a.limit)) + '%';
      balken.classList.toggle('spaet', a.limit - vergangen < 10000);
    }
    if (vergangen >= a.limit) prBestaetigen(true);
  }, 250);
});

BEI_RUECKKEHR.push(weg => {
  const a = pr && pr.aktuell;
  if (!a || a.fertig || pr.phase !== 'aufgabe') return;
  if (a.merkPhase) a.merkEnde += weg;
  else a.start += weg;
});

document.addEventListener('keydown', e => {
  if (ansicht.name !== 'pruefung' || !pr || offenerDialog || e.metaKey || e.ctrlKey || e.altKey) return;
  if (pr.phase === 'aufgabe' && pr.aktuell && !pr.aktuell.merkPhase) {
    if (e.key === 'Enter') {
      e.preventDefault();
      prBestaetigen(false);
      return;
    }
    let i = ['1', '2', '3', '4', '5', '6'].indexOf(e.key.toLowerCase());
    if (i < 0) i = ['a', 'b', 'c', 'd', 'e', 'f'].indexOf(e.key.toLowerCase());
    if (i >= 0 && i < pr.aktuell.aufgabe.antworten.length) AKTIONEN['pr-wahl'](String(i));
  }
});
