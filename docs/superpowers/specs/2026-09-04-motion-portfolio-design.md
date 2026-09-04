# Motion Portfolio Rebuild — Design

**Date:** 2026-09-04
**Status:** Approved

## Context

`nimakondori.github.io` is a fork of the al-folio academic Jekyll theme. Two rounds of restyling (deep-space palette, then a cinematic neural-network background) improved the look but left the underlying al-folio structure intact: five separate academic tabs, Bootstrap/MDB, a whitespace-heavy layout, and almost no motion.

Nima wants the site rebuilt as a single-page, motion-heavy portfolio in the style of the templates sold on motionsites.ai — dramatic full-bleed hero, oversized type, scroll-driven animation throughout — while remaining deployable to `nimakondori.github.io` through the existing GitHub Actions pipeline.

## Decisions

- **Direction:** "Cinematic full-bleed" — full-viewport hero with oversized centered type over the moving scene background; sections reveal on scroll.
- **Structure:** one long scrolling page at `/`, with anchor navigation.
- **Content:** publications and CV stay as full sections (not reduced to outbound links).
- **Engine:** Jekyll stays, so `.github/workflows/deploy.yml` continues to work untouched. Everything al-folio (layouts, includes, SCSS, vendored assets, extra pages) is deleted and rebuilt from scratch.
- **Theme:** dark-only. The light/dark toggle is dropped — a cinematic motion site is designed for one palette, and maintaining a light variant of a full-bleed image treatment adds cost without benefit.

## Page Structure

| # | Section | Content source | Motion |
|---|---------|----------------|--------|
| 00 | Hero | `_config.yml` name/tagline | Split-text headline reveal, parallax scene bg, magnetic CTA, pulsing scroll cue |
| 01 | About | `_pages/home.md` body | Line-by-line text reveal, animated stat counters, portrait parallax |
| 02 | Marquee | `_data/stack.yml` (new) | Infinite ticker, skew on scroll velocity |
| 03 | Work | `_projects/*.md` | Staggered card reveal, hover zoom + glow |
| 04 | Publications | `_bibliography/` via jekyll-scholar | Row stagger, hover highlight |
| 05 | Experience | `_data/cv.yml` | Timeline line draws on scroll, entry stagger, resume PDF download |
| 06 | Contact | `_config.yml` socials | Oversized hover type, social icon pop-in |

## Architecture

**Kept:** `deploy.yml`, `_projects/` collection, `_bibliography/` + jekyll-scholar, `_data/cv.yml`, `assets/pdf/nimakondori_resume.pdf`, `assets/img/` (scene background, profile, project images), the scene background system (`scene_background.liquid`, `_scene.scss`, `scene-particles.js`), and the hidden `/traffic/` page.

**Deleted:** all al-folio layouts, includes, and `_sass` partials; vendored Bootstrap/MDB/Font Awesome/Tabler/search assets; `_pages/{about,publications,projects,repositories,cv,blog,news,teaching,profiles,dropdown,about_einstein}.md`; al-folio demo `_posts/`; theme docs (`CUSTOMIZE.md`, `FAQ.md`, `INSTALL.md`, `CONTRIBUTING.md`, `readme_preview/`, `lighthouse_results/`); al-folio-specific CI workflows (docker publishing, lighthouse-badger, axe, broken-links); the purgecss build step and its config.

**Created:**
- `_layouts/default.liquid` — minimal shell (head, scene background, nav, content, footer, scripts)
- `_layouts/home.liquid` — composes the seven sections
- `_layouts/page.liquid` — minimal wrapper for `/traffic/` and 404
- `_layouts/bib.liquid` — jekyll-scholar entry template (replaces al-folio's)
- `_includes/sections/{hero,about,marquee,work,publications,experience,contact}.liquid`
- `_includes/{head,nav,footer,social}.liquid`
- `_sass/` — hand-written stylesheet (reset, tokens, typography, sections, motion primitives)
- `assets/js/motion.js` — GSAP + ScrollTrigger + Lenis setup and per-section animation

**Motion stack:** GSAP + ScrollTrigger + Lenis, loaded from CDN `<script>` tags. No bundler, no build step added. Every animation is gated behind `prefers-reduced-motion`, which disables scroll-driven motion and renders all content in its final state.

**Dependency trim:** `Gemfile` and `_config.yml` plugin list reduce to `jekyll`, `jekyll-scholar`, and `jekyll-sitemap`. `Gemfile.lock` is gitignored, so CI resolves fresh.

## Risks

- Large deletion surface — done on the `redesign/motion-portfolio` branch, with `bundle exec jekyll build` verified after each phase before anything reaches `master`.
- jekyll-scholar depends on `_layouts/bib.liquid` and the `scholar:` config block; both must be rewritten rather than deleted.
- CDN-loaded motion libraries are a third-party runtime dependency; the site must remain readable if they fail to load (content is in the DOM, animation only enhances).

## Verification

`bundle exec jekyll build` after each phase, then `bundle exec jekyll serve` with a browser pass: hero and every section render, scroll animations fire, publications and CV populate from real data, resume downloads, `/traffic/` still works, no console errors, mobile viewport is clean, and `prefers-reduced-motion` shows a static but complete page.
