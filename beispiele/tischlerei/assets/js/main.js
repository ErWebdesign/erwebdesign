(function () {
  'use strict';

  /* ---------- Mobiles Menü ---------- */
  var kopf = document.querySelector('.kopf');
  var menueKnopf = document.querySelector('.menue-knopf');
  var nav = document.getElementById('menue');

  if (kopf && menueKnopf && nav) {
    var setzeMenue = function (offen) {
      menueKnopf.setAttribute('aria-expanded', String(offen));
      menueKnopf.textContent = offen ? 'Schließen' : 'Menü';
      if (offen) {
        nav.style.setProperty('--nav-top', kopf.getBoundingClientRect().bottom + 'px');
      }
      kopf.classList.toggle('ist-offen', offen);
      document.documentElement.classList.toggle('menue-offen', offen);
    };

    menueKnopf.addEventListener('click', function () {
      setzeMenue(menueKnopf.getAttribute('aria-expanded') !== 'true');
    });

    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setzeMenue(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menueKnopf.getAttribute('aria-expanded') === 'true') {
        setzeMenue(false);
        menueKnopf.focus();
      }
    });

    window.matchMedia('(min-width: 60em)').addEventListener('change', function (m) {
      if (m.matches) setzeMenue(false);
    });
  }

  /* ---------- Google Maps erst nach Klick laden ---------- */
  var kartenKnopf = document.querySelector('[data-karte-laden]');

  if (kartenKnopf) {
    kartenKnopf.addEventListener('click', function () {
      var flaeche = document.getElementById('karte-flaeche');
      var iframe = document.createElement('iframe');
      iframe.src = 'https://www.google.com/maps?q=' +
        encodeURIComponent('Erfundenestraße 44, 12345 Erfundenstadt') + '&output=embed';
      iframe.title = 'Google-Maps-Karte: Tischlerei Kernholz, Erfundenestraße 44, 12345 Erfundenstadt';
      iframe.allowFullscreen = true;
      flaeche.textContent = '';
      flaeche.appendChild(iframe);
      flaeche.classList.add('ist-geladen');
    });
  }

  /* ---------- Anfrageformular (öffnet das E-Mail-Programm) ---------- */
  var formular = document.getElementById('anfrage');

  if (formular) {
    var status = document.getElementById('anfrage-status');
    var emailMuster = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    var pruefeFeld = function (feld) {
      var wert = feld.value.trim();
      var gueltig = feld.type === 'checkbox'
        ? feld.checked
        : wert !== '' && (feld.type !== 'email' || emailMuster.test(wert));
      var fehler = document.getElementById(feld.id + '-fehler');
      feld.setAttribute('aria-invalid', String(!gueltig));
      if (fehler) fehler.hidden = gueltig;
      return gueltig;
    };

    formular.querySelectorAll('[data-pflicht]').forEach(function (feld) {
      feld.addEventListener(feld.type === 'checkbox' ? 'change' : 'blur', function () {
        if (feld.getAttribute('aria-invalid') === 'true') pruefeFeld(feld);
      });
    });

    formular.addEventListener('submit', function (e) {
      e.preventDefault();
      var erstesFehlerfeld = null;

      formular.querySelectorAll('[data-pflicht]').forEach(function (feld) {
        if (!pruefeFeld(feld) && !erstesFehlerfeld) erstesFehlerfeld = feld;
      });

      if (erstesFehlerfeld) {
        status.textContent = 'Bitte prüfen Sie die markierten Felder.';
        erstesFehlerfeld.focus();
        return;
      }

      var daten = new FormData(formular);
      var betreff = 'Anfrage über die Website – ' + daten.get('thema');
      var text = [
        'Name: ' + daten.get('name'),
        'E-Mail: ' + daten.get('email'),
        'Telefon: ' + (daten.get('telefon') || '–'),
        'Thema: ' + daten.get('thema'),
        '',
        daten.get('nachricht')
      ].join('\n');

      window.location.href = 'mailto:info@tischlerei-kernholz.de?subject=' +
        encodeURIComponent(betreff) + '&body=' + encodeURIComponent(text);

      status.textContent = 'Ihr E-Mail-Programm öffnet sich mit der fertigen Nachricht. ' +
        'Falls nicht, schreiben Sie uns direkt an info@tischlerei-kernholz.de.';
    });
  }
})();
