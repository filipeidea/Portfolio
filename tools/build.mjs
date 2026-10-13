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
for (const f of ["projects.js", "images.js", "facts.js"]) {
  new Function(fs.readFileSync(path.join(ROOT, "assets/data", f), "utf8"))();
}
const { PROJECTS, IMAGES, FACTS } = globalThis.window;

// ---------- helpers ----------
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
  ["profile.html", "Profile", "profile"], ["resume.html", "Résumé", "resume"], ["#contact", "Contact", "contact"]];

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
<meta property="og:site_name" content="Filipe Meltzer — Architect &amp; Urbanist">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${ogImg}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#f3f2ee">
<link rel="icon" href="${r}assets/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600&amp;family=IBM+Plex+Mono:wght@400&amp;family=Newsreader:ital,opsz,wght@0,6..72,400;1,6..72,400&amp;display=swap">
<link rel="stylesheet" href="${r}assets/css/style.css?v=${V.css}">
${extraHead}${jsonld ? `<script type="application/ld+json">${JSON.stringify(jsonld)}</script>\n` : ""}</head>
<body data-page="${page}">
<a class="skip" href="#main">Skip to content</a>
<header class="site-header">
<div class="wrap bar">
<a class="brand" href="${r}index.html">Filipe Meltzer <small>Architect &amp; Urbanist</small></a>
<button class="menu-btn" type="button" aria-expanded="false" aria-controls="nav" aria-label="Open menu" hidden><span></span><span></span><span></span></button>
<nav class="nav" id="nav" aria-label="Main">${nav}</nav>
</div>
</header>
${body}
<footer id="contact" class="site-footer">
<div class="wrap">
<p class="mono">Contact</p>
<h2 class="foot-cta">Let’s talk about architecture.</h2>
<div class="foot-grid">
<p class="foot-note">Open to conversations with architecture practices in Brazil and abroad. The quickest way to reach me is through LinkedIn.</p>
<div><p class="mono">Reach</p><ul class="foot-links">${reach}</ul></div>
<div><p class="mono">Pages</p><ul class="foot-links"><li><a href="${r}index.html#projects">Projects</a></li><li><a href="${r}sketchbook.html">Sketchbook</a></li><li><a href="${r}profile.html">Profile</a></li><li><a href="${r}resume.html">Résumé</a></li></ul></div>
</div>
<div class="foot-base mono"><span>© ${new Date().getFullYear()} Filipe Meltzer · ${esc(FACTS.registration)}</span><span>${esc(FACTS.base)}</span></div>
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
/* The slideshow fills 76% of the screen height and crops to fill the width, so on tall
   (portrait) screens the image must be wider than the screen to stay sharp. */
