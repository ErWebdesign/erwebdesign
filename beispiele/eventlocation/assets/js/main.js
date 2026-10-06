(function () {
  "use strict";

  var EMAIL = "info@eventlocation-erfundenstadt.de";
  var MAP_SRC = "https://maps.google.com/maps?q=" +
    encodeURIComponent("Erfundenestraße 44, 12044 Erfundenstadt") + "&z=15&output=embed";

  /* ---------- Menü ---------- */
  var menu = document.getElementById("menu");
  var openers = document.querySelectorAll("[data-menu-open]");
  var lastFocus = null;

  function setExpanded(value) {
    openers.forEach(function (b) { b.setAttribute("aria-expanded", String(value)); });
  }

  function openMenu() {
    if (!menu) return;
    lastFocus = document.activeElement;
    menu.hidden = false;
    document.body.style.overflow = "hidden";
    setExpanded(true);
    var close = menu.querySelector("[data-menu-close]");
    if (close) close.focus();
  }

  function closeMenu(restoreFocus) {
    if (!menu || menu.hidden) return;
    menu.hidden = true;
    document.body.style.overflow = "";
    setExpanded(false);
    if (restoreFocus && lastFocus) lastFocus.focus();
  }

  openers.forEach(function (b) { b.addEventListener("click", openMenu); });

  if (menu) {
    menu.querySelector("[data-menu-close]").addEventListener("click", function () { closeMenu(true); });
    menu.querySelectorAll("[data-menu-link]").forEach(function (a) {
      a.addEventListener("click", function () { closeMenu(false); });
    });
    menu.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { closeMenu(true); return; }
      if (e.key !== "Tab") return;
      var focusable = menu.querySelectorAll("a[href], button");
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  /* ---------- Leiste einblenden, sobald der Schriftzug verschwindet ---------- */
  var topbar = document.getElementById("topbar");
  var masthead = document.getElementById("masthead");

  if (topbar && masthead && "IntersectionObserver" in window) {
    var focusables = topbar.querySelectorAll("a, button");
    new IntersectionObserver(function (entries) {
      var visible = !entries[0].isIntersecting && entries[0].boundingClientRect.top < 0;
      topbar.classList.toggle("is-visible", visible);
      topbar.setAttribute("aria-hidden", String(!visible));
      focusables.forEach(function (el) { el.tabIndex = visible ? 0 : -1; });
    }).observe(masthead);
  }

  /* ---------- Anlass aus der Seitenleiste vorauswählen ---------- */
  var anlass = document.getElementById("f-anlass");
  document.querySelectorAll("[data-occasion]").forEach(function (link) {
    link.addEventListener("click", function () {
      if (anlass) anlass.value = link.getAttribute("data-occasion");
    });
  });

  /* ---------- Anfrageformular: öffnet das E-Mail-Programm ---------- */
  var form = document.getElementById("anfrage-form");
  var status = document.getElementById("form-status");

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = form.elements.name;
      var mail = form.elements.email;
      var consent = form.elements.datenschutz;

      if (!name.value.trim()) { status.textContent = "Bitte geben Sie Ihren Namen an."; name.focus(); return; }
      if (!mail.value.trim() || !mail.checkValidity()) { status.textContent = "Bitte geben Sie eine gültige E-Mail-Adresse an."; mail.focus(); return; }
      if (!consent.checked) { status.textContent = "Bitte bestätigen Sie die Datenschutzerklärung."; consent.focus(); return; }

      var datum = form.elements.datum.value;
      if (datum) {
        var p = datum.split("-");
        datum = p[2] + "." + p[1] + "." + p[0];
      }

      var lines = [
        "Name: " + name.value.trim(),
        "E-Mail: " + mail.value.trim(),
        "Telefon: " + (form.elements.telefon.value.trim() || "–"),
        "Wunschtermin: " + (datum || "–"),
        "Anlass: " + (form.elements.anlass.value || "–"),
        "Gäste (ca.): " + (form.elements.gaeste.value || "–"),
        "",
        form.elements.nachricht.value.trim()
      ];
      var subject = "Anfrage" + (form.elements.anlass.value ? ": " + form.elements.anlass.value : "") + (datum ? " am " + datum : "");

      window.location.href = "mailto:" + EMAIL +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(lines.join("\n"));

      status.textContent = "Ihr E-Mail-Programm öffnet sich mit der vorbereiteten Anfrage. Falls nicht, schreiben Sie uns direkt an " + EMAIL + ".";
    });
  }

  /* ---------- Karte erst nach Klick laden ---------- */
  var mapButton = document.getElementById("map-load");
  if (mapButton) {
    mapButton.addEventListener("click", function () {
      var holder = document.getElementById("map-consent");
      var iframe = document.createElement("iframe");
      iframe.src = MAP_SRC;
      iframe.title = "Karte: eventlocation, Erfundenestraße 44, 12044 Erfundenstadt";
      iframe.loading = "lazy";
      iframe.referrerPolicy = "no-referrer-when-downgrade";
      holder.replaceWith(iframe);
    });
  }

  /* ---------- Jahr im Footer ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
