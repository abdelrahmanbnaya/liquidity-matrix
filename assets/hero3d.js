/* Liquidity Matrix: the home page's 3D liquidity map. Real gold candles and the same untouched highs / lows as the
   market page (data/hero-xauusd.json, rewritten by code with every levels update). Desktop only (900px+ wide, WebGL):
   phones and old browsers never download three.js and keep the page exactly as it was. No tracking, no storage. */
(function () {
  "use strict";
  if (window.__lmHero3d) return;
  window.__lmHero3d = 1;
  var stage = document.getElementById("hero3d");
  if (!stage || !window.matchMedia || !window.matchMedia("(min-width: 900px)").matches) return;
  var probe = document.createElement("canvas");
  if (!(probe.getContext("webgl") || probe.getContext("experimental-webgl"))) return;
  var AR = stage.getAttribute("data-lang") === "ar";
  var MONTHS = AR ? ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"]
    : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  function day(t) { var d = new Date(t * 1000); return d.getUTCDate() + " " + MONTHS[d.getUTCMonth()]; }

  function load(src, done) {
    var s = document.createElement("script");
    s.src = src; s.async = true; s.onload = done; s.onerror = function () {};
    document.head.appendChild(s);
  }

  fetch(stage.getAttribute("data-src"), { cache: "no-cache" })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (data) {
      if (!data || !data.bars || data.bars.length < 30) return;
      load("https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js", function () {
        if (window.THREE) build(data);
      });
    })
    .catch(function () {});

  function build(DATA) {
    var canvas = stage.querySelector("canvas");
    var renderer;
    try { renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true }); } catch (e) { return; }
    stage.hidden = false;
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    var bars = DATA.bars, n = bars.length, last = DATA.last, dg = DATA.digits || 2;
    var levels = (DATA.levels || []).filter(function (l) { return typeof l.price === "number"; });
    var lo = Infinity, hi = -Infinity;
    bars.forEach(function (b) { lo = Math.min(lo, b[3]); hi = Math.max(hi, b[2]); });
    levels.forEach(function (l) { lo = Math.min(lo, l.lo); hi = Math.max(hi, l.hi); });
    var pad = (hi - lo) * 0.06; lo -= pad; hi += pad;
    var W = 26, H = 9;
    function X(i) { return -W / 2 + (i + 0.5) * W / n; }
    function Y(p) { return (p - lo) / (hi - lo) * H - H / 2; }
    var bw = W / n * 0.62, floor = -H / 2 - 0.6;

    var scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0a0a0d, 30, 62);
    var camera = new THREE.PerspectiveCamera(32, 1, 0.1, 200);
    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    var key = new THREE.DirectionalLight(0xffe2a0, 0.9); key.position.set(8, 14, 12); scene.add(key);
    var rim = new THREE.DirectionalLight(0x6688ff, 0.25); rim.position.set(-10, 4, -12); scene.add(rim);
    var grid = new THREE.GridHelper(44, 44, 0x2a2a33, 0x18181e); grid.position.y = floor; scene.add(grid);

    var upMat = new THREE.MeshStandardMaterial({ color: 0x26a69a, roughness: 0.45, metalness: 0.15 });
    var dnMat = new THREE.MeshStandardMaterial({ color: 0xef5350, roughness: 0.45, metalness: 0.15 });
    var parts = [];
    bars.forEach(function (b, i) {
      var mat = b[4] >= b[1] ? upMat : dnMat;
      var top = Y(Math.max(b[1], b[4])), bot = Y(Math.min(b[1], b[4]));
      var body = new THREE.Mesh(new THREE.BoxGeometry(bw, Math.max(0.03, top - bot), bw), mat);
      var wick = new THREE.Mesh(new THREE.BoxGeometry(bw * 0.16, Math.max(0.03, Y(b[2]) - Y(b[3])), bw * 0.16), mat);
      body.position.set(X(i), (top + bot) / 2, 0); wick.position.set(X(i), (Y(b[2]) + Y(b[3])) / 2, 0);
      scene.add(body); scene.add(wick);
      parts.push([body, wick, (top + bot) / 2, (Y(b[2]) + Y(b[3])) / 2]);
    });

    function label(text, color) {
      var c = document.createElement("canvas"), g = c.getContext("2d");
      c.width = 512; c.height = 96;
      g.font = "700 38px JetBrains Mono, Consolas, monospace";
      var w = Math.min(500, g.measureText(text).width + 36);
      g.fillStyle = "rgba(10,10,13,0.88)"; g.strokeStyle = color; g.lineWidth = 4;
      g.beginPath(); if (g.roundRect) g.roundRect(4, 14, w, 68, 14); else g.rect(4, 14, w, 68); g.fill(); g.stroke();
      g.fillStyle = color; g.textBaseline = "middle"; g.fillText(text, 22, 49);
      var s = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthTest: false }));
      s.scale.set(4.4, 0.825, 1); s.center.set(0, 0.5);
      return s;
    }

    var fades = [], t0 = bars[0][0], step = bars[1][0] - bars[0][0];
    levels.forEach(function (l) {
      var above = l.side === "above", col = above ? 0xef5350 : 0x26a69a, css = above ? "#ef5350" : "#26a69a";
      var i = l.t ? Math.max(0, Math.min(n - 1, Math.round((l.t - t0) / step))) : 0;
      var x0 = X(i), x1 = W / 2 + 3, y = Y(l.price);
      var thick = l.zone ? Math.max(0.05, Y(l.hi) - Y(l.lo)) : 0.035;
      var plate = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, 4.2),
        new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false }));
      plate.rotation.x = -Math.PI / 2; plate.position.set((x0 + x1) / 2, y, 0); scene.add(plate);
      var edge = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, thick, 0.035),
        new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0 }));
      edge.position.set((x0 + x1) / 2, l.zone ? (Y(l.hi) + Y(l.lo)) / 2 : y, 2.1); scene.add(edge);
      var price = l.zone ? l.lo.toFixed(dg) + "–" + l.hi.toFixed(dg) : l.price.toFixed(dg);
      var tag = label(price + (l.t ? " · " + day(l.t) : ""), css);
      tag.position.set(x1 + 0.2, y, 2.1); tag.material.opacity = 0; scene.add(tag);
      fades.push([plate.material, 0.16], [edge.material, 0.95], [tag.material, 1]);
    });
    var lastLine = new THREE.Mesh(new THREE.BoxGeometry(W + 6, 0.03, 0.03), new THREE.MeshBasicMaterial({ color: 0xf5c046 }));
    lastLine.position.set(3, Y(last), 0); scene.add(lastLine);
    var lastTag = label(last.toFixed(dg) + (AR ? " آخر سعر" : " last"), "#f5c046");
    lastTag.position.set(W / 2 + 3.2, Y(last), 0); scene.add(lastTag);

    var chip = stage.querySelector(".h3-chip");
    if (chip) chip.textContent = (DATA.symbol || "XAUUSD") + " · " + (DATA.tf || "H4") + " · " + day(bars[0][0]) + " – " +
      day(bars[n - 1][0]);

    var yaw = -0.42, pitch = 0.18, tYaw = yaw, tPitch = pitch, drag = null, start = performance.now(), on = true;
    function size() {
      var r = stage.getBoundingClientRect();
      renderer.setSize(r.width, r.height, false);
      camera.aspect = r.width / Math.max(1, r.height);
      camera.updateProjectionMatrix();
    }
    canvas.addEventListener("pointerdown", function (e) { drag = [e.clientX, e.clientY, tYaw, tPitch]; canvas.setPointerCapture(e.pointerId); });
    canvas.addEventListener("pointermove", function (e) {
      if (!drag) return;
      tYaw = drag[2] - (e.clientX - drag[0]) * 0.006;
      tPitch = Math.max(-0.05, Math.min(0.75, drag[3] + (e.clientY - drag[1]) * 0.004));
    });
    canvas.addEventListener("pointerup", function () { drag = null; });
    canvas.addEventListener("pointercancel", function () { drag = null; });
    if ("IntersectionObserver" in window) {        // off screen: stop drawing (no wasted battery)
      new IntersectionObserver(function (es) {
        var was = on; on = es[0].isIntersecting;
        if (on && !was) requestAnimationFrame(frame);
      }).observe(stage);
    }
    function frame(now) {
      var t = (now - start) / 1000;
      var grow = reduce ? 1 : Math.min(1, t / 1.8);
      parts.forEach(function (p, i) {
        var k = Math.max(0.001, Math.min(1, grow * 1.35 - i / n * 0.35));
        p[0].scale.y = k; p[1].scale.y = k;
        p[0].position.y = p[2] * k + floor * (1 - k); p[1].position.y = p[3] * k + floor * (1 - k);
      });
      var f = reduce ? 1 : Math.max(0, Math.min(1, (t - 1.6) / 0.8));
      fades.forEach(function (m) { m[0].opacity = m[1] * f; });
      if (!drag && !reduce) tYaw = -0.42 + Math.sin(t * 0.18) * 0.3;
      yaw += (tYaw - yaw) * 0.06; pitch += (tPitch - pitch) * 0.06;
      var r = 30;
      camera.position.set(Math.sin(yaw) * Math.cos(pitch) * r + 2, Math.sin(pitch) * r + 1.2, Math.cos(yaw) * Math.cos(pitch) * r);
      camera.lookAt(2.4, 0, 0);
      renderer.render(scene, camera);
      if (on && (!reduce || drag || t < 0.5)) requestAnimationFrame(frame);
    }
    size();
    window.addEventListener("resize", function () { size(); renderer.render(scene, camera); });
    canvas.addEventListener("pointerdown", function () { if (reduce) requestAnimationFrame(frame); });
    requestAnimationFrame(frame);
  }
})();
