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
let rk = null;

function esc(t) {
  return String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

function typName(t) {
  return t === 'mix' ? 'Alles gemischt' : TYPEN[t] ? TYPEN[t].name : t;
}

function typAktiv(t) {
  const x = TYPEN[t];
  return !!x && (x.art === 'reaktion' || typeof x.erzeuge === 'function' || FESTE_AUFGABEN.some(f => f.typ === t));
}

function mischbar(t) {
  return typAktiv(t) && TYPEN[t].art !== 'reaktion';
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

function aufgabenVerlauf() {
  return daten.verlauf.filter(x => x.t !== 'reaktion');
}

function statZeile(v, reaktion) {
  if (!v.length) return '';
  if (reaktion) {
    const ok = v.filter(x => x.r && x.ms > 0);
    const schnitt = ok.length ? Math.round(ok.reduce((s, x) => s + x.ms, 0) / ok.length) : 0;
    return `<span class="zeile-stat">${zahlText(v.length)} Signale · ${quote(v)} %${ok.length ? ` · Ø ${schnitt} ms` : ''}</span>`;
  }
  return `<span class="zeile-stat">${zahlText(v.length)} ${v.length === 1 ? 'Aufgabe' : 'Aufgaben'} · ${quote(v)} %</span>`;
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

const ANSICHTEN = {};
const AKTIONEN = {};

function render() {
  clearInterval(uhr);
  uhr = null;
  $app.classList.toggle('breit', ansicht.name === 'aufgabe' || ansicht.name === 'intro');
  $app.innerHTML = ANSICHTEN[ansicht.name]();
  if (ansicht.name === 'aufgabe' && sitzung.aktuell.gewaehlt === null) {
    uhr = setInterval(() => {
      const el = document.getElementById('uhr');
      if (el && sitzung && sitzung.aktuell.gewaehlt === null) el.textContent = zeitText(Date.now() - sitzung.aktuell.start);
    }, 1000);
  }
}

function zeige(name, extra) {
  if (rk && name !== 'reaktion') clearTimeout(rk.timer);
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

Object.assign(AKTIONEN, {
  gehe(w) {
    zeige(w);
  },

  'dialog-ja'() {
    const d = offenerDialog;
    schliesseDialog();
    if (d && d.weiter) d.weiter();
  },

  'dialog-nein'() {
    const d = offenerDialog;
    schliesseDialog();
    if (d && d.zurueck) d.zurueck();
  }
});
