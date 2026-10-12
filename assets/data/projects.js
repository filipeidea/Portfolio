/*
 * PROJECT DATA — the single place to add or edit projects.
 *
 * Each project needs: slug (used in the URL), title, and the fields below.
 * Images are referenced by key ("<folder>/<name>") and must exist in
 * assets/img (generate them with tools/build_images.py).
 * Gallery "layout" values: "full" (edge to edge), "wide" (text-column wide),
 * "pair" (two images side by side, give "images": [a, b]), "small".
 * Leave a field out (or set it to null) when the fact is not documented.
 * The order of this list is the order on the home page.
 */
window.PROJECTS = [
  {
    slug: "monolyt",
    title: "Monolyt",
    location: "Balneário Camboriú, SC, Brazil",
    typology: "Multi-family residential",
    category: "Residential",
    year: "2022",
    yearNote: "design",
    area: "11,098 m²",
    practice: "Architects Office",
    stages: ["Feasibility study", "Preliminary design"],
    awards: [
      "Gold Winner — Urban Design & Architecture Design Awards (APR) 2024, Housing Multi-Family (Concept)",
      "Winner — World Design Awards 2023, Housing Concept"
    ],
    summary:
      "A multi-family residential building in Balneário Camboriú with glazed living floors, generous terraces and a stone-lined base.",
    description: [
      "Glazed floors with deep terraces sit above a solid base, where a carved, stone-lined void with planting creates an outdoor room at the foot of the building.",
      "Developed at Architects Office through the feasibility and preliminary design stages. The project received two international awards as a team project."
    ],
    cover: "monolyt/front",
    gallery: [
      { layout: "full", img: "monolyt/front", alt: "Evening view of Monolyt: three glazed residential floors with terraces above a stone base, set among trees" },
      { layout: "pair", images: [
        { img: "monolyt/stone", alt: "A carved stone void with planting and a fire pit at the base of the building at dusk" },
        { img: "monolyt/corner", alt: "Corner of the building with stacked terraces, glass balustrades and warm interior light" }
      ] },
      { layout: "wide", img: "monolyt/terraces", alt: "Front elevation at dusk showing the terraced glass floors and timber soffits" },
      { layout: "small", img: "monolyt/axo", alt: "Axonometric diagram of the building volumes on the sloping site", caption: "Volumetric study" }
    ],
    team: "Sávio Jobim, Larissa Oliveira, Maria Gabriella Stabile, Felipe Barradas, Regiane Fernandes, Filipe Meltzer, Thiago Buccieri, Marcelo Checchia",
    featured: true
  },
  {
    slug: "masterplan-urucuca",
    title: "Masterplan Uruçuca",
    location: "Serra Grande, Uruçuca, BA, Brazil",
    typology: "Masterplan · hospitality · multi-family",
    category: "Urban & Hospitality",
    year: "2023",
    yearNote: "design",
    area: null,
    practice: "Architects Office",
    stages: ["Feasibility study", "Preliminary design", "Schematic design", "Planning approval"],
    awards: [
      "Third Award — Rethinking The Future Awards 2024, Urban Design (Concept)"
    ],
    summary:
      "A masterplan in Serra Grande, on the coast of southern Bahia, with timber houses and hospitality buildings set within the forest and beside the water.",
    description: [
      "Small buildings are distributed through the trees, and a large radial timber canopy marks a communal space by the water.",
      "Developed at Architects Office from feasibility through schematic design and planning approval drawings. The project received the Rethinking The Future Award as a team project."
    ],
    cover: "urucuca/lagoon",
    gallery: [
      { layout: "full", img: "urucuca/lagoon", alt: "Dusk view across a lagoon to a long, low timber canopy lit from within, with palms behind" },
      { layout: "wide", img: "urucuca/canopy", alt: "Underside of a radial timber roof with a glazed core and a dining terrace beside a pool" },
      { layout: "pair", images: [
        { img: "urucuca/houses", alt: "Three timber houses with pitched roofs set in tropical garden" },
        { img: "urucuca/stone", alt: "A stone and timber building emerging from dense forest with figures walking past" }
      ] },
      { layout: "wide", img: "urucuca/forest", alt: "Aerial view of roofs scattered within the forest canopy in morning mist" },
      { layout: "wide", img: "urucuca/site", alt: "Plan of the site showing the building clusters along a green corridor", caption: "Site plan" }
    ],
    team: "Greg Bousquet, Sávio Jobim, Carolina Passos, Daniela Bertuol, Filipe Meltzer, Thiago Buccieri, Larissa Oliveira",
    featured: true
  },
  {
    slug: "quinta",
    title: "Quinta",
    location: "Marateca, Portugal",
    typology: "Single-family residential",
    category: "Residential",
    year: "2023",
    yearNote: "design",
    area: "1,896 m²",
    practice: "Architects Office",
    stages: ["Feasibility study", "Preliminary design"],
    awards: [],
    summary:
      "A country estate in Marateca that reinterprets Portuguese rural architecture: whitewashed volumes, pitched roofs and stone bases arranged around courtyards.",
    description: [
      "The design grew out of a series of hand sketches studying Portuguese architecture across the centuries — palaces, monasteries, chimneys, tiles and openings — which informed the design of the new buildings.",
      "Developed at Architects Office through the feasibility and preliminary design stages. The sketch studies for the project are shown in the Sketchbook."
    ],
    cover: "quinta/approach",
    gallery: [
      { layout: "full", img: "quinta/approach", alt: "Long whitewashed building with a pitched roof behind gravel and native planting, under a tall tree" },
      { layout: "pair", images: [
        { img: "quinta/court", alt: "White gabled volume over a stone base with a deep window at dusk" },
        { img: "quinta/arcade", alt: "Pool terrace in front of a stone arcade beneath a white upper floor" }
      ] },
      { layout: "wide", img: "quinta/pool", alt: "Infinity pool with loungers overlooking a wide green valley" },
      { layout: "wide", img: "quinta/houses", alt: "Row of white houses with stone bases among grasses and agave" },
      { layout: "pair", images: [
        { img: "quinta/axo-sketch", alt: "Hand-drawn axonometric of the estate with courtyards, pool and gardens", caption: "Axonometric sketch" },
        { img: "quinta/elevations", alt: "Two hand-drawn elevations of the estate buildings in the landscape", caption: "Elevation sketches" }
      ] }
    ],
    team: "Greg Bousquet, Sávio Jobim, Larissa Oliveira, Rafael Igayara, Daniela Bertuol, Filipe Meltzer, Ana Thereza Sacchi, Thiago Buccieri Santana",
    featured: true
  },
  {
    slug: "iguatemi-306",
    title: "Iguatemi 306",
    location: "São Paulo, SP, Brazil",
    typology: "Corporate tower",
    category: "Corporate",
    year: "2024",
    yearNote: "design",
    area: "41,400 m²",
    practice: "Architects Office",
    stages: ["Feasibility study"],
    awards: [],
    summary:
      "A corporate tower in São Paulo whose stacked, shifting volumes are wrapped in a deep planted grid.",
    description: [
      "The tower is composed of offset blocks that open terraces at different heights, letting vegetation climb the facade. Early concept work moved between hand sketches, a physical block model and digital massing studies.",
      "Developed at Architects Office at feasibility stage."
    ],
    cover: "iguatemi/tower",
    gallery: [
      { layout: "wide", img: "iguatemi/tower", alt: "Glazed tower with offset volumes and planted terraces against a stormy sky", tall: true },
      { layout: "pair", images: [
        { img: "iguatemi/street", alt: "The tower seen from the street beside a lower building with a planted facade" },
        { img: "iguatemi/facade", alt: "Close view of the facade grid with plants spilling from every bay" }
      ] },
      { layout: "trio", images: [
        { img: "iguatemi/sketch", alt: "Watercolour sketch of a green twisting tower among existing buildings", caption: "Concept sketch" },
        { img: "iguatemi/model", alt: "Physical model of stacked offset blocks", caption: "Block model" },
        { img: "iguatemi/axo", alt: "White massing model of the tower in its urban context", caption: "Massing study" }
      ] }
    ],
    team: "Greg Bousquet, Sávio Jobim, Larissa Oliveira, Rafael Igayara, Fiama Costa, Filipe Meltzer, Caio Caccaos, Stephany Smynniuk, Thiago Buccieri Santana, Pedro Teixeira",
    featured: true
  },
  {
    slug: "casa-bvv",
    title: "Casa BVV",
    location: "Boa Vista Village, Porto Feliz, SP, Brazil",
    typology: "Single-family residential",
    category: "Residential",
    year: "2021",
    yearNote: "design",
    area: "985 m²",
    practice: "Architects Office",
    stages: ["Preliminary design", "Schematic design", "Design development", "Construction documents", "Released for construction"],
    awards: [],
    summary:
      "A low, horizontal country house of rammed-earth-toned walls and timber pavilions arranged around gardens and a long pool.",
    description: [
      "Long earth-toned walls face the street, while the living spaces open onto gardens and the pool through large glazed timber frames.",
      "At Architects Office, Filipe coordinated the architecture with the consultant engineering projects through every stage up to the release for construction, except the initial concept."
    ],
    cover: "bvv/garden",
    gallery: [
      { layout: "full", img: "bvv/garden", alt: "Earth-toned wall of the house screened by palms and tropical planting" },
      { layout: "wide", img: "bvv/pavilion", alt: "Timber-framed glazed pavilions opening onto a lawn" },
      { layout: "wide", img: "bvv/pool", alt: "Long pool in front of the main pavilion with stone paving and a deep roof" },
      { layout: "wide", img: "bvv/wall", alt: "Street view of the long, low boundary wall among trees" },
      { layout: "pair", images: [
        { img: "bvv/plan", alt: "Ground floor plan of the house around courtyards and the pool", caption: "Ground floor plan" },
        { img: "bvv/axo", alt: "Axonometric of the house volumes on the plot", caption: "Axonometric" }
      ] }
    ],
    team: "Greg Bousquet, João Vieira, Daniela Bertuol, Filipe Meltzer, Jorge Vassalo Sales Góz, Fernando Longhi, Livia Frugoli, Thiago Buccieri, Herbert Anthony",
    featured: true
  },
  {
    slug: "casa-par",
    title: "Casa PAR",
    location: "Monte Mor, SP, Brazil",
    typology: "Single-family residential",
    category: "Residential",
    year: "2023",
    yearNote: "completed",
    area: "574 m²",
    practice: "Architects Office",
    stages: ["Construction documents", "Released for construction"],
    awards: [],
    publications: [
      { label: "ArchDaily (English)", url: "https://www.archdaily.com/1014050/par-house-architects-office" },
      { label: "ArchDaily Brasil", url: "https://www.archdaily.com/pt/1013677/casa-par-architects-office" },
      { label: "ArchDaily en Español", url: "https://www.archdaily.com/es/1063189/casa-par-architects-office" },
      { label: "Espaço de Arquitetura, 2024", url: null }
    ],
    summary:
      "A completed country house in a rural setting near São Paulo: pitched timber roofs over white-walled volumes, opening onto a pool deck.",
    description: [
      "Exposed timber trusses define the large living spaces under the pitched roofs, with full-height glazing towards the landscape.",
      "Filipe joined the project in its final phase, coordinating the consultant engineering projects with the architecture during construction documents and release for construction. The house was published by ArchDaily in 2024."
    ],
    credit: "Photography: Felco (as credited on ArchDaily)",
    cover: "casa-par/pool",
    gallery: [
      { layout: "wide", img: "casa-par/living", alt: "Living room under exposed timber roof trusses with a glazed gable wall" },
      { layout: "pair", images: [
        { img: "casa-par/pool", alt: "White-walled volumes with pitched roofs behind a pool and timber deck" },
        { img: "casa-par/hall", alt: "Interior with tall timber trusses, a sitting area and a fireplace" }
      ] }
    ],
    team: "Greg Bousquet, João Vieira, Rodrigo Mathias, Bruna Bertuccelli, Daniela Bertuol, Graziella Behning, Filipe Meltzer, Lívia Frugoli, Evandro Nunes, Thiago Buccieri",
    featured: true
  },
  {
    slug: "gaivota",
    title: "Gaivota",
    location: "São Paulo, SP, Brazil",
    typology: "Residential tower",
    category: "Residential",
    year: "2024",
    yearNote: "design",
    area: "20,300 m²",
    practice: "Architects Office",
    stages: ["Feasibility study", "Preliminary design"],
    awards: [],
    summary:
      "A slender residential tower in São Paulo with a warm, vertical facade rhythm and a planted, double-height entrance.",
    description: [
      "The study tested the tower's massing within its dense urban block before developing the facade and the ground-floor entrance.",
      "Developed at Architects Office through the feasibility and preliminary design stages."
    ],
    cover: "gaivota/tower",
    gallery: [
      { layout: "wide", img: "gaivota/tower", alt: "Tall slender residential tower with a warm vertical facade among city buildings" },
      { layout: "pair", images: [
        { img: "gaivota/entrance", alt: "Double-height entrance with planting and a cyclist passing on the pavement" },
        { img: "gaivota/axo", alt: "Axonometric of the tower within its city block", caption: "Urban massing study" }
      ] }
    ],
    team: "Greg Bousquet, Sávio Jobim, Larissa Oliveira, Rafael Igayara, Maria Gabriela Stabile, Filipe Meltzer, Livia Frugoli, Thiago Buccieri Santana",
    featured: false
  },
  {
    slug: "gramado",
    title: "Gramado",
    location: "Gramado, RS, Brazil",
    typology: "Residential building",
    category: "Residential",
    year: "2023",
    yearNote: "design",
    area: "4,923 m²",
    practice: "Architects Office",
    stages: ["Feasibility study", "Preliminary design"],
    awards: [],
    summary:
      "A residential building in Gramado, in the Serra Gaúcha, composed of dark, steep-roofed volumes among the araucaria trees.",
    description: [
      "The building is divided into several gabled volumes clad in dark materials rather than a single block.",
      "Developed at Architects Office through the feasibility and preliminary design stages."
    ],
    cover: "gramado/corner",
    gallery: [
      { layout: "wide", img: "gramado/corner", alt: "Dark gabled residential volumes among araucaria pines at dusk" },
      { layout: "pair", images: [
        { img: "gramado/street", alt: "The building from the street on a rainy day, with a cyclist" },
        { img: "gramado/forest", alt: "The gabled facades framed by trees and lit windows" }
      ] }
    ],
    team: "Sávio Jobim, Larissa Oliveira, Maria Gabriella Stabile, Fiama Costa, Filipe Meltzer, Herbert Anthony, Ícaro Epifânio, Thiago Buccieri, Marcelo Checchia",
    featured: false
  },
  {
    slug: "hotel-barrinhas",
    title: "Hotel Barrinhas",
    location: "Preá, CE, Brazil",
    typology: "Hospitality",
    category: "Urban & Hospitality",
    year: "2023",
    yearNote: "design",
    area: "1,238 m²",
    practice: "Architects Office",
    stages: ["Feasibility study", "Preliminary design"],
    awards: [],
    summary:
      "A beach hotel on the coast of Ceará: low pitched-roof pavilions among coconut palms, facing the sea.",
    description: [
      "Hand sketches explored the arrangement of guest buildings, pools and gardens across the site.",
      "Developed at Architects Office through the feasibility and preliminary design stages."
    ],
    cover: "barrinhas/palms",
    gallery: [
      { layout: "wide", img: "barrinhas/beach", alt: "Aerial view of turquoise sea, beach and the hotel among coconut palms" },
      { layout: "wide", img: "barrinhas/palms", alt: "Low pavilions with pitched roofs among palms under a blue sky" },
      { layout: "pair", images: [
        { img: "barrinhas/court", alt: "Pitched-roof pavilions around a garden courtyard" },
        { img: "barrinhas/pool", alt: "Pool in front of a two-storey guest building with palms" }
      ] },
      { layout: "pair", images: [
        { img: "barrinhas/sketch-1", alt: "Coloured axonometric sketch of the hotel pavilions, pools and dunes", caption: "Concept sketch" },
        { img: "barrinhas/sketch-2", alt: "Line sketches of guest buildings around a pool", caption: "Concept sketch" }
      ] }
    ],
    team: "Sávio Jobim, Larissa Oliveira, Maria Gabriella Stabile, Filipe Meltzer, Luisa Bolsas, Thiago Buccieri",
    featured: false
  },
  {
    slug: "porto-cultural-tramandai",
    title: "Porto Cultural Tramandaí",
    location: "Tramandaí, RS, Brazil",
    typology: "Cultural & civic · undergraduate thesis",
    category: "Academic",
    year: null,
    yearNote: null,
    area: null,
    practice: "UNISINOS — final thesis project (individual work)",
    stages: null,
    awards: [],
    summary:
      "A cultural port on the shore of a lagoon in Tramandaí: a long linear structure of glued-laminated eucalyptus arches with a viewing park on its roof.",
    description: [
      "My final thesis project, in which I set out to express the values I consider essential in architecture. The central concept is a large linear structure running along the edge of the lagoon. Each arch is made of glued-laminated timber using eucalyptus, a sustainable choice thanks to its fast growth, durability and capacity for renewal. Natural stone and reinforced concrete complete the landscape.",
      "The roof is designed as a park and viewpoint for watching the sunset over the lagoon. The whole complex is planned for pedestrians and hosts fish markets — with space for processing and storage that supports local cooperatives — as well as concerts and performances.",
      "Concept and materials were inspired by the sarilhos: small elevated timber shelters on striking posts set in the lagoon, used by local fishermen to store their boats. Many are in poor condition or hard to reach. The 'port' does not receive large ships; it welcomes the small fisherman with contemporary versions of the sarilho, giving more democratic access to this tool of artisanal fishing.",
      "The project was approved by the examining board and praised for its originality and execution."
    ],
    cover: "tramandai/canopy",
    gallery: [
      { layout: "full", img: "tramandai/canopy", alt: "Dusk view of the long timber canopy and a dark concrete volume beside a reflecting pool" },
      { layout: "wide", img: "tramandai/masterplan", alt: "Coloured site plan of the complex winding along the lagoon edge", caption: "Masterplan" },
      { layout: "pair", images: [
        { img: "tramandai/square", alt: "People gathering under the timber arches at the entrance square" },
        { img: "tramandai/hall", alt: "Interior hall with a large suspended sculptural installation" }
      ] },
      { layout: "wide", img: "tramandai/street", alt: "The canopy at the end of a street framing the lagoon and hills" },
      { layout: "pair", images: [
        { img: "tramandai/elevations", alt: "Five long elevations of the complex", caption: "Elevations" },
        { img: "tramandai/section", alt: "Wall section and exploded axonometric of the timber structure", caption: "Construction section" }
      ] },
      { layout: "small", img: "tramandai/siteplan", alt: "Black and white aerial site plan with the project along the lagoon", caption: "Site plan" }
    ],
    team: null,
    featured: true
  }
];

/* Site-wide facts and contact details. Leave a value as null to hide it. */
window.SITE = {
  name: "Filipe Meltzer",
  title: "Architect & Urbanist",
  base: "São Paulo, Brazil",
  registration: "CAU/BR 145917-1",
  email: null, // e.g. "name@example.com" — not in the source documents, add it to show it
  linkedin: "https://www.linkedin.com/in/filipemeltzer",
  cv: "assets/docs/Filipe-Meltzer-CV.pdf"
};
