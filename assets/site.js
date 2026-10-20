/* Liquidity Matrix site helpers: how fresh the numbers are (computed in the visitor's browser, so it stays true
   even when the updater is off) and the market filter on the levels page. No tracking, no storage. */
(function () {
  "use strict";
  if (window.__lmSite) return;
  window.__lmSite = 1;

  // FX / metals / indices week: closed from Friday 21:00 UTC to Sunday 22:00 UTC
  function closed(ts) {
    var d = new Date(ts * 1000), w = d.getUTCDay(), h = d.getUTCHours();
    return (w === 5 && h >= 21) || w === 6 || (w === 0 && h < 22);
  }
  // seconds of OPEN market between t and now (a weekend does not make Friday's numbers stale)
  function openSeconds(t, now) {
    var s = 0, step = 600, x = t;
    for (; x < now && x - t < 40 * 86400; x += step) if (!closed(x)) s += Math.min(step, now - x);
    return s;
  }
  function relEn(sec) {
    var m = Math.round(sec / 60), h = Math.round(sec / 3600), d = Math.round(sec / 86400);
    if (m < 1) return "just now";
    if (m < 60) return m + " min ago";
    if (h < 48) return h + (h === 1 ? " hour ago" : " hours ago");
    return d + " days ago";
  }
  function arCount(n, one, two, few, many) {
    if (n === 1) return one;
    if (n === 2) return two;
    if (n >= 3 && n <= 10) return n + " " + few;
    return n + " " + many;
  }
  function relAr(sec) {
    var m = Math.round(sec / 60), h = Math.round(sec / 3600), d = Math.round(sec / 86400);
    if (m < 1) return "الآن";
    if (m < 60) return "منذ " + arCount(m, "دقيقة", "دقيقتين", "دقائق", "دقيقة");
    if (h < 48) return "منذ " + arCount(h, "ساعة", "ساعتين", "ساعات", "ساعة");
    return "منذ " + arCount(d, "يوم", "يومين", "أيام", "يومًا");
  }
  var LABEL = {
    en: { ok: "Up to date", warn: "May need an update", old: "Outdated", closed: "Market closed for the weekend" },
    ar: { ok: "محدّث", warn: "قد يحتاج إلى تحديث", old: "قديم", closed: "السوق مغلق (عطلة نهاية الأسبوع)" }
  };
  function paint() {
    var now = Date.now() / 1000;
    Array.prototype.forEach.call(document.querySelectorAll(".fresh[data-t]"), function (el) {
      var t = parseFloat(el.getAttribute("data-t"));
      if (!isFinite(t) || t <= 0) return;
      var ar = el.getAttribute("data-lang") === "ar", open = openSeconds(t, now), age = Math.max(0, now - t);
      // updates run every morning and at each session open: the longest normal gap is about 12 hours
      var st = closed(now) && open < 13 * 3600 ? "closed" : open <= 13 * 3600 ? "ok" : open <= 26 * 3600 ? "warn" : "old";
      el.className = "fresh f-" + st;
      el.textContent = (ar ? LABEL.ar : LABEL.en)[st] + " · " + (ar ? relAr(age) : relEn(age));
      el.title = new Date(t * 1000).toUTCString();
    });
  }
  function filters() {
    Array.prototype.forEach.call(document.querySelectorAll("[data-filter]"), function (bar) {
      var grid = document.querySelector(bar.getAttribute("data-filter"));
      if (!grid) return;
      bar.hidden = false;
      bar.addEventListener("click", function (ev) {
        var b = ev.target.closest ? ev.target.closest("button") : null;
        if (!b) return;
        var g = b.getAttribute("data-g");
        Array.prototype.forEach.call(bar.querySelectorAll("button"), function (x) {
          x.classList.toggle("on", x === b);
          x.setAttribute("aria-pressed", x === b ? "true" : "false");
        });
        Array.prototype.forEach.call(grid.querySelectorAll("[data-group]"), function (c) {
          c.hidden = g !== "all" && c.getAttribute("data-group") !== g;
        });
      });
    });
  }
  function folds() {                       // long detail stays folded on phones, open on wide screens
    if (!(window.matchMedia && window.matchMedia("(min-width: 900px)").matches)) return;
    Array.prototype.forEach.call(document.querySelectorAll("details.more"), function (d) { d.open = true; });
  }
  function start() {
    paint();
    filters();
    folds();
    setInterval(paint, 60000);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
