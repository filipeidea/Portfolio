/*
 * PROFESSIONAL FACTS — one source for the profile, résumé and home page figures.
 * Every number here has its source and counting rule written next to it, so the
 * site, the résumé page and the PDF can be kept consistent.
 *
 * Sources:
 *   CV   = assets/docs/Filipe-Meltzer-CV.pdf (2026, "REV01") — primary source
 *   PF   = portfolio filipe 2025_web.pdf — project sheets, roles, dates
 *   PRESS = public articles (linked where used)
 */
window.FACTS = {
  name: "Filipe Meltzer",
  title: "Architect & Urbanist",
  base: "São Paulo, Brazil",
  registration: "CAU/BR 145917-1", // PF, cover page
  email: null, // not in any source document — add it here to show it on the site
  linkedin: "https://www.linkedin.com/in/filipemeltzer", // CV
  cv: "assets/docs/Filipe-Meltzer-CV.pdf",

  /* Home page figures.
   * projects: CV ("23 projects"). Check: CV typology counts 1+2+2+3+3+5+8 = 24,
   *   minus Masterplan Uruçuca, which the CV lists under both masterplan and hotels = 23.
   * area: CV ("458,000+ m²"). Check: CV typology areas add up to 486,119 m²; minus the
   *   masterplan site area (27,771 m², which the CV notes is site area, not floor area)
   *   = 458,348 m². The CV's other phrase, "more than 450,000 m² approved by clients",
   *   is consistent with this but less precise; the site uses 458,000+ everywhere.
   * locations: CV says 17. The CV map names 16 places; the 17th used here is
   *   Balneário Camboriú (SC), the location of Monolyt (PF project sheet, confirmed by press).
   *   NEEDS CONFIRMATION by Filipe.
   * awards: three awards for two team projects (CV, PF).
   */
  figures: [
    { value: "23", label: "projects in the concept team at Architects Office since 2021" },
    { value: "458,000+", unit: "m²", label: "total floor area of those projects" },
    { value: "17", label: "locations in Brazil and Portugal" },
    { value: "3", label: "international awards for team projects" }
  ],

  places: [ // CV map (16) + Balneário Camboriú (see above)
    "São Paulo, SP", "Araçariguama, SP", "Monte Mor, SP", "Baronesa, SP",
    "Londrina, PR", "Curitiba, PR", "Balneário Camboriú, SC", "Itapema, SC", "Itajaí, SC",
    "Gramado, RS", "Uberlândia, MG", "Goiânia, GO", "Uruçuca, BA",
    "Natal, RN", "Fortaleza, CE", "Preá, CE", "Marateca, Portugal"
  ],

  experience: [
    {
      org: "Architects Office", when: "2021 — Present", where: "São Paulo, Brazil",
      role: "Architect, concept team",
      points: [
        "23 projects totalling 458,000+ m² in 17 locations in Brazil and Portugal: corporate, hospitality, mixed-use, residential and urban design.",
        "Project Leader for Murata 157, a 21,400 m² residential building in Londrina.",
        "Delivered 10 feasibility studies, 10 schematic designs, 2 design developments and 1 construction documents package.",
        "Zoning, site and area studies for São Paulo and other states; floor plans for the São Paulo housing market; concept presentations and storytelling.",
        "Key projects: Pamplona 1704 (125,500 m² mixed-use, São Paulo), Moraes SN (51,600 m², Natal) and Iguatemi 306 (41,400 m² corporate, São Paulo)."
      ]
    },
    { org: "Triptyque Architecture", when: "2021", where: "São Paulo, Brazil", role: "Architect", points: [] },
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
    { title: "Third Award", project: "Masterplan Uruçuca", slug: "masterplan-urucuca", org: "Rethinking The Future Awards", category: "Urban Design (Concept)", year: "2024" },
    { title: "Winner", project: "Monolyt", slug: "monolyt", org: "World Design Awards", category: "Housing Concept", year: "2023" }
  ],

  publications: [
    { title: "Casa PAR", outlet: "ArchDaily", year: "2024", slug: "casa-par",
      links: [
        { label: "English", url: "https://www.archdaily.com/1014050/par-house-architects-office" },
        { label: "Portuguese", url: "https://www.archdaily.com/pt/1013677/casa-par-architects-office" },
        { label: "Spanish", url: "https://www.archdaily.com/es/1063189/casa-par-architects-office" }
      ] },
    { title: "Casa PAR", outlet: "Espaço de Arquitetura", year: "2024", slug: "casa-par", links: [] }
  ],

  skills: ["Concept design", "Feasibility studies", "Zoning and area studies", "Urban analysis", "Project coordination",
    "Construction documents", "Residential design", "Mixed-use developments", "Architectural storytelling",
    "Hand sketching", "Presentation graphics"],
  software: ["AutoCAD", "Revit", "Rhino", "SketchUp", "Enscape", "Corona Renderer", "Adobe Creative Cloud"],
  languages: [["Portuguese", "Native"], ["Spanish", "Fluent"], ["English", "Intermediate"]]
};
