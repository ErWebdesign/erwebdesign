(function () {
  // Schriftzug exakt auf die verfügbare Breite setzen
  const fitters = document.querySelectorAll("[data-fit]");
  function fit() {
    fitters.forEach((el) => {
      const cs = getComputedStyle(el);
      const available = el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const probe = document.createElement("span");
      probe.textContent = el.textContent;
      probe.style.cssText = "position:absolute;visibility:hidden;white-space:nowrap;font-size:100px;" +
        "font-weight:" + cs.fontWeight + ";letter-spacing:-0.045em;font-family:" + cs.fontFamily;
      document.body.appendChild(probe);
      const w = probe.getBoundingClientRect().width;
      probe.remove();
      if (w > 0) el.style.fontSize = Math.floor((available / w) * 100 * 0.995) + "px";
    });
  }
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(fit);
  let t;
  window.addEventListener("resize", () => { clearTimeout(t); t = setTimeout(fit, 100); });

  // Mobile Navigation
  const toggle = document.querySelector("[data-toggle]");
  const panel = document.querySelector("[data-panel]");
  function setMenu(open) {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.querySelector(".sr-only").textContent = open ? "Menü schließen" : "Menü öffnen";
    panel.hidden = !open;
    document.body.style.overflow = open ? "hidden" : "";
  }
  toggle.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
  panel.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !panel.hidden) { setMenu(false); toggle.focus(); }
  });
  window.matchMedia("(min-width: 768px)").addEventListener("change", (e) => { if (e.matches) setMenu(false); });

  // Geöffnet / geschlossen – täglich 10 bis 23 Uhr, deutsche Zeit
  const OPEN = 10, CLOSE = 23;
  function status() {
    const parts = new Intl.DateTimeFormat("de-DE", {
      timeZone: "Europe/Berlin", hour: "numeric", minute: "numeric", hour12: false,
    }).formatToParts(new Date());
    const h = Number(parts.find((p) => p.type === "hour").value) % 24;
    const isOpen = h >= OPEN && h < CLOSE;
    const short = document.querySelector("[data-status]");
    const long = document.querySelector("[data-status-long]");
    short.dataset.open = String(isOpen);
    short.textContent = isOpen ? "Jetzt geöffnet · bis 23 Uhr" : "Gerade geschlossen · ab 10 Uhr";
    long.textContent = isOpen ? "Jetzt geöffnet." : "Gerade geschlossen – ab 10 Uhr wieder da.";
  }
  status();
  setInterval(status, 60000);

  // Google Maps erst nach Klick laden
  const mapBtn = document.querySelector("[data-map-load]");
  mapBtn.addEventListener("click", () => {
    const map = document.querySelector("[data-map]");
    const frame = document.createElement("iframe");
    frame.src = "https://www.google.com/maps?q=" + encodeURIComponent("Erfundenestraße 44") + "&output=embed";
    frame.title = "Karte: Erfundenestraße 44";
    frame.loading = "lazy";
    frame.referrerPolicy = "no-referrer-when-downgrade";
    map.innerHTML = "";
    map.appendChild(frame);
    frame.focus();
  });
})();
