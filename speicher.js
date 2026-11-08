const Speicher = (() => {
  const SCHLUESSEL = 'cat-trainer';
  const MAX = 10000;

  function leer() {
    return { version: 1, profil: null, einstellungen: { niveau: 'auto', anzahl: 10, pruefungLaenge: 'mittel' }, verlauf: [], pruefungen: [] };
  }

  function laden() {
    try {
      const roh = localStorage.getItem(SCHLUESSEL);
      if (!roh) return leer();
      const d = JSON.parse(roh);
      const l = leer();
      return {
        version: 1,
        profil: d.profil || null,
        einstellungen: Object.assign(l.einstellungen, d.einstellungen),
        verlauf: Array.isArray(d.verlauf) ? d.verlauf : [],
        pruefungen: Array.isArray(d.pruefungen) ? d.pruefungen : []
      };
    } catch (e) {
      return leer();
    }
  }

  function speichern(d) {
    try {
      if (d.verlauf.length > MAX) d.verlauf = d.verlauf.slice(-MAX);
      if (d.pruefungen.length > 50) d.pruefungen = d.pruefungen.slice(-50);
      localStorage.setItem(SCHLUESSEL, JSON.stringify(d));
      return true;
    } catch (e) {
      return false;
    }
  }

  function pruefen() {
    try {
      localStorage.setItem(SCHLUESSEL + '-test', '1');
      localStorage.removeItem(SCHLUESSEL + '-test');
      return true;
    } catch (e) {
      return false;
    }
  }

  function loeschen() {
    try {
      localStorage.removeItem(SCHLUESSEL);
    } catch (e) {
      return false;
    }
    return true;
  }

  function dauerhaft() {
    try {
      if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
    } catch (e) {
      return false;
    }
    return true;
  }

  return { leer, laden, speichern, pruefen, loeschen, dauerhaft };
})();
