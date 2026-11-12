const S = {
  svg(breite, hoehe, inhalt, klasse) {
    return `<svg class="fig${klasse ? ' ' + klasse : ''}" viewBox="0 0 ${breite} ${hoehe}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${inhalt}</svg>`;
  },

  r(x) {
    return Math.round(x * 100) / 100;
  },

  punkte(liste) {
    return liste.map(p => S.r(p[0]) + ',' + S.r(p[1])).join(' ');
  },

  polar(cx, cy, radius, winkel) {
    return [cx + radius * Math.cos(winkel), cy + radius * Math.sin(winkel)];
  },

  text(x, y, inhalt, klasse, groesse) {
    return `<text x="${S.r(x)}" y="${S.r(y)}" class="${klasse || ''}" font-size="${groesse || 14}" text-anchor="middle" dominant-baseline="central">${inhalt}</text>`;
  },

  optionen(richtigSvg, falscheSvgs) {
    const gruende = {};
    const falsche = falscheSvgs.slice(0, 3).map(f => {
      if (!Array.isArray(f)) return f;
      if (f[1]) gruende[f[0]] = f[1];
      return f[0];
    });
    const o = H.mische([richtigSvg].concat(falsche));
    return { antworten: o, richtig: o.indexOf(richtigSvg), svg: true, gruende };
  }
};
