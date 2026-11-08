# CAT-Trainer

Inoffizielle Übungs-App für den Computer-Assistierten Test (CAT) im Karrierecenter und den Computertest im Assessmentcenter in Köln.
Die App hat keine Verbindung zur Bundeswehr. Alle Aufgaben sind selbst erstellt und bilden nur das Format nach.
Ergebnisse und Empfehlungen sind Schätzungen, die echten Grenzwerte sind nicht öffentlich.

Reines HTML, CSS und JavaScript. Kein Framework, kein Build-Schritt. Läuft in Safari auf iPad und iPhone, auch offline.

## Stand: Stufe 3

Übungsmodus für alle sieben Testbereiche und eine Prüfungssimulation. Die Aufgabentypen orientieren sich an öffentlichen Beschreibungen, Erfahrungsberichten und einem Screenshot der echten Testsoftware. Die Aufgaben selbst sind neu erstellt.

| Bereich | Aufgabentypen |
| --- | --- |
| Sprache | Rechtschreibung, Wortanalogien, Synonyme und Oberbegriffe, Englisch, Wortflüssigkeit |
| Mathematik | Grundrechenarten, Prozentrechnung, Dreisatz, Textaufgaben, Rechenzeichen einsetzen |
| Logisches Denken | Zahlenreihen, Figurenreihen, Matrizen, Schlussfolgerungen |
| Räumliches Vorstellungsvermögen | Würfel, Faltvorlagen, gedrehte Figuren, Figuren zusammensetzen |
| Technisches Verständnis | Zahnräder, Hebel, Flaschenzüge, einfache Physik |
| Konzentration, Merkfähigkeit und Reaktion | Zeichen zählen, Symbole vergleichen, Merkfähigkeit (Ausweise), Reaktionstest |
| Allgemeinwissen | Allgemeinbildung, Grundwissen Bundeswehr |

### Übungsmodus
- Meist 4 Antwortmöglichkeiten, bei Schlussfolgerungen, Wortflüssigkeit und Figuren zusammensetzen 5 (mit „Keine … ist richtig“)
- Jeder Aufgabentyp startet mit kurzer Erklärung und Beispielaufgabe, der Reaktionstest mit Probelauf
- Nach jeder Antwort: Lösung und Lösungsweg
- Schwierigkeit 1 bis 5 oder „Auto“ (Start nach Schulabschluss, zweimal richtig → schwerer, falsch → leichter)
- Auswertung mit Fehlern zum Nachlesen und „Fehler nochmal üben“
- Auf dem iPad im Querformat: Frage und Bild links, Antworten rechts

### Prüfungssimulation
- Die Art richtet sich nach dem Ziel: CAT wie im Karrierecenter (Mannschaften, Feldwebel, KSK als Feldwebel) oder Computertest wie in Köln (Offizier, KSK als Offizier)
- Länge wählbar: Kurz (ca. 20 Min.), Mittel (ca. 45 Min.), Lang (ca. 90 Min.)
- Einweisung, dann alle sieben Bereiche nacheinander, jeder mit Anleitung und zwei Beispielen
- Zeitlimit pro Aufgabe (geschätzt, Köln mit mehr Zeit), Antwort wählen und mit „Weiter“ bestätigen
- Schwierigkeit passt sich an: richtig → schwerer, falsch → leichter; Köln startet eine Stufe höher
- Kein Zurück, Lösungen erst am Ende, Reaktionstest im Bereich Konzentration
- Ergebnis: Punkte, Niveau pro Bereich, ehrliche Einschätzung pro Laufbahn, die schwächsten Bereiche mit Tipps und „Jetzt üben“, alle Aufgaben mit Lösungsweg
- Zeitlimits und Grenzwerte sind Schätzungen der App, die echten Werte sind nicht öffentlich

Geplant: Stufe 4 (Statistik und Lernplan).

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
| `gen-logik.js` | Generator für Schlussfolgerungen |
| `gen-sprache.js` | Generator für Wortflüssigkeit |
| `gen-figuren.js` | Generatoren für Figurenreihen und Matrizen |
| `gen-raum.js` | Generatoren für Würfel, Faltvorlagen, gedrehte Figuren und Figuren zusammensetzen |
| `gen-technik.js` | Generatoren für Zahnräder, Hebel, Flaschenzüge und Physik |
| `gen-konzentration.js` | Generatoren für Zeichen zählen, Symbole vergleichen, Merkfähigkeit und den Reaktionstest |
| `aufgaben.js` | Bereiche, Aufgabentypen mit Erklärungen, alle festen Aufgaben und die Wortliste |
| `speicher.js` | Speichern im localStorage |
| `kern.js` | Grundlagen: Zustand, Anzeige, Dialoge, gemeinsame Hilfen |
| `uebung.js` | Übungsmodus: Aufgaben anzeigen, auswerten, Fehler wiederholen |
| `reaktion.js` | Reaktionstest |
| `pruefung.js` | Prüfungssimulation, Zeitlimits, Ergebnis und Laufbahn-Einschätzung |
| `app.js` | Startseite, Onboarding, Bereiche, Einstellungen und Bedienung |
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

Für Wortflüssigkeit kannst du am Ende von `aufgaben.js` weitere Wörter in die `WORTLISTE` schreiben (Großbuchstaben, ein Hauptwort pro Eintrag).

Feste Aufgaben werden mit den automatisch erzeugten Aufgaben gemischt. Typen ohne Generator (Sprache, Englisch, Allgemeinwissen) bestehen nur aus festen Aufgaben, je mehr dort stehen, desto weniger wiederholt sich.

## Nach Änderungen

In `sw.js` die Versionsnummer in `VERSION` erhöhen (z. B. `cat-trainer-6`), damit die Offline-Version aktualisiert wird.
