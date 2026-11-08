const WF_KEINE = 'Keine der Antworten ist richtig.';

function wortfluessigkeit(n) {
  const passend = WORTLISTE.filter(w => (n === 5 ? w.length >= 9 : w.length === n + 4));
  const wort = H.wahl(passend);
  const buchstaben = wort.split('');
  let salat;
  do { salat = H.mische(buchstaben); } while (salat.join('') === wort || salat[0] === wort[0]);
  const erster = wort[0];
  const keine = Math.random() < 0.2;
  const andere = H.mische([...new Set(buchstaben.filter(b => b !== erster))]);
  const reserve = H.mische('ABDEFGHKLMNRSTU'.split('').filter(b => b !== erster && !andere.includes(b)));
  const auswahl = andere.concat(reserve).slice(0, keine ? 4 : 3);
  const optionen = (keine ? auswahl : auswahl.concat([erster])).sort((a, b) => a.localeCompare(b, 'de'));
  return {
    frage: 'Die Buchstaben ergeben ein Wort. Mit welchem Buchstaben beginnt es?',
    term: salat.join(' '),
    antworten: optionen.concat([WF_KEINE]),
    richtig: keine ? 4 : optionen.indexOf(erster),
    reihenfolgeFest: true,
    erklaerung: [`Das gesuchte Wort heißt ${wort}.`, keine ? `Es beginnt mit ${erster}. Dieser Buchstabe steht nicht bei den Antworten.` : `Es beginnt mit ${erster}.`, 'Tipp: Suche zuerst nach typischen Silben wie SCH, -ER oder -EN.']
  };
}
