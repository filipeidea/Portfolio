/*
 * Static site builder — no dependencies, Node 18+.
 *
 *   node tools/build.mjs            → writes the complete site to _site/
 *   python3 -m http.server -d _site → preview at http://localhost:8000
 *
 * Every page is written as complete HTML, so all text, images and links are
 * readable without JavaScript (search engines, link previews, screen readers,
 * slow connections). assets/js/app.js only adds interaction: menu, slideshow,
 * project filter and image viewer.
 *
 * Content lives in assets/data/projects.js (projects) and assets/data/facts.js
 * (profile, résumé, figures). The sketchbook is defined below in SKETCHBOOK.
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "_site");
const SITE_URL = "https://filipeidea.github.io/Portfolio/"; // public address, used for canonical and share links

// ---------- load data (the data files are plain browser scripts) ----------
globalThis.window = {};
for (const f of ["projects.js", "images.js", "facts.js", "draw.js"]) {
  new Function(fs.readFileSync(path.join(ROOT, "assets/data", f), "utf8"))();
}
const { PROJECTS, IMAGES, FACTS, DRAW } = globalThis.window;
const DRAW_CFG = JSON.parse(fs.readFileSync(path.join(ROOT, "tools/draw.json"), "utf8")); // steps and captions of each drawing

// ---------- figures computed from the project ledger (assets/data/facts.js) ----------
const LEDGER = FACTS.ledger;
const fmtArea = (n) => Math.round(n).toLocaleString("en-US");
const TOTAL_AREA = LEDGER.reduce((a, x) => a + (x.area || 0), 0);
const CITIES = [...new Set(LEDGER.map((x) => x.city))];
const STAGE_COUNT = Object.fromEntries(Object.keys(FACTS.stageNames).map((k) => [k, LEDGER.filter((x) => x.stage === k).length]));
const FIGURES = [
  { value: String(LEDGER.length), label: "projects since 2021, at Architects Office and Triptyque" },
  { value: (Math.floor(TOTAL_AREA / 1000) * 1000).toLocaleString("en-US") + "+", unit: "m²", label: "of floor area across those projects" },
  { value: String(CITIES.length), label: "cities in Brazil and Portugal" },
  { value: String(FACTS.awardsCount), label: "international awards for team projects", href: "recognition.html" }
];
const TYPOLOGY = FACTS.typologies.map((t) => {
  const list = LEDGER.filter((x) => t.match.includes(x.type));
  const area = LEDGER.filter((x) => (t.areaOnly || t.match).includes(x.type)).reduce((a, x) => a + (x.area || 0), 0);
  list.sort((a, b) => b.year - a.year || (b.area || 0) - (a.area || 0));
  return { label: t.label, count: list.length, area, partial: list.some((x) => x.area == null), list };
}).sort((a, b) => b.count - a.count || b.area - a.area);
const PLURAL = { EV: ["feasibility study", "feasibility studies"], EP: ["schematic design", "schematic designs"],
  AP: ["design development", "design developments"], PE: ["construction documents package", "construction documents packages"] };
const STAGE_LINE = Object.entries(STAGE_COUNT).map(([k, n]) => `${n} ${PLURAL[k][n === 1 ? 0 : 1]}`).join(" · ");

// ---------- helpers ----------
const isTeam = (p) => !!p.practice && !/UNISINOS/.test(p.practice); // office projects are team work
const ALIASES = { "casa-bvv": "casa-sapucai", "casa-sapucaia": "casa-sapucai" }; // old project addresses → new
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const pad = (n) => String(n).padStart(2, "0");
const hash = (f) => crypto.createHash("md5").update(fs.readFileSync(path.join(ROOT, f))).digest("hex").slice(0, 8);
const V = { css: hash("assets/css/style.css"), js: hash("assets/js/app.js") };
const ARROW = '<svg width="16" height="10" viewBox="0 0 16 10" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M0 5h14M10 1l4 4-4 4"/></svg>';
const ARROW_L = '<svg width="16" height="10" viewBox="0 0 16 10" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M16 5H2M6 1L2 5l4 4"/></svg>';

function need(key) { if (!IMAGES[key]) throw new Error("Missing image: " + key); return IMAGES[key]; }
const src = (r, key, w) => `${r}assets/img/${key}-${w}.webp`;
const largest = (r, key) => src(r, key, need(key).w.at(-1));
/* Responsive <img>. o: { sizes, eager, lazyData (srcset held in data- attributes), cls } */
function img(r, key, alt, o = {}) {
  const m = need(key);
  const set = m.w.map((w) => `${src(r, key, w)} ${w}w`).join(", ");
  const mid = m.w.length > 1 ? m.w.at(-2) : m.w[0];
  const W = 1000, H = Math.round(W / m.r);
  const s = o.lazyData ? `data-src="${src(r, key, mid)}" data-srcset="${set}"` : `src="${src(r, key, mid)}" srcset="${set}"`;
  return `<img ${s} sizes="${o.sizes || "100vw"}" width="${W}" height="${H}" alt="${esc(alt)}"` +
    (o.eager ? ' fetchpriority="high"' : ' loading="lazy"') + ' decoding="async"' + (o.cls ? ` class="${o.cls}"` : "") + ">";
}
/* An image that opens in the viewer. Without JavaScript the link opens the full-size file. */
function zoom(r, it, sizes, light) {
  return `<a class="zoom${light ? " light" : ""}" href="${largest(r, it.img)}" data-caption="${esc(it.caption || it.alt)}">` +
    img(r, it.img, it.alt, { sizes }) + `<span class="sr-only"> (open full size)</span></a>`;
}
function fig(r, it, sizes, cls = "", light = false) {
  return `<figure class="${cls}">${zoom(r, it, sizes, light)}` + (it.caption ? `<figcaption class="mono">${esc(it.caption)}</figcaption>` : "") + "</figure>";
}

// ---------- layout ----------
const NAV = [["index.html#projects", "Projects", "projects"], ["sketchbook.html", "Sketchbook", "sketchbook"],
  ["profile.html", "Profile", "profile"], ["recognition.html", "Recognition", "recognition"], ["lab.html", "Lab", "lab"], ["resume.html", "Résumé", "resume"], ["#contact", "Contact", "contact"]];

