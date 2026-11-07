# Regeln für die Arbeit in diesem Repo

## Zusammenarbeit
- Ich bin Programmier-Anfänger und arbeite nur auf dem iPad. Erklärungen kurz und einfach halten.
- Wenn dir Informationen fehlen oder etwas unklar ist, frag mich, bevor du baust. Rate nicht.
- Stell Fragen als Auswahl mit kurzen Antwortmöglichkeiten und markiere deine Empfehlung.
- Bei größeren Änderungen erst einen kurzen Plan zeigen und auf mein OK warten.
- Immer nur eine Stufe bauen. Danach kurz erklären, was gebaut wurde, eine Test-Checkliste fürs iPad geben und auf mein OK warten.

## CAT-Trainer
- Übungs-App für den CAT (Computer-Assistierter Test) der Bundeswehr: gleiche Testbereiche und Aufgabentypen, Multiple Choice, Zeitdruck, anpassende Schwierigkeit.
- Nur eigene Aufgaben im gleichen Format. Keine Original-Aufgaben, nichts von kommerziellen Anbietern kopieren.
- Kein Bundeswehr-Logo, kein offizielles Design, kein Hinweis, dass die App offiziell ist.
- Ergebnisse und Empfehlungen sind Schätzungen. Das muss in der App klar stehen.

## Technik
- Reines HTML, CSS und JavaScript, kein Framework, kein Build-Schritt.
- Läuft in Safari auf dem iPad, auch offline.
- Fortschritt im localStorage, nur über `speicher.js`.
- Aufgaben in `aufgaben.js`. Wo möglich per Generator erzeugen.
- Figuren, Matrizen und Würfel als SVG im Code zeichnen, keine Bilddateien.
- Keine Kommentare im Code.
- Design: mobile first, fürs iPad, große Buttons, dunkel, ruhig, gut lesbar. Timer sichtbar, aber nicht hektisch.
- Bei Änderungen an App-Dateien `VERSION` in `sw.js` erhöhen.

## Stufen
1. Grundgerüst, Startseite, Onboarding, Speichern, Übungsmodus Mathe und Zahlenreihen (fertig)
2. Alle übrigen Testbereiche im Übungsmodus
3. Prüfungssimulation (anpassend, Zeitlimit) mit Ergebnis und Laufbahn-Empfehlung
4. Statistik und Lernplan

## Ablauf
- Commit-Nachrichten auf Deutsch.
- `README.md` auf Deutsch aktuell halten.
