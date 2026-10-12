/* Filipe Meltzer — portfolio. Plain JS, no build step.
   Shared header/footer, responsive images, lightbox, and page renderers. */
(function () {
  "use strict";
  document.documentElement.classList.remove("no-js");

  var SITE = window.SITE || {};
  var PROJECTS = window.PROJECTS || [];
  var IMAGES = window.IMAGES || {};
  var page = document.body.getAttribute("data-page");

  /* ---------- helpers ---------- */
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function src(key, w) { return "assets/img/" + key + "-" + w + ".webp"; }
  function largest(key) { var m = IMAGES[key]; return m ? src(key, m.w[m.w.length - 1]) : ""; }
  /* <img> with srcset. opts: sizes, eager, cls */
  function img(key, alt, opts) {
    opts = opts || {};
    var m = IMAGES[key];
    if (!m) return '<div class="missing" role="img" aria-label="' + esc(alt) + '"></div>';
    var set = m.w.map(function (w) { return src(key, w) + " " + w + "w"; }).join(", ");
    var mid = m.w.length > 1 ? m.w[m.w.length - 2] : m.w[0];
    var W = 1000, H = Math.round(W / m.r);
    return '<img src="' + src(key, mid) + '" srcset="' + set + '" sizes="' + (opts.sizes || "100vw") +
      '" width="' + W + '" height="' + H + '" alt="' + esc(alt) + '"' +
      (opts.eager ? ' fetchpriority="high"' : ' loading="lazy"') + ' decoding="async"' +
      (opts.cls ? ' class="' + opts.cls + '"' : "") + ">";
  }
  var ARROW = '<svg width="16" height="10" viewBox="0 0 16 10" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M0 5h14M10 1l4 4-4 4"/></svg>';
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function altFor(p, key) {
    for (var i = 0; i < p.gallery.length; i++) {
      var g = p.gallery[i], list = g.images || [g];
      for (var j = 0; j < list.length; j++) if (list[j].img === key) return list[j].alt;
    }
    return p.title;
  }
  function bySlug(s) { for (var i = 0; i < PROJECTS.length; i++) if (PROJECTS[i].slug === s) return i; return -1; }

  /* ---------- header & footer ---------- */
  var NAV = [
    ["index.html#projects", "Projects", "projects"],
    ["sketchbook.html", "Sketchbook", "sketchbook"],
    ["profile.html", "Profile", "profile"],
    ["resume.html", "Résumé", "resume"],
    ["#contact", "Contact", "contact"]
  ];
  function header() {
    var el = document.getElementById("site-header");
    if (!el) return;
    var current = page === "project" ? "projects" : page;
    el.className = "site-header";
    el.innerHTML =
      '<div class="wrap bar">' +
      '<a class="brand" href="index.html">Filipe Meltzer <small>Architect &amp; Urbanist</small></a>' +
      '<button class="menu-btn" type="button" aria-expanded="false" aria-controls="nav" aria-label="Open menu"><span></span><span></span><span></span></button>' +
      '<nav class="nav" id="nav" aria-label="Main">' +
      NAV.map(function (n) {
        return '<a href="' + n[0] + '"' + (n[2] === current ? ' aria-current="page"' : "") + ">" + n[1] + "</a>";
      }).join("") +
      "</nav></div>";
    var btn = el.querySelector(".menu-btn");
    function setMenu(open) {
      document.body.classList.toggle("menu-open", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    }
    btn.addEventListener("click", function () { setMenu(!document.body.classList.contains("menu-open")); });
    el.querySelectorAll(".nav a").forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && document.body.classList.contains("menu-open")) { setMenu(false); btn.focus(); } });
    var onScroll = function () { el.classList.toggle("scrolled", window.scrollY > 8); };
    window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
  }

  function footer() {
    var el = document.getElementById("contact");
    if (!el) return;
    var links = [];
    if (SITE.email) links.push('<li><a href="mailto:' + esc(SITE.email) + '">' + esc(SITE.email) + "</a></li>");
    if (SITE.linkedin) links.push('<li><a href="' + esc(SITE.linkedin) + '" rel="noopener">LinkedIn</a></li>');
    if (SITE.cv) links.push('<li><a href="' + esc(SITE.cv) + '" download>Download CV (PDF)</a></li>');
    el.className = "site-footer";
    el.innerHTML =
      '<div class="wrap">' +
      '<p class="mono">Contact</p>' +
      '<h2 class="foot-cta">Let’s talk about architecture.</h2>' +
      '<div class="foot-grid">' +
      '<p style="max-width:460px;margin:0;color:#c9c7c0">Open to conversations with architecture practices in Brazil and abroad. The quickest way to reach me is through LinkedIn.</p>' +
      '<div><p class="mono">Reach</p><ul class="foot-links">' + links.join("") + "</ul></div>" +
      '<div><p class="mono">Pages</p><ul class="foot-links">' +
      '<li><a href="index.html#projects">Projects</a></li><li><a href="sketchbook.html">Sketchbook</a></li>' +
      '<li><a href="profile.html">Profile</a></li><li><a href="resume.html">Résumé</a></li></ul></div>' +
      "</div>" +
      '<div class="foot-base mono"><span>© ' + new Date().getFullYear() + " Filipe Meltzer · " + esc(SITE.registration || "") + "</span><span>" + esc(SITE.base || "") + "</span></div>" +
      "</div>";
  }

  /* ---------- lightbox ---------- */
  var lb, lbItems = [], lbIndex = 0, lbReturn = null;
  function buildLightbox() {
    lb = document.createElement("dialog");
    lb.className = "lb";
    lb.setAttribute("aria-label", "Image viewer");
    lb.innerHTML =
      '<div class="lb-top"><span class="mono lb-count"></span>' +
      '<button type="button" class="lb-close" aria-label="Close image viewer"><svg width="18" height="18" viewBox="0 0 18 18" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M2 2l14 14M16 2L2 16"/></svg></button></div>' +
      '<div class="lb-stage"><img alt=""></div>' +
      '<div class="lb-bottom"><p class="lb-cap"></p><div class="lb-nav">' +
      '<button type="button" class="lb-prev" aria-label="Previous image"><svg width="16" height="10" viewBox="0 0 16 10" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M16 5H2M6 1L2 5l4 4"/></svg></button>' +
      '<button type="button" class="lb-next" aria-label="Next image">' + ARROW + "</button></div></div>";
    document.body.appendChild(lb);
    lb.querySelector(".lb-close").addEventListener("click", closeLb);
    lb.querySelector(".lb-prev").addEventListener("click", function () { showLb(lbIndex - 1); });
    lb.querySelector(".lb-next").addEventListener("click", function () { showLb(lbIndex + 1); });
    lb.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") showLb(lbIndex + 1);
      if (e.key === "ArrowLeft") showLb(lbIndex - 1);
    });
    lb.addEventListener("close", function () { document.body.style.overflow = ""; if (lbReturn) lbReturn.focus(); });
    lb.querySelector(".lb-stage").addEventListener("click", function (e) { if (e.target === this) closeLb(); });
    var x0 = null;
    lb.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend", function (e) {
      if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 50) showLb(lbIndex + (dx < 0 ? 1 : -1));
    });
  }
  function showLb(i) {
    var n = lbItems.length; lbIndex = (i + n) % n;
    var it = lbItems[lbIndex], im = lb.querySelector(".lb-stage img"), stage = lb.querySelector(".lb-stage");
    stage.classList.add("lb-loading");
    im.onload = function () { stage.classList.remove("lb-loading"); };
    im.onerror = function () { stage.classList.remove("lb-loading"); lb.querySelector(".lb-cap").textContent = "This image could not be loaded."; };
    im.className = it.light ? "light" : "";
    im.src = largest(it.key); im.alt = it.alt;
    lb.querySelector(".lb-cap").textContent = it.caption || it.alt;
    lb.querySelector(".lb-count").textContent = pad(lbIndex + 1) + " / " + pad(n);
    var multi = n > 1;
    lb.querySelector(".lb-nav").style.visibility = multi ? "visible" : "hidden";
  }
  function openLb(items, i, from) {
    if (!lb) buildLightbox();
    lbItems = items; lbReturn = from || null;
    showLb(i);
    document.body.style.overflow = "hidden";
    if (lb.showModal) lb.showModal(); else lb.setAttribute("open", "");
    lb.querySelector(".lb-close").focus();
  }
  function closeLb() { if (lb.close) lb.close(); else { lb.removeAttribute("open"); document.body.style.overflow = ""; } }
  /* Wire every button.zoom inside root into one lightbox sequence */
  function wireZoom(root) {
    var btns = Array.prototype.slice.call(root.querySelectorAll("button.zoom"));
    var items = btns.map(function (b) {
      return { key: b.getAttribute("data-key"), alt: b.querySelector("img").alt, caption: b.getAttribute("data-caption"), light: b.hasAttribute("data-light") };
    });
    btns.forEach(function (b, i) { b.addEventListener("click", function () { openLb(items, i, b); }); });
  }
  function zoomFig(o, sizes, cls) {
    return '<figure class="' + (cls || "") + '"><button type="button" class="zoom" data-key="' + o.img + '"' +
      (o.caption ? ' data-caption="' + esc(o.caption) + '"' : "") + (o.light ? " data-light" : "") +
      ' aria-label="Enlarge image: ' + esc(o.alt) + '">' + img(o.img, o.alt, { sizes: sizes }) + "</button>" +
      (o.caption ? '<figcaption class="mono">' + esc(o.caption) + "</figcaption>" : "") + "</figure>";
  }

  /* ---------- reveal on scroll ---------- */
  function reveal() {
    var els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) { els.forEach(function (e) { e.classList.add("in"); }); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (e) { io.observe(e); });
  }

  /* ---------- home ---------- */
  var SIZES = ["s-xl", "s-l", "s-r", "s-m", "s-a", "s-b"];
  function home() {
    // hero sequence
    var heroKeys = ["urucuca/canopy", "monolyt/front", "quinta/approach", "bvv/pool"];
    var heroProjects = ["masterplan-urucuca", "monolyt", "quinta", "casa-bvv"];
    var frame = document.getElementById("hero-frame");
    if (frame) {
      frame.innerHTML = heroKeys.map(function (k, i) {
        var p = PROJECTS[bySlug(heroProjects[i])];
        return '<div class="hero-slide' + (i === 0 ? " is-active" : "") + '" aria-hidden="' + (i === 0 ? "false" : "true") + '">' +
          img(k, p ? altFor(p, k) : "", { eager: i === 0, sizes: "100vw" }) + "</div>";
      }).join("");
      var slides = frame.querySelectorAll(".hero-slide"), cur = 0, timer = null;
      var cap = document.getElementById("hero-caption"), count = document.getElementById("hero-count");
      var playBtn = document.getElementById("hero-play");
      var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      function go(i) {
        slides[cur].classList.remove("is-active"); slides[cur].setAttribute("aria-hidden", "true");
        cur = (i + slides.length) % slides.length;
        slides[cur].classList.add("is-active"); slides[cur].setAttribute("aria-hidden", "false");
        var p = PROJECTS[bySlug(heroProjects[cur])];
        cap.innerHTML = '<a href="project.html?p=' + p.slug + '">' + esc(p.title) + '</a><span class="mono">' + esc(p.location) + "</span>";
        count.textContent = pad(cur + 1) + " / " + pad(slides.length);
      }
      function play() { stop(); timer = setInterval(function () { go(cur + 1); }, 6500); playBtn.setAttribute("aria-label", "Pause slideshow"); playBtn.innerHTML = PAUSE; }
      function stop() { if (timer) clearInterval(timer); timer = null; playBtn.setAttribute("aria-label", "Play slideshow"); playBtn.innerHTML = PLAY; }
      var PAUSE = '<svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true"><rect x="2" y="1" width="2.5" height="10"/><rect x="7.5" y="1" width="2.5" height="10"/></svg>';
      var PLAY = '<svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true"><path d="M2 1l9 5-9 5z"/></svg>';
      document.getElementById("hero-prev").addEventListener("click", function () { go(cur - 1); if (timer) play(); });
      document.getElementById("hero-next").addEventListener("click", function () { go(cur + 1); if (timer) play(); });
      playBtn.addEventListener("click", function () { timer ? stop() : play(); });
      go(0);
      if (!reduce) play(); else stop();
      document.addEventListener("visibilitychange", function () { if (document.hidden && timer) { clearInterval(timer); timer = "paused"; } else if (timer === "paused") play(); });
    }

    // project index
    var list = document.getElementById("index");
    if (list) {
      list.innerHTML = PROJECTS.map(function (p, i) {
        var size = SIZES[i % SIZES.length];
        var sizes = size === "s-xl" ? "100vw" : "(min-width: 760px) 60vw, 100vw";
        return '<a class="card reveal ' + size + '" data-cat="' + esc(p.category) + '" href="project.html?p=' + p.slug + '">' +
          '<div class="ph">' + img(p.cover, "", { sizes: sizes }) + "</div>" +
          '<div class="meta"><span class="num">' + pad(i + 1) + "</span>" +
          "<h3>" + esc(p.title) + "</h3>" +
          '<span class="sub">' + esc(p.typology) + " · " + esc(p.location) + (p.year ? " · " + esc(p.year) : "") + "</span>" +
          (p.awards && p.awards.length ? '<span class="award">' + (p.awards.length > 1 ? p.awards.length + " awards" : "Award") + "</span>" : "") +
          "</div></a>";
      }).join("");
      var cats = ["All"];
      PROJECTS.forEach(function (p) { if (cats.indexOf(p.category) < 0) cats.push(p.category); });
      var f = document.getElementById("filters");
      f.innerHTML = cats.map(function (c) {
        var n = c === "All" ? PROJECTS.length : PROJECTS.filter(function (p) { return p.category === c; }).length;
        return '<button type="button" aria-pressed="' + (c === "All") + '" data-cat="' + esc(c) + '">' + esc(c) + "<sup>" + n + "</sup></button>";
      }).join("");
      f.addEventListener("click", function (e) {
        var b = e.target.closest("button"); if (!b) return;
        var c = b.getAttribute("data-cat");
        f.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        list.classList.toggle("filtered", c !== "All");
        list.querySelectorAll(".card").forEach(function (card) {
          card.hidden = c !== "All" && card.getAttribute("data-cat") !== c;
          card.classList.add("in");
        });
        document.getElementById("filter-status").textContent = c === "All" ? "Showing all projects" : "Showing " + c + " projects";
      });
    }
  }

  /* ---------- project page ---------- */
  function project() {
    var main = document.getElementById("main");
    var slug = new URLSearchParams(location.search).get("p");
    var i = bySlug(slug);
    if (i < 0) {
      document.title = "Project not found — Filipe Meltzer";
      main.innerHTML = '<div class="wrap notice"><p class="mono">Not found</p><h1 class="h1">This project could not be found.</h1>' +
        '<p style="margin-top:24px"><a class="link-arrow" href="index.html#projects">See all projects ' + ARROW + "</a></p></div>";
      return;
    }
    var p = PROJECTS[i], prev = PROJECTS[(i - 1 + PROJECTS.length) % PROJECTS.length], next = PROJECTS[(i + 1) % PROJECTS.length];
    document.title = p.title + " — Filipe Meltzer, Architect & Urbanist";
    var md = document.querySelector('meta[name="description"]'); if (md) md.setAttribute("content", p.summary);

    var facts = [];
    function fact(label, html) { if (html) facts.push("<div><dt>" + label + "</dt><dd>" + html + "</dd></div>"); }
    fact("Location", esc(p.location));
    fact("Typology", esc(p.typology));
    fact("Year", p.year ? esc(p.year) + (p.yearNote ? ' <span style="color:var(--muted)">(' + esc(p.yearNote) + ")</span>" : "") : "");
    fact("Area", p.area ? esc(p.area) : "");
    fact("Practice", esc(p.practice));
    fact("My role", p.stages && p.stages.length ? '<div class="stages">' + p.stages.map(function (s) { return "<span>" + esc(s) + "</span>"; }).join("") + "</div>" : "");
    fact("Awards", p.awards && p.awards.length ? "<ul>" + p.awards.map(function (a) { return "<li>" + esc(a) + "</li>"; }).join("") + "</ul>" : "");
    fact("Published", p.publications && p.publications.length ? "<ul>" + p.publications.map(function (x) {
      return "<li>" + (x.url ? '<a href="' + esc(x.url) + '" rel="noopener">' + esc(x.label) + "</a>" : esc(x.label)) + "</li>";
    }).join("") + "</ul>" : "");

    var team = p.team ? esc(p.team).replace("Filipe Meltzer", "<strong>Filipe Meltzer</strong>") : "";
    var gallery = p.gallery.filter(function (g) { return g.img !== p.cover; }).map(function (g) {
      if (g.layout === "pair" || g.layout === "trio") {
        return '<div class="g-' + g.layout + ' reveal">' + g.images.map(function (o) {
          return zoomFig(o, g.layout === "pair" ? "(min-width: 760px) 50vw, 100vw" : "(min-width: 760px) 33vw, 100vw", o.caption ? "drawing" : "");
        }).join("") + "</div>";
      }
      var r = IMAGES[g.img] ? IMAGES[g.img].r : 1.6;
      var cls = "g-" + g.layout + (g.tall || (g.layout !== "small" && r < 1.25) ? " tall" : "") + (g.caption ? " drawing" : "") + " reveal";
      return zoomFig(g, g.layout === "small" ? "(min-width: 760px) 58vw, 100vw" : "100vw", cls);
    }).join("");

    main.innerHTML =
      '<header class="wrap p-head">' +
      '<nav class="crumbs mono" aria-label="Breadcrumb"><a href="index.html#projects">Projects</a><span aria-hidden="true">/</span><span>' + pad(i + 1) + " of " + pad(PROJECTS.length) + "</span></nav>" +
      '<h1 class="h1">' + esc(p.title) + "</h1>" +
      '<p class="lede">' + esc(p.summary) + "</p></header>" +
      '<div class="p-hero"><button type="button" class="zoom" style="all:unset;display:block;width:100%;cursor:zoom-in" data-key="' + p.cover + '" aria-label="Enlarge cover image">' +
      img(p.cover, "", { eager: true, sizes: "100vw" }) + "</button></div>" +
      '<div class="wrap"><div class="p-body">' +
      '<dl class="facts">' + facts.join("") + "</dl>" +
      '<div class="p-text"><div class="prose">' + p.description.map(function (t) { return "<p>" + esc(t) + "</p>"; }).join("") + "</div>" +
      (team || p.credit ? '<div class="credits">' + (team ? '<p class="mono">Team</p><p>' + team + "</p>" : "") + (p.credit ? "<p>" + esc(p.credit) + "</p>" : "") + "</div>" : "") +
      "</div></div>" +
      '<section class="gallery" aria-label="Project images">' + gallery + "</section>" +
      '<nav class="pn" aria-label="More projects">' +
      '<a href="project.html?p=' + prev.slug + '"><span class="mono">Previous</span><span class="h3">' + esc(prev.title) + "</span></a>" +
      '<a href="project.html?p=' + next.slug + '"><span class="mono">Next</span><span class="h3">' + esc(next.title) + "</span></a>" +
      "</nav></div>";
    // the hero joins the same lightbox sequence as the gallery
    main.querySelector(".p-hero img").alt = altFor(p, p.cover);
    wireZoom(main);
  }

  /* ---------- generic zoom pages (sketchbook, profile) ---------- */
  function zoomPage() {
    document.querySelectorAll("[data-zoom]").forEach(function (fig) {
      var key = fig.getAttribute("data-zoom"), alt = fig.getAttribute("data-alt"), cap = fig.getAttribute("data-caption");
      fig.innerHTML = '<button type="button" class="zoom" data-key="' + key + '" data-light' + (cap ? ' data-caption="' + esc(cap) + '"' : "") +
        ' aria-label="Enlarge image: ' + esc(alt) + '">' + img(key, alt, { sizes: fig.getAttribute("data-sizes") || "(min-width: 760px) 50vw, 100vw" }) + "</button>" +
        (cap ? '<figcaption class="mono">' + esc(cap) + "</figcaption>" : "");
    });
    document.querySelectorAll("[data-img]").forEach(function (el) {
      el.innerHTML = img(el.getAttribute("data-img"), el.getAttribute("data-alt") || "", { sizes: el.getAttribute("data-sizes") || "50vw" });
    });
    document.querySelectorAll("[data-zoom-group]").forEach(wireZoom);
  }

  function siteBits() {
    document.querySelectorAll("[data-site]").forEach(function (el) {
      var k = el.getAttribute("data-site"), v = SITE[k];
      if (!v) { el.hidden = true; return; }
      if (k === "email") { el.innerHTML = '<a href="mailto:' + esc(v) + '">' + esc(v) + "</a>"; }
    });
  }

  header();
  if (page === "home") home();
  if (page === "project") project();
  zoomPage();
  siteBits();
  footer();
  reveal();
})();
