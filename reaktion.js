function reaktionsIntro() {
  const beispiele = [
    [{ farbe: 'blau', richtung: 1 }, 'Rechts tippen'],
    [{ farbe: 'orange', richtung: 1 }, 'Links tippen'],
    [{ farbe: 'grau', richtung: -1 }, 'Nicht tippen']
  ].map(([s, t]) => `<div class="rk-regel">${reaktionsPfeil(s, true)}<span>${t}</span></div>`).join('');
  const e = daten.einstellungen;
  const n = e.niveau === 'auto' ? startNiveau() : Number(e.niveau);
  return kopf('Reaktionstest', ['gehe', 'bereich']) + `<main class="seite">
    <section class="einleitung"><h1>Reaktionstest</h1>${TYPEN.reaktion.erklaerung.map(p => `<p>${esc(p)}</p>`).join('')}</section>
    <section class="beispiel"><div class="label">So funktioniert es</div><div class="rk-regeln">${beispiele}</div></section>
    <p class="klein">Start auf Niveau ${n}. Je höher das Niveau, desto weniger Zeit hast du.</p>
    <div class="knoepfe">
      <button class="knopf primaer" data-aktion="rk-probe">Probelauf mit 6 Signalen</button>
      <button class="knopf" data-aktion="los">Test starten (20 Signale)</button>
    </div>
  </main>`;
}

function starteReaktion(probe, pruefung) {
  const e = daten.einstellungen;
  const n = pruefung ? pruefung.niveau : e.niveau === 'auto' ? startNiveau() : Number(e.niveau);
  if (rk) clearTimeout(rk.timer);
  rk = { probe, niveau: n, startNiveau: n, auto: !!pruefung || (!probe && e.niveau === 'auto'), anzahl: pruefung ? pruefung.anzahl : probe ? 6 : 20, ergebnisse: [], phase: 'bereit', signal: null, t0: 0, timer: null, letzte: null, pruefung: !!pruefung, fertig: pruefung ? pruefung.fertig : null, titel: pruefung ? pruefung.titel : '' };
  zeige('reaktion');
}

function reaktionsFeld() {
  if (rk.phase === 'bereit') return '<div class="rk-mitte"><p>Halte deine Finger über „Links“ und „Rechts“.</p><button class="knopf primaer rk-startknopf" data-aktion="rk-start">Start</button></div>';
  if (rk.phase === 'pause') return '<div class="rk-mitte"><p>Pausiert.</p><button class="knopf primaer rk-startknopf" data-aktion="rk-weiter">Weiter</button></div>';
  if (rk.phase === 'warten') return '<div class="rk-mitte rk-kreuz">+</div>';
  if (rk.phase === 'signal') return `<div class="rk-mitte rk-seite${rk.signal.seite}">${reaktionsPfeil(rk.signal)}</div>`;
  const e = rk.letzte;
  const texte = { ok: `${e.ms} ms`, falsch: 'Falsche Seite', frueh: 'Zu früh', langsam: 'Zu langsam', 'nogo-ok': 'Richtig, nicht getippt', 'nogo-falsch': 'Grau: nicht tippen' };
  return `<div class="rk-mitte"><div class="rk-meldung ${e.r ? 'gut' : 'schlecht'}">${texte[e.art]}</div></div>`;
}

function zeichneReaktion() {
  const f = document.getElementById('rk-feld');
  const t = document.getElementById('rk-titel');
  const n = document.querySelector('.niveau-kopf');
  if (f) f.innerHTML = reaktionsFeld();
  if (t) t.textContent = reaktionsTitel();
  if (n) n.outerHTML = niveauHtml(rk.niveau).replace('class="niveau"', 'class="niveau niveau-kopf"');
}

function reaktionsTitel() {
  return `${rk.titel}${rk.probe ? 'Probelauf · ' : ''}Signal ${Math.min(rk.ergebnisse.length + 1, rk.anzahl)} von ${rk.anzahl}`;
}

function rkNaechstes() {
  clearTimeout(rk.timer);
  if (rk.ergebnisse.length >= rk.anzahl) {
    rk.phase = 'fertig';
    if (rk.pruefung) {
      const fertig = rk.fertig;
      const ergebnisse = rk.ergebnisse;
      rk = null;
      fertig(ergebnisse);
      return;
    }
    render();
    return;
  }
  const c = REAKTION[rk.niveau];
  rk.phase = 'warten';
  rk.signal = null;
  zeichneReaktion();
  rk.timer = setTimeout(() => {
    rk.signal = reaktionsSignal(rk.niveau);
    rk.phase = 'signal';
    rk.t0 = performance.now();
    zeichneReaktion();
    rk.timer = setTimeout(rkZeitAus, c.zeit);
  }, H.zufall(c.pause[0], c.pause[1]));
}

function rkTipp(seite) {
  if (!rk || ansicht.name !== 'reaktion' || offenerDialog) return;
  if (rk.phase === 'warten') {
    clearTimeout(rk.timer);
    rkErgebnis({ art: 'frueh', r: 0, ms: 0 });
    return;
  }
  if (rk.phase !== 'signal') return;
  clearTimeout(rk.timer);
  const ms = Math.round(performance.now() - rk.t0);
  if (rk.signal.ziel === 0) rkErgebnis({ art: 'nogo-falsch', r: 0, ms });
  else rkErgebnis({ art: seite === rk.signal.ziel ? 'ok' : 'falsch', r: seite === rk.signal.ziel ? 1 : 0, ms });
}

