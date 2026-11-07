const ABSCHLUESSE = [
  { id: 'ohne', name: 'Ohne Abschluss', niveau: 1 },
  { id: 'haupt', name: 'Hauptschulabschluss', niveau: 2 },
  { id: 'real', name: 'Realschulabschluss / Mittlere Reife', niveau: 3 },
  { id: 'fachabi', name: 'Fachhochschulreife', niveau: 3 },
  { id: 'abi', name: 'Abitur', niveau: 4 },
  { id: 'studium', name: 'Studium', niveau: 4 }
];

const ZIELE = [
  { id: 'mannschaften', name: 'Mannschaften' },
  { id: 'feldwebel', name: 'Unteroffizier / Feldwebel' },
  { id: 'offizier', name: 'Offizier' },
  { id: 'ksk', name: 'KSK (Kommando Spezialkräfte)' }
];

const SYMBOLE = {
  zurueck: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  schliessen: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
  regler: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h9M17 7h3M4 17h3M11 17h9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="15" cy="7" r="2.2" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="9" cy="17" r="2.2" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
  pfeil: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
};

const BUCHSTABEN = 'ABCDEF';
const $app = document.getElementById('app');
const $dialog = document.getElementById('dialog');
const $meldung = document.getElementById('meldung');

let daten = Speicher.laden();
const speicherOk = Speicher.pruefen();
let ansicht = { name: daten.profil ? 'start' : 'willkommen' };
let auswahl = { bereich: null, typ: null };
let entwurf = {};
let sitzung = null;
let uhr = null;
let offenerDialog = null;
let meldungTimer = null;