const HERO_SIZES = "(max-aspect-ratio: 3/2) 125vh, 100vw";
function home() {
  const r = "";
  const heroes = [["masterplan-urucuca", "urucuca/canopy"], ["monolyt", "monolyt/corner"], ["quinta", "quinta/pool"], ["casa-bvv", "bvv/pavilion"]];
  const altFor = (p, key) => { for (const g of p.gallery) for (const x of g.images || [g]) if (x.img === key) return x.alt; return p.title; };
  const slides = heroes.map(([slug, key], i) => {
    const p = PROJECTS.find((x) => x.slug === slug);
    return `<figure class="hero-slide${i === 0 ? " is-active" : ""}" data-title="${esc(p.title)}" data-location="${esc(p.location)}" data-href="projects/${slug}.html"${i ? ' aria-hidden="true"' : ""}>` +
      img(r, key, altFor(p, key), { eager: i === 0, lazyData: i > 0, sizes: HERO_SIZES }) + "</figure>";
  }).join("");
  const first = PROJECTS.find((x) => x.slug === heroes[0][0]);
  const SIZES = ["s-xl", "s-l", "s-r", "s-m", "s-a", "s-b"];
  const cats = ["All", ...new Set(PROJECTS.map((p) => p.category))];
  /* Cards crop the image to a fixed shape, so a wide image in a tall frame needs more pixels
     than the column width. Ask the browser for: column width × (image ratio ÷ frame ratio). */
  const FRAME = { "s-xl": [100, 21 / 9], "s-l": [58, 4 / 3], "s-r": [42, 4 / 5], "s-m": [67, 16 / 9], "s-a": [50, 1], "s-b": [50, 1] };
  const cardSizes = (size, ratio) => {
    const [col, fr] = FRAME[size];
    const desk = Math.round(col * Math.max(1, ratio / fr));
    const phone = Math.round(100 * Math.max(1, ratio / (4 / 3))); // cards are 4:3 on phones
    return `(min-width: 760px) ${Math.min(desk, 200)}vw, ${Math.min(phone, 200)}vw`;
  };
  const cards = PROJECTS.map((p, i) => {
    const size = SIZES[i % SIZES.length];
    const authorship = p.practice === "Architects Office" ? "Team project · Architects Office" : "Individual work · " + p.practice.split(" — ")[0];
    return `<li class="card ${size}" data-cat="${esc(p.category)}"><a href="projects/${p.slug}.html">` +
      `<span class="ph">${img(r, p.cover, "", { sizes: cardSizes(size, need(p.cover).r) })}</span>` +
      `<span class="meta"><span class="num" aria-hidden="true">${pad(i + 1)}</span><h3>${esc(p.title)}</h3>` +
      `<span class="sub">${esc(p.typology)} · ${esc(p.location)}${p.year ? " · " + esc(p.year) : ""}</span>` +
      `<span class="tags"><span>${esc(authorship)}</span>${p.awards?.length ? `<span class="award">${p.awards.length > 1 ? p.awards.length + " awards" : "Award"}</span>` : ""}</span>` +
      "</span></a></li>";
  }).join("");
  const figures = FACTS.figures.map((f) => `<div class="figure"><dt>${esc(f.label)}</dt><dd>${esc(f.value)}${f.unit ? ` <small>${esc(f.unit)}</small>` : ""}</dd></div>`).join("");
  const body = `<main id="main">
<section class="wrap intro" aria-labelledby="intro-h">
<div class="intro-grid">
<h1 id="intro-h" class="display">Filipe Meltzer <span class="role">Architect &amp; Urbanist</span></h1>
<div>
<p class="lede">Architect and urbanist in São Paulo. In the concept team at Architects Office I turn briefs, zoning rules, area targets and site conditions into feasibility studies and schematic designs — for housing, hospitality, mixed-use, corporate and urban projects in Brazil and Portugal.</p>
<p class="intro-links"><a class="link-arrow" href="#projects">Selected projects ${ARROW}</a> <a class="link-arrow" href="profile.html">Profile ${ARROW}</a> <a class="link-arrow" href="#contact">Contact ${ARROW}</a></p>
</div>
</div>
</section>
<section class="hero" aria-label="Featured projects">
<div class="hero-frame">${slides}</div>
<div class="wrap hero-bar">
<p class="hero-caption" aria-live="polite"><a href="projects/${first.slug}.html">${esc(first.title)}</a> <span class="mono">${esc(first.location)}</span></p>
<div class="hero-controls" hidden>
<span class="hero-count mono">01 / ${pad(heroes.length)}</span>
<button type="button" class="hero-prev" aria-label="Previous image">${ARROW_L}</button>
<button type="button" class="hero-next" aria-label="Next image">${ARROW}</button>
<button type="button" class="hero-play" aria-label="Pause slideshow"></button>
</div>
</div>
</section>
<section class="wrap figures-wrap" aria-labelledby="fig-h">
<h2 id="fig-h" class="mono">In numbers</h2>
<dl class="figures">${figures}</dl>
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
<section class="section sketch-teaser" aria-labelledby="sk-h">
<div class="wrap split rev">
<div class="sketch-strip">
<a href="sketchbook.html#quinta">${img(r, "sketch/cathedral", "Pen drawing of an ornate Portuguese church facade", { sizes: "(min-width: 900px) 18vw, 33vw" })}</a>
<a href="sketchbook.html#storytelling">${img(r, "sketch/storytelling", "Sequence of drawings: rocks, a tree among them and green building volumes", { sizes: "(min-width: 900px) 18vw, 33vw" })}</a>
<a href="sketchbook.html#housing">${img(r, "sketch/multifamily-house", "Coloured sketch of a dwelling with terraces and planting", { sizes: "(min-width: 900px) 18vw, 33vw" })}</a>
</div>
<div>
<p class="mono">Sketchbook</p>
<h2 id="sk-h" class="h2">Thinking with the hand.</h2>
<p class="teaser-text">I use freehand drawing to read existing architecture, test spatial ideas, brief the people producing renders and tell the story of a concept.</p>
<a class="link-arrow" href="sketchbook.html">Open the sketchbook ${ARROW}</a>
</div>
</div>
</section>
<section class="wrap section" aria-labelledby="pr-h">
<div class="split">
<div class="portrait">${img(r, "profile/portrait", "Portrait of Filipe Meltzer", { sizes: "(min-width: 900px) 30vw, 100vw" })}</div>
<div>
<p class="mono">Profile</p>
<h2 id="pr-h" class="h2">From brief and constraints to a clear architectural proposal.</h2>
<p class="teaser-text">Concept design, feasibility and zoning studies, schematic design and coordination with engineering consultants — and, before Architects Office, three years running my own residential and interior projects through to construction.</p>
<p class="actions"><a class="btn" href="profile.html">Read profile</a> <a class="btn ghost" href="resume.html">Résumé</a></p>
</div>
</div>
</section>
</main>`;
  return layout({ file: "index.html", page: "home", title: "Filipe Meltzer — Architect & Urbanist, São Paulo",
    description: "Portfolio of Filipe Meltzer, architect and urbanist in São Paulo: concept design and feasibility studies for housing, hospitality, mixed-use, corporate and urban projects in Brazil and Portugal.",
    body, jsonld: person, extraHead: `<link rel="preload" as="image" href="${src(r, heroes[0][1], need(heroes[0][1]).w.at(-2))}" imagesrcset="${need(heroes[0][1]).w.map((w) => `${src(r, heroes[0][1], w)} ${w}w`).join(", ")}" imagesizes="${HERO_SIZES}" fetchpriority="high">\n` });
}

