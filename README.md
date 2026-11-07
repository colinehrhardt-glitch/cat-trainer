# CAT-Trainer

Inoffizielle Übungs-App für den Computer-Assistierten Test (CAT) im Karrierecenter.
Die App hat keine Verbindung zur Bundeswehr. Alle Aufgaben sind selbst erstellt und bilden nur das Format nach.
Ergebnisse und Empfehlungen sind Schätzungen, die echten Grenzwerte sind nicht öffentlich.

Reines HTML, CSS und JavaScript. Kein Framework, kein Build-Schritt. Läuft in Safari auf iPad und iPhone, auch offline.

## Stand: Stufe 2

Übungsmodus für alle sieben Testbereiche. Die Aufgabentypen orientieren sich an öffentlichen Beschreibungen und Erfahrungsberichten zum CAT, die Aufgaben selbst sind neu erstellt.

| Bereich | Aufgabentypen |
| --- | --- |
| Sprache | Rechtschreibung, Wortanalogien, Synonyme und Oberbegriffe, Englisch |
| Mathematik | Grundrechenarten, Prozentrechnung, Dreisatz, Textaufgaben, Rechenzeichen einsetzen |
| Logisches Denken | Zahlenreihen, Figurenreihen, Matrizen |
| Räumliches Vorstellungsvermögen | Würfel, Faltvorlagen, gedrehte Figuren |
| Technisches Verständnis | Zahnräder, Hebel, Flaschenzüge, einfache Physik |
| Konzentration und Reaktion | Zeichen zählen, Symbole vergleichen, Reaktionstest |
| Allgemeinwissen | Allgemeinbildung, Grundwissen Bundeswehr |

- Immer 4 Antwortmöglichkeiten, genau eine ist richtig
- Jeder Aufgabentyp startet mit kurzer Erklärung und Beispielaufgabe, der Reaktionstest mit Probelauf
- Nach jeder Antwort: Lösung und Lösungsweg, bei Zählaufgaben mit markierter Lösung
- Schwierigkeit 1 bis 5 oder „Auto“ (Start nach Schulabschluss, zweimal richtig → schwerer, falsch → leichter)
- Figuren, Matrizen, Würfel, Zahnräder, Hebel und Flaschenzüge werden als SVG im Code gezeichnet
- Auswertung nach jeder Runde mit Fehlern zum Nachlesen
- Startseite, Onboarding und Speichern wie in Stufe 1

Geplant: Stufe 3 (Prüfungssimulation mit Zeitlimit und Laufbahn-Empfehlung), Stufe 4 (Statistik und Lernplan).

## Auf dem iPad testen

1. Auf GitHub im Repo **cat-trainer**: *Settings → Pages → Build and deployment*
2. *Source*: „Deploy from a branch“, Branch `claude/clever-feynman-o6d36h`, Ordner `/ (root)`, *Save*
3. Nach 1–2 Minuten öffnen: `https://colinehrhardt-glitch.github.io/cat-trainer/`
4. In Safari: *Teilen → Zum Home-Bildschirm*. Dann startet die App wie eine richtige App und funktioniert offline.

Tipp: Nutze die App vom Home-Bildschirm aus. Safari löscht gespeicherte Daten von Webseiten sonst nach einigen Wochen ohne Besuch.
Safari und die Home-Bildschirm-App haben getrennte Speicher.

## Dateien

| Datei | Inhalt |
| --- | --- |
| `index.html` | Grundgerüst der Seite |
| `style.css` | Design (dunkel, große Buttons) |
| `hilfen.js` | Hilfsfunktionen: Zufall, Zahlenformat, Antwortmöglichkeiten |
| `zeichnen.js` | Hilfsfunktionen für SVG-Zeichnungen |
| `gen-mathe.js` | Generatoren für Mathe und Zahlenreihen |
| `gen-figuren.js` | Generatoren für Figurenreihen und Matrizen |
| `gen-raum.js` | Generatoren für Würfel, Faltvorlagen und gedrehte Figuren |
| `gen-technik.js` | Generatoren für Zahnräder, Hebel, Flaschenzüge und Physik |
| `gen-konzentration.js` | Generatoren für Zeichen zählen, Symbole vergleichen und den Reaktionstest |
| `aufgaben.js` | Bereiche, Aufgabentypen mit Erklärungen und alle festen Aufgaben |
| `speicher.js` | Speichern im localStorage |
| `app.js` | Bildschirme und Ablauf |
| `sw.js` | Offline-Speicher (Service Worker) |
| `manifest.webmanifest`, `icons/` | Für „Zum Home-Bildschirm“ |

## Eigene Aufgaben ergänzen

In `aufgaben.js` gibt es die Liste `FESTE_AUFGABEN`. Dort kannst du neue Aufgaben einfügen:

```js
{
  typ: 'textaufgaben',
  niveau: 2,
  frage: 'Ein Paket wiegt 3 kg. Wie viel wiegen 7 Pakete?',
  antworten: ['21 kg', '24 kg', '18 kg', '10 kg'],
  erklaerung: ['7 × 3 kg = 21 kg']
},
```

- `typ`: Name des Aufgabentyps, z. B. `textaufgaben`, `rechtschreibung` oder `bundeswehr` (siehe `TYPEN` in `aufgaben.js`)
- `niveau`: 1 (leicht) bis 5 (schwer)
- `antworten`: **Die erste Antwort ist immer die richtige.** Die App mischt die Reihenfolge selbst.
- `erklaerung`: ein oder mehrere kurze Schritte des Lösungswegs
- `frage` darf fehlen, wenn der Typ eine Standardfrage hat (Rechtschreibung, Analogien, Englisch)
- Für Analogien gibt es zusätzlich `term`, z. B. `term: 'Hund : bellen = Katze : ?'`
- Für Englisch gibt es zusätzlich `text` mit der Lücke `___`, z. B. `text: 'She ___ to school.'`
- Komma nach der schließenden Klammer `}` nicht vergessen

Feste Aufgaben werden mit den automatisch erzeugten Aufgaben gemischt. Typen ohne Generator (Sprache, Englisch, Allgemeinwissen) bestehen nur aus festen Aufgaben, je mehr dort stehen, desto weniger wiederholt sich.

## Nach Änderungen

In `sw.js` die Versionsnummer in `VERSION` erhöhen (z. B. `cat-trainer-3`), damit die Offline-Version aktualisiert wird.
