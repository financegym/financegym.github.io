/* Leaderboard data + rendering.
   Source of truth: docs/leaderboard.md. Keep the two in sync when a submission
   is graded — add the row here and in the markdown table.

   `ref` points at the agentic system the row runs on: the paper for published
   frameworks, the repository for the ones that only exist as code. Rows whose
   backbone internalizes the research loop point at the model's own paper. */

var FG_REF = {
  react:      { name: "ReAct",          url: "https://arxiv.org/pdf/2210.03629" },
  harness:    { name: "FinanceHarness", url: "https://arxiv.org/pdf/2607.27853" },
  ttddr:      { name: "TTD-DR",         url: "https://arxiv.org/pdf/2507.16075" },
  gptr:       { name: "GPT-Researcher", url: "https://github.com/assafelovic/gpt-researcher" },
  storm:      { name: "STORM",          url: "https://arxiv.org/pdf/2402.14207" },
  openclaw:   { name: "OpenClaw",       url: "https://github.com/openclaw/openclaw" },
  deepagents: { name: "deepagents",     url: "https://github.com/hwchase17/deepagents" },
  tongyi:     { name: "Tongyi-DR",      url: "https://arxiv.org/pdf/2510.24701" },
  openres:    { name: "OpenResearcher", url: "https://arxiv.org/pdf/2603.20278" },
  miro:       { name: "MiroThinker",    url: "https://arxiv.org/pdf/2603.15726" }
};

window.FG_LEADERBOARD = [
  { system: "Claude-Opus-5 · FinanceHarness",     ref: FG_REF.harness,    overall: 44.9, hindsight: 63.8, foresight: 15.7, se: 0.9 },
  { system: "Claude-Opus-4.7 · FinanceHarness",   ref: FG_REF.harness,    overall: 40.0, hindsight: 57.9, foresight: 12.6, se: 0.9 },
  { system: "Claude-Opus-4.8 · FinanceHarness",   ref: FG_REF.harness,    overall: 38.3, hindsight: 55.2, foresight: 11.9, se: 0.9 },
  { system: "Gemini-3.1-Pro · FinanceHarness",    ref: FG_REF.harness,    overall: 35.0, hindsight: 50.5, foresight: 11.5, se: 0.8 },
  { system: "Gemini-3-Flash · FinanceHarness",    ref: FG_REF.harness,    overall: 34.9, hindsight: 50.4, foresight: 10.6, se: 0.8 },
  { system: "Claude-Opus-4.7 · ReAct",            ref: FG_REF.react,      overall: 34.1, hindsight: 50.1, foresight: 9.9,  se: 0.8 },
  { system: "Gemini-3.1-Pro · ReAct",             ref: FG_REF.react,      overall: 33.2, hindsight: 46.8, foresight: 12.8, se: 0.7 },
  { system: "Qwen3.6-27B · FinanceHarness",       ref: FG_REF.harness,    overall: 32.4, hindsight: 45.7, foresight: 11.8, se: 0.8 },
  { system: "GPT-5.5 · ReAct",                    ref: FG_REF.react,      overall: 31.8, hindsight: 47.5, foresight: 8.0,  se: 0.7 },
  { system: "Gemini-3-Flash · TTD-DR",            ref: FG_REF.ttddr,      overall: 31.5, hindsight: 45.5, foresight: 9.8,  se: 0.7 },
  { system: "GLM-5 · ReAct",                      ref: FG_REF.react,      overall: 30.4, hindsight: 44.7, foresight: 8.5,  se: 0.9 },
  { system: "Gemini-3-Flash · GPT-Researcher",    ref: FG_REF.gptr,       overall: 30.4, hindsight: 42.2, foresight: 12.0, se: 0.8 },
  { system: "Gemini-3-Flash · ReAct",             ref: FG_REF.react,      overall: 30.2, hindsight: 43.7, foresight: 9.8,  se: 0.7 },
  { system: "DeepSeek-v3.2 · ReAct",              ref: FG_REF.react,      overall: 28.9, hindsight: 42.4, foresight: 8.4,  se: 0.8 },
  { system: "Tongyi-DR-30B-A3B · self-contained", ref: FG_REF.tongyi,     overall: 28.2, hindsight: 39.7, foresight: 10.7, se: 0.8 },
  { system: "Gemini-3-Flash · deepagents",        ref: FG_REF.deepagents, overall: 28.1, hindsight: 40.7, foresight: 8.6,  se: 1.1 },
  { system: "Gemini-3-Flash · OpenClaw",          ref: FG_REF.openclaw,   overall: 27.7, hindsight: 40.2, foresight: 8.3,  se: 0.7 },
  { system: "Gemini-3-Flash · STORM",             ref: FG_REF.storm,      overall: 27.4, hindsight: 39.3, foresight: 9.4,  se: 0.6 },
  { system: "OpenResearcher · self-contained",    ref: FG_REF.openres,    overall: 27.2, hindsight: 39.9, foresight: 8.1,  se: 0.7 },
  { system: "Qwen3-235B-A22B · ReAct",            ref: FG_REF.react,      overall: 26.8, hindsight: 39.7, foresight: 7.3,  se: 0.7 },
  { system: "Gemma-4-26B · ReAct",                ref: FG_REF.react,      overall: 25.7, hindsight: 37.6, foresight: 7.7,  se: 0.6 },
  { system: "MiroThinker-1.7-mini · self-contained", ref: FG_REF.miro,    overall: 21.2, hindsight: 29.6, foresight: 7.8,  se: 0.6 },
  { system: "gpt-oss-120b · ReAct",               ref: FG_REF.react,      overall: 18.7, hindsight: 27.8, foresight: 5.2,  se: 0.8 }
];

