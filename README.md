# CAT-Trainer

Inoffizielle Übungs-App für den Computer-Assistierten Test (CAT) im Karrierecenter.
Die App hat keine Verbindung zur Bundeswehr. Alle Aufgaben sind selbst erstellt und bilden nur das Format nach.
Ergebnisse und Empfehlungen sind Schätzungen, die echten Grenzwerte sind nicht öffentlich.

Reines HTML, CSS und JavaScript. Kein Framework, kein Build-Schritt. Läuft in Safari auf iPad und iPhone, auch offline.

## Stand: Stufe 1

- Startseite mit Ziel, Testtermin (Countdown) und heutigem Fortschritt
- Onboarding: Schulabschluss, Testtermin, Ziel
- Übungsmodus Mathematik: Grundrechenarten, Prozentrechnung, Dreisatz, Textaufgaben, Rechenzeichen einsetzen
- Übungsmodus Logisches Denken: Zahlenreihen
- Jeder Aufgabentyp startet mit kurzer Erklärung und Beispielaufgabe
- Nach jeder Antwort: Lösung und Lösungsweg
- Schwierigkeit 1 bis 5 oder „Auto“ (Start nach Schulabschluss, zweimal richtig → schwerer, falsch → leichter)
- Auswertung nach jeder Runde mit Fehlern zum Nachlesen
- Fortschritt im localStorage, Einstellungen zum Ändern des Profils und zum Löschen

Geplant: Stufe 2 (übrige Bereiche), Stufe 3 (Prüfungssimulation), Stufe 4 (Statistik und Lernplan).

## Auf dem iPad testen

1. Auf GitHub im Repo **cat-trainer**: *Settings → Pages → Build and deployment*
2. *Source*: „Deploy from a branch“, Branch auswählen (z. B. `main`), Ordner `/ (root)`, *Save*
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
| `aufgaben.js` | Bereiche, Aufgabentypen, Generatoren und feste Aufgaben |
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

- `typ`: Name des Aufgabentyps, z. B. `textaufgaben` oder `zahlenreihen` (siehe `TYPEN` in `aufgaben.js`)
- `niveau`: 1 (leicht) bis 5 (schwer)
- `antworten`: **Die erste Antwort ist immer die richtige.** Die App mischt die Reihenfolge selbst.
- `erklaerung`: ein oder mehrere kurze Schritte des Lösungswegs
- Komma nach der schließenden Klammer `}` nicht vergessen

Feste Aufgaben werden mit den automatisch erzeugten Aufgaben gemischt.

## Nach Änderungen

In `sw.js` die Versionsnummer in `VERSION` erhöhen (z. B. `cat-trainer-2`), damit die Offline-Version aktualisiert wird.
