/* Liquidity Matrix track record: filter the closed scenarios (outcome, market) and show them 5, then 10 more at a
   time. Without JavaScript every row stays visible. No tracking, no storage. */
(function () {
  "use strict";
  var box = document.getElementById("rec-closed");
  if (!box) return;
  var FIRST = 5, STEP = 10, shown = FIRST, f = { st: "all", sym: "all" };
  var rows = [].slice.call(box.querySelectorAll(".rec-list > li"));
  var more = box.querySelector(".rec-more-btn"), ar = box.getAttribute("data-lang") === "ar";
  function match(li) {
    return (f.st === "all" || li.getAttribute("data-st") === f.st) &&
           (f.sym === "all" || li.getAttribute("data-sym") === f.sym);
  }
  function draw() {
    var hits = rows.filter(match), left;
    rows.forEach(function (li) { li.hidden = true; });
    hits.slice(0, shown).forEach(function (li) { li.hidden = false; });
    left = hits.length - Math.min(shown, hits.length);
    more.hidden = left <= 0;
    more.textContent = ar ? ("عرض " + Math.min(STEP, left) + " أخرى (المتبقي " + left + ")")
                          : ("Show " + Math.min(STEP, left) + " more (" + left + " left)");
    var empty = box.querySelector(".rec-empty");
    if (empty) empty.hidden = hits.length > 0;
  }
  [].forEach.call(box.querySelectorAll(".chips[data-f]"), function (bar) {
    bar.addEventListener("click", function (e) {
      var b = e.target.closest("button");
      if (!b) return;
      [].forEach.call(bar.querySelectorAll("button"), function (x) { x.classList.toggle("on", x === b); x.setAttribute("aria-pressed", x === b); });
      f[bar.getAttribute("data-f")] = b.getAttribute("data-v");
      shown = FIRST;
      draw();
    });
  });
  more.addEventListener("click", function () { shown += STEP; draw(); });
  box.classList.add("js");
  draw();
})();
