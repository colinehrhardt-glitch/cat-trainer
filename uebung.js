function aufgabeBild(a) {
  if (a.term) return `<div class="term${/[a-zäöüß]{2}/i.test(a.term) ? ' term-wort' : ''}">${esc(a.term)}</div>`;
  if (a.reihe) return `<div class="reihe">${a.reihe.map(z => `<span class="zahl">${esc(H.zahl(z))}</span>`).join('')}<span class="zahl offen">?</span></div>`;
  if (a.zeichen) return `<div class="term">${a.zeichen.teile.map(x => (x === '?' ? '<span class="luecke">?</span>' : esc(H.zahl(x)))).join(' ')} = ${esc(H.zahl(a.zeichen.ergebnis))}</div>`;
  if (a.text) return `<div class="satz">${esc(a.text).replace('___', '<span class="satz-luecke">?</span>').replace(/\n/g, '<br>')}</div>`;
  if (a.bild) return `<div class="bild">${a.bild}</div>`;
  return '';
}

function antwortInhalt(a, i) {
  return a.svg ? `<span class="antwort-bild">${a.antworten[i]}</span>` : `<span class="antwort-text">${esc(a.antworten[i])}</span>`;
}

function aufgabeHtml(a, wahl, aktion, nachher) {
  const fertig = wahl !== null && wahl !== undefined;
  const knoepfe = a.antworten.map((t, i) => {
    let klasse = '';
    let marke = '';
    if (fertig) {
      klasse = i === a.richtig ? 'richtig' : i === wahl ? 'falsch' : 'gedimmt';
      if (i === a.richtig) marke = '<span class="marke-ergebnis" aria-label="richtige Antwort">✓</span>';
      else if (i === wahl) marke = '<span class="marke-ergebnis" aria-label="deine Antwort">✗</span>';
    }
    return `<button class="antwort ${klasse}" data-aktion="${aktion}" data-wert="${i}"${fertig ? ' disabled' : ''}><span class="buchstabe">${BUCHSTABEN[i]}</span>${antwortInhalt(a, i)}${marke}</button>`;
  }).join('');
  const lang = !a.term && !a.reihe && !a.zeichen && !a.bild && !a.text;
  const art = a.svg ? ' antworten-bild' : a.antworten.every(t => t.length <= 3) ? ' antworten-kurz' : '';
  return `<div class="aufgabe-layout"><div class="aufgabe-links"><div class="frage${lang ? ' frage-text' : ''}">${esc(a.frage)}</div>${aufgabeBild(a)}</div><div class="aufgabe-rechts"><div class="antworten${art}">${knoepfe}</div>${nachher || ''}</div></div>`;
}

function neuGemischt(a) {
  const kopie = Object.assign({}, a);
  if (a.merkenQuelle) {
    kopie.merken = a.merkenQuelle;
    kopie.weitere = null;
  }
  if (a.reihenfolgeFest) return kopie;
  const reihenfolge = H.mische(a.antworten.map((_, i) => i));
  kopie.antworten = reihenfolge.map(i => a.antworten[i]);
  kopie.richtig = reihenfolge.indexOf(a.richtig);
  return kopie;
}

function grundFuer(a, wahl) {
  if (wahl === null || wahl === undefined) return 'Die Zeit ist abgelaufen. Im Test zählt eine Aufgabe ohne Antwort als falsch.';
  const t = a.antworten[wahl];
  return (a.gruende && a.gruende[t]) || (TYPEN[a.typ] && TYPEN[a.typ].fehler) || 'Diese Antwort passt nicht. Vergleiche sie mit dem Lösungsweg.';
}

function antwortZeile(a, i, klasse, titel) {
  const leer = i === null || i === undefined;
  const inhalt = leer ? '<span class="vergleich-text">keine Antwort</span>' : a.svg ? `<span class="vergleich-bild">${a.antworten[i]}</span>` : `<span class="vergleich-text">${esc(a.antworten[i])}</span>`;
  return `<div class="vergleich-zeile ${klasse}"><div class="vergleich-kopf">${leer ? '' : `<span class="buchstabe">${BUCHSTABEN[i]}</span>`}<span class="label">${titel}</span><span class="vergleich-zeichen">${klasse === 'richtig' ? '✓' : '✗'}</span></div>${inhalt}</div>`;
}