function rkZeitAus() {
  if (rk.signal.ziel === 0) rkErgebnis({ art: 'nogo-ok', r: 1, ms: 0 });
  else rkErgebnis({ art: 'langsam', r: 0, ms: REAKTION[rk.niveau].zeit });
}

function rkErgebnis(e) {
  e.niveau = rk.niveau;
  rk.ergebnisse.push(e);
  rk.letzte = e;
  if (!rk.probe) {
    daten.verlauf.push({ b: 'konzentration', t: 'reaktion', n: rk.niveau, r: e.r, ms: e.ms, d: Date.now(), m: rk.pruefung ? 'p' : 'u' });
    speichern();
  }
  if (rk.auto && rk.ergebnisse.length % 5 === 0) {
    const richtig = rk.ergebnisse.slice(-5).filter(x => x.r).length;
    if (richtig >= 4) rk.niveau = Math.min(5, rk.niveau + 1);
    if (richtig <= 2) rk.niveau = Math.max(1, rk.niveau - 1);
  }
  rk.phase = 'rueck';
  zeichneReaktion();
  rk.timer = setTimeout(rkNaechstes, 750);
}

function reaktionsAuswertung() {
  const l = rk.ergebnisse;
  const treffer = l.filter(x => x.art === 'ok');
  const schnitt = treffer.length ? Math.round(treffer.reduce((s, x) => s + x.ms, 0) / treffer.length) : 0;
  const zaehle = art => l.filter(x => x.art === art).length;
  const werte = [
    ['Richtig', `${l.filter(x => x.r).length} von ${l.length}`],
    ['Ø Reaktionszeit', treffer.length ? `${schnitt} ms` : '–'],
    ['Falsch getippt', zaehle('falsch') + zaehle('nogo-falsch')],
    ['Zu früh', zaehle('frueh')],
    ['Zu langsam', zaehle('langsam')],
    ['Niveau', rk.auto ? `${rk.startNiveau} → ${rk.niveau}` : rk.niveau]
  ].map(([a, b]) => `<div class="wert"><span>${a}</span><span>${b}</span></div>`).join('');
  const knoepfe = rk.probe
    ? '<button class="knopf primaer" data-aktion="los">Test starten (20 Signale)</button><button class="knopf" data-aktion="rk-probe">Noch ein Probelauf</button>'
    : '<button class="knopf primaer" data-aktion="los">Noch eine Runde</button><button class="knopf" data-aktion="gehe" data-wert="bereich">Anderen Typ wählen</button><button class="knopf leise" data-aktion="gehe" data-wert="start">Zur Startseite</button>';
  return kopf(rk.probe ? 'Probelauf beendet' : 'Auswertung') + `<main class="seite">
    <section class="ergebnis"><div class="ergebnis-zahl">${treffer.length ? schnitt + ' ms' : '–'}</div><div class="text-2">durchschnittliche Reaktionszeit</div></section>
    <section class="werte">${werte}</section>
    <div class="knoepfe">${knoepfe}</div>
  </main>`;
}

Object.assign(ANSICHTEN, {
  reaktion() {
    if (rk.phase === 'fertig') return reaktionsAuswertung();
    return `<header class="kopf"><button class="symbol" data-aktion="rk-abbrechen" aria-label="Test beenden">${SYMBOLE.schliessen}</button><div class="kopf-titel" id="rk-titel">${reaktionsTitel()}</div>${niveauHtml(rk.niveau).replace('class="niveau"', 'class="niveau niveau-kopf"')}</header>
      <main class="seite rk-main">
        <div class="rk-feld" id="rk-feld">${reaktionsFeld()}</div>
        <div class="rk-tasten"><button class="rk-taste" data-reaktion="-1">Links</button><button class="rk-taste" data-reaktion="1">Rechts</button></div>
      </main>`;
  }
});

Object.assign(AKTIONEN, {
  'rk-probe'() {
    starteReaktion(true);
  },

  'rk-start'() {
    if (rk && rk.phase === 'bereit') rkNaechstes();
  },

  'rk-weiter'() {
    if (rk && rk.phase === 'pause') rkNaechstes();
  },

  'rk-abbrechen'() {
    if (rk.pruefung) {
      AKTIONEN['pr-abbrechen']();
      return;
    }
    if (rk.probe || !rk.ergebnisse.length) {
      clearTimeout(rk.timer);
      rk = null;
      zeige('intro', { bspWahl: null });
      return;
    }
    clearTimeout(rk.timer);
    rk.phase = 'pause';
    zeichneReaktion();
    frageNach({
      titel: 'Test beenden?',
      text: 'Deine bisherigen Reaktionen bleiben gespeichert.',
      ja: 'Beenden',
      nein: 'Weitermachen',
      weiter: () => { rk.phase = 'fertig'; render(); },
      zurueck: () => rkNaechstes()
    });
  }
});
