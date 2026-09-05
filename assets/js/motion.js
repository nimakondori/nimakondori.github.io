/**
 * Motion layer: scroll-driven animation for the one-page portfolio.
 *
 * Everything here is an enhancement — the page is fully readable without it.
 * If GSAP fails to load, or the visitor prefers reduced motion, we bail out
 * after making sure nothing is left stuck in a hidden state.
 */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGSAP = typeof window.gsap !== "undefined";

  window.__motionReady = true;

  function revealAll() {
    document.querySelectorAll("[data-reveal], [data-split]").forEach(function (el) {
      el.style.opacity = "1";
    });
  }

  /* Nav: solid bar once scrolled, plus mobile menu toggle */
  function initNav() {
    var nav = document.getElementById("nav");
    var toggle = document.getElementById("nav-toggle");
    var mobile = document.getElementById("nav-mobile");

    if (nav) {
      var onScroll = function () {
        nav.classList.toggle("is-stuck", window.scrollY > 40);
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }

    if (toggle && mobile) {
      toggle.addEventListener("click", function () {
        var open = toggle.getAttribute("aria-expanded") === "true";
        toggle.setAttribute("aria-expanded", String(!open));
        toggle.setAttribute("aria-label", open ? "Open menu" : "Close menu");
        mobile.hidden = open;
      });

      mobile.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", function () {
          toggle.setAttribute("aria-expanded", "false");
          toggle.setAttribute("aria-label", "Open menu");
          mobile.hidden = true;
        });
      });
    }
  }

  /* Cursor-following label over project cards */
  function initCursorLabel() {
    if (window.matchMedia("(hover: none)").matches) return;

    var targets = document.querySelectorAll("[data-cursor]");
    if (!targets.length) return;

    var label = document.createElement("div");
    label.className = "cursor-label";
    document.body.appendChild(label);

    var move = function (e) {
      label.style.left = e.clientX + "px";
      label.style.top = e.clientY + "px";
    };

    targets.forEach(function (target) {
      target.addEventListener("mouseenter", function () {
        label.textContent = target.getAttribute("data-cursor");
        label.classList.add("is-visible");
        window.addEventListener("mousemove", move);
      });
      target.addEventListener("mouseleave", function () {
        label.classList.remove("is-visible");
        window.removeEventListener("mousemove", move);
      });
    });
  }

  initNav();

  if (reduceMotion || !hasGSAP) {
    revealAll();
    document.documentElement.classList.remove("js");
    initCursorLabel();
    return;
  }

  var gsap = window.gsap;
  var ScrollTrigger = window.ScrollTrigger;
  if (ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  /* Lenis smooth scrolling, wired into ScrollTrigger */
  var LenisCtor = window.Lenis || (window.lenis && window.lenis.default);
  if (LenisCtor && ScrollTrigger) {
    var lenis = new LenisCtor({ duration: 1.05, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (time) {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    document.querySelectorAll('a[href^="/#"], a[href^="#"]').forEach(function (link) {
      link.addEventListener("click", function (e) {
        var id = link.getAttribute("href").replace("/", "");
        if (id.length < 2) return;
        var target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        lenis.scrollTo(target, { offset: -60 });
      });
    });
  }

  /* Hero: headline lines rise in, then supporting content */
  var heroLines = document.querySelectorAll(".hero [data-split]");
  var heroRest = document.querySelectorAll(".hero [data-reveal]");
  var intro = gsap.timeline({ defaults: { ease: "power3.out" } });

  if (heroLines.length) {
    gsap.set(heroLines, { yPercent: 110, opacity: 1 });
    intro.from(".hero__eyebrow", { opacity: 0, y: 16, duration: 0.7 }, 0.15);
    intro.to(heroLines, { yPercent: 0, duration: 1.05, stagger: 0.09 }, 0.25);
  }
  if (heroRest.length) {
    intro.to(heroRest, { opacity: 1, y: 0, duration: 0.8, stagger: 0.08 }, 0.7);
    gsap.set(heroRest, { y: 18 });
  }

  if (!ScrollTrigger) {
    revealAll();
    initCursorLabel();
    return;
  }

  /* Generic reveal-on-scroll for everything outside the hero */
  gsap.utils.toArray("[data-reveal]").forEach(function (el) {
    if (el.closest(".hero")) return;
    gsap.fromTo(
      el,
      { opacity: 0, y: 28 },
      {
        opacity: 1,
        y: 0,
        duration: 0.85,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      }
    );
  });

  /* Contact headline lines */
  gsap.utils.toArray(".contact [data-split]").forEach(function (el, i) {
    gsap.fromTo(
      el,
      { opacity: 0, yPercent: 60 },
      {
        opacity: 1,
        yPercent: 0,
        duration: 1,
        ease: "power3.out",
        delay: i * 0.08,
        scrollTrigger: { trigger: ".contact__headline", start: "top 85%", once: true },
      }
    );
  });

  /* Hero parallax — content drifts as you scroll away */
  gsap.to(".hero__inner", {
    yPercent: 18,
    opacity: 0.25,
    ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
  });

  /* Portrait parallax */
  gsap.utils.toArray("[data-parallax]").forEach(function (el) {
    var strength = parseFloat(el.getAttribute("data-parallax")) || 0.1;
    gsap.to(el, {
      yPercent: -strength * 100,
      ease: "none",
      scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
    });
  });

  /* Counting stats */
  gsap.utils.toArray("[data-count]").forEach(function (el) {
    var end = parseFloat(el.getAttribute("data-count")) || 0;
    var obj = { val: 0 };
    gsap.to(obj, {
      val: end,
      duration: 1.6,
      ease: "power2.out",
      scrollTrigger: { trigger: el, start: "top 90%", once: true },
      onUpdate: function () {
        el.textContent = Math.round(obj.val);
      },
      onComplete: function () {
        var suffix = el.getAttribute("data-count-suffix");
        el.textContent = end + (suffix === null ? "+" : suffix);
      },
    });
  });

  /* Marquee: continuous drift, nudged by scroll velocity */
  var track = document.getElementById("marquee-track");
  if (track) {
    var groupWidth = track.firstElementChild ? track.firstElementChild.offsetWidth : 0;
    if (groupWidth) {
      var marquee = gsap.to(track, {
        x: -groupWidth,
        duration: 26,
        ease: "none",
        repeat: -1,
      });

      ScrollTrigger.create({
        trigger: ".marquee",
        start: "top bottom",
        end: "bottom top",
        onUpdate: function (self) {
          var velocity = gsap.utils.clamp(-3, 3, self.getVelocity() / 320);
          gsap.to(marquee, { timeScale: 1 + Math.abs(velocity), duration: 0.4, overwrite: true });
          gsap.to(track, { skewX: velocity * 1.6, duration: 0.4, overwrite: true });
        },
        onLeave: function () {
          gsap.to(track, { skewX: 0, duration: 0.4 });
        },
      });
    }
  }

  /* Timeline line draws itself as the section scrolls past */
  var progress = document.getElementById("timeline-progress");
  if (progress) {
    gsap.to(progress, {
      height: "100%",
      ease: "none",
      scrollTrigger: {
        trigger: "#timeline",
        start: "top 65%",
        end: "bottom 75%",
        scrub: true,
      },
    });
  }

  /* Magnetic buttons */
  if (!window.matchMedia("(hover: none)").matches) {
    document.querySelectorAll("[data-magnetic]").forEach(function (el) {
      el.addEventListener("mousemove", function (e) {
        var rect = el.getBoundingClientRect();
        var mx = e.clientX - rect.left - rect.width / 2;
        var my = e.clientY - rect.top - rect.height / 2;
        gsap.to(el, { x: mx * 0.25, y: my * 0.32, duration: 0.5, ease: "power3.out" });
      });
      el.addEventListener("mouseleave", function () {
        gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.4)" });
      });
    });
  }

  initCursorLabel();
})();
