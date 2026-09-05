(function () {
  var canvas = document.getElementById("scene-particles");
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext("2d");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var palette = ["rgba(34,229,255,", "rgba(245,185,66,", "rgba(255,255,255,"];
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var width, height, particles, raf, resizeTimer;

  function makeParticle(fromBottom) {
    return {
      x: Math.random() * width,
      y: fromBottom ? height + 10 : Math.random() * height,
      r: Math.random() * 1.6 + 0.6,
      speed: Math.random() * 0.35 + 0.08,
      drift: (Math.random() - 0.5) * 0.3,
      color: palette[Math.floor(Math.random() * palette.length)],
      baseAlpha: Math.random() * 0.5 + 0.25,
      twinkleSpeed: Math.random() * 0.02 + 0.005,
      phase: Math.random() * Math.PI * 2,
    };
  }

  function seed() {
    var count = Math.max(35, Math.min(110, Math.floor((width * height) / 16000)));
    particles = [];
    for (var i = 0; i < count; i++) {
      particles.push(makeParticle(false));
    }
  }

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed();
  }

  function draw(time) {
    ctx.clearRect(0, 0, width, height);
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      if (!reduceMotion) {
        p.y -= p.speed;
        p.x += p.drift;
        if (p.y < -10) {
          particles[i] = makeParticle(true);
          p = particles[i];
        }
      }
      var alpha = p.baseAlpha + Math.sin(time * p.twinkleSpeed + p.phase) * 0.2;
      alpha = Math.max(0, Math.min(1, alpha));
      ctx.beginPath();
      ctx.fillStyle = p.color + alpha + ")";
      ctx.shadowColor = p.color + "0.8)";
      ctx.shadowBlur = 6;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    if (!reduceMotion) {
      raf = requestAnimationFrame(draw);
    }
  }

  function start() {
    if (raf) cancelAnimationFrame(raf);
    if (reduceMotion) {
      draw(0);
    } else {
      raf = requestAnimationFrame(draw);
    }
  }

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      if (raf) cancelAnimationFrame(raf);
    } else {
      start();
    }
  });

  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      resize();
    }, 150);
  });

  resize();
  start();
})();
