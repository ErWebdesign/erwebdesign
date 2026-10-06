(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Mobiles Menü ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("hauptnav");

  function closeNav() {
    if (!toggle) return;
    toggle.setAttribute("aria-expanded", "false");
    toggle.querySelector(".sr-only").textContent = "Menü öffnen";
    nav.classList.remove("is-open");
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      toggle.querySelector(".sr-only").textContent = open ? "Menü öffnen" : "Menü schließen";
      nav.classList.toggle("is-open", !open);
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) closeNav();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        closeNav();
        toggle.focus();
      }
    });
    window.matchMedia("(min-width: 960px)").addEventListener("change", closeNav);
  }

  /* ---------- Header-Linie beim Scrollen ---------- */
  var header = document.querySelector(".site-header");
  function onScrollHeader() {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 8);
  }

  /* ---------- Öffnungsstatus (Mo–Sa 9–21 Uhr) ---------- */
  var OPEN = 9;
  var CLOSE = 21;
  var now = new Date();
  var day = now.getDay(); // 0 = Sonntag
  var hour = now.getHours() + now.getMinutes() / 60;

  var openCard = document.querySelector("[data-open-status]");
  if (openCard) {
    var title;
    var sub;
    var isOpen = false;
    if (day === 0) {
      title = "Heute geschlossen";
      sub = "Montag ab 9 Uhr wieder für dich da";
    } else if (hour < OPEN) {
      title = "Öffnet heute um 9 Uhr";
      sub = "Geöffnet bis 21 Uhr";
    } else if (hour < CLOSE) {
      title = "Jetzt geöffnet";
      sub = "Heute bis 21 Uhr · Erfundenstraße 44";
      isOpen = true;
    } else {
      title = "Für heute geschlossen";
      sub = day === 6 ? "Montag ab 9 Uhr wieder für dich da" : "Morgen ab 9 Uhr wieder für dich da";
    }
    openCard.querySelector("strong").textContent = title;
    openCard.querySelector("span").textContent = sub;
    openCard.classList.toggle("is-open", isOpen);
  }

  var todayRow = document.querySelector('.hours tr[data-day="' + day + '"]');
  if (todayRow) todayRow.classList.add("is-today");

  /* ---------- Scroll-Reveal des Einleitungstextes ---------- */
  var groups = [];
  if (!reduceMotion) {
    document.querySelectorAll("[data-reveal]").forEach(function (p) {
      var words = p.textContent.trim().split(/\s+/);
      p.textContent = "";
      var spans = words.map(function (w, i) {
        var s = document.createElement("span");
        s.className = "w";
        s.textContent = w;
        p.appendChild(s);
        if (i < words.length - 1) p.appendChild(document.createTextNode(" "));
        return s;
      });
      groups.push({ el: p, spans: spans });
    });
  }

  function updateReveal() {
    var vh = window.innerHeight;
    var start = vh * 0.88;
    var end = vh * 0.45;
    groups.forEach(function (g) {
      var r = g.el.getBoundingClientRect();
      var progress = (start - r.top) / (start - end + r.height * 0.6);
      progress = Math.max(0, Math.min(1, progress));
      var count = Math.round(progress * g.spans.length);
      g.spans.forEach(function (s, i) {
        s.classList.toggle("on", i < count);
      });
    });
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      onScrollHeader();
      if (groups.length) updateReveal();
      ticking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  /* ---------- Terminformular ---------- */
  var form = document.getElementById("termin-form");
  if (form) {
    var dateInput = form.querySelector("#t-datum");
    var timeSelect = form.querySelector("#t-uhrzeit");
    var serviceSelect = form.querySelector("#t-leistung");
    var dateError = form.querySelector("#t-datum-fehler");
    var success = document.getElementById("termin-erfolg");

    function pad(n) {
      return String(n).padStart(2, "0");
    }
    function isoLocal(d) {
      return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
    }

    // Frühestes Datum: heute
    dateInput.min = isoLocal(now);

    // Uhrzeiten 09:00 bis 20:30 im 30-Minuten-Takt
    for (var h = OPEN; h < CLOSE; h++) {
      ["00", "30"].forEach(function (m) {
        var opt = document.createElement("option");
        opt.value = pad(h) + ":" + m;
        opt.textContent = pad(h) + ":" + m + " Uhr";
        timeSelect.appendChild(opt);
      });
    }

    function checkDate() {
      dateError.textContent = "";
      dateInput.removeAttribute("aria-invalid");
      dateInput.setCustomValidity("");
      if (!dateInput.value) return true;
      var parts = dateInput.value.split("-");
      var picked = new Date(+parts[0], +parts[1] - 1, +parts[2]);
      var msg = "";
      if (picked.getDay() === 0) {
        msg = "Sonntags ist das Studio geschlossen. Bitte wähle einen Tag von Montag bis Samstag.";
      } else if (dateInput.value < dateInput.min) {
        msg = "Bitte wähle ein Datum ab heute.";
      }
      if (msg) {
        dateError.textContent = msg;
        dateInput.setAttribute("aria-invalid", "true");
        dateInput.setCustomValidity(msg);
        return false;
      }
      return true;
    }
    dateInput.addEventListener("change", checkDate);

    // „Diese Behandlung buchen“-Links wählen die Leistung vor
    document.querySelectorAll("[data-book]").forEach(function (link) {
      link.addEventListener("click", function () {
        serviceSelect.value = link.getAttribute("data-book");
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var dateOk = checkDate();
      if (!dateOk || !form.checkValidity()) {
        form.reportValidity();
        return;
      }

      // Prototyp: Hier würde die Anfrage an das Buchungssystem übertragen.
      var data = new FormData(form);
      var parts = String(data.get("datum")).split("-");
      var picked = new Date(+parts[0], +parts[1] - 1, +parts[2]);
      var dateLabel = picked.toLocaleDateString("de-DE", {
        weekday: "long",
        day: "numeric",
        month: "long",
      });
      var serviceLabel = serviceSelect.options[serviceSelect.selectedIndex].textContent;
      var firstName = String(data.get("name")).trim().split(" ")[0];

      success.querySelector("h3").textContent = "Danke, " + firstName + "!";
      success.querySelector("[data-summary]").textContent =
        serviceLabel + " am " + dateLabel + " um " + data.get("uhrzeit") + " Uhr.";
      success.querySelector("[data-mail]").textContent = String(data.get("email"));

      form.hidden = true;
      success.hidden = false;
      success.focus();
    });

    success.querySelector("button").addEventListener("click", function () {
      form.reset();
      success.hidden = true;
      form.hidden = false;
      serviceSelect.focus();
    });
  }

  /* ---------- Google Maps erst nach Klick laden ---------- */
  var mapButton = document.querySelector("[data-load-map]");
  if (mapButton) {
    mapButton.addEventListener("click", function () {
      var map = mapButton.closest(".map");
      var iframe = document.createElement("iframe");
      iframe.src =
        "https://www.google.com/maps?q=" +
        encodeURIComponent("Erfundenstraße 44, 48999 Lindenhain") +
        "&output=embed";
      iframe.title = "Google-Maps-Karte: Nails, Erfundenstraße 44, 48999 Lindenhain";
      iframe.loading = "lazy";
      iframe.referrerPolicy = "no-referrer-when-downgrade";
      map.innerHTML = "";
      map.appendChild(iframe);
    });
  }

  /* ---------- Jahr im Footer ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = now.getFullYear();
  });
})();