function layout({ r = "", file, title, description, page, body, og = "home", jsonld, extraHead = "" }) {
  const url = SITE_URL + (file === "index.html" ? "" : file);
  const ogImg = `${SITE_URL}assets/og/${og}.jpg`;
  const nav = NAV.map(([h, label, k]) => `<a href="${r}${h}"${k === page ? ' aria-current="page"' : ""}>${label}</a>`).join("");
  const reach = [
    FACTS.email ? `<li><a href="mailto:${esc(FACTS.email)}">${esc(FACTS.email)}</a></li>` : "",
    `<li><a href="${FACTS.linkedin}" rel="me noopener">LinkedIn</a></li>`,
    `<li><a href="${r}${FACTS.cv}" download>Download CV (PDF)</a></li>`
  ].join("");
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<script>document.documentElement.classList.add("js")</script>
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="website">
<meta property="og:locale" content="en_US">
<meta property="og:site_name" content="Filipe Meltzer — Architect &amp; Urbanist">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${ogImg}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#ffffff">
<link rel="icon" href="${r}assets/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600&amp;family=Newsreader:opsz,wght@6..72,400&amp;display=swap">
<link rel="stylesheet" href="${r}assets/css/style.css?v=${V.css}">
${extraHead}${jsonld ? `<script type="application/ld+json">${JSON.stringify(jsonld)}</script>\n` : ""}</head>
<body data-page="${page}">
<a class="skip" href="#main">Skip to content</a>
<header class="site-header">
<div class="wrap bar">
<a class="brand" href="${r}index.html">Filipe Meltzer <small>Architect &amp; Urbanist</small></a>
<button class="menu-btn" type="button" aria-expanded="false" aria-controls="nav" aria-label="Open menu" hidden><span></span><span></span><span></span></button>
<nav class="nav" id="nav" aria-label="Main">${nav}<span class="lang-switch"></span></nav>
</div>
</header>
${body}
<footer id="contact" class="site-footer">
<div class="wrap">
<p class="mono">Contact</p>
<h2 class="foot-cta">Let’s talk about architecture.</h2>
<div class="foot-grid">
<p class="foot-note">Open to conversations with architecture practices in Brazil and abroad.</p>
<div><p class="mono">Reach</p><ul class="foot-links">${reach}</ul></div>
<div><p class="mono">Pages</p><ul class="foot-links"><li><a href="${r}index.html#projects">Projects</a></li><li><a href="${r}sketchbook.html">Sketchbook</a></li><li><a href="${r}profile.html">Profile</a></li><li><a href="${r}recognition.html">Recognition</a></li><li><a href="${r}lab.html">Lab</a></li><li><a href="${r}resume.html">Résumé</a></li></ul></div>
</div>
<div class="foot-base"><span>© ${new Date().getFullYear()} Filipe Meltzer · ${esc(FACTS.registration)}</span><span class="foot-end"><span>${esc(FACTS.base)}</span><a class="secret" href="${r}notebook.html" title="Off the record"><img src="${r}assets/img/notebook-icon-64.webp" srcset="${r}assets/img/notebook-icon-64.webp 1x, ${r}assets/img/notebook-icon-128.webp 2x" width="19" height="64" alt="Travel notebook" loading="lazy"></a></span></div>
</div>
</footer>
<script src="${r}assets/js/app.js?v=${V.js}" defer></script>
</body>
</html>
`;
}

const person = {
  "@context": "https://schema.org", "@type": "Person", name: FACTS.name, jobTitle: FACTS.title,
  url: SITE_URL, image: SITE_URL + largest("", "profile/portrait"), sameAs: [FACTS.linkedin],
  address: { "@type": "PostalAddress", addressLocality: "São Paulo", addressCountry: "BR" },
  worksFor: { "@type": "Organization", name: "Architects Office" },
  alumniOf: { "@type": "CollegeOrUniversity", name: "Universidade do Vale do Rio dos Sinos (UNISINOS)" }
};

// ---------- home ----------
/* Opening: a static composition of three existing project images on the grid — one main
   image and two smaller ones beside it, each linked to its project. No slideshow. */
const OPENING = [["masterplan-urucuca", "urucuca/canopy"], ["quinta", "quinta/court"], ["monolyt", "monolyt/front"]];
const OPEN_SIZES = ["(min-width: 900px) 64vw, 100vw", "(min-width: 900px) 32vw, 50vw", "(min-width: 900px) 32vw, 50vw"];
function home() {
  const r = "";
  const altFor = (p, key) => { for (const g of p.gallery) for (const x of g.images || [g]) if (x.img === key) return x.alt; return p.title; };
  const opening = OPENING.map(([slug, key], i) => {
    const p = PROJECTS.find((x) => x.slug === slug);
    return `<figure class="op op-${i}"><a href="projects/${slug}.html"><span class="op-ph">${img(r, key, altFor(p, key), { eager: i === 0, sizes: OPEN_SIZES[i] })}</span>` +
      `<figcaption><span class="op-title">${esc(p.title)}</span> <span class="op-loc">${esc(p.location.split(",").map((x) => x.trim()).filter((x) => !/^[A-Z]{2}$/.test(x)).join(", "))}</span></figcaption></a></figure>`;
  }).join("");
  const cats = ["All", ...new Set(PROJECTS.map((p) => p.category))];
  /* Every card has the same 3:2 frame so the grid lines up exactly. A wide image cropped
     into the frame needs width × (image ratio ÷ 1.5) pixels to stay sharp. */
  const cardSizes = (ratio) => { const k = Math.max(1, ratio / 1.5); return `(min-width: 760px) ${Math.round(50 * k)}vw, ${Math.round(100 * k)}vw`; };
  // a card: the image, the title and one line — main typology, place, year
  const place = (loc) => loc.split(",").map((x) => x.trim()).filter((x) => !/^[A-Z]{2}$/.test(x)).join(", "); // "Balneário Camboriú, SC, Brazil" → "Balneário Camboriú, Brazil"
  const cards = PROJECTS.map((p) => {
    const kind = p.typology.split(" · ")[0];
    return `<li class="card" data-cat="${esc(p.category)}"><a href="projects/${p.slug}.html">` +
      `<span class="ph">${img(r, p.cover, "", { sizes: cardSizes(need(p.cover).r) })}</span>` +
      `<span class="meta"><h3>${esc(p.title)}</h3>` +
      `<span class="sub">${esc(kind.charAt(0).toUpperCase() + kind.slice(1))} · ${esc(place(p.location))}${p.year ? " · " + esc(p.year) : ""}</span>` +
      "</span></a></li>";
  }).join("");
  const figures = FIGURES.map((f) => `<div class="figure"><dt>${f.href ? `<a href="${f.href}">${esc(f.label)}</a>` : esc(f.label)}</dt><dd>${esc(f.value)}${f.unit ? ` <small>${esc(f.unit)}</small>` : ""}</dd></div>`).join("");
  const body = `<main id="main">
<section class="wrap intro" aria-labelledby="intro-h">
<h1 id="intro-h" class="sr-only">Filipe Meltzer — Architect &amp; Urbanist</h1>
<p class="lede">Architect and urbanist in São Paulo, turning briefs, zoning rules and site conditions into feasibility studies and schematic designs.</p>
<p class="intro-links"><a class="link-arrow" href="#projects">Selected projects ${ARROW}</a> <a class="link-arrow" href="profile.html">Profile ${ARROW}</a> <a class="link-arrow" href="#contact">Contact ${ARROW}</a></p>
</section>
<section class="wrap opening" aria-label="Featured projects">
<div class="op-grid">${opening}</div>
</section>
<section id="projects" class="wrap section" aria-labelledby="proj-h">
<div class="section-head">
<p class="mono">Selected projects</p>
<h2 id="proj-h" class="h2">From a single house to a masterplan in the forest — ${PROJECTS.length} projects across scales and programmes.</h2>
</div>
<div class="filters" role="group" aria-label="Filter projects by category" hidden>${cats.map((c) => {
    const n = c === "All" ? PROJECTS.length : PROJECTS.filter((p) => p.category === c).length;
    return `<button type="button" aria-pressed="${c === "All"}" data-cat="${esc(c)}">${esc(c)} <span class="count">${n}</span></button>`;
  }).join("")}</div>
<p class="sr-only filter-status" aria-live="polite"></p>
<ul class="index" role="list">${cards}</ul>
</section>
<section class="wrap figures-wrap" aria-labelledby="fig-h">
<h2 id="fig-h" class="mono">In numbers</h2>
<dl class="figures">${figures}</dl>
</section>
<section class="wrap section typology" aria-labelledby="typ-h">
<div class="typ-head">
<h2 id="typ-h" class="h2">Projects<br>by typology</h2>
<p class="typ-note">Number of projects and total floor area per typology, since 2021. Point to a number to see the projects.</p>
</div>
<ul class="typ-grid" role="list">${TYPOLOGY.map((t, i) => `<li class="typ-item"><button type="button" class="typ-row" aria-expanded="false" aria-controls="typ-${i}"><span class="typ-num" aria-hidden="true">${pad(t.count)}</span><span class="typ-txt"><span class="typ-label">${esc(t.label)}</span><span class="typ-area mono-plain">${t.count} project${t.count > 1 ? "s" : ""} · ${fmtArea(t.area)}${t.partial ? "*" : ""} m²</span></span></button>` +
  `<div class="typ-panel" id="typ-${i}"><ul>${t.list.map((x) => `<li><span class="tp-name">${x.slug ? `<a href="projects/${x.slug}.html">${esc(x.name)}</a>` : esc(x.name)}</span><span class="tp-meta">${esc(x.city)}${x.area ? " · " + fmtArea(x.area) + " m²" : ""} · ${x.year}</span></li>`).join("")}</ul></div></li>`).join("")}</ul>
<p class="typ-foot">* Some projects have no area on record and are not included in that total. Masterplan Uruçuca counts as both hotel and masterplan; its ${fmtArea(27771)} m² site area is counted once, under masterplan. Total ${fmtArea(TOTAL_AREA)} m² across ${LEDGER.length} projects.</p>
</section>
<section class="wrap section sketch-teaser" aria-labelledby="sk-h">
<div class="split rev">
<a class="sketch-one" href="sketchbook.html#d-q-palmela">${img(r, "sketch/q-palmela", "Watercolour drawing of Palmela Castle: the keep, walls on the rock and cypresses", { sizes: "(min-width: 900px) 56vw, 100vw" })}</a>
<div>
<p class="mono">Sketchbook</p>
<h2 id="sk-h" class="h2">Thinking with the hand.</h2>
<p class="teaser-text">I use freehand drawing to read existing architecture, test spatial ideas, brief the people producing renders and tell the story of a concept.</p>
<a class="link-arrow" href="sketchbook.html">Open the sketchbook ${ARROW}</a>
</div>
</div>
</section>
<section class="wrap section profile-teaser" aria-labelledby="pr-h">
<div class="section-head">
<p class="mono">Profile</p>
<div>
<h2 id="pr-h" class="h2">From brief and constraints to a clear architectural proposal.</h2>
<p class="teaser-text">Concept design, feasibility and zoning studies, schematic design and coordination with engineering consultants — and, before Architects Office, three years running my own residential and interior projects through to construction.</p>
<p class="intro-links"><a class="link-arrow" href="profile.html">Read the profile ${ARROW}</a> <a class="link-arrow" href="resume.html">Résumé ${ARROW}</a></p>
</div>
</div>
</section>
</main>`;
  return layout({ file: "index.html", page: "home", title: "Filipe Meltzer — Architect & Urbanist, São Paulo",
    description: "Portfolio of Filipe Meltzer, architect and urbanist in São Paulo: concept design and feasibility studies for housing, hospitality, mixed-use, corporate and urban projects in Brazil and Portugal.",
    body, jsonld: person, extraHead: `<link rel="preload" as="image" href="${src(r, OPENING[0][1], need(OPENING[0][1]).w.at(-2))}" imagesrcset="${need(OPENING[0][1]).w.map((w) => `${src(r, OPENING[0][1], w)} ${w}w`).join(", ")}" imagesizes="${OPEN_SIZES[0]}" fetchpriority="high">\n` });
}

// ---------- project pages ----------
function project(p, i) {
  const r = "../";
  const prev = PROJECTS[(i - 1 + PROJECTS.length) % PROJECTS.length], next = PROJECTS[(i + 1) % PROJECTS.length];
  const altFor = (key) => { for (const g of p.gallery) for (const x of g.images || [g]) if (x.img === key) return x.alt; return p.title; };
  const team = isTeam(p);
  const facts = [
    ["Location", esc(p.location)], ["Also known as", p.aka ? esc(p.aka) : ""], ["Typology", esc(p.typology)],
    ["Year", p.year ? esc(p.year) + (p.yearNote ? ` <span class="muted">(${esc(p.yearNote)})</span>` : "") : ""],
    ["Area", p.area ? esc(p.area) : ""],
    [team ? "Office" : "Context", esc(team ? p.practice + " — team project" : p.practice)],
    ["Position", p.position ? esc(p.position) : ""],
    ["Awards", p.awards?.length ? "<ul>" + p.awards.map((a) => `<li>${esc(a)}</li>`).join("") + "</ul>" : ""],
    ["Published", p.publications?.length ? "<ul>" + p.publications.map((x) => `<li>${x.url ? `<a href="${esc(x.url)}" rel="noopener">${esc(x.label)}</a>` : esc(x.label)}</li>`).join("") + "</ul>" : ""]
  ].filter((f) => f[1]).map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("");
  const teamHtml = p.team ? esc(p.team).replace("Filipe Meltzer", "<strong>Filipe Meltzer</strong>") : "";
  /* Fixed frames keep every image on the same lines: wide images 16:9 (12:5 for panoramas, 3:2 when the
     image is close to square), pairs 4:3, trios 1:1. Drawings are shown whole (contain) on
     white inside the same frames. The viewer always shows the complete image. */
  const FR = { "f-nat": 1, "f-125": 12 / 5, "f-169": 16 / 9, "f-32": 3 / 2, "f-43": 4 / 3, "f-11": 1 };
  const frameSizes = (key, frame, colVw) => { const k = Math.max(1, need(key).r / FR[frame]); return `(min-width: 760px) ${Math.min(200, Math.round(colVw * k))}vw, ${Math.min(200, Math.round(100 * k))}vw`; };
  const gfig = (o, frame, colVw, extra = "") => `<figure class="gf ${frame}${o.caption ? " drawing" : ""}${extra}">${zoom(r, o, o.caption ? `(min-width: 760px) ${colVw}vw, 100vw` : frameSizes(o.img, frame, colVw), !!o.caption)}` +
    (o.caption ? `<figcaption class="mono">${esc(o.caption)}</figcaption>` : "") + "</figure>";
  const gallery = p.gallery.filter((g) => g.img !== p.cover).map((g) => {
    if (g.layout === "pair") return `<div class="g-row g-2">${g.images.map((o) => gfig(o, "f-43", 50)).join("")}</div>`;
    if (g.layout === "trio") return `<div class="g-row g-3">${g.images.map((o) => gfig(o, "f-11", 33)).join("")}</div>`;
    if (g.layout === "small") return gfig(g, "f-169", 100);
    if (g.layout === "sequence") { // a set of diagrams shown one after another (app.js plays it once in view)
      const m = need(g.steps[0].img);
      const layers = g.steps.map((st, k) => `<div class="seq-layer${k ? "" : " on"}">${img(r, st.img, st.alt, { sizes: "(min-width: 760px) 70vw, 100vw" })}</div>`).join("");
      const steps = g.steps.map((st, k) => `<li><button type="button" data-n="${k}"${k ? "" : ' aria-current="step"'}><span class="seq-n">${k + 1}</span> <span class="seq-l">${esc(st.label)}</span></button></li>`).join("");
      return `<figure class="seq" data-seq><div class="seq-stage" style="aspect-ratio: ${m.r.toFixed(4)}">${layers}</div><figcaption><p class="mono seq-title">${esc(g.title)}</p><ol class="seq-steps" role="list">${steps}</ol></figcaption></figure>`;
    }
    if (g.natural) return gfig(g, "f-nat", 100); // a drawing much wider than any frame: shown at its own proportions
    const rr = need(g.img).r, frame = rr >= 2.2 ? "f-125" : rr >= 1.5 ? "f-169" : "f-32"; // panoramas keep their 12:5 frame
    return gfig(g, frame, 100, g.layout === "full" ? " g-full" : "");
  }).join("\n");
  const body = `<main id="main">
<article>
<header class="wrap p-head">
<nav class="crumbs mono" aria-label="Breadcrumb"><a href="../index.html#projects">Projects</a> <span aria-hidden="true">/</span> <span>${pad(i + 1)} of ${pad(PROJECTS.length)}</span></nav>
<h1 class="h1">${esc(p.title)}</h1>
<p class="lede">${esc(p.summary)}</p>
</header>
<div class="p-hero">${zoom(r, { img: p.cover, alt: altFor(p.cover) }, `${Math.min(200, Math.round(100 * Math.max(1, need(p.cover).r / (16 / 9))))}vw`).replace('loading="lazy"', 'fetchpriority="high"')}</div>
<div class="wrap">
<div class="p-body">
<dl class="facts">${facts}</dl>
<div class="p-text">
<div class="prose">${p.description.map((t) => `<p>${esc(t)}</p>`).join("")}</div>
<section class="p-role" aria-labelledby="role-h">
<h2 id="role-h" class="mono">My role</h2>
<p>${esc(p.role)}</p>
${p.stages?.length ? `<p class="stages"><span class="sr-only">Design stages: </span>${p.stages.map((s) => esc(s)).join(" · ")}</p>` : ""}
</section>
<div class="credits">${teamHtml ? `<h2 class="mono">Team</h2><p>${teamHtml}</p>` : ""}<p class="credit">${esc(p.credit || (team ? `Images © ${p.practice}. Shown with credit to the office.` : "Images and drawings © Filipe Meltzer."))}</p></div>
</div>
</div>
<section class="gallery" aria-label="Project images">
${gallery}
</section>
<nav class="pn" aria-label="More projects">
<a href="${prev.slug}.html" rel="prev"><span class="mono">Previous</span><span class="h3">${esc(prev.title)}</span></a>
<a href="${next.slug}.html" rel="next"><span class="mono">Next</span><span class="h3">${esc(next.title)}</span></a>
</nav>
</div>
</article>
</main>`;
  return layout({ r, file: `projects/${p.slug}.html`, page: "projects", og: p.slug,
    title: `${p.title} — ${p.typology.split(" · ")[0]}, ${p.location.split(",")[0]} · Filipe Meltzer`,
    description: p.summary, body });
}

// ---------- sketchbook ----------
const SKETCHBOOK = [
  { id: "quinta", label: "01 · For the project Quinta, Portugal", title: "Reading Portuguese architecture through time",
    text: "Before the design of the Quinta, I drew the architecture of Portugal — palaces, castles, churches, squares, houses, chimneys, tiles and openings — to understand its proportions and details and reinterpret them in a contemporary estate.",
    link: ["projects/quinta.html", "See the Quinta project"],
    items: [
      ["sketch/q-manueline", "Detailed pen drawing of an ornate Manueline church facade with pinnacles and a carved portal", "Church facade"],
      ["sketch/q-mafra", "Pen drawing of the Palace of Mafra: the basilica's two bell towers and dome, and the long palace front", "Palácio Nacional de Mafra"],
      ["sketch/q-queluz", "Coloured drawing of a gateway and facades at the Palace of Queluz", "Palácio de Queluz"],
      ["sketch/q-sintra", "Pen drawing of the Palace of Sintra with its two conical chimneys", "Palácio Nacional de Sintra"],
      ["sketch/q-palmela", "Watercolour drawing of Palmela Castle: the keep, walls on the rock and cypresses", "Castelo de Palmela"],
      ["sketch/q-saojorge", "Pen drawing of the towers and walls of São Jorge Castle in Lisbon", "Castelo de São Jorge, Lisbon"],
      ["sketch/q-augusta", "Pen drawing of the Rua Augusta Arch between the arcades of the square", "Arco da Rua Augusta, Lisbon"],
      ["sketch/q-pavilion", "Pen sketch of the Portugal Pavilion in Lisbon, its concrete canopy hanging between two porticoes", "Portugal Pavilion, Lisbon"],
      ["sketch/q-details", "Six drawings of details: a window with a balcony, a Gothic window, a chimney, a street corner, a tiled facade and a wooden balcony", "Openings, chimneys, tiles, balconies"],
      ["sketch/q-houses", "Six drawings: a manor house, stacked roofs, two small houses, a church front, Casa de Mateus and a contemporary house", "Houses and churches"],
      ["quinta/axo-sketch", "Hand-drawn axonometric of the Quinta estate with courtyards and pool", "Quinta — axonometric sketch", "c6"],
      ["quinta/elevations", "Hand-drawn elevations of the Quinta buildings in the landscape", "Quinta — elevation sketches", "c6"]] },
  { id: "housing", label: "02 · Multi-family project", title: "Concept sketches for a housing scheme",
    text: "Freehand concept sketches for a multi-family project: a single dwelling with its gardens and terraces, then the whole terraced block on its sloping site.",
    items: [
      ["sketch/multifamily-house", "Coloured axonometric sketch of a two-storey dwelling with terraces and planting", "Dwelling", "c5"],
      ["sketch/multifamily-block", "Coloured sketch of a terraced housing block stepping along a slope", "The block on its site", "c7"]] },
  { id: "atmosphere", label: "03 · Visual studies", title: "Drawing the atmosphere before the render",
    text: "Hand drawings requested for a highly complex project, used to guide the renderings in its early stages: the character of the landscape, the planting and the life of a public plaza.",
    items: [
      ["sketch/valley", "Watercolour aerial view of a green valley with a road, gardens and rocky peaks behind", "The valley"],
      ["sketch/bay", "Watercolour aerial view of terraced landscape and buildings above a long curved bay", "Above the bay"],
      ["sketch/village", "Watercolour view of a hillside village of terraced buildings below rocky peaks", "The hillside village"],
      ["sketch/terrace", "Watercolour view of a roof terrace with lawn, planting and a pool beside a timber wall", "The roof terrace"],
      ["sketch/plaza", "Watercolour perspective of a palm-lined public plaza with people walking", "The plaza"]] },
  { id: "storytelling", label: "04 · Iguatemi 306, São Paulo", title: "A tower among its neighbours",
    text: "A concept sketch for Iguatemi 306: a green, twisting tower drawn among the existing buildings around the site.",
    link: ["projects/iguatemi-306.html", "See the Iguatemi 306 project"],
    items: [
      ["iguatemi/sketch", "Watercolour sketch of a green, twisting tower among existing buildings", "Iguatemi 306 — the green tower"]] },
  { id: "barrinhas", label: "05 · Hotel Barrinhas, Ceará", title: "Arranging a hotel by the sea",
    text: "Early sketches for the arrangement of guest buildings, pools and gardens on the site.",
    link: ["projects/hotel-barrinhas.html", "See the Hotel Barrinhas project"],
    items: [
      ["barrinhas/sketch-1", "Coloured axonometric sketch of hotel pavilions, pools and dunes", "Site sketch", "c7"],
      ["barrinhas/sketch-2", "Line sketches of guest buildings around a pool", "Guest buildings", "c5"]] },
  { id: "gramado", label: "06 · Gramado, Rio Grande do Sul", title: "Houses among the pines",
    text: "Sketches for a residential project on Avenida das Hortênsias, in Gramado.",
    link: ["projects/gramado.html", "See the Gramado project"],
    items: [
      ["sketch/hortensias", "Watercolour sketch of a tall gabled building among pine trees beside the avenue", "Avenida das Hortênsias"],
      ["sketch/houses-story", "Four small coloured sketches of houses: timber-framed, gabled and a simple cabin", "Houses, as a short story"]] }
];
/* Sketchbook: every drawing draws itself while the page is scrolled (assets/js/app.js,
   data from tools/build_draw.py). Without JavaScript, or with reduced motion, the
   drawings and all their captions are simply shown. */
function sketchbook() {
  const r = "";
  let n = 0;
  const scene = ([key, alt, cap]) => {
    const c = DRAW_CFG.find((x) => x.img === key), d = c && DRAW[c.id];
    const num = pad(++n);
    // pencil-then-colour drawings get one more caption, for the colour stage
    const texts = c ? c.steps.map((st) => st.text).concat(d.pair ? [c.colourText || "Then the colour."] : []) : [];
    const steps = texts.map((t, i) => `<li data-t="${d.steps[i]}" data-n="${pad(i + 1)}">${esc(t)}</li>`).join("");
    return `<section class="dw-scene" id="d-${c ? c.id : n}"${c ? ` data-draw="${r}assets/draw/${c.id}" data-w="${d.w}" data-h="${d.h}"${d.pair ? ` data-split="${d.split}"` : ""} style="--steps:${texts.length}"` : ""}>
<div class="dw-stage">
<div class="dw-text">
<p class="dw-num mono">${num}</p>
<h3 class="dw-title">${esc(cap)}</h3>
<ol class="dw-steps">${steps}</ol>
<p class="dw-open"><a class="zoom light" href="${largest(r, key)}" data-caption="${esc(cap)}" data-srcset="${need(key).w.map((w) => `${src(r, key, w)} ${w}w`).join(", ")}" data-alt="${esc(alt)}">Open full size</a></p>
</div>
<figure class="dw-art">${img(r, key, alt, { sizes: "(min-width: 1000px) 60vw, 100vw" })}</figure>
</div>
</section>`;
  };
  const groups = SKETCHBOOK.map((g) => `<section id="${g.id}" class="dw-chapter" aria-labelledby="${g.id}-h">
<div class="wrap dw-head"><p class="mono">${esc(g.label)}</p><h2 id="${g.id}-h" class="h2">${esc(g.title)}</h2><p class="dw-intro">${esc(g.text)}</p>${g.link ? `<p class="more"><a class="link-arrow" href="${g.link[0]}">${g.link[1]} ${ARROW}</a></p>` : ""}</div>
${g.items.map(scene).join("\n")}
</section>`).join("\n");
  const index = SKETCHBOOK.map((g) => `<li><a href="#${g.id}"><span class="mono">${esc(g.label.split(" · ")[0])}</span> ${esc(g.title)}</a></li>`).join("");
  const body = `<main id="main" class="dw-page">
<header class="wrap p-head">
<p class="mono kicker">Sketchbook</p>
<h1 class="h1">Thinking with the hand</h1>
<p class="lede">I start most projects on paper. These freehand drawings were made to read existing architecture, test spatial ideas, brief the people producing renders and tell the story of a concept — most of them for projects at Architects Office.</p>
<p class="hint mono-plain dw-hint" hidden>Scroll, and each drawing draws itself again — line first, then colour.</p>
<ol class="dw-index">${index}</ol>
</header>
${groups}
</main>`;
  return layout({ file: "sketchbook.html", page: "sketchbook", og: "sketchbook", title: "Sketchbook — Filipe Meltzer, Architect & Urbanist",
    description: "Freehand sketches by architect Filipe Meltzer: studies of Portuguese architecture, housing concepts, atmosphere drawings for renders and visual storytelling.", body });
}

// ---------- profile ----------
function entries(list, full) {
  return list.map((e) => `<div class="entry"><h3>${esc(e.org)}</h3><span class="when">${esc(e.when)}</span>` +
    `<span class="where">${esc([e.role, e.where].filter(Boolean).join(" · "))}</span>` +
    (full && e.points.length ? "<ul>" + e.points.map((x) => `<li>${esc(x)}</li>`).join("") + "</ul>" : "") + "</div>").join("");
}
function awardsList(r) {
  return FACTS.awards.map((a) => `<li><span><b>${esc(a.title)}</b> — <a href="${r}projects/${a.slug}.html">${esc(a.project)}</a><br><span class="muted">${esc(a.org)} · ${esc(a.category)}</span></span><span class="mono">${a.year}</span></li>`).join("");
}
function pubsList(r) {
  return FACTS.publications.map((p) => `<li><span><b>${esc(p.outlet)}</b> — <a href="${r}projects/${p.slug}.html">${esc(p.title)}</a>` +
    (p.links.length ? `<br><span class="muted">${p.links.map((l) => `<a href="${l.url}" rel="noopener">${l.label}</a>`).join(" · ")}</span>` : "") +
    `</span><span class="mono">${p.year}</span></li>`).join("");
}
/* Interactive map: each city is a button; hovering, focusing or tapping it shows the
   projects there (pure CSS, works without JavaScript). The same list follows as text. */
function placesMap(r) {
  const byCity = (c) => LEDGER.filter((x) => x.city === c).sort((a, b) => b.year - a.year);
  const n = (k) => `${k} project${k === 1 ? "" : "s"}`;
  const item = (x) => `<li><span class="pc-name">${x.slug ? `<a href="${r}projects/${x.slug}.html">${esc(x.name)}</a>` : esc(x.name)}</span>` +
    `<span class="pc-meta">${esc(x.type)}${x.area ? " · " + fmtArea(x.area) + " m²" : ""} · ${x.year}${x.office ? " · " + esc(x.office) : ""}</span></li>`;
  // one dot per city, or one per group of cities too close together to tell apart
  const units = [];
  for (const pt of FACTS.mapPoints) {
    if (!pt.group) { units.push({ ...pt, cities: [pt.city], label: pt.city.split(",")[0] }); continue; }
    let u = units.find((x) => x.group === pt.group);
    if (!u) { const g = FACTS.mapGroups[pt.group]; u = { group: pt.group, side: g.side, label: g.label, cities: [], xs: [], ys: [] }; units.push(u); }
    u.cities.push(pt.city); u.xs.push(pt.x); u.ys.push(pt.y);
  }
  const avg = (a) => +(a.reduce((s, v) => s + v, 0) / a.length).toFixed(2);
  units.forEach((u) => { if (u.xs) { u.x = avg(u.xs); u.y = avg(u.ys); } });
  const pins = units.map((u, i) => {
    const total = u.cities.reduce((s, c) => s + byCity(c).length, 0);
    const flipX = u.x > 56 ? " fx" : "", flipY = u.y > 50 ? " fy" : "";
    const body = u.cities.length === 1
      ? `<p class="pc-city">${esc(u.cities[0])}<span>${n(total)}</span></p><ul>${byCity(u.cities[0]).map(item).join("")}</ul>`
      : u.cities.map((c) => `<p class="pc-city">${esc(c)}<span>${n(byCity(c).length)}</span></p><ul>${byCity(c).map(item).join("")}</ul>`).join("");
    return `<div class="pin side-${u.side}${flipX}${flipY}${u.abroad ? " abroad" : ""}" style="left:${u.x}%;top:${u.y}%" data-city="${esc(u.cities.join("|"))}">` +
      `<button type="button" class="pin-dot" aria-describedby="pc-${i}"><span class="pin-label">${u.abroad ? "↑ " : ""}${esc(u.abroad ? u.cities[0] : u.label)}</span><span class="sr-only">: ${n(total)}</span></button>` +
      `<div class="pin-card${u.cities.length > 1 ? " multi" : ""}" role="tooltip" id="pc-${i}">${body}</div></div>`;
  }).join("");
  const cityList = [...FACTS.mapPoints].sort((a, b) => byCity(b.city).length - byCity(a.city).length || a.city.localeCompare(b.city))
    .map((pt) => `<li data-city="${esc(pt.city)}"><span class="cl-city">${esc(pt.city)}</span><span class="cl-projects">${byCity(pt.city).map((x) => x.slug ? `<a href="${r}projects/${x.slug}.html">${esc(x.name)}</a>` : esc(x.name)).join(", ")}</span></li>`).join("");
  return `<div class="places">
<div class="map">
<div class="map-view"><div class="map-frame">${img(r, "profile/places-america", "Satellite map of South America with the cities where projects were developed", { sizes: "(min-width: 1300px) 1240px, 100vw" })}${pins}</div></div>
<p class="map-hint mono-plain">Hover or tap a city to see its projects.</p>
</div>
<div class="places-text">
<p class="lede">From the south of Brazil to Portugal: ${LEDGER.length} projects in ${CITIES.length} cities, across residential, hospitality, corporate, urban and mixed-use work.</p>
<details class="city-details"><summary>All cities and their projects</summary><ul class="city-list" role="list">${cityList}</ul></details>
</div>
</div>`;
}
function profile() {
  const r = "";
  const body = `<main id="main">
<div class="wrap">
<section class="profile-top" aria-labelledby="p-h">
<div class="portrait">${img(r, "profile/portrait", "Portrait of Filipe Meltzer, seated, in black and white", { sizes: "(min-width: 900px) 30vw, 100vw", eager: true })}</div>
<div>
<p class="mono kicker">Profile</p>
<h1 id="p-h" class="h1">Architect &amp; Urbanist</h1>
<div class="prose">
<p class="lede">I’m an architect and urbanist focused on concept design and architectural development. My work starts with the brief, the zoning rules and the site: what can be built, how much, and in what form — and how to turn that into a clear architectural proposal.</p>
<p>Since 2021 I have worked in the concept team at Architects Office in São Paulo, on projects in Brazil and Portugal: feasibility studies, zoning and area analyses for São Paulo and other states, schematic designs, coordination with engineering consultants, and the presentation of each concept. I was Project Leader for Murata 157, a 21,395 m² residential building in Londrina. Since 2021, at Architects Office and Triptyque, I have worked on ${LEDGER.length} projects in ${CITIES.length} cities: ${STAGE_LINE}.</p>
<p>Before that I ran my own practice (2018–2021), taking residential and interior projects from first design through permit approval, construction drawings and site management, after two years as a designer at Schelle Architecture + Design. Hand sketching remains central to how I think and communicate.</p>
<p>I graduated in Architecture and Urbanism from UNISINOS in Rio Grande do Sul, with an academic exchange at the Universidad Nacional de Mar del Plata, Argentina.</p>
</div>
<p class="intro-links"><a class="link-arrow" href="resume.html">View the résumé ${ARROW}</a> <a class="link-arrow" href="${FACTS.cv}" download>Download CV (PDF) ${ARROW}</a></p>
</div>
</section>

<section class="cv-block" aria-labelledby="exp">
<h2 id="exp" class="mono">Experience</h2>
<div class="entries">${entries(FACTS.experience, true)}</div>
</section>

<section class="cv-block" aria-labelledby="rec">
<h2 id="rec" class="mono">Recognition</h2>
<div>
<p class="lede">${FACTS.awards.length} international awards and ${PRESS_COUNT} publications for team projects at Architects Office in which I took part — Monolyt, Masterplan Uruçuca and Casa PAR.</p>
<p class="actions"><a class="link-arrow" href="recognition.html">Awards and press ${ARROW}</a></p>
</div>
</section>

<section class="cv-block places-block" aria-labelledby="pl">
<h2 id="pl" class="mono">Projects across places</h2>
${placesMap(r)}
</section>

<section class="cv-block" aria-labelledby="ed">
<h2 id="ed" class="mono">Education and languages</h2>
<div class="cols">
<div><ul class="list-plain">${FACTS.education.map((e) => `<li><span>${esc(e.what)}<br><span class="muted">${esc(e.where)}</span></span><span class="mono-plain">${e.when}</span></li>`).join("")}</ul>
<p class="note">Registered architect · ${esc(FACTS.registration)}. Final thesis: <a href="projects/porto-cultural-tramandai.html">Porto Cultural Tramandaí</a>.</p></div>
<div><ul class="list-plain">${FACTS.languages.map(([l, v]) => `<li><span>${l}</span><span class="muted">${v}</span></li>`).join("")}</ul>
<p class="note">Skills and software are listed in the <a href="resume.html">résumé</a>.</p></div>
</div>
</section>
</div>
</main>`;
  return layout({ file: "profile.html", page: "profile", title: "Profile — Filipe Meltzer, Architect & Urbanist",
    description: "Filipe Meltzer, architect and urbanist in São Paulo: concept team at Architects Office since 2021, feasibility and schematic design, awards, publications, skills and education.", body, jsonld: person });
}

// ---------- résumé ----------
function resume() {
  const r = "";
  const ao = FACTS.experience[0];
  const body = `<main id="main" class="section resume-page">
<div class="wrap">
<div class="resume-bar no-print">
<p class="mono">Résumé</p>
<p class="actions"><button class="btn ghost print-btn" type="button" hidden>Print this page</button> <a class="btn" href="${FACTS.cv}" download>Download CV (PDF)</a></p>
</div>
<article class="resume" aria-labelledby="r-name">
<h1 id="r-name">${esc(FACTS.name)}</h1>
<p class="role">${esc(FACTS.title)}</p>
<p class="contact-line"><span>${esc(FACTS.base)}</span><a href="${FACTS.linkedin}" rel="noopener">linkedin.com/in/filipemeltzer</a>${FACTS.email ? `<a href="mailto:${esc(FACTS.email)}">${esc(FACTS.email)}</a>` : ""}<span>${esc(FACTS.registration)}</span></p>
<p class="summary">Architect and urbanist working on residential, mixed-use, hospitality, corporate and urban-scale projects. Concept design, feasibility, zoning and area studies, schematic design, coordination with engineering consultants and architectural representation, including hand sketching.</p>
<div class="r-grid">
<div>
<h2>Experience</h2>
<div class="entry"><h3>${esc(ao.org)}</h3><span class="when">${esc(ao.when)}</span><span class="where">${esc(ao.role)} · ${esc(ao.where)}</span><ul>${ao.points.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>
${entries(FACTS.experience.slice(1), true)}
<h2>Education</h2>
<ul class="small-list">${FACTS.education.map((e) => `<li>${esc(e.what)}<span>${esc(e.where)} · ${e.when}</span></li>`).join("")}</ul>
</div>
<div>
<h2>Projects since 2021</h2>
<p>${LEDGER.length} projects · ${(Math.floor(TOTAL_AREA / 1000) * 1000).toLocaleString("en-US")}+ m² · ${CITIES.length} cities in Brazil and Portugal</p>
<p class="muted-s">${STAGE_LINE}</p>
<h2>Awards</h2>
<ul class="small-list">${FACTS.awards.map((a) => `<li>${esc(a.title)} — ${esc(a.project)}<span>${esc(a.org)}, ${a.year} · ${esc(a.category)}</span></li>`).join("")}<li><span>Team projects at Architects Office</span></li></ul>
<h2>Publications</h2>
<ul class="small-list">${FACTS.publications.map((p) => `<li>${esc(p.title)} — ${esc(p.outlet)}, ${p.year}${p.links.length ? `<span>${p.links.map((l) => l.label).join(", ")} editions</span>` : ""}</li>`).join("")}</ul>
<h2>Languages</h2>
<ul class="small-list">${FACTS.languages.map(([l, v]) => `<li>${l} — ${v}</li>`).join("")}</ul>
<h2>Software</h2>
<p>${FACTS.software.join(" · ")}</p>
<h2>Skills</h2>
<p>${FACTS.skills.join(" · ")}</p>
</div>
</div>
</article>
</div>
</main>`;
  return layout({ file: "resume.html", page: "resume", title: "Résumé — Filipe Meltzer, Architect & Urbanist",
    description: "Résumé of Filipe Meltzer, architect and urbanist in São Paulo: experience, awards, publications, education, languages and software.", body });
}

// ---------- recognition (awards and press) ----------
const PRESS = [...FACTS.publications.flatMap((p) => p.outlet.includes(" · ")
    ? p.links.map((l) => ({ outlet: l.label, title: p.title, slug: p.slug, year: p.year, links: [{ label: "Read", url: l.url }] }))
    : [{ ...p }]), ...FACTS.features];
const PRESS_COUNT = PRESS.length;
function recognition() {
  const r = "";
  const proj = (slug) => PROJECTS.find((p) => p.slug === slug);
  const projLink = (slug) => { const p = proj(slug); return `<a href="projects/${slug}.html">${esc(p.title)}</a><span class="rc-loc">${esc(p.location.split(",").map((x) => x.trim()).filter((x) => !/^[A-Z]{2}$/.test(x)).join(", "))}</span>`; };
  const awards = FACTS.awards.map((a) => `<li class="rc-row"><span class="rc-year mono-plain">${a.year}</span>` +
    `<span class="rc-main"><span class="rc-title">${esc(a.title)}</span><span class="rc-org">${esc(a.org)}</span><span class="rc-cat mono-plain">${esc(a.category)}</span>${a.url ? `<a class="rc-ext" href="${a.url}" rel="noopener">Award page ↗</a>` : ""}</span>` +
    `<span class="rc-proj">${projLink(a.slug)}</span></li>`).join("");
  const press = PRESS.map((p) => `<li class="rc-row"><span class="rc-year mono-plain">${p.year || ""}</span>` +
    `<span class="rc-main"><span class="rc-title">${esc(p.outlet)}</span>${p.note ? `<span class="rc-org">${esc(p.note)}</span>` : ""}<span class="rc-links">${p.links.map((l) => `<a class="rc-ext" href="${l.url}" rel="noopener">${esc(l.label)} ↗</a>`).join("")}</span></span>` +
    `<span class="rc-proj">${projLink(p.slug)}</span></li>`).join("");
  const body = `<main id="main">
<div class="wrap section rec-page">
<header class="page-head">
<p class="mono kicker">Recognition</p>
<h1 class="h1">Awards and press</h1>
<p class="lede">International awards and publications for projects I worked on in the concept team at Architects Office. They are team projects; my role in each is described on its project page.</p>
</header>
<dl class="figures rec-figures">
<div class="figure"><dt>international awards</dt><dd>${FACTS.awards.length}</dd></div>
<div class="figure"><dt>award-winning projects</dt><dd>${new Set(FACTS.awards.map((a) => a.slug)).size}</dd></div>
<div class="figure"><dt>publications and features</dt><dd>${PRESS_COUNT}</dd></div>
<div class="figure"><dt>projects published</dt><dd>${new Set(PRESS.map((p) => p.slug)).size}</dd></div>
</dl>
<section class="rc-block" aria-labelledby="aw-h">
<h2 id="aw-h" class="h2">Awards</h2>
<ul class="rc-list" role="list">${awards}</ul>
</section>
<section class="rc-block" aria-labelledby="pr-h">
<h2 id="pr-h" class="h2">Press</h2>
<ul class="rc-list" role="list">${press}</ul>
</section>
</div>
</main>`;
  return layout({ file: "recognition.html", page: "recognition", title: "Recognition — Filipe Meltzer, Architect & Urbanist",
    description: "Awards and press for projects Filipe Meltzer worked on at Architects Office: Monolyt, Masterplan Uruçuca and Casa PAR.", body });
}

// ---------- travel notebook: an unlisted page (no menu, no sitemap, noindex), reached from the small figure on the home page ----------
const NOTEBOOK = [
  ["notebook/amsterdam", "Watercolour of an ornate gateway and a red-brick corner building with a turret, in Amsterdam", "Muntplein, Amsterdam"],
  ["notebook/cntower", "Watercolour of the CN Tower rising beside a glass building", "CN Tower, Toronto"],
  ["notebook/farol", "Watercolour of a white lighthouse with a red lantern on the rocks by the sea", "Lighthouse of San José Ignacio, Uruguay"],
  ["notebook/castilhos", "Pen drawing of a mansard-roofed building with a domed tower", "Instituto Júlio de Castilhos, Porto Alegre"],
  ["notebook/rooftops", "Watercolour of a street of colourful old buildings seen from above", "A street of old buildings"],
  ["notebook/cafe", "Watercolour of a café corner with carved columns, a counter and bentwood chairs", "Café Imperial"],
  ["notebook/lion", "Pen drawing of a winged lion with a serpent's tail", "A winged lion"],
  ["notebook/facade", "Watercolour of a narrow old building with a bay window and a small tree", "A narrow facade"],
  ["notebook/ornaments", "Pen drawings of carved stone ornaments and brackets", "Ornaments"],
  ["notebook/plant", "Watercolour of a young banana plant with long leaves", "A banana plant"],
  ["notebook/lunch", "Watercolour of two hanging lamps above a plate of pasta and a dessert", "Lunch under the lamps"],
  ["notebook/house", "Watercolour of a low contemporary house by the water", "A house by the water"],
  ["notebook/passerby", "Watercolour of a woman with red hair, sunglasses, a yellow top and wide striped trousers", "A passer-by"]
];
function notebook() {
  const r = "";
  const tiles = NOTEBOOK.map(([key, alt, cap]) => `<li class="nb-tile"><a class="zoom light" href="${largest(r, key)}" data-caption="${esc(cap)}">${img(r, key, alt, { sizes: "(min-width: 900px) 30vw, 50vw" })}<span class="sr-only"> (open full size)</span></a><p class="nb-cap">${esc(cap)}</p></li>`).join("");
  const body = `<main id="main">
<header class="wrap p-head">
<p class="mono kicker">Off the record</p>
<h1 class="h1">Travel notebook</h1>
<p class="lede">Drawings and watercolours made while travelling, or just looking around — not for any project.</p>
</header>
<div class="wrap section nb-page">
<ul class="nb-grid" role="list">${tiles}</ul>
<p class="more"><a class="link-arrow" href="sketchbook.html">The project sketchbook ${ARROW}</a></p>
</div>
</main>`;
  return layout({ file: "notebook.html", page: "notebook", og: "sketchbook", title: "Travel notebook — Filipe Meltzer",
    description: "Travel drawings and watercolours by Filipe Meltzer.", body, extraHead: '<meta name="robots" content="noindex, nofollow">\n' });
}

// ---------- lab: small tools made with AI, usable by anyone (the apps live in apps/, in Portuguese) ----------
const TOOLS = [
  { href: "apps/escadas/", title: "Emergency stairs", std: "Fire department codes of SP, PR, GO, RS and MG",
    text: "How many emergency stairs a building needs, and of which type, from its state, use and height. It also gives the population, the exit width and the maximum travel distance, with the rule behind each answer." },
  { href: "apps/elevadores/", title: "Elevator traffic", std: "NBR 5665",
    text: "Traffic calculation for a group of elevators: population, round-trip time, interval and five-minute capacity, with a check against the limits and the number of cars that would meet them. The calculation can be saved and exported." }
];
function lab() {
  const items = TOOLS.map((t) => `<li class="lab-item"><a href="${t.href}"><h2 class="h3">${esc(t.title)}</h2><p class="lab-std mono">${esc(t.std)}</p><p class="lab-text">${esc(t.text)}</p><span class="link-arrow">Open the tool ${ARROW}</span></a></li>`).join("");
  const body = `<main id="main">
<header class="wrap p-head">
<p class="mono kicker">Lab</p>
<h1 class="h1">Tools for everyday design work</h1>
<p class="lede">Small apps I design and build with AI to take the repetitive part out of reading codes and sizing. Anyone can use them: they run entirely in the browser and nothing is sent to a server.</p>
</header>
<div class="wrap section lab-page">
<ul class="lab-list" role="list">${items}</ul>
<p class="lab-note">The tools are in Portuguese because they follow Brazilian standards. They are preliminary checks for early design stages: they do not replace the standards themselves, the design by a licensed professional, or the review by the authorities.</p>
</div>
</main>`;
  return layout({ file: "lab.html", page: "lab", title: "Lab — Filipe Meltzer, Architect & Urbanist",
    description: "Free tools by Filipe Meltzer for early design stages: emergency stairs by state fire code and elevator traffic by NBR 5665.", body });
}

// ---------- legacy address, 404, sitemap ----------
function legacy() {
  const list = PROJECTS.map((p) => `<li><a href="projects/${p.slug}.html">${esc(p.title)}</a></li>`).join("");
  const body = `<main id="main" class="wrap notice"><p class="mono">Projects</p><h1 class="h2">Project pages have moved.</h1><ul class="list-plain moved">${list}</ul></main>
<script>(function(){var s=new URLSearchParams(location.search).get("p");var al=${JSON.stringify(ALIASES)};s=al[s]||s;var ok=${JSON.stringify(PROJECTS.map((p) => p.slug))};if(s&&ok.indexOf(s)>=0)location.replace("projects/"+s+".html");})();</script>`;
  return layout({ file: "project.html", page: "projects", title: "Projects — Filipe Meltzer", description: "Projects by Filipe Meltzer.", body,
    extraHead: '<meta name="robots" content="noindex">\n' });
}
function notFound() {
  const body = `<main id="main" class="wrap notice"><p class="mono">404</p><h1 class="h1">This page does not exist.</h1><p class="more"><a class="link-arrow" href="index.html">Back to the portfolio ${ARROW}</a></p></main>`;
  return layout({ file: "404.html", page: "notfound", title: "Page not found — Filipe Meltzer", description: "Page not found.", body,
    extraHead: `<base href="/Portfolio/">\n<meta name="robots" content="noindex">\n` });
}

// ---------- write ----------
function write(file, html) { const f = path.join(OUT, file); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, html); }
function copy(dir) { fs.cpSync(path.join(ROOT, dir), path.join(OUT, dir), { recursive: true }); }

fs.mkdirSync(OUT, { recursive: true });
for (const f of fs.readdirSync(OUT)) fs.rmSync(path.join(OUT, f), { recursive: true, force: true }); // empty, keep the folder
for (const d of ["apps", "assets/css", "assets/js", "assets/img", "assets/draw", "assets/docs", "assets/og"]) copy(d);
fs.copyFileSync(path.join(ROOT, "assets/favicon.svg"), path.join(OUT, "assets/favicon.svg"));
fs.writeFileSync(path.join(OUT, ".nojekyll"), "");
write("index.html", home());
PROJECTS.forEach((p, i) => write(`projects/${p.slug}.html`, project(p, i)));
write("sketchbook.html", sketchbook());
write("profile.html", profile());
write("resume.html", resume());
write("recognition.html", recognition());
write("lab.html", lab());
write("notebook.html", notebook()); // unlisted: not in the menu or the sitemap
write("project.html", legacy());
for (const [from, to] of Object.entries(ALIASES)) {
  const p = PROJECTS.find((x) => x.slug === to);
  write(`projects/${from}.html`, `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${esc(p.title)} — Filipe Meltzer</title>` +
    `<link rel="canonical" href="${SITE_URL}projects/${to}.html"><meta http-equiv="refresh" content="0; url=${to}.html"><meta name="robots" content="noindex"></head>` +
    `<body><p>This project is now at <a href="${to}.html">${esc(p.title)}</a>.</p></body></html>\n`);
}
write("404.html", notFound());
const urls = ["", "profile.html", "sketchbook.html", "recognition.html", "lab.html", "apps/escadas/", "apps/elevadores/", "resume.html", ...PROJECTS.map((p) => `projects/${p.slug}.html`)];
write("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `<url><loc>${SITE_URL}${u}</loc></url>`).join("\n")}\n</urlset>\n`);
console.log(`Built ${urls.length} pages + project.html + 404.html into _site/`);

// Portuguese version (_site/pt/), made from the pages above with tools/pt.json
await import("./i18n.mjs");