// ---------- project pages ----------
function project(p, i) {
  const r = "../";
  const prev = PROJECTS[(i - 1 + PROJECTS.length) % PROJECTS.length], next = PROJECTS[(i + 1) % PROJECTS.length];
  const altFor = (key) => { for (const g of p.gallery) for (const x of g.images || [g]) if (x.img === key) return x.alt; return p.title; };
  const team = p.practice === "Architects Office";
  const facts = [
    ["Location", esc(p.location)], ["Typology", esc(p.typology)],
    ["Year", p.year ? esc(p.year) + (p.yearNote ? ` <span class="muted">(${esc(p.yearNote)})</span>` : "") : ""],
    ["Area", p.area ? esc(p.area) : ""],
    [team ? "Office" : "Context", esc(team ? "Architects Office — team project" : p.practice)],
    ["Awards", p.awards?.length ? "<ul>" + p.awards.map((a) => `<li>${esc(a)}</li>`).join("") + "</ul>" : ""],
    ["Published", p.publications?.length ? "<ul>" + p.publications.map((x) => `<li>${x.url ? `<a href="${esc(x.url)}" rel="noopener">${esc(x.label)}</a>` : esc(x.label)}</li>`).join("") + "</ul>" : ""]
  ].filter((f) => f[1]).map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("");
  const teamHtml = p.team ? esc(p.team).replace("Filipe Meltzer", "<strong>Filipe Meltzer</strong>") : "";
  const gallery = p.gallery.filter((g) => g.img !== p.cover).map((g) => {
    if (g.images) return `<div class="g-${g.layout}">` + g.images.map((o) => fig(r, o, g.layout === "pair" ? "(min-width: 760px) 50vw, 100vw" : "(min-width: 760px) 33vw, 100vw", o.caption ? "drawing" : "", !!o.caption)).join("") + "</div>";
    const ratio = need(g.img).r;
    const cls = `g-${g.layout}${g.tall || (g.layout !== "small" && ratio < 1.25) ? " tall" : ""}${g.caption ? " drawing" : ""}`;
    return fig(r, g, g.layout === "small" ? "(min-width: 760px) 58vw, 100vw" : "100vw", cls, !!g.caption);
  }).join("\n");
  const body = `<main id="main">
<article>
<header class="wrap p-head">
<nav class="crumbs mono" aria-label="Breadcrumb"><a href="../index.html#projects">Projects</a> <span aria-hidden="true">/</span> <span>${pad(i + 1)} of ${pad(PROJECTS.length)}</span></nav>
<h1 class="h1">${esc(p.title)}</h1>
<p class="lede">${esc(p.summary)}</p>
</header>
<div class="p-hero">${zoom(r, { img: p.cover, alt: altFor(p.cover) }, "100vw").replace('loading="lazy"', 'fetchpriority="high"')}</div>
<div class="wrap">
<div class="p-body">
<dl class="facts">${facts}</dl>
<div class="p-text">
<div class="prose">${p.description.map((t) => `<p>${esc(t)}</p>`).join("")}</div>
<section class="p-role" aria-labelledby="role-h">
<h2 id="role-h" class="mono">My role</h2>
<p>${esc(p.role)}</p>
${p.stages?.length ? `<ul class="stages" aria-label="Design stages">${p.stages.map((s) => `<li>${esc(s)}</li>`).join("")}</ul>` : ""}
</section>
${teamHtml || p.credit ? `<div class="credits">${teamHtml ? `<h2 class="mono">Team</h2><p>${teamHtml}</p>` : ""}${p.credit ? `<p>${esc(p.credit)}</p>` : ""}</div>` : ""}
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
    text: "Before the design of the Quinta, I drew the architecture of Portugal — monasteries, palaces, squares, chimneys, tiles and openings — to understand its proportions and details and reinterpret them in a contemporary estate.",
    link: ["projects/quinta.html", "See the Quinta project"],
    items: [
      ["sketch/cathedral", "Detailed pen drawing of an ornate Portuguese church facade", "Church facade", "c5"],
      ["sketch/details", "Grid of twelve small sketches of Portuguese buildings and details: houses, a church, a tiled facade and a wooden balcony", "Chimneys, tiles, openings, balconies", "c7"],
      ["sketch/lisbon", "Panorama sketches of Portuguese landmarks including a domed palace, a triumphal arch and a bridge", "Panorama studies", "c12"],
      ["sketch/arch", "Pen sketch of the Portugal Pavilion in Lisbon, its concrete canopy hanging between two porticoes", "Portugal Pavilion, Lisbon", "c8 o3"],
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
      ["sketch/plaza-studies", "Three small watercolour studies of terraced landscape and planting", "Landscape studies", "c12"],
      ["sketch/plaza", "Watercolour perspective of a palm-lined public plaza with people walking", "Plaza perspective", "c12"]] },
  { id: "storytelling", label: "04 · Storytelling", title: "A concept told in drawings",
    text: "Drawings used to tell the concept of a project as a sequence: rocks, a tree growing among them, and the building volumes that follow.",
    items: [
      ["sketch/storytelling", "Vertical sequence of drawings: a pile of rocks, smaller rocks, a tree among rocks and green building volumes", "Concept sequence", "c4 o3"],
      ["iguatemi/sketch", "Watercolour sketch of a green, twisting tower among existing buildings", "Iguatemi 306 — concept sketch", "c4"]] },
  { id: "barrinhas", label: "05 · Hotel Barrinhas, Ceará", title: "Arranging a hotel by the sea",
    text: "Early sketches for the arrangement of guest buildings, pools and gardens on the site.",
    link: ["projects/hotel-barrinhas.html", "See the Hotel Barrinhas project"],
    items: [
      ["barrinhas/sketch-1", "Coloured axonometric sketch of hotel pavilions, pools and dunes", "Site sketch", "c7"],
      ["barrinhas/sketch-2", "Line sketches of guest buildings around a pool", "Guest buildings", "c5"]] }
];
function sketchbook() {
  const r = "";
  const sizesFor = (c) => c.startsWith("c12") ? "100vw" : c.startsWith("c4") ? "(min-width: 760px) 33vw, 100vw" : "(min-width: 760px) 58vw, 100vw";
  const groups = SKETCHBOOK.map((g) => `<section id="${g.id}" class="sk-group" aria-labelledby="${g.id}-h">
<div class="sk-head"><p class="mono">${esc(g.label)}</p><div><h2 id="${g.id}-h" class="h3">${esc(g.title)}</h2><p>${esc(g.text)}</p></div></div>
<div class="sk-grid">${g.items.map(([key, alt, cap, c]) => fig(r, { img: key, alt, caption: cap }, sizesFor(c), c, true)).join("")}</div>
${g.link ? `<p class="more"><a class="link-arrow" href="${g.link[0]}">${g.link[1]} ${ARROW}</a></p>` : ""}
</section>`).join("\n");
  const body = `<main id="main">
<header class="wrap p-head">
<p class="mono kicker">Sketchbook</p>
<h1 class="h1">Thinking with the hand</h1>
<p class="lede">I start most projects on paper. These freehand drawings were made to read existing architecture, test spatial ideas, brief the people producing renders and tell the story of a concept — most of them for projects at Architects Office.</p>
</header>
<div class="wrap">
${groups}
</div>
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
    (p.links.length ? `<br><span class="muted">Editions: ${p.links.map((l) => `<a href="${l.url}" rel="noopener" hreflang="${l.label === "English" ? "en" : l.label === "Portuguese" ? "pt" : "es"}">${l.label}</a>`).join(", ")}</span>` : "") +
    `</span><span class="mono">${p.year}</span></li>`).join("");
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
<p>Since 2021 I have worked in the concept team at Architects Office in São Paulo, on ${FACTS.figures[0].value} projects in Brazil and Portugal: feasibility studies, zoning and area analyses for São Paulo and other states, schematic designs, coordination with engineering consultants, and the presentation of each concept. I was Project Leader for Murata 157, a 21,400 m² residential building in Londrina.</p>
<p>Before that I ran my own practice (2018–2021), taking residential and interior projects from first design through permit approval, construction drawings and site management, after two years as a designer at Schelle Architecture + Design. Hand sketching remains central to how I think and communicate.</p>
<p>I graduated in Architecture and Urbanism from UNISINOS in Rio Grande do Sul, with an academic exchange at the Universidad Nacional de Mar del Plata, Argentina.</p>
</div>
<p class="actions"><a class="btn" href="resume.html">View résumé</a> <a class="btn ghost" href="${FACTS.cv}" download>Download CV (PDF)</a></p>
</div>
</section>