function esc(t) {
  return String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

function typName(t) {
  return t === 'mix' ? 'Alles gemischt' : TYPEN[t] ? TYPEN[t].name : t;
}

function typAktiv(t) {
  const x = TYPEN[t];
  return !!x && (typeof x.erzeuge === 'function' || FESTE_AUFGABEN.some(f => f.typ === t));
}

function bereichAktiv(b) {
  return b.typen.some(typAktiv);
}

function bereichVon(t) {
  return BEREICHE.find(b => b.typen.includes(t));
}

function startNiveau() {
  const a = daten.profil && ABSCHLUESSE.find(x => x.id === daten.profil.abschluss);
  return a ? a.niveau : 3;
}

function heuteIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function tageBis(iso) {
  const [j, m, t] = iso.split('-').map(Number);
  const heute = new Date();
  heute.setHours(0, 0, 0, 0);
  return Math.round((new Date(j, m - 1, t) - heute) / 86400000);
}

function datumText(iso) {
  const [j, m, t] = iso.split('-');
  return `${t}.${m}.${j}`;
}

function quote(liste) {
  return liste.length ? Math.round(100 * liste.filter(x => x.r).length / liste.length) : 0;
}

function zeitText(ms) {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function zahlText(n) {
  return n.toLocaleString('de-DE');
}

function speichern() {
  if (!Speicher.speichern(daten) && speicherOk) melde('Speichern hat nicht geklappt.');
}

function kopf(titel, zurueck, rechts) {
  const links = zurueck
    ? `<button class="symbol" data-aktion="${zurueck[0]}" data-wert="${zurueck[1] || ''}" aria-label="Zurück">${SYMBOLE.zurueck}</button>`
    : '<span class="symbol-platz"></span>';
  return `<header class="kopf">${links}<div class="kopf-titel">${esc(titel)}</div>${rechts || '<span class="symbol-platz"></span>'}</header>`;
}

function niveauHtml(n) {
  let s = '';
  for (let i = 1; i <= 5; i++) s += `<i class="${i <= n ? 'an' : ''}"></i>`;
  return `<span class="niveau" aria-label="Niveau ${n} von 5"><span class="niveau-text">Niveau ${n}</span><span class="niveau-balken">${s}</span></span>`;
}

function aufgabeHtml(a, wahl, aktion) {
  const fertig = wahl !== null && wahl !== undefined;
  let bild = '';
  if (a.term) bild = `<div class="term">${esc(a.term)}</div>`;
  if (a.reihe) bild = `<div class="reihe">${a.reihe.map(z => `<span class="zahl">${esc(H.zahl(z))}</span>`).join('')}<span class="zahl offen">?</span></div>`;
  if (a.zeichen) bild = `<div class="term">${a.zeichen.teile.map(x => (x === '?' ? '<span class="luecke">?</span>' : esc(H.zahl(x)))).join(' ')} = ${esc(H.zahl(a.zeichen.ergebnis))}</div>`;
  const knoepfe = a.antworten.map((t, i) => {
    let klasse = '';
    let marke = '';
    if (fertig) {
      klasse = i === a.richtig ? 'richtig' : i === wahl ? 'falsch' : 'gedimmt';
      if (i === a.richtig) marke = '<span class="marke-ergebnis" aria-label="richtige Antwort">✓</span>';
      else if (i === wahl) marke = '<span class="marke-ergebnis" aria-label="deine Antwort">✗</span>';
    }
    return `<button class="antwort ${klasse}" data-aktion="${aktion}" data-wert="${i}"${fertig ? ' disabled' : ''}><span class="buchstabe">${BUCHSTABEN[i]}</span><span class="antwort-text">${esc(t)}</span>${marke}</button>`;
  }).join('');
  const lang = !a.term && !a.reihe && !a.zeichen;
  return `<div class="frage${lang ? ' frage-text' : ''}">${esc(a.frage)}</div>${bild}<div class="antworten${a.antworten.every(t => t.length <= 3) ? ' antworten-kurz' : ''}">${knoepfe}</div>`;
}

function rueckmeldungHtml(a, wahl, knopf) {
  const ok = wahl === a.richtig;
  const titel = ok ? 'Richtig' : `Falsch. Richtig ist ${BUCHSTABEN[a.richtig]}: ${a.antworten[a.richtig]}`;
  const weg = a.erklaerung && a.erklaerung.length
    ? `<div class="label">Lösungsweg</div><ol class="weg">${a.erklaerung.map(z => `<li>${esc(z)}</li>`).join('')}</ol>`
    : '';
  return `<section class="rueckmeldung ${ok ? 'gut' : 'schlecht'}" id="rueckmeldung" tabindex="-1" aria-live="polite"><div class="rueck-titel">${esc(titel)}</div>${weg}${knopf || ''}</section>`;
}

function neueAufgabe(typ, niveau, gesehen) {
  const t = TYPEN[typ];
  const schluessel = a => JSON.stringify([a.frage, a.term, a.reihe, a.zeichen]);
  const feste = FESTE_AUFGABEN.filter(f => f.typ === typ);
  const passende = feste.filter(f => f.niveau === niveau && !gesehen.has(schluessel(f)));
  let a = null;
  if (passende.length && (!t.erzeuge || Math.random() < 0.25)) a = festeAufgabe(H.wahl(passende));
  for (let v = 0; !a && t.erzeuge && v < 25; v++) {
    const k = t.erzeuge(niveau);
    if (!gesehen.has(schluessel(k)) || v === 24) a = k;
  }
  if (!a && feste.length) {
    const naechste = feste.slice().sort((x, y) => Math.abs(x.niveau - niveau) - Math.abs(y.niveau - niveau));
    a = festeAufgabe(naechste.find(f => !gesehen.has(schluessel(f))) || naechste[0]);
  }
  a.typ = typ;
  a.niveau = niveau;
  gesehen.add(schluessel(a));
  return a;
}

function festeAufgabe(f) {
  const o = H.mische(f.antworten);
  return { frage: f.frage, antworten: o, richtig: o.indexOf(f.antworten[0]), erklaerung: f.erklaerung || [] };
}

const ANSICHTEN = {
  willkommen() {
    return `<main class="seite willkommen">
      <div class="marke-gross">CAT-Trainer</div>
      <h1>Bereite dich auf den Computer-Assistierten Test vor.</h1>
      <p class="text-2">Du übst alle Bereiche des Eignungstests mit eigenen Aufgaben im gleichen Format.</p>
      <div class="hinweis">Inoffizielle Übungs-App ohne Verbindung zur Bundeswehr. Alle Ergebnisse und Empfehlungen sind Schätzungen.</div>
      <button class="knopf primaer" data-aktion="ob-start">Los geht's</button>
    </main>`;
  },

  onboarding() {
    const s = ansicht.schritt;
    let inhalt = '';
    if (s === 1) {
      inhalt = `<h1>Welchen Schulabschluss hast du?</h1>
        <p class="text-2">Danach richtet sich das Startniveau.</p>
        <div class="liste">${ABSCHLUESSE.map(a => `<button class="wahl${entwurf.abschluss === a.id ? ' aktiv' : ''}" data-aktion="ob-abschluss" data-wert="${a.id}">${esc(a.name)}</button>`).join('')}</div>`;
    }
    if (s === 2) {
      inhalt = `<h1>Wann ist dein Testtermin?</h1>
        <p class="text-2">Daraus entsteht später dein Lernplan.</p>
        <label class="feld-label" for="ob-termin">Datum</label>
        <input class="feld" type="date" id="ob-termin" min="${heuteIso()}" value="${esc(entwurf.termin || '')}">
        <p class="fehlertext" id="ob-fehler" hidden>Wähle ein Datum oder tippe auf „Noch kein Termin“.</p>
        <div class="knoepfe">
          <button class="knopf primaer" data-aktion="ob-termin">Weiter</button>
          <button class="knopf" data-aktion="ob-kein-termin">Noch kein Termin</button>
        </div>`;
    }
    if (s === 3) {
      inhalt = `<h1>Was ist dein Ziel?</h1>
        <p class="text-2">Daran misst die App später deine Ergebnisse.</p>
        <div class="liste">${ZIELE.map(z => `<button class="wahl${entwurf.ziel === z.id ? ' aktiv' : ''}" data-aktion="ob-ziel" data-wert="${z.id}">${esc(z.name)}</button>`).join('')}</div>`;
    }
    return kopf(`Schritt ${s} von 3`, ['ob-zurueck']) + `<div class="balken" aria-hidden="true"><span style="width:${s * 33.34}%"></span></div><main class="seite">${inhalt}</main>`;
  },

  start() {
    const p = daten.profil;
    const ziel = ZIELE.find(z => z.id === p.ziel);
    let termin = 'Noch kein Testtermin eingetragen.';
    if (p.termin) {
      const t = tageBis(p.termin);
      if (t > 1) termin = `Test am ${datumText(p.termin)} · noch ${t} Tage`;
      else if (t === 1) termin = `Test morgen, am ${datumText(p.termin)}`;
      else if (t === 0) termin = 'Heute ist dein Test. Viel Erfolg!';
      else termin = 'Dein Testtermin ist vorbei. Trag in den Einstellungen einen neuen ein.';
    }
    const heute = new Date();
    heute.setHours(0, 0, 0, 0);
    const h = daten.verlauf.filter(x => x.d >= heute.getTime());
    const heuteText = h.length ? `Heute: ${h.length} ${h.length === 1 ? 'Aufgabe' : 'Aufgaben'} · ${quote(h)} % richtig` : 'Heute hast du noch nicht geübt.';
    const kachel = (titel, text, aktion) => aktion
      ? `<button class="kachel" data-aktion="${aktion}"><span class="kachel-titel">${titel}</span><span class="kachel-text">${text}</span></button>`
      : `<div class="kachel aus" aria-disabled="true"><span class="kachel-titel">${titel}<span class="bald">Bald</span></span><span class="kachel-text">${text}</span></div>`;
    const rechts = `<button class="symbol" data-aktion="gehe" data-wert="einstellungen" aria-label="Einstellungen">${SYMBOLE.regler}</button>`;
    return kopf('CAT-Trainer', null, rechts) + `<main class="seite">
      ${speicherOk ? '' : '<div class="hinweis warnung">Speichern ist in diesem Browser nicht möglich, zum Beispiel im privaten Modus. Dein Fortschritt geht beim Schließen verloren.</div>'}
      <section class="ziel">
        <div class="label">Dein Ziel</div>
        <div class="ziel-name">${esc(ziel ? ziel.name : '')}</div>
        <div class="ziel-termin">${esc(termin)}</div>
        <div class="ziel-heute">${esc(heuteText)}</div>
      </section>
      <nav class="kacheln">
        <button class="kachel haupt" data-aktion="gehe" data-wert="ueben"><span class="kachel-titel">Üben${SYMBOLE.pfeil}</span><span class="kachel-text">Bereich wählen, ohne Zeitlimit, mit Lösungsweg nach jeder Aufgabe.</span></button>
        ${kachel('Prüfung simulieren', 'Alle Bereiche mit Zeitlimit und anpassender Schwierigkeit.')}
        ${kachel('Statistik', 'Trefferquote, Tempo und Verlauf pro Bereich.')}
        ${kachel('Lernplan', 'Tägliche Einheiten bis zum Testtag.')}
      </nav>
      <p class="fuss">Inoffizielle Übungs-App ohne Verbindung zur Bundeswehr. Die Aufgaben sind selbst erstellt. Alle Ergebnisse sind Schätzungen.</p>
    </main>`;
  },

  ueben() {
    const zeilen = BEREICHE.map(b => {
      if (!bereichAktiv(b)) {
        return `<div class="zeile aus" aria-disabled="true"><span class="zeile-inhalt"><span class="zeile-titel">${esc(b.name)}</span><span class="zeile-text">${esc(b.info)}</span></span><span class="bald">Bald</span></div>`;
      }
      const v = daten.verlauf.filter(x => x.b === b.id);
      const stat = v.length ? `<span class="zeile-stat">${zahlText(v.length)} ${v.length === 1 ? 'Aufgabe' : 'Aufgaben'} · ${quote(v)} %</span>` : '';
      return `<button class="zeile" data-aktion="bereich" data-wert="${b.id}"><span class="zeile-inhalt"><span class="zeile-titel">${esc(b.name)}</span><span class="zeile-text">${esc(b.info)}</span>${stat}</span>${SYMBOLE.pfeil}</button>`;
    }).join('');
    return kopf('Üben', ['gehe', 'start']) + `<main class="seite"><p class="text-2 einstieg">Wähle einen Bereich.</p><div class="liste">${zeilen}</div></main>`;
  },

  bereich() {
    const b = BEREICHE.find(x => x.id === auswahl.bereich);
    const aktive = b.typen.filter(typAktiv);
    const e = daten.einstellungen;
    const zeilen = [];
    if (aktive.length > 1) {
      zeilen.push(`<button class="zeile" data-aktion="typ" data-wert="mix"><span class="zeile-inhalt"><span class="zeile-titel">Alles gemischt</span><span class="zeile-text">${esc(H.und(aktive.map(typName)))}</span></span>${SYMBOLE.pfeil}</button>`);
    }
    b.typen.forEach(t => {
      if (!typAktiv(t)) {
        zeilen.push(`<div class="zeile aus" aria-disabled="true"><span class="zeile-inhalt"><span class="zeile-titel">${esc(typName(t))}</span></span><span class="bald">Bald</span></div>`);
        return;
      }
      const v = daten.verlauf.filter(x => x.t === t);
      const stat = v.length ? `<span class="zeile-stat">${zahlText(v.length)} ${v.length === 1 ? 'Aufgabe' : 'Aufgaben'} · ${quote(v)} %</span>` : '';
      zeilen.push(`<button class="zeile" data-aktion="typ" data-wert="${t}"><span class="zeile-inhalt"><span class="zeile-titel">${esc(typName(t))}</span>${stat}</span>${SYMBOLE.pfeil}</button>`);
    });
    const segment = (aktion, wert, text, aktiv) => `<button class="segment${aktiv ? ' aktiv' : ''}" data-aktion="${aktion}" data-wert="${wert}" aria-pressed="${aktiv}">${text}</button>`;
    const niveaus = ['auto', '1', '2', '3', '4', '5'].map(n => segment('niveau', n, n === 'auto' ? 'Auto' : n, String(e.niveau) === n)).join('');
    const anzahlen = [10, 20, 30].map(n => segment('anzahl', n, n, e.anzahl === n)).join('');
    const niveauInfo = e.niveau === 'auto'
      ? `Startet bei Niveau ${startNiveau()}. Zweimal richtig macht es schwerer, falsch macht es leichter.`
      : `Alle Aufgaben kommen auf Niveau ${e.niveau} von 5.`;
    return kopf(b.name, ['gehe', 'ueben']) + `<main class="seite">
      <section class="gruppe"><h2 class="label">Aufgabentyp</h2><div class="liste">${zeilen.join('')}</div></section>
      <section class="gruppe"><h2 class="label">Schwierigkeit</h2><div class="segmente">${niveaus}</div><p class="klein">${esc(niveauInfo)}</p></section>
      <section class="gruppe"><h2 class="label">Aufgaben pro Runde</h2><div class="segmente">${anzahlen}</div></section>
    </main>`;
  },

  intro() {
    const t = auswahl.typ;
    const b = BEREICHE.find(x => x.id === auswahl.bereich);
    const text = t === 'mix'
      ? [`Die Aufgaben kommen gemischt aus ${H.und(b.typen.filter(typAktiv).map(typName))}.`]
      : TYPEN[t].erklaerung;
    const bsp = ansicht.beispiel;
    const fertig = ansicht.bspWahl !== null;
    return kopf(typName(t), ['gehe', 'bereich']) + `<main class="seite">
      <section class="einleitung"><h1>${esc(typName(t))}</h1>${text.map(p => `<p>${esc(p)}</p>`).join('')}</section>
      <section class="beispiel">
        <div class="label">Beispielaufgabe${t === 'mix' ? ` · ${esc(typName(bsp.typ))}` : ''}</div>
        ${aufgabeHtml(bsp, ansicht.bspWahl, 'bsp')}
        ${fertig ? rueckmeldungHtml(bsp, ansicht.bspWahl, '') : ''}
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
    const rechts = `<div class="uhr" id="uhr" aria-label="Benötigte Zeit">${zeitText(fertig ? a.ms : Date.now() - a.start)}</div>`;
    const kopfzeile = `<header class="kopf"><button class="symbol" data-aktion="abbrechen" aria-label="Übung beenden">${SYMBOLE.schliessen}</button><div class="kopf-titel">Aufgabe ${nr} von ${s.anzahl}</div>${rechts}</header>`;
    return kopfzeile + `<div class="balken" aria-hidden="true"><span style="width:${100 * s.liste.length / s.anzahl}%"></span></div>
      <main class="seite">
        <div class="meta"><span>${esc(typName(a.aufgabe.typ))}</span>${niveauHtml(a.aufgabe.niveau)}</div>
        ${aufgabeHtml(a.aufgabe, a.gewaehlt, 'antwort')}
        ${fertig ? rueckmeldungHtml(a.aufgabe, a.gewaehlt, knopf) : ''}
      </main>`;
  },

  auswertung() {
    const s = sitzung;
    const l = s.liste;
    const r = l.filter(x => x.richtig).length;
    const pct = l.length ? Math.round(100 * r / l.length) : 0;
    const zeit = l.length ? Math.round(l.reduce((x, y) => x + y.ms, 0) / l.length / 1000) : 0;
    const werte = [`<div class="wert"><span>Zeit pro Aufgabe</span><span>Ø ${zeit} s</span></div>`];
    werte.push(s.auto
      ? `<div class="wert"><span>Niveau</span><span>${s.startNiveau} → ${s.niveau}</span></div>`
      : `<div class="wert"><span>Niveau</span><span>${s.niveau}</span></div>`);
    if (s.typen.length > 1) {
      s.typen.forEach(t => {
        const xs = l.filter(x => x.aufgabe.typ === t);
        if (xs.length) werte.push(`<div class="wert"><span>${esc(typName(t))}</span><span>${xs.filter(x => x.richtig).length} von ${xs.length}</span></div>`);
      });
    }
    const fehler = l.filter(x => !x.richtig).map(x => {
      const a = x.aufgabe;
      const titel = a.term || (a.reihe ? a.reihe.map(z => H.zahl(z)).join(', ') + ', ?' : a.zeichen ? a.zeichen.teile.map(z => (z === '?' ? '?' : H.zahl(z))).join(' ') + ' = ' + H.zahl(a.zeichen.ergebnis) : a.frage);
      return `<details class="fehler"><summary>${esc(titel)}</summary><div class="fehler-inhalt">
        ${a.term || a.reihe || a.zeichen ? `<p>${esc(a.frage)}</p>` : ''}
        <p>Deine Antwort: ${esc(a.antworten[x.gewaehlt])}<br>Richtig: <strong>${esc(a.antworten[a.richtig])}</strong></p>
        <ol class="weg">${a.erklaerung.map(z => `<li>${esc(z)}</li>`).join('')}</ol>
      </div></details>`;
    }).join('');
    return kopf('Auswertung') + `<main class="seite">
      <section class="ergebnis"><div class="ergebnis-zahl">${r} von ${l.length}</div><div class="text-2">richtig · ${pct} %</div></section>
      <section class="werte">${werte.join('')}</section>
      ${fehler ? `<section class="gruppe"><h2 class="label">Deine Fehler</h2><div class="fehlerliste">${fehler}</div></section>` : ''}
      <div class="knoepfe">
        <button class="knopf primaer" data-aktion="nochmal">Noch eine Runde</button>
        <button class="knopf" data-aktion="gehe" data-wert="bereich">Anderen Typ wählen</button>
        <button class="knopf leise" data-aktion="gehe" data-wert="start">Zur Startseite</button>
      </div>
    </main>`;
  },

  einstellungen() {
    const p = daten.profil;
    const opt = (liste, wert) => liste.map(x => `<option value="${x.id}"${x.id === wert ? ' selected' : ''}>${esc(x.name)}</option>`).join('');
    const n = daten.verlauf.length;
    return kopf('Einstellungen', ['gehe', 'start']) + `<main class="seite">
      <section class="gruppe">
        <h2 class="label">Profil</h2>
        <label class="feld-label" for="e-abschluss">Schulabschluss</label>
        <select class="feld" id="e-abschluss" data-feld="abschluss">${opt(ABSCHLUESSE, p.abschluss)}</select>
        <label class="feld-label" for="e-termin">Testtermin</label>
        <div class="feld-reihe">
          <input class="feld" type="date" id="e-termin" data-feld="termin" value="${esc(p.termin || '')}">
          <button class="knopf klein-knopf" id="e-termin-weg" data-aktion="termin-weg"${p.termin ? '' : ' hidden'}>Entfernen</button>
        </div>
        <label class="feld-label" for="e-ziel">Ziel</label>
        <select class="feld" id="e-ziel" data-feld="ziel">${opt(ZIELE, p.ziel)}</select>
      </section>
      <section class="gruppe">
        <h2 class="label">Fortschritt</h2>
        <p>${n ? `${zahlText(n)} beantwortete ${n === 1 ? 'Aufgabe' : 'Aufgaben'}.` : 'Noch keine Aufgaben beantwortet.'} Alles bleibt nur auf diesem Gerät gespeichert.</p>
        <div class="knoepfe">
          <button class="knopf gefahr" data-aktion="frage-loeschen"${n ? '' : ' disabled'}>Fortschritt löschen</button>
          <button class="knopf leise" data-aktion="frage-reset">Alles zurücksetzen</button>
        </div>
      </section>
      <section class="gruppe">
        <h2 class="label">Über diese App</h2>
        <p>Inoffizielle Übungs-App. Sie ist nicht von der Bundeswehr und hat keine Verbindung zu ihr.</p>
        <p>Alle Aufgaben sind selbst erstellt und bilden nur das Format des CAT nach.</p>
        <p>Ergebnisse und Empfehlungen sind Schätzungen. Die echten Grenzwerte sind nicht öffentlich.</p>
        <p class="klein">Version 1 · Stufe 1</p>
      </section>
    </main>`;
  }
};

function render() {
  clearInterval(uhr);
  uhr = null;
  $app.innerHTML = ANSICHTEN[ansicht.name]();
  if (ansicht.name === 'aufgabe' && sitzung.aktuell.gewaehlt === null) {
    uhr = setInterval(() => {
      const el = document.getElementById('uhr');
      if (el && sitzung && sitzung.aktuell.gewaehlt === null) el.textContent = zeitText(Date.now() - sitzung.aktuell.start);
    }, 1000);
  }
}

function zeige(name, extra) {
  ansicht = Object.assign({ name }, extra || {});
  render();
  window.scrollTo(0, 0);
  const t = $app.querySelector('h1, .kopf-titel');
  if (t) {
    t.setAttribute('tabindex', '-1');
    t.focus({ preventScroll: true });
  }
}

function zeigeRueckmeldung() {
  const el = document.getElementById('rueckmeldung');
  if (!el) return;
  const ruhig = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ behavior: ruhig ? 'auto' : 'smooth', block: 'nearest' });
}

function melde(text) {
  $meldung.textContent = text;
  $meldung.hidden = false;
  clearTimeout(meldungTimer);
  meldungTimer = setTimeout(() => { $meldung.hidden = true; }, 1800);
}

function frageNach(d) {
  offenerDialog = d;
  $dialog.innerHTML = `<div class="dialog-grund"><div class="dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-titel">
    <h2 id="dialog-titel">${esc(d.titel)}</h2><p>${esc(d.text)}</p>
    <div class="knoepfe"><button class="knopf ${d.gefahr ? 'gefahr' : 'primaer'}" data-aktion="dialog-ja">${esc(d.ja)}</button><button class="knopf" data-aktion="dialog-nein">${esc(d.nein || 'Abbrechen')}</button></div>
  </div></div>`;
  $dialog.hidden = false;
  $dialog.querySelector('[data-aktion="dialog-nein"]').focus();
}

function schliesseDialog() {
  offenerDialog = null;
  $dialog.hidden = true;
  $dialog.innerHTML = '';
}

function starteBeispiel() {
  const typen = auswahl.typ === 'mix' ? BEREICHE.find(b => b.id === auswahl.bereich).typen.filter(typAktiv) : [auswahl.typ];
  zeige('intro', { beispiel: neueAufgabe(H.wahl(typen), 1, new Set()), bspWahl: null });
}

function starteSitzung() {
  const e = daten.einstellungen;
  const typen = auswahl.typ === 'mix' ? BEREICHE.find(b => b.id === auswahl.bereich).typen.filter(typAktiv) : [auswahl.typ];
  const start = e.niveau === 'auto' ? startNiveau() : Number(e.niveau);
  sitzung = { typen, beutel: [], auto: e.niveau === 'auto', niveau: start, startNiveau: start, anzahl: e.anzahl, liste: [], gesehen: new Set(), serie: 0, aktuell: null };
  naechsteAufgabe();
}

function naechsteAufgabe() {
  if (!sitzung.beutel.length) sitzung.beutel = H.mische(sitzung.typen);
  const typ = sitzung.beutel.pop();
  sitzung.aktuell = { aufgabe: neueAufgabe(typ, sitzung.niveau, sitzung.gesehen), gewaehlt: null, start: Date.now(), ms: 0, richtig: false };
  zeige('aufgabe');
}

function antworte(i) {
  const a = sitzung.aktuell;
  if (a.gewaehlt !== null) return;
  a.ms = Date.now() - a.start;
  a.gewaehlt = i;
  a.richtig = i === a.aufgabe.richtig;
  sitzung.liste.push(a);
  const b = bereichVon(a.aufgabe.typ);
  daten.verlauf.push({ b: b ? b.id : '', t: a.aufgabe.typ, n: a.aufgabe.niveau, r: a.richtig ? 1 : 0, ms: a.ms, d: Date.now(), m: 'u' });
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

const AKTIONEN = {
  gehe(w) {
    zeige(w);
  },
  'ob-start'() {
    entwurf = {};
    zeige('onboarding', { schritt: 1 });
  },
  'ob-zurueck'() {
    if (ansicht.schritt > 1) zeige('onboarding', { schritt: ansicht.schritt - 1 });
    else zeige('willkommen');
  },
  'ob-abschluss'(w) {
    entwurf.abschluss = w;
    zeige('onboarding', { schritt: 2 });
  },
  'ob-termin'() {
    const v = document.getElementById('ob-termin').value;
    if (!v) {
      document.getElementById('ob-fehler').hidden = false;
      return;
    }
    entwurf.termin = v;
    zeige('onboarding', { schritt: 3 });
  },
  'ob-kein-termin'() {
    entwurf.termin = null;
    zeige('onboarding', { schritt: 3 });
  },
  'ob-ziel'(w) {
    entwurf.ziel = w;
    daten.profil = { abschluss: entwurf.abschluss, termin: entwurf.termin || null, ziel: w, seit: Date.now() };
    speichern();
    Speicher.dauerhaft();
    zeige('start');
  },
  bereich(w) {
    auswahl.bereich = w;
    zeige('bereich');
  },
  typ(w) {
    auswahl.typ = w;
    starteBeispiel();
  },
  niveau(w) {
    daten.einstellungen.niveau = w === 'auto' ? 'auto' : w;
    speichern();
    render();
  },
  anzahl(w) {
    daten.einstellungen.anzahl = Number(w);
    speichern();
    render();
  },
  bsp(w) {
    if (ansicht.bspWahl !== null) return;
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
  'termin-weg'() {
    daten.profil.termin = null;
    speichern();
    render();
    melde('Gespeichert');
  },
  'frage-loeschen'() {
    frageNach({
      titel: 'Fortschritt löschen?',
      text: 'Alle beantworteten Aufgaben werden gelöscht. Dein Profil bleibt erhalten.',
      ja: 'Löschen',
      gefahr: true,
      weiter: () => {
        daten.verlauf = [];
        speichern();
        render();
        melde('Fortschritt gelöscht');
      }
    });
  },
  'frage-reset'() {
    frageNach({
      titel: 'Alles zurücksetzen?',
      text: 'Profil, Einstellungen und Fortschritt werden gelöscht. Danach startest du neu.',
      ja: 'Zurücksetzen',
      gefahr: true,
      weiter: () => {
        Speicher.loeschen();
        daten = Speicher.leer();
        sitzung = null;
        zeige('willkommen');
      }
    });
  },
  'dialog-ja'() {
    const d = offenerDialog;
    schliesseDialog();
    if (d && d.weiter) d.weiter();
  },
  'dialog-nein'() {
    schliesseDialog();
  }
};

document.addEventListener('click', e => {
  const el = e.target.closest('[data-aktion]');
  if (!el || el.disabled) return;
  if (offenerDialog && !el.dataset.aktion.startsWith('dialog-')) return;
  const f = AKTIONEN[el.dataset.aktion];
  if (f) f(el.dataset.wert);
});

document.addEventListener('change', e => {
  const feld = e.target.dataset && e.target.dataset.feld;
  if (!feld || !daten.profil) return;
  daten.profil[feld] = e.target.value || null;
  speichern();
  const weg = document.getElementById('e-termin-weg');
  if (feld === 'termin' && weg) weg.hidden = !daten.profil.termin;
  melde('Gespeichert');
});

document.addEventListener('keydown', e => {
  if (offenerDialog) {
    if (e.key === 'Escape') schliesseDialog();
    return;
  }
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  if (e.target && /INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return;
  const taste = e.key.toLowerCase();
  let i = ['1', '2', '3', '4', '5', '6'].indexOf(taste);
  if (i < 0) i = ['a', 'b', 'c', 'd', 'e', 'f'].indexOf(taste);
  if (i < 0) return;
  if (ansicht.name === 'aufgabe' && sitzung.aktuell.gewaehlt === null && i < sitzung.aktuell.aufgabe.antworten.length) antworte(i);
  if (ansicht.name === 'intro' && ansicht.bspWahl === null && i < ansicht.beispiel.antworten.length) AKTIONEN.bsp(String(i));
});

if ('serviceWorker' in navigator && location.protocol === 'https:') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}

render();