function wegHtml(a) {
  const weg = a.erklaerung && a.erklaerung.length ? `<div class="label">So löst du die Aufgabe</div><ol class="weg">${a.erklaerung.map(z => `<li>${esc(z)}</li>`).join('')}</ol>` : '';
  const bild = a.loesungsbild ? `<div class="bild loesungsbild">${a.loesungsbild}</div>` : '';
  const v = TYPEN[a.typ] && TYPEN[a.typ].vorgehen;
  const vorgehen = v ? `<div class="vorgehen"><div class="label">So gehst du bei diesem Aufgabentyp vor</div><ol>${v.map(z => `<li>${esc(z)}</li>`).join('')}</ol></div>` : '';
  return weg + bild + vorgehen;
}

function loesungHtml(a, wahl) {
  if (wahl === a.richtig) return wegHtml(a);
  return `<div class="vergleich">${antwortZeile(a, wahl, 'falsch', 'Deine Antwort')}${antwortZeile(a, a.richtig, 'richtig', 'Richtige Antwort')}</div>
    <div class="warum"><div class="label">Warum deine Antwort falsch ist</div><p>${esc(grundFuer(a, wahl))}</p></div>${wegHtml(a)}`;
}

function rueckmeldungHtml(a, wahl, knopf) {
  const ok = wahl === a.richtig;
  const inhalt = ok ? `<details class="mehr"><summary>Lösungsweg und Vorgehen anzeigen</summary><div class="mehr-inhalt">${wegHtml(a)}</div></details>` : loesungHtml(a, wahl);
  return `<section class="rueckmeldung ${ok ? 'gut' : 'schlecht'}" id="rueckmeldung" tabindex="-1" aria-live="polite"><div class="rueck-titel">${ok ? 'Richtig ✓' : 'Leider falsch'}</div>${inhalt}${knopf || ''}</section>`;
}

function aufgabenSchluessel(a) {
  return JSON.stringify([a.frage, a.term, a.reihe, a.zeichen, a.text, a.bild, a.svg ? '' : a.antworten.slice().sort()]);
}

function neueAufgabe(typ, niveau, gesehen) {
  const t = TYPEN[typ];
  const feste = FESTE_AUFGABEN.filter(f => f.typ === typ).map(f => Object.assign({ frage: t.frage || '' }, f));
  const passende = feste.filter(f => f.niveau === niveau && !gesehen.has(aufgabenSchluessel(f)));
  let a = null;
  if (passende.length && (!t.erzeuge || Math.random() < (t.festAnteil || 0.25))) a = festeAufgabe(H.wahl(passende));
  for (let v = 0; !a && t.erzeuge && v < 25; v++) {
    const k = t.erzeuge(niveau);
    if (!gesehen.has(aufgabenSchluessel(k)) || v === 24) a = k;
  }
  if (!a && feste.length) {
    const naechste = H.mische(feste).sort((x, y) => Math.abs(x.niveau - niveau) - Math.abs(y.niveau - niveau));
    a = festeAufgabe(naechste.find(f => !gesehen.has(aufgabenSchluessel(f))) || naechste[0]);
  }
  a.typ = typ;
  a.niveau = niveau;
  gesehen.add(aufgabenSchluessel(a));
  return a;
}

function festeAufgabe(f) {
  const o = H.mische(f.antworten);
  return { frage: f.frage, term: f.term, text: f.text, antworten: o, richtig: o.indexOf(f.antworten[0]), erklaerung: f.erklaerung || [] };
}

function starteBeispiel() {
  if (auswahl.typ !== 'mix' && TYPEN[auswahl.typ].art === 'reaktion') {
    zeige('intro', { bspWahl: null });
    return;
  }
  const typen = auswahl.typ === 'mix' ? BEREICHE.find(b => b.id === auswahl.bereich).typen.filter(mischbar) : [auswahl.typ];
  zeige('intro', { beispiel: neueAufgabe(H.wahl(typen), 1, new Set()), bspWahl: null });
}