<section class="cv-block" aria-labelledby="exp">
<h2 id="exp" class="mono">Experience</h2>
<div class="entries">${entries(FACTS.experience, true)}</div>
</section>

<section class="cv-block" aria-labelledby="rec">
<h2 id="rec" class="mono">Awards &amp; publications</h2>
<div class="cols">
<div><h3 class="h3">Awards</h3><ul class="list-plain rec">${awardsList(r)}</ul><p class="note">Awarded to team projects at Architects Office, in which I took part.</p></div>
<div><h3 class="h3">Publications</h3><ul class="list-plain rec">${pubsList(r)}</ul><p class="note">Team project at Architects Office.</p></div>
</div>
</section>

<section class="cv-block" aria-labelledby="pl">
<h2 id="pl" class="mono">Projects across places</h2>
<div class="places">
${fig(r, { img: "profile/places-map", alt: "Map of Brazil marking the cities where projects were developed, and Marateca, Portugal", caption: "Map from my CV" }, "(min-width: 900px) 55vw, 100vw", "")}
<div>
<p class="lede">From the south of Brazil to Portugal: ${FACTS.places.length} locations, across residential, hospitality, urban and mixed-use projects.</p>
<ul class="places-list">${FACTS.places.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
</div>
</div>
</section>

<section class="cv-block" aria-labelledby="sk">
<h2 id="sk" class="mono">Skills &amp; education</h2>
<div class="cols">
<div><h3 class="h3">Skills</h3><ul class="list-plain">${FACTS.skills.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>
<div><h3 class="h3">Software</h3><ul class="list-plain">${FACTS.software.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
<h3 class="h3 spaced">Languages</h3><ul class="list-plain">${FACTS.languages.map(([l, v]) => `<li><span>${l}</span><span class="muted">${v}</span></li>`).join("")}</ul></div>
<div><h3 class="h3">Education</h3><ul class="list-plain">${FACTS.education.map((e) => `<li><span>${esc(e.what)}<br><span class="muted">${esc(e.where)}</span></span><span class="mono">${e.when}</span></li>`).join("")}</ul>
<p class="note">Registered architect · ${esc(FACTS.registration)}</p>
<p class="more"><a class="link-arrow" href="projects/porto-cultural-tramandai.html">Final thesis: Porto Cultural Tramandaí ${ARROW}</a></p></div>
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

// ---------- legacy address, 404, sitemap ----------
function legacy() {
  const list = PROJECTS.map((p) => `<li><a href="projects/${p.slug}.html">${esc(p.title)}</a></li>`).join("");
  const body = `<main id="main" class="wrap notice"><p class="mono">Projects</p><h1 class="h2">Project pages have moved.</h1><ul class="list-plain moved">${list}</ul></main>
<script>(function(){var s=new URLSearchParams(location.search).get("p");var ok=${JSON.stringify(PROJECTS.map((p) => p.slug))};if(s&&ok.indexOf(s)>=0)location.replace("projects/"+s+".html");})();</script>`;
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
for (const d of ["assets/css", "assets/js", "assets/img", "assets/docs", "assets/og"]) copy(d);
fs.copyFileSync(path.join(ROOT, "assets/favicon.svg"), path.join(OUT, "assets/favicon.svg"));
fs.writeFileSync(path.join(OUT, ".nojekyll"), "");
write("index.html", home());
PROJECTS.forEach((p, i) => write(`projects/${p.slug}.html`, project(p, i)));
write("sketchbook.html", sketchbook());
write("profile.html", profile());
write("resume.html", resume());
write("project.html", legacy());
write("404.html", notFound());
const urls = ["", "profile.html", "sketchbook.html", "resume.html", ...PROJECTS.map((p) => `projects/${p.slug}.html`)];
write("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `<url><loc>${SITE_URL}${u}</loc></url>`).join("\n")}\n</urlset>\n`);
console.log(`Built ${urls.length} pages + project.html + 404.html into _site/`);