(function () {
  var rows = window.FG_LEADERBOARD;
  var BAR_MAX = 40; // % — the bar's shared baseline scale, fixed so rows compare

  function bar(value) {
    var pct = Math.max(0, Math.min(100, (value / BAR_MAX) * 100));
    return (
      '<span class="score-cell">' +
        '<span class="value">' + value.toFixed(1) + "</span>" +
        '<span class="bar-track" aria-hidden="true">' +
          '<span class="bar-fill" style="width:' + pct.toFixed(1) + '%"></span>' +
        "</span>" +
      "</span>"
    );
  }

  // FinanceHarness is named in blue wherever it appears in a system name — the
  // same blue the page uses for emphasis elsewhere. It replaces the old "ours"
  // badge, so identity is carried by the name itself rather than a row flag.
  function fhName(system) {
    return system.replace("FinanceHarness", '<span class="fh">FinanceHarness</span>');
  }

  function refLink(ref) {
    if (!ref) return "";
    var kind = ref.url.indexOf("github.com") !== -1 ? "repository" : "paper";
    return (
      '<a class="ref-link" href="' + ref.url + '" target="_blank" rel="noopener"' +
        ' title="' + ref.name + " " + kind + '">' + ref.name +
        '<span class="ext" aria-hidden="true">↗</span>' +
      "</a>"
    );
  }

  var state = { sort: "overall", dir: -1 };

  function render() {
    var tbody = document.getElementById("lb-body");
    if (!tbody) return;

    var view = rows.slice();
    // Rank is always the overall standing, independent of the current sort.
    var rankOf = {};
    rows.slice().sort(function (a, b) { return b.overall - a.overall; })
        .forEach(function (r, i) { rankOf[r.system] = i + 1; });

    view.sort(function (a, b) {
      var k = state.sort;
      if (k === "system") return state.dir * a.system.localeCompare(b.system);
      if (k === "ref") return state.dir * a.ref.name.localeCompare(b.ref.name);
      return state.dir * (a[k] - b[k]);
    });

    tbody.innerHTML = view.map(function (r) {
      return (
        "<tr>" +
          '<td class="rank">' + rankOf[r.system] + "</td>" +
          '<td class="system">' + fhName(r.system) + "</td>" +
          '<td class="num">' + bar(r.overall) + "</td>" +
          '<td class="num">' + r.hindsight.toFixed(1) + "</td>" +
          '<td class="num">' + r.foresight.toFixed(1) + "</td>" +
          '<td class="num">' + r.se.toFixed(1) + "</td>" +
          "<td>" + refLink(r.ref) + "</td>" +
        "</tr>"
      );
    }).join("");

    var count = document.getElementById("lb-count");
    if (count) count.textContent = rows.length + " systems";

    document.querySelectorAll("#lb-table th[data-sort]").forEach(function (th) {
      var mark = th.querySelector(".sort-mark");
      var active = th.getAttribute("data-sort") === state.sort;
      if (mark) mark.textContent = active ? (state.dir === -1 ? "▼" : "▲") : "";
      th.setAttribute("aria-sort", active ? (state.dir === -1 ? "descending" : "ascending") : "none");
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("#lb-table th[data-sort] button").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var key = btn.parentElement.getAttribute("data-sort");
        if (state.sort === key) state.dir *= -1;
        else { state.sort = key; state.dir = key === "system" || key === "ref" ? 1 : -1; }
        render();
      });
    });

    render();
  });
})();
