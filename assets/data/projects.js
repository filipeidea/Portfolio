/*
 * PROJECT DATA — the single place to add or edit projects.
 * After editing, the site is rebuilt automatically when the change is pushed
 * to GitHub (or locally with:  node tools/build.mjs).
 *
 * Fields
 *   slug         used in the page address: projects/<slug>.html
 *   title, location, typology, category (used by the home page filter)
 *   year, yearNote ("design" or "completed"), area — leave null when not documented
 *   practice     office or institution; "Architects Office" marks a team project
 *   stages       the design stages Filipe took part in, using these terms:
 *                Feasibility study · Schematic design · Design development ·
 *                Pre-construction documents · Construction documents ·
 *                Permit drawings · Issued for construction
 *                (Brazilian equivalents: estudo de viabilidade · estudo preliminar ·
 *                 anteprojeto · pré-executivo · projeto executivo · projeto legal ·
 *                 liberado para obra)
 *   role         one or two sentences, first person, on Filipe's own contribution
 *   summary      one sentence shown under the title and in link previews
 *   description  paragraphs about the project itself — only verifiable content
 *   cover        image key used on the home page and at the top of the project page
 *   gallery      images in order. layout: "full" | "wide" | "small" (one image)
 *                or "pair" | "trio" (several, in "images"). Add "caption" for drawings.
 *   team         credits exactly as listed in the source portfolio
 *   aka          another name the project is known by (optional)
 *   position     Filipe's role title on the project (from the project spreadsheet)
 *   credit       image credit; if left out, team projects show "Images © <practice>"
 *
 * Image keys ("<folder>/<name>") must exist in assets/img — see tools/build_images.py.
 * The order of this list is the order on the home page.
 *
 * Open questions are recorded as  // CONFIRM:  comments next to the field.
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
    area: "11,474 m²",
    practice: "Architects Office",
    position: "Architect",
    stages: ["Feasibility study", "Schematic design"],
    role: "Member of the concept team during the feasibility study and schematic design. The two awards were given to the office’s project team.",
    publications: [
      { label: "Architects Office — project page", url: "https://www.architectsoffice.co/projeto/monolyt" },
      { label: "Exame, April 2024", url: "https://exame.com/casual/predio-de-balneario-camboriu-ganha-premiacao-internacional-da-arquitetura/" },
      { label: "NSC Total, April 2024", url: "https://www.nsctotal.com.br/colunista/dagmara-spautz/projeto-de-predio-para-praia-agreste-em-balneario-camboriu-ganha-premio-internacional" },
      { label: "The Architecture Community", url: "https://www.thearchitecturecommunity.com/monolyt-ao-world-design-awards-2023/" }
    ],
    awards: [
      "Gold Winner — Urban Design & Architecture Design Awards (APR) 2024, Housing Multi-Family (Concept)",
      "Winner — World Design Awards 2023, Housing Concept"
    ],
    summary:
      "A multi-family residential building in Balneário Camboriú with glazed living floors, generous terraces and a stone-lined base.",
    description: [
      "On Praia do Estaleiro, the office describes the building as taking its form from erosion — natural rock and human intervention combined. Native vegetation is preserved, reflecting pools occupy the ground floor and private pools in the units meet the original rock (Architects Office project description).",
      "Glazed floors with deep terraces sit above a solid base, where a carved, stone-lined void with planting creates an outdoor room at the foot of the building."
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
    slug: "masterplan-urucuca", // area from SHEET (site area)
    title: "Masterplan Uruçuca",
    location: "Serra Grande, Uruçuca, BA, Brazil",
    typology: "Masterplan · hospitality · multi-family",
    category: "Urban & Hospitality",
    year: "2023",
    yearNote: "design",
    area: "27,771 m² (site)",
    practice: "Architects Office",
    position: "Dedicated architect",
    stages: ["Feasibility study", "Schematic design", "Design development", "Permit drawings"],
    role: "Member of the project team from the feasibility study through schematic design, design development and the permit drawings. The award was given to the office’s project team.",
    awards: [
      "Third Award — Rethinking The Future Awards 2024, Urban Design (Concept)"
    ],
    publications: [
      { label: "Rethinking The Future Awards — project page", url: "https://awards.re-thinkingthefuture.com/masterplan-urucuca-architects-office/" }
    ],
    summary:
      "A masterplan in Serra Grande, on the coast of southern Bahia, with timber houses and hospitality buildings set within the forest and beside the water.",
    description: [
      "Small buildings are distributed through the trees, and a large radial timber canopy marks a communal space by the water.",
      "The schematic design places 51 bungalows of 30, 60 and 80 m² on the ocean plot and 32 flats on the continental plot, with the hotel reception and administration, a spa, a small mall and a beach club around a natural pool.",
      "The beach club roof follows a simple logic: the site limits and the 30 m protection strip set the area that can be built; the kitchen, toilets, bar and lookout are placed inside it; that area is extruded into a roof, completed, and given its timber structure and movement."
    ],
    cover: "urucuca/lagoon",
    gallery: [
      { layout: "full", img: "urucuca/lagoon", alt: "Dusk view across a lagoon to a long, low timber canopy lit from within, with palms behind" },
      { layout: "wide", img: "urucuca/canopy", alt: "Underside of a radial timber roof with a glazed core and a dining terrace beside a pool" },
      { layout: "wide", img: "urucuca/masterplan", natural: true, alt: "Masterplan seen from above: two plots on either side of the road, with buildings and paths among the trees and the sea on the right", caption: "Masterplan" },
      { layout: "pair", images: [
        { img: "urucuca/houses", alt: "Three timber houses with pitched roofs set in tropical garden" },
        { img: "urucuca/stone", alt: "A stone and timber building emerging from dense forest with figures walking past" }
      ] },
      { layout: "wide", img: "urucuca/bungalow", natural: true, alt: "Plans and elevations of a pair of 30 m² bungalows with pitched roofs, joined by a stair", caption: "Bungalows of 30 m²: plans and elevations" },
      { layout: "wide", img: "urucuca/forest", alt: "Aerial view of roofs scattered within the forest canopy in morning mist" },
      { layout: "pair", images: [
        { img: "urucuca/club-plan", alt: "Plan and elevations of the beach club: the hall, bar, kitchen and lookout under one roof, beside a natural pool", caption: "Beach club: plan and elevations" },
        { img: "urucuca/club-layers", alt: "Exploded diagram of the beach club: roof covering, roof structure, lookout, kitchen and bars, and the hall", caption: "Beach club: the parts of the building" }
      ] },
      { layout: "sequence", title: "Beach club: the logic of the roof", steps: [
        { img: "urucuca/roof-1", label: "Site limits", alt: "Axonometric diagram of the plot limits, the residential lot, the high-water line and the 30 m protection strip, with the area that can be built shaded" },
        { img: "urucuca/roof-2", label: "Kitchen and toilets", alt: "The kitchen and toilets placed inside the buildable area" },
        { img: "urucuca/roof-3", label: "Bar and lookout", alt: "A round bar and a spiral lookout added beside the kitchen" },
        { img: "urucuca/roof-4", label: "Extruding the roof", alt: "The buildable area extruded into the outline of the roof" },
        { img: "urucuca/roof-5", label: "Completing the roof", alt: "The roof completed as one long curved shape over the buildings" },
        { img: "urucuca/roof-6", label: "Structure and movement", alt: "The finished roof in black, with the lookout's open timber dome at its tip" }
      ] }
    ],
    team: "Greg Bousquet, Sávio Jobim, Carolina Passos, Daniela Bertuol, Filipe Meltzer, Thiago Buccieri, Larissa Oliveira",
    featured: true
  },
  {
    slug: "murata-157",
    title: "Murata 157",
    aka: null,
    location: "Londrina, PR, Brazil",
    typology: "Residential tower",
    category: "Residential",
    year: "2025",
    yearNote: "design",
    area: "21,395 m²",
    practice: "Architects Office",
    position: "Project Leader",
    stages: ["Schematic design"],
    role: "Project Leader at Architects Office, from the kick-off through the four presentations of the schematic design (2025–2026).",
    awards: [],
    credit: "Confidential project, in development. The client and the name of the development are withheld; images © Architects Office, shown for portfolio purposes only.",
    summary:
      "A residential tower in Londrina built on one square grid: four apartments per floor around a central core, behind a deep concrete frame.",
    description: [
      "The site is a 2,335 m² plot in the Gleba Palhano district. The brief asked for apartments with three suites, four per floor, and a leisure floor with a 25 m pool, a gym and gourmet spaces.",
      "The concept starts from the square: the Renaissance plans of the Palazzo Farnese and Palladio’s Villa La Rotonda, and the Sierpinski carpet, a square divided into nine with its centre removed, repeated at every scale. The tower follows the same rule — a square plan with the core at its centre and four apartments around it.",
      "One structural grid of 5.60 m, divided into 1.40 m modules, organises everything: two parking spaces fit between columns in the basements, and the bedrooms, bathrooms and wardrobes take whole modules above. On the facade the grid becomes a deep concrete frame filled with glazing, timber screens and balconies.",
      "92 apartments of about 120 m² each, with 21,395 m² of built area."
    ],
    cover: "murata/front",
    gallery: [
      { layout: "full", img: "murata/front", alt: "The lower floors facing the street: a grid of concrete frames above a stone base with planting" },
      { layout: "pair", images: [
        { img: "murata/tower", alt: "The tower seen from the avenue among trees: a slender square tower with a deep concrete frame and warm infill panels" },
        { img: "murata/below", alt: "The tower seen from below through the trees" }
      ] },
      { layout: "wide", img: "murata/fractal", alt: "Four squares showing the Sierpinski carpet: a square divided into nine with the centre removed, repeated at smaller scales", caption: "Concept — the Sierpinski carpet", natural: true },
      { layout: "pair", images: [
        { img: "murata/plan", alt: "Typical floor plan: four apartments around the central core on the square grid", caption: "Typical floor plan" },
        { img: "murata/section", alt: "Section of the tower above the basements on the sloping site", caption: "Section" }
      ] },
      { layout: "wide", img: "murata/module", alt: "The structural grid of 5.60 m divided into 1.40 m modules: two parking spaces between columns, bedrooms and bathrooms in whole modules", caption: "One grid for structure, parking and rooms", natural: true },
      { layout: "wide", img: "murata/pool", alt: "The leisure floor: a pool with natural stone edges beside the tower" },
      { layout: "wide", img: "murata/entrance", alt: "The entrance at dusk: warm light between carved stone walls at the foot of the tower" },
      { layout: "wide", img: "murata/corner", alt: "Close view of the corner: concrete frames with timber screens and glazing" }
    ],
    team: null,
    featured: true
  },
  {
    slug: "iguatemi-306", // area 49,811 m² confirmed by Filipe (12 Oct 2026); the CV previously gave 41,400 m²
    title: "Iguatemi 306",
    location: "São Paulo, SP, Brazil",
    typology: "Corporate tower",
    category: "Corporate",
    year: "2024",
    yearNote: "design",
    area: "49,811 m²",
    practice: "Architects Office",
    position: "Dedicated architect",
    stages: ["Feasibility study"],
    role: "Member of the concept team during the feasibility study.",
    awards: [],
    summary:
      "A corporate tower in São Paulo whose stacked, shifting volumes are wrapped in a deep planted grid.",
    description: [
      "The tower is composed of offset blocks that open terraces at different heights, letting vegetation climb the facade. Early concept work moved between hand sketches, a physical block model and digital massing studies."
    ],
    cover: "iguatemi/tower",
    gallery: [
      { layout: "wide", img: "iguatemi/tower", alt: "Glazed tower with offset volumes and planted terraces against a stormy sky", tall: true },
      { layout: "pair", images: [
        { img: "iguatemi/street", alt: "The tower seen from the street beside a lower building with a planted facade" },
        { img: "iguatemi/facade", alt: "Close view of the facade grid with plants spilling from every bay" }
      ] },
      { layout: "pair", images: [
        { img: "iguatemi/sketch", alt: "Watercolour sketch of a green twisting tower among existing buildings", caption: "Concept sketch" },
        { img: "iguatemi/axo", alt: "White massing model of the tower in its urban context", caption: "Massing study" }
      ] },
      { layout: "pair", images: [
        { img: "iguatemi/model", alt: "Physical model of stacked offset blocks", caption: "Block model" },
        { img: "iguatemi/model-hand", alt: "A hand placing the top block on the physical model of the tower", caption: "Stacking the blocks by hand" }
      ] }
    ],
    team: "Greg Bousquet, Sávio Jobim, Larissa Oliveira, Rafael Igayara, Fiama Costa, Filipe Meltzer, Caio Caccaos, Stephany Smynniuk, Thiago Buccieri Santana, Pedro Teixeira",
    featured: true
  },
  {
    slug: "quinta",
    title: "Quinta",
    aka: "Marateca",
    location: "Marateca, Portugal",
    typology: "Single-family residential",
    category: "Residential",
    year: "2024",
    yearNote: "design",
    area: "1,458 m²",
    practice: "Architects Office",
    position: "Dedicated architect",
    stages: ["Feasibility study", "Schematic design"],
    role: "Member of the concept team during the feasibility study and schematic design. I drew the freehand studies of Portuguese architecture made for the project, shown in the Sketchbook.",
    awards: [],
    summary:
      "A country estate in Marateca that reinterprets Portuguese rural architecture: whitewashed volumes, pitched roofs and stone bases arranged around courtyards.",
    description: [
      "The design grew out of a series of hand sketches studying Portuguese architecture across the centuries — palaces, monasteries, chimneys, tiles and openings — which informed the design of the new buildings."
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
    slug: "casa-sapucai", // also known as Casa BVV; Triptyque Architecture (confirmed by Filipe). Location, area and year from SHEET. Old addresses casa-bvv / casa-sapucaia forward here.
    title: "Casa Sapucaí",
    aka: "Casa BVV",
    location: "Quinta da Baronesa, SP, Brazil",
    typology: "Single-family residential",
    category: "Residential",
    year: "2021",
    yearNote: "design",
    area: "1,291 m²",
    practice: "Triptyque Architecture",
    position: "Dedicated architect",
    stages: ["Schematic design", "Design development", "Pre-construction documents", "Construction documents", "Issued for construction"],
    role: "Coordinated the architecture with the engineering consultants’ projects in every stage up to issue for construction, except the initial concept.",
    awards: [],
    summary:
      "A low, horizontal country house in Quinta da Baronesa, São Paulo state, with earth-toned walls and timber pavilions arranged around gardens and a long pool.",
    description: [
      "Long earth-toned walls face the street, while the living spaces open onto gardens and the pool through large glazed timber frames."
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
    year: "2022",
    yearNote: "design; completed 2023",
    area: "574 m²",
    practice: "Architects Office",
    position: "Architect",
    stages: ["Construction documents", "Issued for construction"],
    role: "Joined the project in its final phase to coordinate the engineering consultants’ projects with the architecture, through construction documents and issue for construction.",
    awards: [],
    publications: [
      { label: "ArchDaily (English)", url: "https://www.archdaily.com/1014050/par-house-architects-office" },
      { label: "ArchDaily Brasil", url: "https://www.archdaily.com/pt/1013677/casa-par-architects-office" },
      { label: "ArchDaily en Español", url: "https://www.archdaily.com/es/1063189/casa-par-architects-office" },
      { label: "Espaço de Arquitetura, 2024", url: "https://espacodearquitetura.com/projetos/casa-par/" }
    ],
    summary:
      "A completed country house in a rural setting near São Paulo: pitched timber roofs over white-walled volumes, opening onto a pool deck.",
    description: [
      "Exposed timber trusses define the large living spaces under the pitched roofs, with full-height glazing towards the landscape."
    ],
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
    slug: "porto-cultural-tramandai",
    title: "Porto Cultural Tramandaí",
    location: "Tramandaí, RS, Brazil",
    typology: "Cultural & civic · undergraduate thesis",
    category: "Academic",
    year: null,
    yearNote: null,
    area: null,
    practice: "UNISINOS — undergraduate final thesis",
    stages: null,
    role: "Individual work: my undergraduate final thesis project at UNISINOS, from site analysis to construction details.",
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
      { layout: "wide", img: "tramandai/lagoon", alt: "The complex seen from the lagoon, with a timber deck and trees on the water's edge" },
      { layout: "wide", img: "tramandai/masterplan", alt: "Coloured site plan of the complex winding along the lagoon edge", caption: "Masterplan" },
      { layout: "wide", img: "tramandai/square", alt: "People gathering under the timber arches at the entrance square" },
      { layout: "wide", img: "tramandai/hall", alt: "Interior hall with a large suspended sculptural installation" },
      { layout: "wide", img: "tramandai/boardwalk", alt: "Cyclists and café tables on the boardwalk along the curved timber building" },
      { layout: "wide", img: "tramandai/approach", alt: "The long curved building seen across the street, with a cyclist in the foreground" },
      { layout: "wide", img: "tramandai/street", alt: "The canopy at the end of a street framing the lagoon and hills" },
      { layout: "pair", images: [
        { img: "tramandai/elevations", alt: "Five long elevations of the complex", caption: "Elevations" },
        { img: "tramandai/section", alt: "Wall section and exploded axonometric of the timber structure", caption: "Construction section" }
      ] },
      { layout: "small", img: "tramandai/siteplan", alt: "Black and white aerial site plan with the project along the lagoon", caption: "Site plan" }
    ],
    team: null,
    featured: true
  },
  {
    slug: "gramado",
    title: "Gramado",
    aka: "Hortensias SN",
    location: "Gramado, RS, Brazil",
    typology: "Residential building",
    category: "Residential",
    year: "2023",
    yearNote: "design",
    area: "6,238 m²",
    practice: "Architects Office",
    position: "Dedicated architect",
    stages: ["Feasibility study", "Schematic design"],
    role: "Member of the concept team during the feasibility study and schematic design.",
    awards: [],
    summary:
      "A residential building in Gramado, in the Serra Gaúcha, composed of dark, steep-roofed volumes among the araucaria trees.",
    description: [
      "The building is divided into several gabled volumes clad in dark materials rather than a single block."
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
    slug: "gaivota",
    title: "Gaivota",
    aka: "Gaivota 530",
    location: "São Paulo, SP, Brazil",
    typology: "Residential tower",
    category: "Residential",
    year: "2024",
    yearNote: "design",
    area: "21,726 m²",
    practice: "Architects Office",
    position: "Dedicated architect",
    stages: ["Feasibility study", "Schematic design"],
    role: "Member of the concept team during the feasibility study and schematic design.",
    awards: [],
    summary:
      "A slender residential tower in São Paulo with a warm, vertical facade rhythm and a planted, double-height entrance.",
    description: [
      "The study tested the tower's massing within its dense urban block before developing the facade and the ground-floor entrance."
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
    slug: "hotel-barrinhas",
    title: "Hotel Barrinhas",
    location: "Preá, CE, Brazil",
    typology: "Hospitality",
    category: "Urban & Hospitality",
    year: "2024",
    yearNote: "design",
    area: "2,653 m²",
    practice: "Architects Office",
    position: "Dedicated architect",
    stages: ["Feasibility study", "Schematic design"],
    role: "Member of the concept team during the feasibility study and schematic design.",
    awards: [],
    summary:
      "A beach hotel on the coast of Ceará: low pitched-roof pavilions among coconut palms, facing the sea.",
    description: [
      "Hand sketches explored the arrangement of guest buildings, pools and gardens across the site."
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
  }
];
