// Source-backed, bounded candidate universe for the Species narrowing guide.
// This is not a complete Omaha tree inventory and is not an identification key.

export const SPECIES_CONTENT_CHECKED_ON = "2026-08-02";
export const SPECIES_NEXT_REVIEW_DUE = "2027-02-02";

export type SpeciesSource = {
  id: string;
  title: string;
  organization: string;
  url: string;
  publicationDate?: string;
  accessedOn: string;
  geography: "Nebraska" | "Eastern Nebraska" | "Upper Midwest" | "United States";
};

export type EvidenceStatement = {
  text: string;
  sourceIds: string[];
};

export type LeafArrangement = "opposite" | "alternate";
export type LeafType = "simple" | "compound" | "needles-or-scales";
export type LeafShape =
  | "deeply-lobed"
  | "rounded-lobes"
  | "pointed-lobes"
  | "triangular"
  | "oval-serrated"
  | "elm-like"
  | "many-small-leaflets"
  | "very-large-compound";
export type Bark =
  | "diamond-ridged"
  | "warty-corky"
  | "smooth-to-scaly"
  | "deeply-furrowed"
  | "gray-furrowed"
  | "rough-scaly";
export type Fruit =
  | "paddle-seeds"
  | "paired-winged-seeds"
  | "cottony-seeds"
  | "small-round-pears"
  | "fringed-acorn-cap"
  | "acorn"
  | "small-dark-berries"
  | "long-flat-pods"
  | "round-winged-seeds"
  | "thick-dark-pods"
  | "none-seen";
export type OverallForm = "vase" | "rounded" | "upright" | "broad-spreading" | "open-irregular";
export type SizeClass = "under-40" | "40-to-70" | "over-70";

export type MatchTraits = {
  leafArrangement: LeafArrangement[];
  leafType: LeafType[];
  leafShape: LeafShape[];
  bark: Bark[];
  fruit: Fruit[];
  overallForm: OverallForm[];
  sizeClass: SizeClass[];
};

export type SpeciesProfile = {
  id: string;
  commonName: string;
  scientificName: string;
  taxonScope: "species" | "genus-group";
  taxonNote: EvidenceStatement;
  omahaRelevance: EvidenceStatement;
  recognition: EvidenceStatement[];
  matureSize: EvidenceStatement;
  importantLocalConcern?: EvidenceStatement;
  whatToWatchFor?: EvidenceStatement;
  maintenanceNote: EvidenceStatement;
  traits: MatchTraits;
  traitSourceIds: Record<keyof MatchTraits, string[]>;
  sourceIds: string[];
};

export type SpeciesReview = {
  reviewerName: "A.J.";
  reviewerRole: "Midwest Roots Tree Services Owner/Climber and business/product owner";
  independent: false;
  isaCertifiedArborist: false;
  reviewScope: string;
  evidenceBoundary: string;
  finalContentReview: "pending" | "completed";
  sourcesCheckedOn: string;
  nextReviewDue: string;
};

export const speciesReview: SpeciesReview = {
  reviewerName: "A.J.",
  reviewerRole: "Midwest Roots Tree Services Owner/Climber and business/product owner",
  independent: false,
  isaCertifiedArborist: false,
  reviewScope: "Practical Omaha relevance and homeowner usefulness; not independent or credentialed arboricultural review.",
  evidenceBoundary: "Practical experience does not replace authoritative sources, identification, diagnosis, or an individual-tree risk assessment.",
  finalContentReview: "pending",
  sourcesCheckedOn: SPECIES_CONTENT_CHECKED_ON,
  nextReviewDue: SPECIES_NEXT_REVIEW_DUE,
};

