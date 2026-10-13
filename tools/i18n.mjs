/* Portuguese version of the site, made from the English pages built by tools/build.mjs.

   Usage:  node tools/i18n.mjs            → writes _site/pt/ (run after build.mjs)
           node tools/i18n.mjs --todo     → lists English texts that still have no translation

   Every text between tags, and the alt / title / aria-label / data-caption / data-alt /
   meta content attributes, is looked up in tools/pt.json ({ "English": "Português" }).
   Whitespace around a text is kept; the lookup uses the trimmed text. Numbers written
   the English way (123,346) are written the Portuguese way (123.346). Relative links to
   assets get one more "../" because the pages live one folder deeper; links between pages
   stay inside /pt/. A text with no translation stays in English and is listed with --todo. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE = path.join(ROOT, "_site");
const OUT = path.join(SITE, "pt");
const DICT_FILE = path.join(ROOT, "tools/pt.json");
const DICT = fs.existsSync(DICT_FILE) ? JSON.parse(fs.readFileSync(DICT_FILE, "utf8")) : {};
const SITE_URL = "https://filipeidea.github.io/Portfolio/";
const todo = new Set();
// language switch: the flag of the language the link leads to, in black and white (24 × 16)
const FLAG_US = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 16\" width=\"24\" height=\"16\" aria-hidden=\"true\" focusable=\"false\"><rect x=\".5\" y=\".5\" width=\"23\" height=\"15\" fill=\"#fff\" stroke=\"#111\"/><rect x=\"0\" y=\"0.000\" width=\"24\" height=\"1.231\" fill=\"#111\"/><rect x=\"0\" y=\"2.462\" width=\"24\" height=\"1.231\" fill=\"#111\"/><rect x=\"0\" y=\"4.923\" width=\"24\" height=\"1.231\" fill=\"#111\"/><rect x=\"0\" y=\"7.385\" width=\"24\" height=\"1.231\" fill=\"#111\"/><rect x=\"0\" y=\"9.846\" width=\"24\" height=\"1.231\" fill=\"#111\"/><rect x=\"0\" y=\"12.308\" width=\"24\" height=\"1.231\" fill=\"#111\"/><rect x=\"0\" y=\"14.769\" width=\"24\" height=\"1.231\" fill=\"#111\"/><rect x=\"0\" y=\"0\" width=\"10.080\" height=\"8.615\" fill=\"#111\"/><circle cx=\"1.68\" cy=\"1.08\" r=\"0.40\" fill=\"#fff\"/><circle cx=\"3.55\" cy=\"1.08\" r=\"0.40\" fill=\"#fff\"/><circle cx=\"5.41\" cy=\"1.08\" r=\"0.40\" fill=\"#fff\"/><circle cx=\"7.28\" cy=\"1.08\" r=\"0.40\" fill=\"#fff\"/><circle cx=\"9.15\" cy=\"1.08\" r=\"0.40\" fill=\"#fff\"/><circle cx=\"2.52\" cy=\"3.23\" r=\"0.40\" fill=\"#fff\"/><circle cx=\"4.39\" cy=\"3.23\" r=\"0.40\" fill=\"#fff\"/><circle cx=\"6.25\" cy=\"3.23\" r=\"0.40\" fill=\"#fff\"/><circle cx=\"8.12\" cy=\"3.23\" r=\"0.40\" fill=\"#fff\"/><circle cx=\"1.68\" cy=\"5.38\" r=\"0.40\" fill=\"#fff\"/><circle cx=\"3.55\" cy=\"5.38\" r=\"0.40\" fill=\"#fff\"/><circle cx=\"5.41\" cy=\"5.38\" r=\"0.40\" fill=\"#fff\"/><circle cx=\"7.28\" cy=\"5.38\" r=\"0.40\" fill=\"#fff\"/><circle cx=\"9.15\" cy=\"5.38\" r=\"0.40\" fill=\"#fff\"/><circle cx=\"2.52\" cy=\"7.54\" r=\"0.40\" fill=\"#fff\"/><circle cx=\"4.39\" cy=\"7.54\" r=\"0.40\" fill=\"#fff\"/><circle cx=\"6.25\" cy=\"7.54\" r=\"0.40\" fill=\"#fff\"/><circle cx=\"8.12\" cy=\"7.54\" r=\"0.40\" fill=\"#fff\"/></svg>";
const FLAG_BR = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 16\" width=\"24\" height=\"16\" aria-hidden=\"true\" focusable=\"false\"><rect width=\"24\" height=\"16\" fill=\"#111\"/><path d=\"M2.04 8L12 1.6320000000000001L21.96 8L12 14.368Z\" fill=\"#fff\"/><circle cx=\"12\" cy=\"8\" r=\"4\" fill=\"#111\"/><clipPath id=\"flag-br-globe\"><circle cx=\"12\" cy=\"8\" r=\"4\"/></clipPath><path clip-path=\"url(#flag-br-globe)\" d=\"M7 6.8Q12 4.4 17 8.8\" fill=\"none\" stroke=\"#fff\" stroke-width=\"1.04\"/></svg>";

const decode = (s) => s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
const encode = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const encodeAttr = (s) => encode(s).replace(/"/g, "&quot;");
const ptNumbers = (s) => s.replace(/\d{1,3}(?:,\d{3})+/g, (m) => m.replace(/,/g, "."));
const skip = (t) => !/[A-Za-z]/.test(t) || /^https?:|^[\w.-]+@[\w.-]+$|^www\./.test(t);

function tr(text) {
  const t = text.trim();
  if (!t || skip(t)) return text;
  const k = decode(t);
  if (!(k in DICT)) { todo.add(k); return text; }
  const lead = text.slice(0, text.indexOf(t[0])), trail = text.slice(text.lastIndexOf(t.at(-1)) + 1);
  return lead + encode(ptNumbers(DICT[k])) + trail;
}

const ATTRS = ["alt", "title", "aria-label", "data-caption", "data-alt", "content", "data-title"];
function translateTag(tag, depthUp) {
  // attributes with words
  let out = tag.replace(new RegExp(`\\s(${ATTRS.join("|")})="([^"]*)"`, "g"), (m, a, v) => {
    if (a === "content" && !/^<meta\s+(name="description"|property="og:(title|description)"|name="twitter:(title|description)")/.test(tag)) return m;
    const t = decode(v).trim();
    if (!t || skip(t)) return m;
    if (!(t in DICT)) { todo.add(t); return m; }
    return ` ${a}="${encodeAttr(ptNumbers(DICT[t]))}"`;
  });
  // relative asset paths one folder deeper
  out = out.replace(/\s(href|src|srcset|data-src|data-srcset|data-draw|imagesrcset)="([^"]*)"/g, (m, a, v) => {
    const fix = (u) => (/^(\.\.\/)*(assets|apps)\//.test(u) ? "../" + u : u);
    if (a.endsWith("srcset")) return ` ${a}="${v.split(", ").map((p) => { const [u, w] = p.split(" "); return fix(u) + (w ? " " + w : ""); }).join(", ")}"`;
    return ` ${a}="${fix(v)}"`;
  });
  return out;
}

function translatePage(html, rel) {
  // leave scripts and styles alone (JSON-LD keeps its English data)
  const parts = html.split(/(<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<[^>]+>)/);
  let out = parts.map((p) => {
    if (!p) return p;
    if (p.startsWith("<script")) return p.replace(/^<script[^>]*>/, (t) => t.replace(/\ssrc="((?:\.\.\/)*assets\/[^"]*)"/, ' src="../$1"'));
    if (p.startsWith("<style")) return p;
    if (p.startsWith("<")) return translateTag(p);
    return tr(p);
  }).join("");
  const enUrl = SITE_URL + rel.replace(/index\.html$/, ""), ptUrl = SITE_URL + "pt/" + rel.replace(/index\.html$/, "");
  out = out.replace('<html lang="en">', '<html lang="pt-BR">')
    .replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${ptUrl}">`)
    .replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${ptUrl}">`)
    .replace(/<meta property="og:locale" content="[^"]*">/, '<meta property="og:locale" content="pt_BR">');
  return { out, enUrl, ptUrl };
}

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const f = path.join(dir, d.name);
    if (d.isDirectory()) return d.name === "pt" || d.name === "assets" || d.name === "apps" ? [] : walk(f);
    return d.name.endsWith(".html") ? [f] : [];
  });
}

const pages = walk(SITE);
const results = pages.map((f) => {
  const rel = path.relative(SITE, f).split(path.sep).join("/");
  const html = fs.readFileSync(f, "utf8");
  return { f, rel, html, ...translatePage(html, rel) };
});

if (process.argv.includes("--todo")) {
  const list = [...todo].sort();
  fs.writeFileSync(path.join(ROOT, "tools/pt-todo.json"), JSON.stringify(Object.fromEntries(list.map((k) => [k, ""])), null, 1));
  console.log(list.length, "texts without translation → tools/pt-todo.json");
  process.exit(0);
}

for (const r of results) {
  // language switch and hreflang, in both versions
  const alt = `<link rel="alternate" hreflang="en" href="${r.enUrl}">\n<link rel="alternate" hreflang="pt-BR" href="${r.ptUrl}">\n`;
  const depth = r.rel.split("/").length - 1;
  const up = "../".repeat(depth);
  if (r.html.includes('hreflang="pt-BR"')) continue; // already done (i18n run twice without a new build)
  const enHtml = r.html.replace("</head>", alt + "</head>")
    .replace('<span class="lang-switch"></span>', `<a class="lang-switch" href="${up}pt/${r.rel}" hreflang="pt-BR" lang="pt-BR" title="Português" aria-label="Português">${FLAG_BR}</a>`);
  fs.writeFileSync(r.f, enHtml);
  const ptHtml = r.out.replace("</head>", alt + "</head>")
    .replace('<span class="lang-switch"></span>', `<a class="lang-switch" href="../${up}${r.rel}" hreflang="en" lang="en" title="English" aria-label="English">${FLAG_US}</a>`);
  const dest = path.join(OUT, r.rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, ptHtml);
}
// sitemap: add the Portuguese addresses
const sm = path.join(SITE, "sitemap.xml");
if (fs.existsSync(sm)) {
  const x = fs.readFileSync(sm, "utf8");
  const pt = [...x.matchAll(/<loc>([^<]*)<\/loc>/g)].filter((m) => !m[1].includes("/apps/")).map((m) => `<url><loc>${m[1].replace(SITE_URL, SITE_URL + "pt/")}</loc></url>`).join("\n");
  fs.writeFileSync(sm, x.replace("</urlset>", pt + "\n</urlset>"));
}
console.log(`Portuguese: ${results.length} pages into _site/pt/` + (todo.size ? ` — ${todo.size} texts still in English (node tools/i18n.mjs --todo)` : ""));