function starteSitzung() {
  if (auswahl.typ !== 'mix' && TYPEN[auswahl.typ].art === 'reaktion') {
    starteReaktion(false);
    return;
  }
  const e = daten.einstellungen;
  const typen = auswahl.typ === 'mix' ? BEREICHE.find(b => b.id === auswahl.bereich).typen.filter(mischbar) : [auswahl.typ];
  const start = e.niveau === 'auto' ? startNiveau() : Number(e.niveau);
  sitzung = { typen, beutel: [], auto: e.niveau === 'auto', niveau: start, startNiveau: start, anzahl: e.anzahl, liste: [], gesehen: new Set(), serie: 0, aktuell: null };
  naechsteAufgabe();
}

function folgeAufgaben(aufgabe, platz) {
  return (aufgabe.weitere || []).slice(0, Math.max(0, platz)).map(w => Object.assign(w, { typ: aufgabe.typ, niveau: aufgabe.niveau }));
}

function neuerStand(aufgabe) {
  const merken = !!aufgabe.merken;
  return { aufgabe, gewaehlt: null, start: Date.now(), ms: 0, richtig: false, merkPhase: merken, merkEnde: merken ? Date.now() + aufgabe.merken.sekunden * 1000 : 0 };
}

function merkHtml(merken, rest, aktion, knopfText) {
  return `<div class="merk-kopf"><div class="frage">Präge dir diese Ausweise ein. Danach werden sie ausgeblendet.</div>${rest === null ? '' : `<div class="merk-zeit" id="merk-zeit">${rest} s</div>`}</div>
    ${merken.html}
    <div class="knoepfe merk-knoepfe"><button class="knopf primaer" data-aktion="${aktion}">${knopfText}</button></div>`;
}

function naechsteAufgabe() {
  let aufgabe;
  if (sitzung.wiederholung) {
    aufgabe = sitzung.wiederholung[sitzung.liste.length];
  } else if (sitzung.warteschlange && sitzung.warteschlange.length) {
    aufgabe = sitzung.warteschlange.shift();
  } else {
    if (!sitzung.beutel.length) sitzung.beutel = H.mische(sitzung.typen);
    aufgabe = neueAufgabe(sitzung.beutel.pop(), sitzung.niveau, sitzung.gesehen);
    sitzung.warteschlange = folgeAufgaben(aufgabe, sitzung.anzahl - sitzung.liste.length - 1);
  }
  sitzung.aktuell = neuerStand(aufgabe);
  zeige('aufgabe');
}

function starteWiederholung() {
  const alt = sitzung;
  const liste = alt.liste.filter(x => !x.richtig).map(x => neuGemischt(x.aufgabe));
  if (!liste.length) return;
  sitzung = { typen: alt.typen, beutel: [], auto: false, niveau: alt.niveau, startNiveau: alt.startNiveau, anzahl: liste.length, liste: [], gesehen: new Set(), serie: 0, aktuell: null, wiederholung: liste };
  naechsteAufgabe();
}

function antworte(i) {
  const a = sitzung.aktuell;
  if (a.gewaehlt !== null || a.merkPhase) return;
  a.ms = Date.now() - a.start;
  a.gewaehlt = i;
  a.richtig = i === a.aufgabe.richtig;
  sitzung.liste.push(a);
  const b = bereichVon(a.aufgabe.typ);
  daten.verlauf.push({ b: b ? b.id : '', t: a.aufgabe.typ, n: a.aufgabe.niveau, r: a.richtig ? 1 : 0, ms: a.ms, d: Date.now(), m: sitzung.wiederholung ? 'w' : 'u' });
  speichern();
  if (sitzung.auto) {
    if (a.richtig) {
      sitzung.serie++;
      if (sitzung.serie >= 2) {
        sitzung.niveau = Math.min(5, sitzung.niveau + 1);
        sitzung.serie = 0;
      }
    } else {
      sitzung.serie = 0;
      sitzung.niveau = Math.max(1, sitzung.niveau - 1);
    }
  }
  render();
  zeigeRueckmeldung();
}

