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
      // the link holds the image, or describes it in data- attributes (Sketchbook)
      return { href: a.getAttribute("href"), srcset: im ? im.getAttribute("srcset") || im.getAttribute("data-srcset") : a.getAttribute("data-srcset"), alt: im ? im.alt : a.getAttribute("data-alt") || "", cap: a.getAttribute("data-caption"), light: a.classList.contains("light") };
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

  /* ---------- Sketchbook: each drawing draws itself as its scene scrolls past ----------
     Every pixel has a moment (0..1) in a time map made by tools/build_draw.py. The
     pixels are sorted by that moment once; scrolling then only copies the pixels between
     the last moment and the new one. Only the scenes near the screen keep their data. */
  var scenes = $$(".dw-scene[data-draw]");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var canDraw = (function () { try { var c = document.createElement("canvas"); return !!(c.getContext && c.getContext("2d")); } catch (e) { return false; } })();
  if (scenes.length && !reduce && canDraw) {
    document.documentElement.classList.add("dw-on");
    var hint = $(".dw-hint"); if (hint) hint.hidden = false;
    var loadImg = function (src) {
      return new Promise(function (ok, bad) { var im = new Image(); im.decoding = "async"; im.onload = function () { ok(im); }; im.onerror = bad; im.src = src; });
    };
    var pixels = function (im, w, h) {
      var c = document.createElement("canvas"); c.width = w; c.height = h;
      var x = c.getContext("2d", { willReadFrequently: true }); x.drawImage(im, 0, 0, w, h);
      return x.getImageData(0, 0, w, h).data;
    };
    var S = scenes.map(function (el) {
      var w = +el.getAttribute("data-w"), h = +el.getAttribute("data-h");
      var art = $(".dw-art", el), cv = document.createElement("canvas");
      cv.width = w; cv.height = h; cv.setAttribute("aria-hidden", "true");
      art.appendChild(cv);
      var bar = document.createElement("div"); bar.className = "dw-progress"; bar.innerHTML = "<span></span>";
      $(".dw-steps", el).after(bar);
      return { el: el, w: w, h: h, cv: cv, ctx: cv.getContext("2d"), bar: $("span", bar), steps: $$(".dw-steps li", el),
        base: el.getAttribute("data-draw"), state: 0, t: -1 };
    });
    var build = function (sc) {
      sc.state = 1;
      /* Events: "pixel p takes its colour from source s at moment k" (k in 1/65535).
         One source: the drawing itself. Pencil-then-colour drawings (data-split): first the
         pencil sheet (source 0, moment in red+green), then the coloured sheet (source 1,
         moment in blue, between split and 0.98). */
      var split = sc.el.hasAttribute("data-split") ? +sc.el.getAttribute("data-split") : -1;
      var files = [loadImg(sc.base + ".webp"), loadImg(sc.base + "-t.webp")];
      if (split >= 0) files.push(loadImg(sc.base + "-a.webp"));
      Promise.all(files).then(function (ims) {
        if (sc.state !== 1) return;
        var w = sc.w, h = sc.h, n = w * h, pair = split >= 0;
        var srcB = pixels(ims[0], w, h), map = pixels(ims[1], w, h), srcA = pair ? pixels(ims[2], w, h) : srcB;
        var tA = new Uint16Array(n), tB = pair ? new Uint16Array(n) : null, count = new Uint32Array(65537), i, v, b, m = 0;
        for (i = 0; i < n; i++) {
          v = (map[i * 4] << 8) | map[i * 4 + 1];
          if (!pair) { if (v === 0) v = 64880; tA[i] = v; count[v + 1]++; m++; continue; } // paper shows its faint tints last
          if (v) { tA[i] = v; count[v + 1]++; m++; }
          b = map[i * 4 + 2];
          if (b) { v = Math.round((split + (b - 1) / 254 * (0.98 - split)) * 65535); tB[i] = v; count[v + 1]++; m++; }
        }
        for (i = 1; i < 65537; i++) count[i] += count[i - 1];  // count[k] = events before moment k
        var ev = new Uint32Array(m), pos = count.slice(0, 65536);
        for (i = 0; i < n; i++) {
          if (pair) {
            if (tA[i]) ev[pos[tA[i]]++] = i * 2;
            if (tB[i]) ev[pos[tB[i]]++] = i * 2 + 1;
          } else ev[pos[tA[i]]++] = i * 2 + 1;
        }
        var out = sc.ctx.createImageData(w, h);
        out.data.fill(255);
        sc.srcA = srcA; sc.srcB = srcB; sc.tA = pair ? tA : null; sc.ev = ev; sc.cum = count; sc.out = out; sc.k = 0; sc.state = 2; sc.t = -1;
        update(sc);
      }).catch(function () { sc.state = 0; sc.el.classList.add("dw-fail"); });
    };
    var drop = function (sc) { if (sc.state === 2) { sc.srcA = sc.srcB = sc.tA = sc.ev = sc.cum = sc.out = null; } sc.state = 0; };
    var progress = function (sc) {
      var r = sc.el.getBoundingClientRect(), vh = window.innerHeight;
      var run = r.height - vh;
      return Math.max(0, Math.min(1, (-r.top) / (run * 0.88)));
    };
    var update = function (sc) {
      var t = progress(sc);
      // captions follow the drawing
      var now = -1;
      sc.steps.forEach(function (li, i) { var on = t > 0 && t >= +li.getAttribute("data-t"); li.classList.toggle("on", on); if (on) now = i; });
      sc.steps.forEach(function (li, i) { li.classList.toggle("now", i === now); });
      if (now < 0 && sc.steps[0]) sc.steps[0].classList.add("now");
      sc.bar.style.transform = "scaleX(" + t + ")";
      if (sc.state !== 2 || t === sc.t) return;
      sc.t = t;
      var key = Math.min(65535, Math.floor(t * 65535)), target = sc.cum[key + 1], k = sc.k, o = sc.out.data, ev = sc.ev, tA = sc.tA, i, e, p, s;
      if (target > k) for (i = k; i < target; i++) {
        e = ev[i]; p = (e >>> 1) * 4; s = e & 1 ? sc.srcB : sc.srcA;
        o[p] = s[p]; o[p + 1] = s[p + 1]; o[p + 2] = s[p + 2];
      } else for (i = k - 1; i >= target; i--) {  // scrolling back: undo, newest first
        e = ev[i]; p = (e >>> 1) * 4;
        if (e & 1 && tA && tA[e >>> 1] && tA[e >>> 1] <= key) { s = sc.srcA; o[p] = s[p]; o[p + 1] = s[p + 1]; o[p + 2] = s[p + 2]; }
        else o[p] = o[p + 1] = o[p + 2] = 255;
      }
      sc.k = target;
      sc.ctx.putImageData(sc.out, 0, 0);
    };
    var ticking = false;
    var frame = function () {
      ticking = false;
      var vh = window.innerHeight;
      S.forEach(function (sc) {
        var r = sc.el.getBoundingClientRect();
        var near = r.bottom > -vh * 1.5 && r.top < vh * 2.5;
        if (near && sc.state === 0) build(sc);
        else if (!near && sc.state) drop(sc);
        if (r.bottom > 0 && r.top < vh) update(sc);
      });
    };
    var onScroll = function () { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    frame();
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
