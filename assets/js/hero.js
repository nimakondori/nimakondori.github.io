/**
 * Hero layer: the particle name (act 1) and the live agent-eval console (act 2).
 *
 * Both are enhancements. With reduced motion or no canvas, the hero shows a
 * static name and the console shows its final state.
 */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------------------------
   * Particle name
   * ------------------------------------------------------------------------- */
  function initParticles() {
    var hero = document.getElementById("hero");
    var canvas = document.getElementById("hero-particles");
    if (!hero || !canvas || !canvas.getContext || reduceMotion) {
      if (hero) hero.classList.add("is-static");
      return;
    }

    var ctx = canvas.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var first = hero.querySelector(".hero__name-fallback");
    var names = (first ? first.innerHTML : "Nima<br>Kondori").split(/<br\s*\/?>/i);
    // HSL anchors sampled across the name, left to right: violet, teal, pink, ice
    var palette = [
      [250, 90, 78],
      [176, 82, 70],
      [326, 95, 76],
      [195, 90, 82],
    ];
    var width, height, particles = [], raf = null, visible = true, resizeTimer;
    var pointer = { x: -9999, y: -9999 };

    function build() {
      width = hero.clientWidth;
      height = hero.clientHeight;
      if (!width || !height) return;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      var off = document.createElement("canvas");
      var o = off.getContext("2d", { willReadFrequently: true });
      off.width = width;
      off.height = height;

      var line1 = names[0].trim().toUpperCase();
      var line2 = (names[1] || "").trim().toUpperCase();
      // Fit the longer line to ~86% of the width, capped for large screens
      o.font = '700 100px "Space Grotesk", sans-serif';
      var widest = Math.max(o.measureText(line1).width, o.measureText(line2).width) || 1;
      var size = Math.min((100 * width * 0.86) / widest, height / 4.2, 190);
      var centerY = height * 0.4;
      o.fillStyle = "#fff";
      o.textAlign = "center";
      o.textBaseline = "middle";
      o.font = "700 " + size + 'px "Space Grotesk", sans-serif';
      o.fillText(line1, width / 2, centerY - size * 0.48);
      o.fillText(line2, width / 2, centerY + size * 0.48);

      var data = o.getImageData(0, 0, width, height).data;
      var gap = width < 600 ? 3 : width < 1000 ? 4 : 5;
      var next = [];
      for (var y = 0; y < height; y += gap) {
        for (var x = 0; x < width; x += gap) {
          if (data[(y * width + x) * 4 + 3] < 128) continue;
          var t = x / width + Math.sin(y / 60) * 0.08;
          var c = palette[Math.max(0, Math.min(3, Math.floor(t * 4)))];
          var prev = particles[next.length];
          next.push({
            hx: x,
            hy: y,
            x: prev ? prev.x : Math.random() * width,
            y: prev ? prev.y : Math.random() * height,
            vx: 0,
            vy: 0,
            c: c,
          });
        }
      }
      particles = next;
      pointer.r = Math.max(70, Math.min(110, width / 13));
    }

    function frame() {
      ctx.clearRect(0, 0, width, height);
      var r2 = pointer.r * pointer.r;
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        var dx = p.x - pointer.x;
        var dy = p.y - pointer.y;
        var d2 = dx * dx + dy * dy;
        if (d2 < r2) {
          var d = Math.sqrt(d2) || 1;
          var f = ((r2 - d2) / r2) * 6;
          p.vx += (dx / d) * f;
          p.vy += (dy / d) * f;
        }
        p.vx = (p.vx + (p.hx - p.x) * 0.04) * 0.84;
        p.vy = (p.vy + (p.hy - p.y) * 0.04) * 0.84;
        p.x += p.vx;
        p.y += p.vy;
        var speed = Math.min(1, (Math.abs(p.vx) + Math.abs(p.vy)) / 3);
        ctx.fillStyle = "hsla(" + p.c[0] + "," + p.c[1] + "%," + (p.c[2] + speed * 15) + "%,0.88)";
        ctx.fillRect(p.x, p.y, 2.2, 2.2);
      }
      raf = visible && !document.hidden ? requestAnimationFrame(frame) : null;
    }

    function start() {
      if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame);
    }

    function setPointer(clientX, clientY) {
      var rect = canvas.getBoundingClientRect();
      pointer.x = clientX - rect.left;
      pointer.y = clientY - rect.top;
    }

    hero.addEventListener("mousemove", function (e) {
      setPointer(e.clientX, e.clientY);
    });
    hero.addEventListener("mouseleave", function () {
      pointer.x = pointer.y = -9999;
    });
    hero.addEventListener(
      "touchmove",
      function (e) {
        if (e.touches[0]) setPointer(e.touches[0].clientX, e.touches[0].clientY);
      },
      { passive: true }
    );
    hero.addEventListener("touchend", function () {
      pointer.x = pointer.y = -9999;
    });

    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      start();
    }).observe(hero);

    document.addEventListener("visibilitychange", start);

    var lastWidth = 0;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        // Mobile browsers resize on URL-bar show/hide; only rebuild on width changes
        if (hero.clientWidth === lastWidth) return;
        lastWidth = hero.clientWidth;
        build();
      }, 150);
    });

    var fontReady = document.fonts && document.fonts.load ? document.fonts.load('700 100px "Space Grotesk"') : Promise.resolve();
    fontReady
      .catch(function () {})
      .then(function () {
        lastWidth = hero.clientWidth;
        build();
        if (!particles.length) {
          hero.classList.add("is-static");
          return;
        }
        start();
      });
  }

  /* ---------------------------------------------------------------------------
   * Agent-eval console
   * ------------------------------------------------------------------------- */
  var LINES = [
    ["is-cmd", "$ nima eval copilot-agents --sessions 100k"],
    ["is-step", "→ taxonomy: intent × outcome × difficulty"],
    ["", "  labelling sessions with an LLM panel…"],
    ["is-ok", "  ✓ intent consistency  90%+ per axis"],
    ["is-ok", "  ✓ outcome grader      task completion"],
    ["is-warn", "  ! offline ≠ online    gaps in benchmark mix"],
    ["is-step", "→ distilling classifier to a GNN"],
    ["is-ok", "  ✓ accuracy preserved  at ~2% of the cost"],
    ["", "  routing unhappy sessions to failure analysis…"],
    ["is-ok", "  ✓ feeding benchmark selection for hillclimbing"],
  ];

  function formatCount(el, value) {
    var fmt = el.getAttribute("data-format");
    var text = fmt === "k" ? Math.round(value / 1000) + "k" : String(Math.round(value));
    return (el.getAttribute("data-prefix") || "") + text + (el.getAttribute("data-suffix") || "");
  }

  function initConsole() {
    var consoleEl = document.getElementById("console");
    var log = document.getElementById("console-log");
    if (!consoleEl || !log) return;

    var counters = consoleEl.querySelectorAll("[data-console-count]");

    function renderFinal() {
      log.innerHTML = "";
      LINES.forEach(function (line) {
        var div = document.createElement("div");
        div.className = line[0];
        div.textContent = line[1];
        log.appendChild(div);
      });
    }

    if (reduceMotion) {
      renderFinal();
      return;
    }

    var lineIndex = 0, charIndex = 0, current = null, timer = null, countStart = null;

    function tickCounters(now) {
      if (countStart === null) return;
      var k = Math.min(1, (now - countStart) / 6500);
      var eased = 1 - Math.pow(1 - k, 3);
      counters.forEach(function (el) {
        var to = parseFloat(el.getAttribute("data-console-count"));
        var from = parseFloat(el.getAttribute("data-from") || "0");
        el.textContent = formatCount(el, from + (to - from) * eased);
      });
      if (k < 1) requestAnimationFrame(tickCounters);
    }

    function reset() {
      clearTimeout(timer);
      log.innerHTML = "";
      lineIndex = 0;
      charIndex = 0;
      countStart = null;
      counters.forEach(function (el) {
        el.textContent = formatCount(el, parseFloat(el.getAttribute("data-from") || "0"));
      });
    }

    function step() {
      if (lineIndex >= LINES.length) {
        var caret = document.createElement("span");
        caret.className = "console__caret";
        log.appendChild(caret);
        timer = setTimeout(function () {
          reset();
          step();
        }, 6000);
        return;
      }
      var line = LINES[lineIndex];
      if (charIndex === 0) {
        current = document.createElement("div");
        current.className = line[0];
        log.appendChild(current);
        while (log.scrollHeight > log.clientHeight && log.children.length > 1) {
          log.removeChild(log.firstChild);
        }
      }
      current.textContent = line[1].slice(0, ++charIndex);
      if (charIndex >= line[1].length) {
        lineIndex++;
        charIndex = 0;
        if (lineIndex === 1) {
          countStart = performance.now();
          requestAnimationFrame(tickCounters);
        }
        timer = setTimeout(step, 300);
      } else {
        timer = setTimeout(step, line[0] === "is-cmd" ? 34 : 11);
      }
    }

    var started = false;
    new IntersectionObserver(
      function (entries) {
        if (entries[0].isIntersecting && !started) {
          started = true;
          reset();
          step();
        }
      },
      { threshold: 0.4 }
    ).observe(consoleEl);
  }

  /* ---------------------------------------------------------------------------
   * Cursor light + glass tilt
   * ------------------------------------------------------------------------- */
  function initPointerEffects() {
    if (reduceMotion || window.matchMedia("(hover: none)").matches) return;

    var spot = document.getElementById("scene-spot");
    var tilts = document.querySelectorAll("[data-tilt]");

    window.addEventListener(
      "mousemove",
      function (e) {
        if (spot) {
          spot.classList.add("is-on");
          spot.style.transform = "translate(" + e.clientX + "px," + e.clientY + "px)";
        }
        tilts.forEach(function (el) {
          var r = el.getBoundingClientRect();
          if (r.bottom < 0 || r.top > window.innerHeight) return;
          var rx = (e.clientY - (r.top + r.height / 2)) / -60;
          var ry = (e.clientX - (r.left + r.width / 2)) / 60;
          rx = Math.max(-6, Math.min(6, rx));
          ry = Math.max(-6, Math.min(6, ry));
          el.style.transform = "perspective(1200px) rotateX(" + rx + "deg) rotateY(" + ry + "deg)";
        });
      },
      { passive: true }
    );

    document.addEventListener("mouseleave", function () {
      if (spot) spot.classList.remove("is-on");
      tilts.forEach(function (el) {
        el.style.transform = "";
      });
    });
  }

  initParticles();
  initConsole();
  initPointerEffects();
})();
