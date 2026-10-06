/* Er-Webdesign — drei Dinge: Jahr, Mobilmenü, ein Scroll-Reveal. */

(function () {
  'use strict';

  /* ---- Jahr in der Fußzeile ---- */
  var jetzt = String(new Date().getFullYear());
  document.querySelectorAll('.jahr').forEach(function (el) {
    el.textContent = jetzt;
  });

  /* ---- Mobilmenü ---- */
  var burger = document.querySelector('.burger');
  var menu = document.getElementById('mobilmenu');

  if (burger && menu) {
    var toggle = function (open) {
      burger.setAttribute('aria-expanded', String(open));
      menu.hidden = !open;
      document.body.classList.toggle('menu-offen', open);
    };

    burger.addEventListener('click', function () {
      toggle(burger.getAttribute('aria-expanded') !== 'true');
    });

    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) toggle(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') {
        toggle(false);
        burger.focus();
      }
    });

    /* Beim Wechsel auf Desktop-Breite wieder schließen */
    window.matchMedia('(min-width: 960px)').addEventListener('change', function (e) {
      if (e.matches) toggle(false);
    });
  }

  /* ---- Handy mit Gründungsangebot ---- */
  if (/[?&]aufnahme(=|&|$)/.test(location.search)) {
    document.documentElement.classList.add('aufnahme');
  }

  var angebot = document.querySelector('[data-angebot]');

  if (angebot) {
    var buehne = angebot.querySelector('.livedemo__buehne');
    var handy = angebot.querySelector('.livehandy');
    var screen = angebot.querySelector('.handyscreen');
    var ruhig = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

var aufnahme = document.documentElement.classList.contains('aufnahme');
    var klein = window.matchMedia('(max-width: 959px)');
    var spur = angebot.querySelector('.livedemo__spur');
    var gekoppelt = false;

    /* Handy so groß wie möglich in die Bühne einpassen */
    var skalieren = function () {
      var b = buehne.getBoundingClientRect();
      var fh = gekoppelt ? 0.92 : 0.86;
      var fb = gekoppelt ? 0.84 : 0.72;
      var s = Math.min((b.height * fh - 16) / 845, (b.width * fb - 16) / 390);
      handy.style.setProperty('--s', Math.max(s, 0.2).toFixed(4));
    };

    /* Smartphone: Seiten-Scroll steuert den Handy-Inhalt */
    var mitlaufen = function () {
      if (!gekoppelt) return;
      var r = spur.getBoundingClientRect();
      var oben = parseFloat(getComputedStyle(buehne).top) || 0;
      var weg = r.height - buehne.offsetHeight;
      var p = weg > 0 ? Math.min(Math.max((oben - r.top) / weg, 0), 1) : 0;
      screen.scrollTop = p * (screen.scrollHeight - screen.clientHeight);
    };
    /* direkt beim Scrollen — nur ein paar Messwerte und ein scrollTop, das bremst nichts */
    window.addEventListener('scroll', mitlaufen, { passive: true });

    var modus = function () {
      gekoppelt = klein.matches && !aufnahme;
      angebot.classList.toggle('ist-gekoppelt', gekoppelt);
      if (!gekoppelt) screen.scrollTop = 0;
      skalieren();
      mitlaufen();
    };
    modus();
    klein.addEventListener('change', modus);

    if ('ResizeObserver' in window) {
      new ResizeObserver(function () { skalieren(); mitlaufen(); }).observe(buehne);
    } else {
      window.addEventListener('resize', function () { skalieren(); mitlaufen(); });
    }

    /* Computer: einmal sanft anstupsen, damit klar ist, dass man im Handy scrollen kann */
    var beruehrt = false;
    ['wheel', 'pointerdown', 'keydown', 'touchstart'].forEach(function (typ) {
      screen.addEventListener(typ, function () { beruehrt = true; }, { passive: true });
    });
    var angestupst = false;
    var anstupsen = function () {
      if (angestupst || gekoppelt || aufnahme || ruhig || beruehrt || screen.scrollTop > 0) return;
      angestupst = true;
      setTimeout(function () {
        var start = null;
        var schritt = function (t) {
          if (beruehrt) return;
          if (start === null) start = t;
          var p = Math.min((t - start) / 1300, 1);
          screen.scrollTop = Math.round(Math.sin(p * Math.PI) * 120);
          if (p < 1) requestAnimationFrame(schritt);
        };
        requestAnimationFrame(schritt);
      }, 700);
    };
    if ('IntersectionObserver' in window) {
      var stupsIo = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) { anstupsen(); stupsIo.disconnect(); }
      }, { threshold: 0.6 });
      stupsIo.observe(angebot);
    }

    /* Freie Plätze: Kästchen aus data-frei / data-gesamt bauen */
    var plaetze = angebot.querySelector('[data-frei]');
    if (plaetze) {
      var frei = parseInt(plaetze.getAttribute('data-frei'), 10) || 0;
      var gesamt = parseInt(plaetze.getAttribute('data-gesamt'), 10) || 5;
      var box = plaetze.querySelector('.hs__kaestchen');
      for (var n = 0; n < gesamt; n++) {
        var k = document.createElement('i');
        if (n >= frei) k.className = 'vergeben';
        box.appendChild(k);
      }
      plaetze.querySelector('[data-frei-text]').textContent = frei + ' von ' + gesamt;
    }

    /* Prozent-Zähler 0 → 30 */
    var zaehler = angebot.querySelector('[data-zaehler]');
    var ziel = zaehler ? parseInt(zaehler.getAttribute('data-zaehler'), 10) : 0;
    var zaehltGerade = false;
    var zaehlen = function () {
      if (!zaehler || zaehltGerade) return;
      if (ruhig) { zaehler.textContent = ziel; return; }
      zaehltGerade = true;
      var start = null;
      var schritt = function (t) {
        if (start === null) start = t;
        var p = Math.min((t - start) / 1000, 1);
        zaehler.textContent = Math.round(ziel * (1 - Math.pow(1 - p, 3)));
        if (p < 1) { requestAnimationFrame(schritt); } else { zaehltGerade = false; }
      };
      requestAnimationFrame(schritt);
    };

    /* Einblenden beim Scrollen im Handy — spielt bei jedem Runterscrollen neu ab */
    var teile = [].slice.call(angebot.querySelectorAll('.hs-rein'));
    teile.forEach(function (el) {
      var geschwister = [].slice.call(el.parentNode.children).filter(function (c) {
        return c.classList.contains('hs-rein');
      });
      el.style.transitionDelay = (geschwister.indexOf(el) * 80) + 'ms';
    });

    if (!ruhig && 'IntersectionObserver' in window) {
      angebot.classList.add('hs-an');
      if (zaehler) zaehler.textContent = '0';
      var hsio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add('is-da');
            if (e.target.contains(zaehler)) zaehlen();
          } else if (e.boundingClientRect.top > e.rootBounds.bottom) {
            /* wieder unter den Bildschirmrand gerutscht: zurücksetzen */
            e.target.classList.remove('is-da');
            if (e.target.contains(zaehler) && !zaehltGerade) zaehler.textContent = '0';
          }
        });
      }, { root: screen, threshold: 0.3 });
      teile.forEach(function (el) { hsio.observe(el); });
    }
  }

  /* ---- Fenster „Platz sichern“ ---- */
  var EMPFAENGER = 'er.webdesign44@gmail.com';   /* <- eure E-Mail-Adresse eintragen */

  var platz = document.getElementById('platz');

  if (platz && typeof platz.showModal === 'function') {
    var form = platz.querySelector('[data-platz-form]');
    var danke = platz.querySelector('[data-platz-danke]');
    var fehler = platz.querySelector('[data-platz-fehler]');
    var ausloeser = null;

    /* „Noch X von Y Plätzen frei“ aus dem Handy übernehmen */
    var quelle = document.querySelector('[data-frei]');
    if (quelle) {
      platz.querySelector('[data-platz-frei]').textContent =
        'Noch ' + quelle.getAttribute('data-frei') + ' von ' + quelle.getAttribute('data-gesamt') + ' Plätzen frei';
    }

    var oeffnen = function (von) {
      ausloeser = von;
      platz.showModal();
      if (!danke.hidden) { danke.focus(); } else { form.querySelector('input').focus(); }
    };

    var schliessen = function () { platz.close(); };

    platz.addEventListener('close', function () {
      /* Nach dem Absenden für den nächsten Besuch zurücksetzen */
      if (!danke.hidden) {
        form.reset();
        form.hidden = false;
        danke.hidden = true;
      }
      if (ausloeser) ausloeser.focus();
    });

    document.querySelectorAll('[data-platz]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        oeffnen(a);
      });
    });

    platz.querySelectorAll('[data-platz-zu]').forEach(function (b) {
      b.addEventListener('click', schliessen);
    });

    /* Klick auf den abgedunkelten Hintergrund schließt */
    platz.addEventListener('click', function (e) {
      if (e.target === platz) schliessen();
    });

    var meldung = function (feld) {
      var name = feld.labels && feld.labels[0] ? feld.labels[0].textContent.trim() : '';
      if (feld.type === 'checkbox') return 'Bitte bestätigen Sie den Datenschutz-Hinweis.';
      if (feld.validity.valueMissing) return 'Bitte „' + name + '“ ausfüllen.';
      if (feld.type === 'email') return 'Bitte eine gültige E-Mail-Adresse eingeben.';
      if (feld.type === 'tel') return 'Bitte eine gültige Telefonnummer eingeben.';
      return 'Bitte „' + name + '“ prüfen.';
    };

    /* Rote Markierung verschwindet, sobald das Feld stimmt */
    var wahl = form.querySelector('[data-platz-wahl]');
    var gewaehlt = function () {
      return !!form.querySelector('input[name="gefunden"]:checked');
    };

    form.addEventListener('input', function (e) {
      if (e.target.name === 'gefunden') {
        wahl.removeAttribute('aria-invalid');
      } else if (e.target.getAttribute('aria-invalid') === 'true' && e.target.checkValidity()) {
        e.target.removeAttribute('aria-invalid');
      }
      if (!form.querySelector('[aria-invalid="true"]')) fehler.hidden = true;
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var felder = [].slice.call(form.querySelectorAll('input')).filter(function (f) {
        return f.type !== 'radio';
      });
      felder.forEach(function (f) {
        if (f.type !== 'checkbox') f.value = f.value.trim();
      });

      var falsch = felder.filter(function (f) { return !f.checkValidity(); });
      felder.forEach(function (f) {
        if (falsch.indexOf(f) > -1) { f.setAttribute('aria-invalid', 'true'); } else { f.removeAttribute('aria-invalid'); }
      });

      /* „Wie haben Sie uns gefunden?“ zählt als eine Angabe, nicht als sechs */
      if (gewaehlt()) { wahl.removeAttribute('aria-invalid'); } else { wahl.setAttribute('aria-invalid', 'true'); }

      if (falsch.length || !gewaehlt()) {
        if (falsch.length) {
          fehler.textContent = meldung(falsch[0]);
          falsch[0].focus();
        } else {
          fehler.textContent = 'Bitte auswählen, wie Sie uns gefunden haben.';
          form.querySelector('input[name="gefunden"]').focus();
        }
        fehler.hidden = false;
        return;
      }
      fehler.hidden = true;

      var d = new FormData(form);
      var betreff = 'Gründungsangebot −30 %: ' + d.get('betriebsname');
      var text = [
        'Hallo,',
        '',
        'ich möchte mir einen Platz im Gründungsangebot (−30 %) sichern.',
        '',
        'Vorname: ' + d.get('vorname'),
        'Nachname: ' + d.get('nachname'),
        'Art des Betriebs: ' + d.get('betrieb'),
        'Name des Betriebs: ' + d.get('betriebsname'),
        'E-Mail: ' + d.get('email'),
        'Telefon: ' + d.get('telefon'),
        'Gefunden über: ' + d.get('gefunden'),
        '',
        'Viele Grüße',
        d.get('vorname') + ' ' + d.get('nachname')
      ].join('\n');

      window.location.href = 'mailto:' + EMPFAENGER +
        '?subject=' + encodeURIComponent(betreff) +
        '&body=' + encodeURIComponent(text);

      platz.querySelector('[data-platz-danke-titel]').textContent = 'Danke, ' + d.get('vorname') + '!';
      form.hidden = true;
      danke.hidden = false;
      danke.focus();
    });
  }

  /* ---- Reveal ---- */
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var flaechen = document.querySelectorAll('.reveal');
  var alleZeigen = function () {
    flaechen.forEach(function (el) { el.classList.add('is-in'); });
  };

  if (reduced || !('IntersectionObserver' in window)) {
    alleZeigen();
    return;
  }

  /* Erst jetzt verstecken — und sicherheitshalber nach 2,5 s alles zeigen,
     falls der Observer in einem Browser nicht auslöst. Nichts bleibt unsichtbar. */
  document.documentElement.classList.add('js');
  setTimeout(alleZeigen, 2500);

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.06 });

  flaechen.forEach(function (el) { io.observe(el); });
})();
