/* Liquidity Matrix: the newest educational scenarios on the home page, read in the visitor's browser from the
   public log (/data/scenarios.json), so the cards always match the track record. No tracking, no storage.
   English or Arabic from data-lang on #latest. */
(function () {
  "use strict";
  var box = document.getElementById("latest");
  if (!box || !window.fetch) return;
  var ar = box.getAttribute("data-lang") === "ar";
  var T = ar ? {
    names: { XAUUSD: "الذهب", XAGUSD: "الفضة", EURUSD: "اليورو مقابل الدولار", GBPUSD: "الإسترليني مقابل الدولار",
             USDJPY: "الدولار مقابل الين", NAS100: "ناسداك 100", US30: "داو جونز 30", BTCUSD: "بيتكوين" },
    long: "شراء بعد سحب السيولة عند", short: "بيع بعد سحب السيولة عند",
    entry: "الدخول", stop: "الوقف", target: "الهدف",
    open: "مفتوح · النتيجة لم تُعرف بعد", win: "وصل إلى الهدف", loss: "ضرب الوقف", expired: "انتهت مدته",
    after: "وصل السعر إلى الهدف بعد ضرب الوقف", published: "نُشر",
    days: ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"],
    months: ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"],
    base: "/ar/markets/"
  } : {
    names: { XAUUSD: "Gold", XAGUSD: "Silver", EURUSD: "EUR/USD", GBPUSD: "GBP/USD", USDJPY: "USD/JPY",
             NAS100: "Nasdaq 100", US30: "Dow Jones 30", BTCUSD: "Bitcoin" },
    long: "Long after a sweep of", short: "Short after a sweep of",
    entry: "Entry", stop: "Stop", target: "Target",
    open: "Open · outcome not known yet", win: "Target reached", loss: "Stopped out", expired: "Expired",
    after: "target reached after the stop", published: "Published",
    days: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    base: "/markets/"
  };
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function px(s, v) { return Number(v).toFixed(s.digits); }
  function num(v) { return '<span class="num" dir="ltr">' + v + "</span>"; }
  function when(t) {
    var d = new Date(t * 1000);
    function two(n) { return (n < 10 ? "0" : "") + n; }
    var clock = two(d.getUTCHours()) + ":" + two(d.getUTCMinutes()) + " UTC";
    return T.days[d.getUTCDay()] + " " + d.getUTCDate() + " " + T.months[d.getUTCMonth()] + " · " +
      (ar ? "⁦" + clock + "⁩" : clock);
  }
  function status(s) {
    if (s.status === "open") return '<span class="st st-open">' + T.open + "</span>";
    if (s.status === "target") return '<span class="st st-win">' + T.win + " · " + num("+" + Number(s.r).toFixed(2) + "R") + "</span>";
    if (s.status === "stop") return '<span class="st st-loss">' + T.loss + " · " + num("−1.00R") + "</span>" +
      (s.tp_after_stop_t ? '<span class="st-note">' + T.after + "</span>" : "");
    var r = Number(s.r || 0);
    return '<span class="st">' + T.expired + " · " + num((r >= 0 ? "+" : "−") + Math.abs(r).toFixed(2) + "R") + "</span>";
  }
  fetch("/data/scenarios.json", { cache: "no-cache" }).then(function (r) { return r.json(); }).then(function (all) {
    var rows = (all || []).filter(function (s) {
      return s && s.symbol && s.entry != null && s.sl != null && s.tp != null && s.created_utc;
    }).sort(function (a, b) { return b.created_utc - a.created_utc; }).slice(0, 3);
    if (!rows.length) return;
    box.innerHTML = rows.map(function (s) {
      var long = s.side === "long";
      return '<a class="card lsc" href="' + T.base + esc(String(s.symbol).toLowerCase()) + '#scenario">' +
        '<div class="mk-head"><span class="kicker">' + esc(s.symbol) + '</span><span class="mk-name">' +
        esc(T.names[s.symbol] || s.symbol) + "</span></div>" +
        '<h3 class="' + (long ? "down" : "up") + '">' + (long ? T.long : T.short) + " " + num(esc(px(s, s.sweep_price))) + "</h3>" +
        '<div class="lsc-lv"><div><span>' + T.entry + '</span><b class="num">' + esc(px(s, s.entry)) + "</b></div>" +
        "<div><span>" + T.stop + '</span><b class="num up">' + esc(px(s, s.sl)) + "</b></div>" +
        "<div><span>" + T.target + '</span><b class="num down">' + esc(px(s, s.tp)) + "</b></div></div>" +
        '<div class="lsc-st">' + status(s) + "</div>" +
        '<p class="lsc-when">' + T.published + " " + esc(when(s.created_utc)) + "</p></a>";
    }).join("");
    box.hidden = false;
  }).catch(function () { /* the link to the track record stays */ });
})();
