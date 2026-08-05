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

/* Tabbed panels (the Data section). Follows the ARIA tabs pattern: roving
   tabindex, arrow/Home/End keys, and `hidden` on the inactive panels so their
   content stays out of the accessibility tree and out of find-in-page. */
(function () {
  "use strict";

  function initTabs(root) {
    var tabs = [].slice.call(root.querySelectorAll('[role="tab"]'));
    if (!tabs.length) return;

    function select(tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute("aria-selected", on ? "true" : "false");
        t.tabIndex = on ? 0 : -1;
        var panel = document.getElementById(t.getAttribute("aria-controls"));
        if (panel) panel.hidden = !on;
      });
      if (focus) tab.focus();
    }

    // In-prose pointers: a button anywhere on the page can activate a tab.
    [].forEach.call(document.querySelectorAll("[data-select-tab]"), function (btn) {
      var target = document.getElementById(btn.getAttribute("data-select-tab"));
      if (tabs.indexOf(target) === -1) return;
      btn.addEventListener("click", function () { select(target, true); });
    });

    tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () { select(tab, false); });
      tab.addEventListener("keydown", function (e) {
        var next = null;
        if (e.key === "ArrowRight") next = tabs[(i + 1) % tabs.length];
        else if (e.key === "ArrowLeft") next = tabs[(i - 1 + tabs.length) % tabs.length];
        else if (e.key === "Home") next = tabs[0];
        else if (e.key === "End") next = tabs[tabs.length - 1];
        if (next) { e.preventDefault(); select(next, true); }
      });
    });
  }

  function init() {
    [].forEach.call(document.querySelectorAll(".tabs"), initTabs);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
