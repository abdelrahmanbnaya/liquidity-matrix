/* Liquidity Matrix session clock: the same session clocks as the site's session tables.
   Asia 00:00 UTC -> London 08:00 (London time) -> New York 08:00 (New York time) -> 17:00 New York.
   Daylight saving is handled by the browser's time-zone data. Shows the visitor's own local times. */
(function () {
  "use strict";
  var LONDON = "Europe/London", NEW_YORK = "America/New_York";
  var AR = (document.documentElement.lang || "").indexOf("ar") === 0;
  var NAMES = AR ? { "Asia": "آسيا", "London": "لندن", "New York": "نيويورك" } : null;
  function nm(s) { return AR ? NAMES[s] : s; }

  function zoneOffsetMs(tz, t) {
    var f = new Intl.DateTimeFormat("en-US", {
      timeZone: tz, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit"
    });
    var p = {};
    f.formatToParts(new Date(t)).forEach(function (x) { p[x.type] = x.value; });
    var asUtc = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second);
    return asUtc - t;
  }

  function at(tz, y, m, d, h) {               // UTC ms of h:00 local time in tz on that calendar day
    var guess = Date.UTC(y, m, d, h, 0, 0);
    var t = guess - zoneOffsetMs(tz, guess);
    return guess - zoneOffsetMs(tz, t);
  }

  function bounds(t) {
    var u = new Date(t), y = u.getUTCFullYear(), m = u.getUTCMonth(), d = u.getUTCDate();
    var asia = Date.UTC(y, m, d), london = at(LONDON, y, m, d, 8), ny = at(NEW_YORK, y, m, d, 8),
        close = at(NEW_YORK, y, m, d, 17);
    return [["Asia", asia, london], ["London", london, ny], ["New York", ny, close]];
  }

  function weekday(t) { return new Date(t).getUTCDay(); }   // 0 Sunday .. 6 Saturday (UTC day)

  function fmtLeft(ms) {
    var m = Math.max(0, Math.round(ms / 60000)), h = Math.floor(m / 60);
    if (AR) return (h ? h + " س " : "") + (m % 60) + " د";
    return (h ? h + " h " : "") + (m % 60) + " min";
  }

  function localTime(t) {
    return new Date(t).toLocaleTimeString(AR ? "en-GB" : [], { hour: "2-digit", minute: "2-digit" });
  }

  function state(now) {
    var current = null, next = null;
    for (var day = 0; day < 4 && !next; day++) {
      var b = bounds(now + day * 86400000);
      for (var i = 0; i < b.length; i++) {
        var s = b[i], wd = weekday(s[1]);
        if (wd === 0 || wd === 6) continue;               // sessions run Monday to Friday (UTC day of the open)
        if (s[1] <= now && now < s[2]) current = s;
        if (s[1] > now && !next) next = s;
      }
    }
    return { current: current, next: next };
  }

  function render() {
    var now = Date.now(), st = state(now);
    document.querySelectorAll("[data-sessions]").forEach(function (el) {
      var a = el.querySelector("[data-now]"), b = el.querySelector("[data-next]");
      var wd = weekday(now);
      if (st.current) {
        a.textContent = AR ? "جلسة " + nm(st.current[0]) + " مفتوحة · متبقٍ " + fmtLeft(st.current[2] - now)
                           : st.current[0] + " session open · " + fmtLeft(st.current[2] - now) + " left";
      } else if (wd === 0 || wd === 6) {
        a.textContent = AR ? "عطلة نهاية الأسبوع · أسواق العملات والمعادن مغلقة" : "Weekend · forex and metals closed";
      } else {
        a.textContent = AR ? "بين الجلسات" : "Between sessions";
      }
      if (st.next) {
        b.textContent = AR ? "تفتح جلسة " + nm(st.next[0]) + " بعد " + fmtLeft(st.next[1] - now) + " (الساعة " +
          localTime(st.next[1]) + " بتوقيتك)."
          : st.next[0] + " opens in " + fmtLeft(st.next[1] - now) + " (" + localTime(st.next[1]) + " your time).";
      }
    });
  }

  if (typeof Intl === "undefined" || !Intl.DateTimeFormat) return;
  render();
  setInterval(render, 30000);
})();

/* Folded detail (details.more): open on wide screens, and open the one a link points into. */
(function () {
  "use strict";
  function openFor(hash) {
    var t = hash && hash.length > 1 ? document.getElementById(hash.slice(1)) : null;
    var d = t && t.closest ? t.closest("details.more") : null;
    if (d) d.open = true;
  }
  if (window.matchMedia && window.matchMedia("(min-width: 900px)").matches) {
    Array.prototype.forEach.call(document.querySelectorAll("details.more"), function (d) { d.open = true; });
  }
  openFor(location.hash);
  window.addEventListener("hashchange", function () { openFor(location.hash); });
})();