export const speciesSources: SpeciesSource[] = [
  {
    id: "nfs-trees",
    title: "Trees to Plant",
    organization: "Nebraska Forest Service",
    url: "https://nfs.unl.edu/trees/",
    accessedOn: SPECIES_CONTENT_CHECKED_ON,
    geography: "Nebraska",
  },
  {
    id: "nsa-street-trees",
    title: "Street Trees",
    organization: "Nebraska Statewide Arboretum",
    url: "https://plantnebraska.org/file_download/inline/ef573841-7880-4097-a751-28736febd70d",
    publicationDate: "2024-03",
    accessedOn: SPECIES_CONTENT_CHECKED_ON,
    geography: "Eastern Nebraska",
  },
  {
    id: "nfs-ash-id",
    title: "Identifying Ash Trees",
    organization: "Nebraska Forest Service",
    url: "https://nfs.unl.edu/identifying-ash-trees/",
    accessedOn: SPECIES_CONTENT_CHECKED_ON,
    geography: "Nebraska",
  },
  {
    id: "nfs-eab-faq",
    title: "Emerald Ash Borer Frequently Asked Questions",
    organization: "Nebraska Forest Service",
    url: "https://nfs.unl.edu/eab-faq/",
    accessedOn: SPECIES_CONTENT_CHECKED_ON,
    geography: "Nebraska",
  },
  {
    id: "nfs-silver-maple",
    title: "Silver Maple",
    organization: "Nebraska Forest Service",
    url: "https://nfs.unl.edu/silver-maple/",
    accessedOn: SPECIES_CONTENT_CHECKED_ON,
    geography: "Nebraska",
  },
  {
    id: "umn-silver-maple",
    title: "Replacements for ash trees in yards and boulevards",
    organization: "University of Minnesota Extension",
    url: "https://extension.umn.edu/trees-and-shrubs/replacements-ash-trees-yards-and-boulevards",
    accessedOn: SPECIES_CONTENT_CHECKED_ON,
    geography: "Upper Midwest",
  },
  {
    id: "nfs-cottonwood",
    title: "Cottonwood, Eastern",
    organization: "Nebraska Forest Service",
    url: "https://nfs.unl.edu/cottonwood-eastern/",
    accessedOn: SPECIES_CONTENT_CHECKED_ON,
    geography: "Nebraska",
  },
  {
    id: "ne-callery-pear",
    title: "Callery Pear",
    organization: "Nebraska Invasive Species Council",
    url: "https://neinvasives.com/terrestrial-invasive-plants/callery-pear/",
    accessedOn: SPECIES_CONTENT_CHECKED_ON,
    geography: "Nebraska",
  },
  {
    id: "nfs-bur-oak",
    title: "Oak, Bur",
    organization: "Nebraska Forest Service",
    url: "https://nfs.unl.edu/oak-bur/",
    accessedOn: SPECIES_CONTENT_CHECKED_ON,
    geography: "Nebraska",
  },
  {
    id: "nfs-red-oak",
    title: "Oak, Northern Red",
    organization: "Nebraska Forest Service",
    url: "https://nfs.unl.edu/oak-northern-red/",
    accessedOn: SPECIES_CONTENT_CHECKED_ON,
    geography: "Eastern Nebraska",
  },
  {
    id: "umn-oak-id",
    title: "Oak buds and green acorns can harm horses — Identifying oaks",
    organization: "University of Minnesota Extension",
    url: "https://extension.umn.edu/horse-pastures-and-facilities/oak-buds-and-green-acorns-can-harm-horses",
    publicationDate: "2021",
    accessedOn: SPECIES_CONTENT_CHECKED_ON,
    geography: "Upper Midwest",
  },
  {
    id: "nfs-pruning",
    title: "Pruning Trees",
    organization: "Nebraska Forest Service",
    url: "https://nfs.unl.edu/pruning-trees/",
    accessedOn: SPECIES_CONTENT_CHECKED_ON,
    geography: "Nebraska",
  },
  {
    id: "nfs-hackberry",
    title: "Hackberry",
    organization: "Nebraska Forest Service",
    url: "https://nfs.unl.edu/hackberry/",
    accessedOn: SPECIES_CONTENT_CHECKED_ON,
    geography: "Nebraska",
  },
  {
    id: "umn-hackberry",
    title: "Common hackberry",
    organization: "University of Minnesota Extension",
    url: "https://extension.umn.edu/trees-and-shrubs/common-hackberry",
    publicationDate: "2026",
    accessedOn: SPECIES_CONTENT_CHECKED_ON,
    geography: "Upper Midwest",
  },
  {
    id: "nfs-honeylocust",
    title: "Honeylocust",
    organization: "Nebraska Forest Service",
    url: "https://nfs.unl.edu/honeylocust/",
    accessedOn: SPECIES_CONTENT_CHECKED_ON,
    geography: "Nebraska",
  },
  {
    id: "nfs-american-elm",
    title: "Elm, American",
    organization: "Nebraska Forest Service",
    url: "https://nfs.unl.edu/elm-american/",
    accessedOn: SPECIES_CONTENT_CHECKED_ON,
    geography: "Nebraska",
  },
  {
    id: "umn-resistant-elms",
    title: "Dutch elm disease-resistant elm trees",
    organization: "University of Minnesota Extension",
    url: "https://extension.umn.edu/lawns-and-landscapes-minnesota/dutch-elm-disease-resistant-elm-trees",
    publicationDate: "2026",
    accessedOn: SPECIES_CONTENT_CHECKED_ON,
    geography: "Upper Midwest",
  },
  {
    id: "nfs-coffeetree",
    title: "Coffeetree, Kentucky",
    organization: "Nebraska Forest Service",
    url: "https://nfs.unl.edu/coffeetree-kentucky/",
    accessedOn: SPECIES_CONTENT_CHECKED_ON,
    geography: "Nebraska",
  },
];

