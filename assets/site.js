/* Site behaviour: theme toggle, nav scroll-spy, copy-to-clipboard. No dependencies. */

(function () {
  var KEY = "financegym-theme";
  var root = document.documentElement;

  var stored = null;
  try { stored = localStorage.getItem(KEY); } catch (e) { /* private mode */ }
  if (stored === "light" || stored === "dark") root.setAttribute("data-theme", stored);

  function currentMode() {
    var explicit = root.getAttribute("data-theme");
    if (explicit) return explicit;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function paint(btn) {
    var mode = currentMode();
    btn.textContent = mode === "dark" ? "☀" : "☽";
    btn.setAttribute("aria-label", "Switch to " + (mode === "dark" ? "light" : "dark") + " theme");
    btn.setAttribute("title", btn.getAttribute("aria-label"));
  }

  document.addEventListener("DOMContentLoaded", function () {
    var btn = document.querySelector("[data-theme-toggle]");
    if (btn) {
      paint(btn);
      btn.addEventListener("click", function () {
        var next = currentMode() === "dark" ? "light" : "dark";
        root.setAttribute("data-theme", next);
        try { localStorage.setItem(KEY, next); } catch (e) { /* ignore */ }
        paint(btn);
      });
    }

    // Single page: mark whichever section the reader is currently in. A section
    // counts as reached once its heading clears the sticky header.
    var links = [], targets = [];
    document.querySelectorAll('.nav a[href^="#"]').forEach(function (a) {
      var el = document.getElementById(a.getAttribute("href").slice(1));
      if (el) { links.push(a); targets.push(el); }
    });

    function spy() {
      var y = window.pageYOffset + 110;   // sticky header + a little breathing room
      var active = -1;
      targets.forEach(function (el, i) {
        if (el.getBoundingClientRect().top + window.pageYOffset <= y) active = i;
      });
      // Bottom of the page always belongs to the last section, however short it is.
      if (window.innerHeight + window.pageYOffset >= document.body.offsetHeight - 4) {
        active = links.length - 1;
      }
      links.forEach(function (a, i) {
        if (i === active) a.setAttribute("aria-current", "true");
        else a.removeAttribute("aria-current");
      });
    }

    if (links.length) {
      var ticking = false;
      var onScroll = function () {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function () { ticking = false; spy(); });
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
      spy();
    }

    // Any [data-copy] button copies the text of the element it names.
    document.addEventListener("click", function (ev) {
      var btn = ev.target.closest("[data-copy]");
      if (!btn) return;
      var text = btn.getAttribute("data-copy");
      if (text === "@prev") {
        var pre = btn.parentElement.querySelector("pre");
        text = pre ? pre.innerText : "";
      }
      if (!text) return;
      navigator.clipboard.writeText(text).then(function () {
        var was = btn.textContent;
        btn.textContent = "copied";
        setTimeout(function () { btn.textContent = was; }, 1200);
      });
    });
  });
})();