Object.assign(ANSICHTEN, {
  intro() {
    const t = auswahl.typ;
    const b = BEREICHE.find(x => x.id === auswahl.bereich);
    if (t !== 'mix' && TYPEN[t].art === 'reaktion') return reaktionsIntro();
    const text = t === 'mix'
      ? [`Die Aufgaben kommen gemischt aus ${H.und(b.typen.filter(mischbar).map(typName))}.`]
      : TYPEN[t].erklaerung;
    const bsp = ansicht.beispiel;
    const fertig = ansicht.bspWahl !== null;
    const merkOffen = bsp.merken && !ansicht.bspGemerkt;
    return kopf(typName(t), ['gehe', 'bereich']) + `<main class="seite">
      <section class="einleitung"><h1>${esc(typName(t))}</h1>${text.map(p => `<p>${esc(p)}</p>`).join('')}</section>
      <section class="beispiel">
        <div class="label">Beispielaufgabe${t === 'mix' ? ` · ${esc(typName(bsp.typ))}` : ''}</div>
        ${merkOffen ? merkHtml(bsp.merken, null, 'bsp-gemerkt', 'Weiter zur Frage') : aufgabeHtml(bsp, ansicht.bspWahl, 'bsp', fertig ? rueckmeldungHtml(bsp, ansicht.bspWahl, '') : '')}
      </section>
      <div class="knoepfe"><button class="knopf ${fertig ? 'primaer' : ''}" data-aktion="los">${fertig ? 'Übung starten' : 'Beispiel überspringen und starten'}</button></div>
    </main>`;
  },

  aufgabe() {
    const s = sitzung;
    const a = s.aktuell;
    const fertig = a.gewaehlt !== null;
    const nr = s.liste.length + (fertig ? 0 : 1);
    const letzte = fertig && s.liste.length >= s.anzahl;
    const knopf = `<button class="knopf primaer" data-aktion="weiter">${letzte ? 'Zur Auswertung' : 'Weiter'}</button>`;
    const rechts = `<div class="uhr" id="uhr" aria-label="Benötigte Zeit">${zeitText(fertig ? a.ms : a.merkPhase ? 0 : Date.now() - a.start)}</div>`;
    const kopfzeile = `<header class="kopf"><button class="symbol" data-aktion="abbrechen" aria-label="Übung beenden">${SYMBOLE.schliessen}</button><div class="kopf-titel">${s.wiederholung ? 'Wiederholung' : 'Aufgabe'} ${nr} von ${s.anzahl}</div>${rechts}</header>`;
    return kopfzeile + `<div class="balken" aria-hidden="true"><span style="width:${100 * s.liste.length / s.anzahl}%"></span></div>
      <main class="seite">
        <div class="meta"><span>${esc(typName(a.aufgabe.typ))}</span>${niveauHtml(a.aufgabe.niveau)}</div>
        ${a.merkPhase ? merkHtml(a.aufgabe.merken, Math.max(0, Math.ceil((a.merkEnde - Date.now()) / 1000)), 'gemerkt', 'Ich habe sie mir gemerkt') : aufgabeHtml(a.aufgabe, a.gewaehlt, 'antwort', fertig ? rueckmeldungHtml(a.aufgabe, a.gewaehlt, knopf) : '')}
      </main>`;
  },

  auswertung() {
    const s = sitzung;
    const l = s.liste;
    const r = l.filter(x => x.richtig).length;
    const pct = l.length ? Math.round(100 * r / l.length) : 0;
    const zeit = l.length ? Math.round(l.reduce((x, y) => x + y.ms, 0) / l.length / 1000) : 0;
    const werte = [`<div class="wert"><span>Zeit pro Aufgabe</span><span>Ø ${zeit} s</span></div>`];
    if (s.wiederholung) werte.push('<div class="wert"><span>Art</span><span>Wiederholung deiner Fehler</span></div>');
    else werte.push(s.auto
      ? `<div class="wert"><span>Niveau</span><span>${s.startNiveau} → ${s.niveau}</span></div>`
      : `<div class="wert"><span>Niveau</span><span>${s.niveau}</span></div>`);
    if (s.typen.length > 1) {
      s.typen.forEach(t => {
        const xs = l.filter(x => x.aufgabe.typ === t);
        if (xs.length) werte.push(`<div class="wert"><span>${esc(typName(t))}</span><span>${xs.filter(x => x.richtig).length} von ${xs.length}</span></div>`);
      });
    }
    const anzahlFehler = l.filter(x => !x.richtig).length;
    const fehler = l.filter(x => !x.richtig).map(x => {
      const a = x.aufgabe;
      const titel = a.term || a.text || (a.reihe ? a.reihe.map(z => H.zahl(z)).join(', ') + ', ?' : a.zeichen ? a.zeichen.teile.map(z => (z === '?' ? '?' : H.zahl(z))).join(' ') + ' = ' + H.zahl(a.zeichen.ergebnis) : a.frage);
      return `<details class="fehler"><summary>${esc(titel)}</summary><div class="fehler-inhalt">
        ${a.term || a.reihe || a.zeichen || a.text ? `<p>${esc(a.frage)}</p>` : ''}
        ${a.bild ? `<div class="bild">${a.bild}</div>` : ''}
        ${loesungHtml(a, x.gewaehlt)}
      </div></details>`;
    }).join('');
    return kopf('Auswertung') + `<main class="seite">
      <section class="ergebnis"><div class="ergebnis-zahl">${r} von ${l.length}</div><div class="text-2">richtig · ${pct} %</div></section>
      <section class="werte">${werte.join('')}</section>
      ${fehler ? `<section class="gruppe"><h2 class="label">Deine Fehler</h2><div class="fehlerliste">${fehler}</div></section>` : ''}
      <div class="knoepfe">
        ${anzahlFehler ? `<button class="knopf primaer" data-aktion="fehler-wiederholen">${anzahlFehler === 1 ? 'Den Fehler' : `Die ${anzahlFehler} Fehler`} nochmal üben</button>` : ''}
        <button class="knopf${anzahlFehler ? '' : ' primaer'}" data-aktion="nochmal">Noch eine Runde</button>
        <button class="knopf" data-aktion="gehe" data-wert="bereich">Anderen Typ wählen</button>
        <button class="knopf leise" data-aktion="gehe" data-wert="start">Zur Startseite</button>
      </div>
    </main>`;
  }
});

