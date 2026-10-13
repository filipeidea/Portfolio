/*
 * PROFESSIONAL FACTS — one source for the profile, résumé and home page figures.
 * Every number here has its source and counting rule written next to it, so the
 * site, the résumé page and the PDF can be kept consistent.
 *
 * Sources:
 *   SHEET = Filipe's project spreadsheet "projetos FILIPE + AO" (Google Sheets, read 13 Oct 2026)
 *           — primary source for every project's area, year, city, role and stage
 *   CV   = assets/docs/Filipe-Meltzer-CV.pdf (2026, "REV01")
 *   PF   = portfolio filipe 2025_web.pdf — project sheets, roles, dates
 *   PRESS = public articles (linked where used)
 */
window.FACTS = {
  name: "Filipe Meltzer",
  title: "Architect & Urbanist",
  base: "São Paulo, Brazil",
  registration: "CAU/BR 145917-1", // PF, cover page
  email: "filipemeltzer@outlook.com", // confirmed by Filipe, 12 Oct 2026
  linkedin: "https://www.linkedin.com/in/filipemeltzer", // CV
  cv: "assets/docs/Filipe-Meltzer-CV.pdf",

  /* LEDGER — every project since 2021, from SHEET (client names deliberately left out).
   * stage = last stage delivered: EV feasibility study · EP schematic design ·
   *         AP design development · PE construction documents
   * area in m² (null when the sheet has none); slug = page on this site, if any.
   * Casa Sapucaí was a Triptyque Architecture project; all others Architects Office.
   */
  ledger: [
    { name: "Floriano 310", year: 2024, type: "Corporate", area: 9769.16, city: "São Paulo, SP", role: "Dedicated architect", stage: "EV" },
    { name: "Iguatemi 306", year: 2024, type: "Corporate", area: 49811.18, city: "São Paulo, SP", role: "Dedicated architect", stage: "EV", slug: "iguatemi-306" },
    { name: "UDI", year: 2024, type: "Corporate", area: 17366.66, city: "Uberlândia, MG", role: "Dedicated architect", stage: "EP" },
    { name: "Barrinhas", year: 2024, type: "Hotel", area: 2652.74, city: "Preá, CE", role: "Dedicated architect", stage: "EP", slug: "hotel-barrinhas" },
    { name: "Masterplan Uruçuca", year: 2023, type: "Hotel and masterplan", area: 27771.00, city: "Uruçuca, BA", role: "Dedicated architect", stage: "EP", slug: "masterplan-urucuca" },
    { name: "Dulcídio 1202", year: 2022, type: "Mixed-use", area: null, city: "Curitiba, PR", role: "Architect", stage: "EV" },
    { name: "Mussi 226", year: 2026, type: "Mixed-use", area: 40897.40, city: "Itajaí, SC", role: "Dedicated architect", stage: "EV" },
    { name: "INC 17", year: 2025, type: "Mixed-use", area: 29512.85, city: "Itapema, SC", role: "Architect", stage: "EP" },
    { name: "Moraes SN", year: 2025, type: "Mixed-use", area: 51591.73, city: "Natal, RN", role: "Dedicated architect", stage: "EV" },
    { name: "Pamplona 1704", year: 2026, type: "Mixed-use", area: 125490.67, city: "São Paulo, SP", role: "Dedicated architect", stage: "EV" },
    { name: "Valente-Meireles", year: 2024, type: "Residential building", area: 9874.19, city: "Fortaleza, CE", role: "Architect", stage: "EP" },
    { name: "1144", year: 2024, type: "Residential building", area: 42708.29, city: "Goiânia, GO", role: "Dedicated architect", stage: "AP" },
    { name: "Hortensias SN", year: 2023, type: "Residential building", area: 6238.04, city: "Gramado, RS", role: "Dedicated architect", stage: "EP", slug: "gramado" },
    { name: "Monolyt", year: 2022, type: "Residential building", area: 11473.58, city: "Balneário Camboriú, SC", role: "Architect", stage: "EP", slug: "monolyt" },
    { name: "Murata 157", year: 2025, type: "Residential building", area: 21394.86, city: "Londrina, PR", role: "Project Leader", stage: "EP" },
    { name: "Penteado 84", year: 2022, type: "Residential building", area: 3367.12, city: "São Paulo, SP", role: "Dedicated architect", stage: "EV" },
    { name: "Gaivota 530", year: 2024, type: "Residential building", area: 21725.63, city: "São Paulo, SP", role: "Dedicated architect", stage: "EV", slug: "gaivota" },
    { name: "Leite 668", year: 2025, type: "Residential building", area: 6564.54, city: "São Paulo, SP", role: "Dedicated architect", stage: "EP" },
    { name: "Casa PAR", year: 2022, type: "Residential house", area: 574, city: "Monte Mor, SP", role: "Architect", stage: "PE", slug: "casa-par" },
    { name: "Marateca (Quinta)", year: 2024, type: "Residential house", area: 1458.25, city: "Marateca, Portugal", role: "Dedicated architect", stage: "EV", slug: "quinta" },
    { name: "Casa Sapucaí", year: 2021, type: "Residential house", area: 1290.89, city: "Quinta da Baronesa, SP", role: "Dedicated architect", stage: "AP", slug: "casa-sapucai", office: "Triptyque" },
    { name: "Antonio 3227", year: 2026, type: "Retrofit", area: 10572.63, city: "São Paulo, SP", role: "Dedicated architect", stage: "EP" },
    { name: "Gleba AB", year: 2026, type: "Urban design", area: null, city: "Araçariguama, SP", role: "Dedicated architect", stage: "EV" }
  ],
  stageNames: { EV: "Feasibility study", EP: "Schematic design", AP: "Design development", PE: "Construction documents" },

  /* Typology table (home page). Counts and areas computed from the ledger by tools/build.mjs:
   * Masterplan Uruçuca counts under both hotels and masterplan; its area (27,771 m², site)
   * is counted once, under masterplan. Projects without area data are excluded from totals.
   * Check: total 492,105.41 m² = SHEET total. 23 projects, 17 locations.
   */
  typologies: [
    { label: "Residential buildings", match: ["Residential building"] },
    { label: "Mixed-use", match: ["Mixed-use"] },
    { label: "Corporate", match: ["Corporate"] },
    { label: "Residential houses", match: ["Residential house"] },
    { label: "Masterplan & urban design", match: ["Hotel and masterplan", "Urban design"] },
    { label: "Hotels", match: ["Hotel", "Hotel and masterplan"], areaOnly: ["Hotel"] },
    { label: "Retrofit", match: ["Retrofit"] }
  ],

  awardsCount: 3, // three awards for two team projects (Monolyt ×2, Masterplan Uruçuca)

  /* Map of locations (profile page). x, y = position on assets/img/profile/places-america
   * (América.png), in % of its width/height, computed from each city's latitude/longitude
   * (the map is a Mercator projection: x = 62.71 + (lon + 34.79) * 0.9086,
   * y = 13.63 - 1.7694 * mercator(lat), in %). Cities closer together than the dots can show
   * share a "group": one dot, one label, one card listing each city. "side" = label side.
   * Marateca, Portugal is off the map: shown as a note at the top, towards Europe. */
  mapGroups: {
    sp: { label: "São Paulo +3", side: "r" },
    sc: { label: "Itajaí · Itapema · B. Camboriú", side: "r" }
  },
  mapPoints: [
    { city: "Gramado, RS", x: 48.10, y: 68.06, side: "l" },
    { city: "Itajaí, SC", x: 50.11, y: 63.10, group: "sc" },
    { city: "Itapema, SC", x: 50.16, y: 63.46, group: "sc" },
    { city: "Balneário Camboriú, SC", x: 50.14, y: 63.26, group: "sc" },
    { city: "Curitiba, PR", x: 49.56, y: 60.18, side: "l" },
    { city: "Londrina, PR", x: 47.84, y: 56.06, side: "l" },
    { city: "São Paulo, SP", x: 51.96, y: 56.52, group: "sp" },
    { city: "Araçariguama, SP", x: 51.57, y: 56.31, group: "sp" },
    { city: "Monte Mor, SP", x: 51.34, y: 55.37, group: "sp" },
    { city: "Quinta da Baronesa, SP", x: 52.04, y: 55.37, group: "sp" },
    { city: "Uberlândia, MG", x: 50.46, y: 47.73, side: "l" },
    { city: "Goiânia, GO", x: 49.58, y: 43.59, side: "l" },
    { city: "Uruçuca, BA", x: 58.63, y: 39.73, side: "r" },
    { city: "Fortaleza, CE", x: 59.32, y: 20.23, side: "r" },
    { city: "Natal, RN", x: 62.33, y: 23.89, side: "r" },
    { city: "Preá, CE", x: 57.59, y: 18.62, side: "l" },
    { city: "Marateca, Portugal", x: 66.5, y: 5, side: "l", abroad: true }
  ],

  experience: [
    {
      org: "Architects Office", when: "2021 — Present", where: "São Paulo, Brazil",
      role: "Architect, concept team",
      points: [
        "Projects for housing, mixed-use, corporate, hospitality and urban design in Brazil and Portugal — feasibility studies, schematic design and coordination with engineering consultants.",
        "Project Leader for Murata 157, a 21,395 m² residential building in Londrina.",
        "Zoning, site and area studies for São Paulo and other states; floor plans for the São Paulo housing market; concept presentations and storytelling.",
        "Key projects: Pamplona 1704 (125,491 m² mixed-use, São Paulo), Moraes SN (51,592 m² mixed-use, Natal) and Iguatemi 306 (49,811 m² corporate, São Paulo)."
      ]
    },
    { org: "Triptyque Architecture", when: "2021", where: "São Paulo, Brazil", role: "Architect",
      points: ["Casa Sapucaí (1,291 m², Quinta da Baronesa, SP): coordinated the architecture with the engineering consultants’ projects from schematic design to issue for construction."] },
    {
      org: "Independent practice", when: "2018 — 2021", where: null, role: "Architect",
      points: [
        "Residential and interior projects from first design to construction, including permit approvals.",
        "Construction drawings for joinery, stonework, floor layouts, electrical, plumbing and civil works.",
        "Cost estimates, scheduling and management of construction and interior works."
      ]
    },
    {
      org: "Schelle Architecture + Design", when: "2016 — 2018", where: null, role: "Architectural designer",
      points: [
        "Residential and interior projects from design to construction, 3D visualisation for clients and detailed drawings."
      ]
    }
  ],

  education: [
    { what: "Bachelor of Architecture and Urbanism", where: "UNISINOS · São Leopoldo, RS, Brazil", when: "2018" },
    { what: "Academic exchange", where: "Universidad Nacional de Mar del Plata, Argentina", when: "2016" }
  ],

  awards: [
    { title: "Gold Winner", project: "Monolyt", slug: "monolyt", org: "Urban Design & Architecture Design Awards, by Architecture Press Release (APR)", category: "Housing Multi-Family (Concept)", year: "2024" },
    { title: "Third Award", project: "Masterplan Uruçuca", slug: "masterplan-urucuca", org: "Rethinking The Future Awards", category: "Urban Design (Concept)", year: "2024",
      url: "https://awards.re-thinkingthefuture.com/masterplan-urucuca-architects-office/" },
    { title: "Winner", project: "Monolyt", slug: "monolyt", org: "World Design Awards", category: "Housing Concept", year: "2023" }
  ],

  publications: [
    { title: "Casa PAR", outlet: "ArchDaily", year: "2024", slug: "casa-par",
      links: [
        { label: "English", url: "https://www.archdaily.com/1014050/par-house-architects-office" },
        { label: "Portuguese", url: "https://www.archdaily.com/pt/1013677/casa-par-architects-office" },
        { label: "Spanish", url: "https://www.archdaily.com/es/1063189/casa-par-architects-office" }
      ] },
    { title: "Casa PAR", outlet: "Espaço de Arquitetura", year: "2024", slug: "casa-par",
      links: [{ label: "Portuguese", url: "https://espacodearquitetura.com/projetos/casa-par/" }] },
    { title: "Monolyt", outlet: "Exame · NSC Total", year: "2024", slug: "monolyt",
      links: [{ label: "Exame", url: "https://exame.com/casual/predio-de-balneario-camboriu-ganha-premiacao-internacional-da-arquitetura/" }, { label: "NSC Total", url: "https://www.nsctotal.com.br/colunista/dagmara-spautz/projeto-de-predio-para-praia-agreste-em-balneario-camboriu-ganha-premio-internacional" }] }
  ],

  /* Other features shown on the Recognition page only (not in the CV). */
  features: [
    { title: "Monolyt", outlet: "The Architecture Community", slug: "monolyt", note: "World Design Awards 2023 feature",
      links: [{ label: "Read", url: "https://www.thearchitecturecommunity.com/monolyt-ao-world-design-awards-2023/" }] }
  ],

  skills: ["Concept design", "Feasibility studies", "Zoning and area studies", "Urban analysis", "Project coordination",
    "Construction documents", "Residential design", "Mixed-use developments", "Architectural storytelling",
    "Hand sketching", "Presentation graphics"],
  software: ["AutoCAD", "Revit", "Rhino", "SketchUp", "Enscape", "Corona Renderer", "Adobe Creative Cloud"],
  languages: [["Portuguese", "Native"], ["Spanish", "Fluent"], ["English", "Intermediate"]]
};