const statement = (text: string, ...sourceIds: string[]): EvidenceStatement => ({ text, sourceIds });
const allTraitSources = (...sourceIds: string[]): Record<keyof MatchTraits, string[]> => ({
  leafArrangement: [...sourceIds],
  leafType: [...sourceIds],
  leafShape: [...sourceIds],
  bark: [...sourceIds],
  fruit: [...sourceIds],
  overallForm: [...sourceIds],
  sizeClass: [...sourceIds],
});

export const candidateUniverseRationale = {
  inclusion: statement(
    "The guide retains ten deciduous profiles documented by Nebraska authorities as native, established, widely planted, or otherwise materially relevant in Nebraska or eastern Nebraska. It intentionally mixes frequently encountered trees with locally important comparison profiles.",
    "nfs-trees",
    "nsa-street-trees",
  ),
  exclusion: statement(
    "The set is not a complete Omaha inventory. Conifers, small ornamental trees, shrubs, uncommon taxa, hybrids outside the named elm selections, and many additional Nebraska trees are excluded to keep this homeowner comparison bounded; an unmatched tree must be confirmed elsewhere.",
    "nfs-trees",
    "nsa-street-trees",
  ),
};

export const treeDatabase: SpeciesProfile[] = [
  {
    id: "true-ash",
    commonName: "True ash trees",
    scientificName: "Fraxinus spp.",
    taxonScope: "genus-group",
    taxonNote: statement("This profile covers North American true ash species in the genus Fraxinus; it does not distinguish an individual ash species.", "nfs-ash-id", "nfs-eab-faq"),
    omahaRelevance: statement("Nebraska Forest Service describes green ash as abundant in Nebraska and records emerald ash borer in Omaha.", "nfs-trees", "nfs-eab-faq"),
    recognition: [
      statement("Leaves, buds, and stems occur opposite one another, and leaves are compound with typically 5–11 leaflets.", "nfs-ash-id"),
      statement("When present, paddle-shaped seeds hang in clusters into late fall or early winter.", "nfs-ash-id"),
    ],
    matureSize: statement("The Nebraska Street Trees guide treats ash alternatives as large-tree planning context; mature size varies by Fraxinus species.", "nsa-street-trees"),
    importantLocalConcern: statement("Emerald ash borer attacks North American true ash, and Nebraska Forest Service documents it in Douglas County and Omaha.", "nfs-eab-faq"),
    whatToWatchFor: statement("Canopy thinning, branch dieback, or D-shaped exit holes warrant confirmation because similar signs can have other causes. After an ash is killed, falling-branch potential increases quickly; species identity alone does not show that this tree is infested, dead, or hazardous.", "nfs-eab-faq"),
    maintenanceNote: statement("A healthy ash in a good location does not require urgent removal solely because it is ash; treatment or removal decisions require evaluation of the individual tree.", "nfs-eab-faq"),
    traits: {
      leafArrangement: ["opposite"], leafType: ["compound"], leafShape: ["many-small-leaflets"],
      bark: ["diamond-ridged"], fruit: ["paddle-seeds", "none-seen"], overallForm: ["rounded", "upright"], sizeClass: ["40-to-70", "over-70"],
    },
    traitSourceIds: allTraitSources("nfs-ash-id", "nfs-eab-faq"),
    sourceIds: ["nfs-trees", "nsa-street-trees", "nfs-ash-id", "nfs-eab-faq"],
  },
  {
    id: "silver-maple",
    commonName: "Silver maple",
    scientificName: "Acer saccharinum",
    taxonScope: "species",
    taxonNote: statement("This profile is the species Acer saccharinum, not another maple or a named cultivar.", "nfs-silver-maple"),
    omahaRelevance: statement("Nebraska Forest Service says silver maple was heavily planted in urban areas and is suitable throughout Nebraska, although new planting is now rare.", "nfs-silver-maple"),
    recognition: [
      statement("Leaves are opposite and deeply lobed, with a silvery underside; paired winged seeds may be present.", "umn-silver-maple", "nfs-silver-maple"),
    ],
    matureSize: statement("Nebraska Forest Service lists a typical mature height and spread of 60–90 feet.", "nfs-silver-maple"),
    importantLocalConcern: statement("Nebraska Forest Service describes silver maple as weak-wooded and susceptible to storm damage.", "nfs-silver-maple"),
    whatToWatchFor: statement("Look for actual broken, hanging, cracked, or recently changed branches after storms. Those observable conditions and nearby targets—not the species name—determine whether to use the Hazard screening.", "nfs-silver-maple", "nfs-pruning"),
    maintenanceNote: statement("Individual branch unions, damage, and site conditions must be evaluated before deciding whether pruning is appropriate.", "nfs-pruning"),
    traits: {
      leafArrangement: ["opposite"], leafType: ["simple"], leafShape: ["deeply-lobed"],
      bark: ["gray-furrowed"], fruit: ["paired-winged-seeds", "none-seen"], overallForm: ["broad-spreading", "rounded"], sizeClass: ["40-to-70", "over-70"],
    },
    traitSourceIds: allTraitSources("nfs-silver-maple", "umn-silver-maple"),
    sourceIds: ["nfs-silver-maple", "umn-silver-maple", "nfs-pruning"],
  },
  {
    id: "eastern-cottonwood",
    commonName: "Eastern cottonwood",
    scientificName: "Populus deltoides",
    taxonScope: "species",
    taxonNote: statement("This profile is eastern cottonwood, Populus deltoides.", "nfs-cottonwood"),
    omahaRelevance: statement("Eastern cottonwood is Nebraska's state tree and occurs abundantly along streams, rivers, and other wet areas.", "nfs-cottonwood"),
    recognition: [
      statement("Broad triangular leaves and cottony seed release in late spring are useful seasonal comparison features.", "nfs-cottonwood"),
    ],
    matureSize: statement("Nebraska Forest Service lists a typical mature height of 70–100 feet and spread of 60–90 feet.", "nfs-cottonwood"),
    whatToWatchFor: statement("For any large tree, inspect observable broken or hanging branches and consider people or property within reach; the profile does not infer an individual-tree hazard.", "nfs-pruning"),
    maintenanceNote: statement("Its mature size and the specific site should be considered during on-site planning.", "nfs-cottonwood"),
    traits: {
      leafArrangement: ["alternate"], leafType: ["simple"], leafShape: ["triangular"],
      bark: ["deeply-furrowed"], fruit: ["cottony-seeds", "none-seen"], overallForm: ["broad-spreading", "open-irregular"], sizeClass: ["over-70"],
    },
    traitSourceIds: allTraitSources("nfs-cottonwood"),
    sourceIds: ["nfs-cottonwood", "nfs-pruning"],
  },
  {
    id: "callery-pear",
    commonName: "Callery pear (including ‘Bradford’)",
    scientificName: "Pyrus calleryana",
    taxonScope: "species",
    taxonNote: statement("Callery pear is Pyrus calleryana; ‘Bradford’ is one named cultivar, and ornamental pear is another common label.", "ne-callery-pear"),
    omahaRelevance: statement("The Nebraska Invasive Species Council documents Callery pear as a common ornamental that can escape into roadsides, fields, hedgerows, forest edges, wetlands, and forests.", "ne-callery-pear"),
    recognition: [
      statement("Alternate rounded leaves have finely serrated, distinctly wavy margins; dense clusters of five-petaled white flowers may appear in season.", "ne-callery-pear"),
      statement("Tiny hard pears appear in fall, and bark changes from smooth with lenticels to shallow scaly ridges as the tree matures.", "ne-callery-pear"),
    ],
    matureSize: statement("The Nebraska source says Callery pear can reach 60 feet, although that size is rare.", "ne-callery-pear"),
    importantLocalConcern: statement("Nebraska identifies Callery pear as invasive and advises against planting it.", "ne-callery-pear"),
    whatToWatchFor: statement("The species can develop weak structure and split in ice or storms. Inspect the particular tree for an actual split, crack, broken limb, or recent change before drawing any safety conclusion.", "ne-callery-pear", "nfs-pruning"),
    maintenanceNote: statement("Existing-tree decisions depend on the individual tree and site; the Nebraska source directs property owners to local weed-control authorities for appropriate removal methods.", "ne-callery-pear"),
    traits: {
      leafArrangement: ["alternate"], leafType: ["simple"], leafShape: ["oval-serrated"],
      bark: ["smooth-to-scaly"], fruit: ["small-round-pears", "none-seen"], overallForm: ["upright", "rounded"], sizeClass: ["under-40", "40-to-70"],
    },
    traitSourceIds: allTraitSources("ne-callery-pear"),
    sourceIds: ["ne-callery-pear", "nfs-pruning"],
  },
  {
    id: "bur-oak",
    commonName: "Bur oak",
    scientificName: "Quercus macrocarpa",
    taxonScope: "species",
    taxonNote: statement("This profile is bur oak, Quercus macrocarpa, in the white-oak group.", "nfs-bur-oak", "umn-oak-id"),
    omahaRelevance: statement("Nebraska Forest Service describes bur oak as the state's most common native oak, occurring naturally in the eastern third of Nebraska.", "nfs-bur-oak", "nfs-trees"),
    recognition: [
      statement("Rounded-lobed leaves distinguish the white-oak group; bur oak also has deeply furrowed bark and a conspicuously fringed acorn cap.", "umn-oak-id", "nfs-bur-oak"),
    ],
    matureSize: statement("The Nebraska Street Trees guide lists about 60 feet mature height and width for planning.", "nsa-street-trees"),
    importantLocalConcern: statement("Where oak wilt is a concern, Nebraska Forest Service says oak pruning should be restricted from April through June.", "nfs-pruning"),
    whatToWatchFor: statement("Unusual canopy browning can have more than one cause; the profile cannot diagnose oak wilt or determine individual-tree risk.", "nfs-pruning"),
    maintenanceNote: statement("Confirm current pruning timing and evaluate the individual tree before work.", "nfs-pruning"),
    traits: {
      leafArrangement: ["alternate"], leafType: ["simple"], leafShape: ["rounded-lobes"],
      bark: ["deeply-furrowed"], fruit: ["fringed-acorn-cap", "acorn", "none-seen"], overallForm: ["broad-spreading", "rounded"], sizeClass: ["40-to-70", "over-70"],
    },
    traitSourceIds: allTraitSources("nfs-bur-oak", "umn-oak-id"),
    sourceIds: ["nfs-bur-oak", "nfs-trees", "nsa-street-trees", "umn-oak-id", "nfs-pruning"],
  },
  {
    id: "northern-red-oak",
    commonName: "Northern red oak",
    scientificName: "Quercus rubra",
    taxonScope: "species",
    taxonNote: statement("This profile is northern red oak, Quercus rubra, not every tree in the red-oak group.", "nfs-red-oak"),
    omahaRelevance: statement("Nebraska Forest Service identifies northern red oak as the state's second most abundant native oak, concentrated along the Missouri River and tributaries in eastern Nebraska.", "nfs-red-oak", "nfs-trees"),
    recognition: [
      statement("Red-oak-group leaves have pointed, bristle-tipped lobes; acorns may provide additional seasonal evidence.", "umn-oak-id"),
    ],
    matureSize: statement("The Nebraska Street Trees guide lists about 60 feet mature height and 40 feet mature width for eastern Nebraska planning.", "nsa-street-trees"),
    importantLocalConcern: statement("Where oak wilt is a concern, Nebraska Forest Service says oak pruning should be restricted from April through June.", "nfs-pruning"),
    whatToWatchFor: statement("Unusual canopy browning or rapid leaf loss requires confirmation; species identity alone does not diagnose oak wilt or establish hazard.", "nfs-pruning"),
    maintenanceNote: statement("Confirm current pruning timing and evaluate the individual tree before work.", "nfs-pruning"),
    traits: {
      leafArrangement: ["alternate"], leafType: ["simple"], leafShape: ["pointed-lobes"],
      bark: ["gray-furrowed"], fruit: ["acorn", "none-seen"], overallForm: ["rounded", "broad-spreading"], sizeClass: ["40-to-70", "over-70"],
    },
    traitSourceIds: allTraitSources("nfs-red-oak", "umn-oak-id"),
    sourceIds: ["nfs-red-oak", "nfs-trees", "nsa-street-trees", "umn-oak-id", "nfs-pruning"],
  },
  {
    id: "common-hackberry",
    commonName: "Common hackberry",
    scientificName: "Celtis occidentalis",
    taxonScope: "species",
    taxonNote: statement("This profile is common hackberry, Celtis occidentalis.", "nfs-hackberry", "umn-hackberry"),
    omahaRelevance: statement("Nebraska Forest Service says common hackberry is suitable throughout the state and useful in streets, yards, and parks.", "nfs-hackberry"),
    recognition: [
      statement("Young bark has bumpy wart-like texture that develops cork-like ridges; leaves are dark green and small berry-like fruit turns purple or reddish-brown in autumn.", "umn-hackberry"),
    ],
    matureSize: statement("Nebraska Forest Service lists a typical mature height and spread of 50–70 feet.", "nfs-hackberry"),
    importantLocalConcern: statement("Nebraska Forest Service notes that poorly attached branches can split in ice storms; this is a structural possibility, not a conclusion about a particular tree.", "nfs-hackberry"),
    whatToWatchFor: statement("Inspect the individual tree for actual cracks, splitting, or recently broken branches after storms before choosing a safety route.", "nfs-hackberry", "nfs-pruning"),
    maintenanceNote: statement("Site conditions and observable branch structure should guide individual-tree review.", "nfs-hackberry", "nfs-pruning"),
    traits: {
      leafArrangement: ["alternate"], leafType: ["simple"], leafShape: ["elm-like", "oval-serrated"],
      bark: ["warty-corky"], fruit: ["small-dark-berries", "none-seen"], overallForm: ["rounded", "broad-spreading"], sizeClass: ["40-to-70", "over-70"],
    },
    traitSourceIds: allTraitSources("nfs-hackberry", "umn-hackberry"),
    sourceIds: ["nfs-hackberry", "umn-hackberry", "nfs-pruning"],
  },
  {
    id: "honeylocust",
    commonName: "Honeylocust",
    scientificName: "Gleditsia triacanthos",
    taxonScope: "species",
    taxonNote: statement("This profile is Gleditsia triacanthos; thornless and fruitless landscape varieties may omit wild-type thorns or pods.", "nfs-honeylocust"),
    omahaRelevance: statement("Nebraska Forest Service describes honeylocust as an eastern Great Plains native used extensively in paved urban landscapes and suitable throughout Nebraska.", "nfs-honeylocust"),
    recognition: [
      statement("Fine compound foliage is typical; long bean-like pods may occur on fruiting trees but can be absent on fruitless varieties.", "nfs-honeylocust"),
    ],
    matureSize: statement("Nebraska Forest Service lists a typical mature height of 50–70 feet and spread of 50–60 feet.", "nfs-honeylocust"),
    whatToWatchFor: statement("Seasonal leaf damage from several insects is often cosmetic according to Nebraska Forest Service; observe the actual extent and change rather than inferring decline from the species.", "nfs-honeylocust"),
    maintenanceNote: statement("Cultivar and the individual tree's observable condition matter when comparing this profile.", "nfs-honeylocust"),
    traits: {
      leafArrangement: ["alternate"], leafType: ["compound"], leafShape: ["many-small-leaflets"],
      bark: ["rough-scaly"], fruit: ["long-flat-pods", "none-seen"], overallForm: ["open-irregular", "broad-spreading"], sizeClass: ["40-to-70", "over-70"],
    },
    traitSourceIds: allTraitSources("nfs-honeylocust"),
    sourceIds: ["nfs-honeylocust"],
  },
  {
    id: "american-elm",
    commonName: "American elm (species only)",
    scientificName: "Ulmus americana",
    taxonScope: "species",
    taxonNote: statement("This profile can compare American elm species traits but cannot determine whether a tree is a named Dutch-elm-disease-resistant cultivar.", "nfs-american-elm", "umn-resistant-elms"),
    omahaRelevance: statement("American elm is native to Nebraska, historically dominated community streets, and resistant varieties can be planted throughout the state.", "nfs-american-elm"),
    recognition: [
      statement("The classic mature form is tall and arching or vase-shaped; leaves are alternate and toothed, and green wafer-like seeds follow flowers.", "nfs-american-elm", "umn-resistant-elms"),
    ],
    matureSize: statement("Nebraska Forest Service lists a typical mature height and spread of 50–80 feet.", "nfs-american-elm"),
    importantLocalConcern: statement("Named resistant American elm selections exist, but resistance is a cultivar claim that this visual comparison cannot establish.", "nfs-american-elm", "umn-resistant-elms"),
    whatToWatchFor: statement("Suspicious canopy decline needs confirmation and must not be attributed to Dutch elm disease from this profile alone.", "nfs-american-elm", "umn-resistant-elms"),
    maintenanceNote: statement("When planting, compare named selections from current regional guidance; for an existing tree, seek confirmation before disease or treatment decisions.", "nfs-american-elm", "umn-resistant-elms"),
    traits: {
      leafArrangement: ["alternate"], leafType: ["simple"], leafShape: ["elm-like", "oval-serrated"],
      bark: ["deeply-furrowed", "gray-furrowed"], fruit: ["round-winged-seeds", "none-seen"], overallForm: ["vase"], sizeClass: ["40-to-70", "over-70"],
    },
    traitSourceIds: allTraitSources("nfs-american-elm", "umn-resistant-elms"),
    sourceIds: ["nfs-american-elm", "umn-resistant-elms"],
  },
  {
    id: "kentucky-coffeetree",
    commonName: "Kentucky coffeetree",
    scientificName: "Gymnocladus dioicus",
    taxonScope: "species",
    taxonNote: statement("This profile is Kentucky coffeetree, Gymnocladus dioicus.", "nfs-coffeetree"),
    omahaRelevance: statement("Nebraska Forest Service calls Kentucky coffeetree a native tree suitable throughout Nebraska and an alternative to ash and elm.", "nfs-coffeetree"),
    recognition: [
      statement("Very large compound foliage, an open winter silhouette, and thick dark seed pods can help compare this profile; pods may be absent on a male tree.", "nfs-coffeetree"),
    ],
    matureSize: statement("Nebraska Forest Service lists a typical mature height of 40–60 feet and spread of 30–50 feet.", "nfs-coffeetree"),
    importantLocalConcern: statement("Nebraska Forest Service states that leaves, seeds, and pulp are toxic to people, pets, and livestock; do not consume them.", "nfs-coffeetree"),
    whatToWatchFor: statement("A missing pod or late spring leaf-out is not by itself evidence of decline; use multiple available traits.", "nfs-coffeetree"),
    maintenanceNote: statement("Confirm cultivar, mature size, and site fit before planting.", "nfs-coffeetree", "nsa-street-trees"),
    traits: {
      leafArrangement: ["alternate"], leafType: ["compound"], leafShape: ["very-large-compound"],
      bark: ["rough-scaly"], fruit: ["thick-dark-pods", "none-seen"], overallForm: ["open-irregular", "upright"], sizeClass: ["40-to-70", "over-70"],
    },
    traitSourceIds: allTraitSources("nfs-coffeetree"),
    sourceIds: ["nfs-coffeetree", "nsa-street-trees"],
  },
];

export const speciesSourcesById = Object.fromEntries(
  speciesSources.map((source) => [source.id, source]),
) as Record<string, SpeciesSource>;

// Compatibility alias for the tools index count; the candidate universe remains
// defined only by the reviewed records above.
export type Tree = SpeciesProfile;