Object.assign(AKTIONEN, {
  typ(w) {
    auswahl.typ = w;
    starteBeispiel();
  },

  bsp(w) {
    if (ansicht.bspWahl !== null || (ansicht.beispiel.merken && !ansicht.bspGemerkt)) return;
    ansicht.bspWahl = Number(w);
    render();
    zeigeRueckmeldung();
  },

  los() {
    starteSitzung();
  },

  antwort(w) {
    antworte(Number(w));
  },

  weiter() {
    if (sitzung.liste.length >= sitzung.anzahl) zeige('auswertung');
    else naechsteAufgabe();
  },

  abbrechen() {
    if (!sitzung.liste.length) {
      sitzung = null;
      zeige('bereich');
      return;
    }
    frageNach({
      titel: 'Übung beenden?',
      text: 'Deine bisherigen Antworten bleiben gespeichert.',
      ja: 'Beenden',
      nein: 'Weiterüben',
      weiter: () => zeige('auswertung')
    });
  },

  nochmal() {
    starteSitzung();
  },

  'fehler-wiederholen'() {
    starteWiederholung();
  },

  gemerkt() {
    const a = sitzung && sitzung.aktuell;
    if (!a || !a.merkPhase) return;
    a.merkPhase = false;
    a.start = Date.now();
    render();
  },

  'bsp-gemerkt'() {
    ansicht.bspGemerkt = true;
    render();
  }
});

NACH_RENDER.push(() => {
  if (ansicht.name !== 'aufgabe' || !sitzung || sitzung.aktuell.gewaehlt !== null) return;
  uhr = setInterval(() => {
    const a = sitzung && sitzung.aktuell;
    if (!a || ansicht.name !== 'aufgabe') return;
    if (a.merkPhase) {
      const rest = Math.max(0, Math.ceil((a.merkEnde - Date.now()) / 1000));
      const el = document.getElementById('merk-zeit');
      if (el) el.textContent = rest + ' s';
      if (rest <= 0) AKTIONEN.gemerkt();
      return;
    }
    const el = document.getElementById('uhr');
    if (el && a.gewaehlt === null) el.textContent = zeitText(Date.now() - a.start);
  }, 250);
});

BEI_RUECKKEHR.push(weg => {
  const a = sitzung && sitzung.aktuell;
  if (!a || a.gewaehlt !== null) return;
  if (a.merkPhase) a.merkEnde += weg;
  else a.start += weg;
});
