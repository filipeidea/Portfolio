/* Filipe Meltzer — portfolio.
   All content is already in the HTML. This script only adds interaction:
   mobile menu, home slideshow, project filter, image viewer and gentle reveals.
   If it fails to load, every page still works. */
(function () {
  "use strict";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function pad(n) { return (n < 10 ? "0" : "") + n; }

  /* ---------- header: sticky border + mobile menu ---------- */
  var header = $(".site-header"), btn = $(".menu-btn");
  if (header) {
    var onScroll = function () { header.classList.toggle("scrolled", window.scrollY > 8); };
    window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
  }
  if (btn) {
    btn.hidden = false;
    var setMenu = function (open) {
      document.body.classList.toggle("menu-open", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    };
    btn.addEventListener("click", function () { setMenu(!document.body.classList.contains("menu-open")); });
    $$(".nav a").forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && document.body.classList.contains("menu-open")) { setMenu(false); btn.focus(); }
    });
    window.addEventListener("resize", function () { if (window.innerWidth > 820) setMenu(false); });
  }

  /* ---------- home slideshow ---------- */
  var slides = $$(".hero-slide");
  if (slides.length > 1) {
    var cur = 0, timer = null, controls = $(".hero-controls"), cap = $(".hero-caption"), count = $(".hero-count"), play = $(".hero-play");
    var PAUSE = '<svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true"><rect x="2" y="1" width="2.5" height="10"/><rect x="7.5" y="1" width="2.5" height="10"/></svg>';
    var PLAY = '<svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true"><path d="M2 1l9 5-9 5z"/></svg>';
    controls.hidden = false;
    var load = function (s) {
      var im = $("img", s);
      if (im && im.getAttribute("data-srcset")) {
        im.srcset = im.getAttribute("data-srcset"); im.src = im.getAttribute("data-src");
        im.removeAttribute("data-srcset"); im.removeAttribute("data-src");
      }
    };
    var go = function (i) {
      slides[cur].classList.remove("is-active"); slides[cur].setAttribute("aria-hidden", "true");
      cur = (i + slides.length) % slides.length;
      var s = slides[cur]; load(s); load(slides[(cur + 1) % slides.length]);
      s.classList.add("is-active"); s.removeAttribute("aria-hidden");
      cap.innerHTML = '<a href="' + s.getAttribute("data-href") + '"></a> <span class="mono"></span>';
      cap.firstChild.textContent = s.getAttribute("data-title");
      cap.lastChild.textContent = s.getAttribute("data-location");
      count.textContent = pad(cur + 1) + " / " + pad(slides.length);
    };
    var start = function () { stop(); timer = setInterval(function () { go(cur + 1); }, 6500); play.innerHTML = PAUSE; play.setAttribute("aria-label", "Pause slideshow"); };
    var stop = function () { if (timer) clearInterval(timer); timer = null; play.innerHTML = PLAY; play.setAttribute("aria-label", "Play slideshow"); };
    $(".hero-prev").addEventListener("click", function () { go(cur - 1); if (timer) start(); });
    $(".hero-next").addEventListener("click", function () { go(cur + 1); if (timer) start(); });
    play.addEventListener("click", function () { timer ? stop() : start(); });
    // preload the second slide once the page has loaded, then autoplay unless reduced motion is requested
    window.addEventListener("load", function () { load(slides[1]); });
    if (reduceMotion) stop(); else start();
    document.addEventListener("visibilitychange", function () {
      if (document.hidden && timer) { stop(); play.dataset.resume = "1"; }
      else if (!document.hidden && play.dataset.resume) { delete play.dataset.resume; start(); }
    });
  }

  /* ---------- project filter ---------- */
  var filters = $(".filters");
  if (filters) {
    filters.hidden = false;
    var index = $(".index"), status = $(".filter-status");
    filters.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      var c = b.getAttribute("data-cat");
      $$("button", filters).forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      index.classList.toggle("filtered", c !== "All");
      var n = 0;
      $$(".card", index).forEach(function (card) {
        var show = c === "All" || card.getAttribute("data-cat") === c;
        card.hidden = !show; if (show) { n++; card.classList.add("in"); }
      });
      status.textContent = c === "All" ? "Showing all " + n + " projects" : "Showing " + n + " " + c + " project" + (n > 1 ? "s" : "");
    });
  }

  /* ---------- image viewer ---------- */
  var links = $$("a.zoom");
  if (links.length && window.HTMLDialogElement) {
    var lb = document.createElement("dialog"), items, idx = 0, opener = null;
    lb.className = "lb";
    lb.setAttribute("aria-label", "Image viewer");
    lb.innerHTML =
      '<div class="lb-top"><span class="mono lb-count"></span>' +
      '<button type="button" class="lb-close" aria-label="Close image viewer"><svg width="18" height="18" viewBox="0 0 18 18" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M2 2l14 14M16 2L2 16"/></svg></button></div>' +
      '<div class="lb-stage"><img alt=""></div>' +
      '<div class="lb-bottom"><p class="lb-cap"></p><div class="lb-nav">' +
      '<button type="button" class="lb-prev" aria-label="Previous image"><svg width="16" height="10" viewBox="0 0 16 10" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M16 5H2M6 1L2 5l4 4"/></svg></button>' +
      '<button type="button" class="lb-next" aria-label="Next image"><svg width="16" height="10" viewBox="0 0 16 10" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M0 5h14M10 1l4 4-4 4"/></svg></button>' +
      "</div></div>";
    document.body.appendChild(lb);
    var stage = $(".lb-stage", lb), big = $(".lb-stage img", lb);
    items = links.map(function (a) {
      var im = $("img", a);
      return { href: a.getAttribute("href"), srcset: im.getAttribute("srcset") || im.getAttribute("data-srcset"), alt: im.alt, cap: a.getAttribute("data-caption"), light: a.classList.contains("light") };
    });
    var show = function (i) {
      idx = (i + items.length) % items.length;
      var it = items[idx];
      stage.classList.add("lb-loading"); big.style.opacity = "0";
      big.onload = function () { stage.classList.remove("lb-loading"); big.style.opacity = "1"; };
      big.onerror = function () { stage.classList.remove("lb-loading"); $(".lb-cap", lb).textContent = "This image could not be loaded."; };
      big.className = it.light ? "light" : "";
      big.removeAttribute("srcset");
      if (it.srcset) { big.sizes = "100vw"; big.srcset = it.srcset; }
      big.src = it.href; big.alt = it.alt;
      $(".lb-cap", lb).textContent = it.cap || it.alt;
      $(".lb-count", lb).textContent = pad(idx + 1) + " / " + pad(items.length);
      $(".lb-nav", lb).style.visibility = items.length > 1 ? "visible" : "hidden";
    };
    var close = function () { lb.close(); };
    links.forEach(function (a, i) {
      a.addEventListener("click", function (e) {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return; // let new-tab clicks through
        e.preventDefault(); opener = a; show(i);
        document.documentElement.classList.add("lb-open");
        lb.showModal(); $(".lb-close", lb).focus();
      });
    });
    $(".lb-close", lb).addEventListener("click", close);
    $(".lb-prev", lb).addEventListener("click", function () { show(idx - 1); });
    $(".lb-next", lb).addEventListener("click", function () { show(idx + 1); });
    stage.addEventListener("click", function (e) { if (e.target === stage) close(); });
    lb.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") show(idx + 1);
      if (e.key === "ArrowLeft") show(idx - 1);
    });
    lb.addEventListener("close", function () { document.documentElement.classList.remove("lb-open"); if (opener) opener.focus(); });
    var x0 = null;
    lb.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend", function (e) {
      if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
    });
  }

  /* ---------- map: the city list and the map pins highlight each other ---------- */
  var pins = $$(".pin"), rows = $$(".city-list li");
  if (pins.length && rows.length) {
    // a pin may stand for several cities ("A|B|C"); a row for one
    var cities = function (el) { return el.getAttribute("data-city").split("|"); };
    var has = function (el, c) { return cities(el).indexOf(c) > -1; };
    var mark = function (list, on) {
      pins.concat(rows).forEach(function (el) {
        if (list.some(function (c) { return has(el, c); })) el.classList.toggle("hl", on);
      });
    };
    pins.concat(rows).forEach(function (el) {
      var c = cities(el);
      el.addEventListener("mouseenter", function () { mark(c, true); });
      el.addEventListener("mouseleave", function () { mark(c, false); });
      el.addEventListener("focusin", function () { mark(c, true); });
      el.addEventListener("focusout", function () { mark(c, false); });
    });
    // taps (touch screens): open one card at a time, close by tapping elsewhere
    pins.forEach(function (pin) {
      $(".pin-dot", pin).addEventListener("click", function (e) {
        e.stopPropagation();
        var was = pin.classList.contains("open");
        pins.forEach(function (x) { x.classList.remove("open"); });
        if (!was) pin.classList.add("open");
      });
    });
    // on the list, clicking a city name opens its card on the map (useful where dots sit close together)
    rows.forEach(function (row) {
      var name = $(".cl-city", row);
      name.setAttribute("role", "button"); name.setAttribute("tabindex", "0");
      var open = function (e) {
        e.stopPropagation();
        var c = row.getAttribute("data-city");
        pins.forEach(function (x) { x.classList.toggle("open", has(x, c)); });
        var map = $(".map-frame"), r = map.getBoundingClientRect();
        if (r.top < 0 || r.bottom > window.innerHeight) map.scrollIntoView({ behavior: "smooth", block: "center" });
      };
      name.addEventListener("click", open);
      name.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(e); } });
    });
    document.addEventListener("click", function (e) { if (!e.target.closest(".pin")) pins.forEach(function (x) { x.classList.remove("open"); }); });
    // Escape closes an open card by moving focus off the pin
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      pins.forEach(function (x) { x.classList.remove("open"); });
      if (document.activeElement && document.activeElement.classList.contains("pin-dot")) document.activeElement.blur();
    });
  }

  /* ---------- typology numbers: the projects of each typology open below it ----------
     Hover and keyboard focus are handled in CSS; a click or tap toggles the panel. */
  var typs = $$(".typ-item");
  if (typs.length) {
    var closeTyp = function (except) {
      typs.forEach(function (t) {
        if (t === except) return;
        t.classList.remove("open"); $(".typ-row", t).setAttribute("aria-expanded", "false");
      });
    };
    typs.forEach(function (item) {
      var btn = $(".typ-row", item);
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        var open = !item.classList.contains("open");
        closeTyp(item);
        item.classList.toggle("open", open);
        btn.setAttribute("aria-expanded", String(open));
        if (!open) btn.blur(); // otherwise keyboard focus would keep it open
      });
      item.addEventListener("mouseenter", function () { btn.setAttribute("aria-expanded", "true"); });
      item.addEventListener("mouseleave", function () { if (!item.classList.contains("open")) btn.setAttribute("aria-expanded", "false"); });
    });
    document.addEventListener("click", function (e) { if (!e.target.closest(".typ-item")) closeTyp(null); });
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      closeTyp(null);
      if (document.activeElement && document.activeElement.classList.contains("typ-row")) document.activeElement.blur();
    });
  }

  /* ---------- print button on the résumé ---------- */
  var pb = $(".print-btn");
  if (pb) { pb.hidden = false; pb.addEventListener("click", function () { window.print(); }); }

  /* ---------- gentle reveal of images below the fold ----------
     Anything that has reached or passed the bottom of the screen is shown, so fast
     scrolling or jumping to an anchor can never leave an element hidden. */
  if (!reduceMotion && window.requestAnimationFrame) {
    var pending = $$(".card, .gallery > figure, .gallery > div").filter(function (e) {
      return e.getBoundingClientRect().top > window.innerHeight; // already visible: never hide it
    });
    pending.forEach(function (e) { e.classList.add("reveal"); });
    var ticking = false;
    var check = function () {
      ticking = false;
      var limit = window.innerHeight * 0.94;
      pending = pending.filter(function (e) {
        if (e.getBoundingClientRect().top < limit) { e.classList.add("in"); return false; }
        return true;
      });
      if (!pending.length) window.removeEventListener("scroll", onReveal);
    };
    var onReveal = function () { if (!ticking) { ticking = true; requestAnimationFrame(check); } };
    window.addEventListener("scroll", onReveal, { passive: true });
    window.addEventListener("resize", onReveal);
    window.addEventListener("hashchange", onReveal);
  }
})();
