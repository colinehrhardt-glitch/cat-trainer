Object.assign(ANSICHTEN, {
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
    const h = aufgabenVerlauf().filter(x => x.d >= heute.getTime());
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
        ${pruefungsKachel()}
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
      const stat = statZeile(aufgabenVerlauf().filter(x => x.b === b.id));
      return `<button class="zeile" data-aktion="bereich" data-wert="${b.id}"><span class="zeile-inhalt"><span class="zeile-titel">${esc(b.name)}</span><span class="zeile-text">${esc(b.info)}</span>${stat}</span>${SYMBOLE.pfeil}</button>`;
    }).join('');
    return kopf('Üben', ['gehe', 'start']) + `<main class="seite"><p class="text-2 einstieg">Wähle einen Bereich.</p><div class="liste">${zeilen}</div></main>`;
  },

  bereich() {
    const b = BEREICHE.find(x => x.id === auswahl.bereich);
    const aktive = b.typen.filter(mischbar);
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
      const stat = statZeile(daten.verlauf.filter(x => x.t === t), t === 'reaktion');
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

  einstellungen() {
    const p = daten.profil;
    const opt = (liste, wert) => liste.map(x => `<option value="${x.id}"${x.id === wert ? ' selected' : ''}>${esc(x.name)}</option>`).join('');
    const n = aufgabenVerlauf().length;
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
          <button class="knopf gefahr" data-aktion="frage-loeschen"${daten.verlauf.length ? '' : ' disabled'}>Fortschritt löschen</button>
          <button class="knopf leise" data-aktion="frage-reset">Alles zurücksetzen</button>
        </div>
      </section>
      <section class="gruppe">
        <h2 class="label">Über diese App</h2>
        <p>Inoffizielle Übungs-App. Sie ist nicht von der Bundeswehr und hat keine Verbindung zu ihr.</p>
        <p>Alle Aufgaben sind selbst erstellt und bilden nur das Format des CAT nach.</p>
        <p>Ergebnisse und Empfehlungen sind Schätzungen. Die echten Grenzwerte sind nicht öffentlich.</p>
        <p class="klein">Version 2 · Stufe 2</p>
      </section>
    </main>`;
  }
});

function pruefungsKachel() {
  const letzte = daten.pruefungen[daten.pruefungen.length - 1];
  const art = PRUEFUNG_ARTEN[pruefungsArt()].name;
  const zusatz = letzte ? `Letzte Prüfung: ${letzte.punkte} von 100 Punkten (${new Date(letzte.d).toLocaleDateString('de-DE', { day: 'numeric', month: 'numeric', year: 'numeric' })})` : 'Alle Bereiche mit Zeitlimit und anpassender Schwierigkeit.';
  return `<button class="kachel" data-aktion="gehe" data-wert="pruefung-start"><span class="kachel-titel">Prüfung simulieren</span><span class="kachel-text">${esc(art)}. ${esc(zusatz)}</span></button>`;
}

Object.assign(ANSICHTEN, {
  'ksk-wahl'() {
    return `<main class="seite willkommen">
      <div class="marke-gross">CAT-Trainer</div>
      <h1>Wie willst du zum KSK?</h1>
      <p class="text-2">Als Feldwebel machst du den CAT im Karrierecenter. Als Offizier machst du den Computertest im Assessmentcenter in Köln. Danach richtet sich deine Prüfungssimulation.</p>
      <div class="liste">
        <button class="wahl" data-aktion="ksk-wahl" data-wert="ksk-feldwebel">KSK als Feldwebel</button>
        <button class="wahl" data-aktion="ksk-wahl" data-wert="ksk-offizier">KSK als Offizier</button>
      </div>
      <p class="klein">Du kannst das später in den Einstellungen ändern.</p>
    </main>`;
  }
});

Object.assign(AKTIONEN, {
  'ksk-wahl'(w) {
    daten.profil.ziel = w;
    speichern();
    zeige('start');
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
  }
});

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

let verstecktSeit = 0;

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    verstecktSeit = Date.now();
    if (rk && ansicht.name === 'reaktion' && ['warten', 'signal', 'rueck'].includes(rk.phase)) {
      clearTimeout(rk.timer);
      rk.phase = 'pause';
      zeichneReaktion();
    }
    return;
  }
  const weg = verstecktSeit ? Date.now() - verstecktSeit : 0;
  verstecktSeit = 0;
  BEI_RUECKKEHR.forEach(f => f(weg));
});

document.addEventListener('pointerdown', e => {
  const el = e.target.closest('[data-reaktion]');
  if (!el) return;
  e.preventDefault();
  rkTipp(Number(el.dataset.reaktion));
});

document.addEventListener('keydown', e => {
  if (ansicht.name === 'reaktion' && !offenerDialog) {
    const k = e.key.toLowerCase();
    if (k === 'arrowleft' || k === 'f') { e.preventDefault(); rkTipp(-1); return; }
    if (k === 'arrowright' || k === 'j') { e.preventDefault(); rkTipp(1); return; }
    if ((k === ' ' || k === 'enter') && rk && rk.phase === 'bereit') { e.preventDefault(); rkNaechstes(); return; }
  }
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
  if (ansicht.name === 'intro' && ansicht.beispiel && ansicht.bspWahl === null && i < ansicht.beispiel.antworten.length) AKTIONEN.bsp(String(i));
});

if ('serviceWorker' in navigator && location.protocol === 'https:') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}

if (daten.profil && daten.profil.ziel === 'ksk') ansicht = { name: 'ksk-wahl' };

render();
