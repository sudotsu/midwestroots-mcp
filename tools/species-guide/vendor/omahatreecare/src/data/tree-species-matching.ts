import type {
  Bark,
  Fruit,
  LeafArrangement,
  LeafShape,
  LeafType,
  OverallForm,
  SizeClass,
  SpeciesProfile,
} from "./tree-species.js";
import { treeDatabase } from "./tree-species.js";

export type ObservationAnswers = {
  season?: "leaf-on" | "leaf-off-or-unavailable";
  leafArrangement?: LeafArrangement;
  leafType?: LeafType;
  leafShape?: LeafShape;
  bark?: Bark;
  fruit?: Fruit;
  overallForm?: OverallForm;
  sizeClass?: SizeClass;
  visibleFailureSign?: "yes" | "no" | "not-sure";
  targetWithinReach?: "yes" | "no" | "not-sure";
};

export type MatchCategory = Exclude<keyof ObservationAnswers, "season" | "visibleFailureSign" | "targetWithinReach">;

export const observationLabels: Record<MatchCategory, string> = {
  leafArrangement: "leaf arrangement",
  leafType: "leaf type",
  leafShape: "leaf shape",
  bark: "bark",
  fruit: "fruit or seed",
  overallForm: "overall form",
  sizeClass: "approximate mature size",
};

export const observationValueLabels: Record<MatchCategory, Readonly<Record<string, string>>> = {
  leafArrangement: {
    opposite: "paired opposite leaves or buds",
    alternate: "staggered alternate leaves or buds",
  },
  leafType: {
    simple: "one leaf blade per stalk",
    compound: "several leaflets on one stalk",
    "needles-or-scales": "needles or scales",
  },
  leafShape: {
    "deeply-lobed": "deeply lobed leaves",
    "rounded-lobes": "rounded leaf lobes",
    "pointed-lobes": "pointed, bristle-tipped leaf lobes",
    triangular: "broad triangular leaves",
    "oval-serrated": "oval leaves with toothed edges",
    "elm-like": "toothed, elm-like leaves",
    "many-small-leaflets": "many small leaflets",
    "very-large-compound": "very large compound leaves",
  },
  bark: {
    "diamond-ridged": "diamond-pattern ridges",
    "warty-corky": "warty or cork-like ridges",
    "smooth-to-scaly": "smooth bark becoming shallow or scaly",
    "deeply-furrowed": "deep furrows",
    "gray-furrowed": "gray furrows or ridges",
    "rough-scaly": "rough or scaly bark",
  },
  fruit: {
    "paddle-seeds": "paddle-shaped seeds in clusters",
    "paired-winged-seeds": "paired winged seeds",
    "cottony-seeds": "cottony seed release",
    "small-round-pears": "small round pear-like fruit",
    "fringed-acorn-cap": "an acorn with a fringed cap",
    acorn: "acorns",
    "small-dark-berries": "small dark berry-like fruit",
    "long-flat-pods": "long flat pods",
    "round-winged-seeds": "round wafer-like winged seeds",
    "thick-dark-pods": "thick dark pods",
    "none-seen": "no fruit or seed currently visible",
  },
  overallForm: {
    vase: "a vase-shaped or arching crown",
    rounded: "a rounded crown",
    upright: "a narrower upright crown",
    "broad-spreading": "a broad spreading crown",
    "open-irregular": "an open or irregular crown",
  },
  sizeClass: {
    "under-40": "likely under about 40 feet",
    "40-to-70": "roughly 40 to 70 feet",
    "over-70": "over about 70 feet",
  },
};

export type CandidateEvidence = {
  category: MatchCategory;
  observationValue: string;
  observationLabel: string;
  profileValueLabels: string[];
};

export type CandidateMatch = {
  profile: SpeciesProfile;
  matches: MatchCategory[];
  contradictions: MatchCategory[];
  matchedEvidence: CandidateEvidence[];
  conflictingEvidence: CandidateEvidence[];
  score: number;
};

export type SpeciesMatchResult = {
  kind: "starting-universe" | "narrowed" | "ambiguous" | "no-match";
  candidates: CandidateMatch[];
  primaryCandidate?: CandidateMatch;
  alternatives: CandidateMatch[];
  primaryTied: boolean;
  candidateOrderMeaning: "evidence-ranked" | "stable-display-only";
  startingCount: number;
  validObservationCount: number;
  seasonUnavailable: boolean;
  safetyHandoff: boolean;
  outsideSupportedUniverse: boolean;
  unsupportedObservations: Array<{
    category: MatchCategory;
    observationValue: string;
    observationLabel: string;
  }>;
  nextObservation: MatchCategory | null;
};

export type SpeciesMatchOptions = {
  skippedObservations?: readonly MatchCategory[];
};

const leafCategories: MatchCategory[] = ["leafArrangement", "leafType", "leafShape"];
const matchCategories: MatchCategory[] = [
  "leafArrangement",
  "leafType",
  "leafShape",
  "bark",
  "fruit",
  "overallForm",
  "sizeClass",
];

function activeCategories(answers: ObservationAnswers): MatchCategory[] {
  return matchCategories.filter((category) => {
    if (answers.season === "leaf-off-or-unavailable" && leafCategories.includes(category)) return false;
    if (category === "fruit" && answers.fruit === "none-seen") return false;
    return answers[category] !== undefined;
  });
}

function supportedValues(profile: SpeciesProfile, category: MatchCategory) {
  return new Set(
    profile.traits[category].filter((value) => !(category === "fruit" && value === "none-seen")),
  );
}

function setsDiffer(left: ReadonlySet<string>, right: ReadonlySet<string>) {
  return left.size !== right.size || [...left].some((value) => !right.has(value));
}

function separatedCandidatePairs(candidates: CandidateMatch[], category: MatchCategory) {
  let separatedPairs = 0;
  for (let leftIndex = 0; leftIndex < candidates.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < candidates.length; rightIndex += 1) {
      if (setsDiffer(
        supportedValues(candidates[leftIndex].profile, category),
        supportedValues(candidates[rightIndex].profile, category),
      )) {
        separatedPairs += 1;
      }
    }
  }
  return separatedPairs;
}

function chooseNextObservation(
  candidates: CandidateMatch[],
  excluded: ReadonlySet<MatchCategory>,
): MatchCategory | undefined {
  let bestCategory: MatchCategory | undefined;
  let bestSeparatedPairs = 0;

  for (const category of matchCategories) {
    if (excluded.has(category)) continue;
    const separatedPairs = separatedCandidatePairs(candidates, category);
    if (separatedPairs > bestSeparatedPairs) {
      bestCategory = category;
      bestSeparatedPairs = separatedPairs;
    }
  }

  return bestCategory;
}

function chooseRecheckObservation(
  candidates: CandidateMatch[],
  active: readonly MatchCategory[],
): MatchCategory | undefined {
  let bestCategory: MatchCategory | undefined;
  let bestSeparatedPairs = -1;
  let bestConflictCount = 0;

  for (const category of matchCategories) {
    if (!active.includes(category)) continue;
    const conflictCount = candidates.filter(({ contradictions }) => contradictions.includes(category)).length;
    if (conflictCount === 0) continue;
    const separatedPairs = separatedCandidatePairs(candidates, category);
    if (
      separatedPairs > bestSeparatedPairs
      || (separatedPairs === bestSeparatedPairs && conflictCount > bestConflictCount)
    ) {
      bestCategory = category;
      bestSeparatedPairs = separatedPairs;
      bestConflictCount = conflictCount;
    }
  }

  return bestCategory;
}

function evidenceFor(
  profile: SpeciesProfile,
  category: MatchCategory,
  observationValue: string,
): CandidateEvidence {
  return {
    category,
    observationValue,
    observationLabel: observationValueLabels[category][observationValue] ?? observationValue,
    profileValueLabels: profile.traits[category].map(
      (value) => observationValueLabels[category][value] ?? value,
    ),
  };
}

function evaluateCandidate(
  profile: SpeciesProfile,
  answers: ObservationAnswers,
  active: MatchCategory[],
): CandidateMatch {
  const matches: MatchCategory[] = [];
  const contradictions: MatchCategory[] = [];
  const matchedEvidence: CandidateEvidence[] = [];
  const conflictingEvidence: CandidateEvidence[] = [];

  for (const category of active) {
    const answer = answers[category];
    if (!answer) continue;
    const evidence = evidenceFor(profile, category, answer);
    if ((profile.traits[category] as readonly string[]).includes(answer)) {
      matches.push(category);
      matchedEvidence.push(evidence);
    } else {
      contradictions.push(category);
      conflictingEvidence.push(evidence);
    }
  }

  return {
    profile,
    matches,
    contradictions,
    matchedEvidence,
    conflictingEvidence,
    score: matches.length,
  };
}

function rankCandidates(candidates: CandidateMatch[]) {
  return candidates.toSorted((left, right) =>
    right.score - left.score
    || left.contradictions.length - right.contradictions.length
    || left.profile.commonName.localeCompare(right.profile.commonName),
  );
}

export function narrowSpeciesCandidates(
  answers: ObservationAnswers,
  universe: readonly SpeciesProfile[] = treeDatabase,
  options: SpeciesMatchOptions = {},
): SpeciesMatchResult {
  const active = activeCategories(answers);
  const seasonUnavailable = answers.season === "leaf-off-or-unavailable";
  const unavailableForNext = seasonUnavailable ? leafCategories : [];
  const answered = matchCategories.filter((category) => answers[category] !== undefined);
  const excludedFromNext = new Set<MatchCategory>([
    ...answered,
    ...unavailableForNext,
    ...(options.skippedObservations ?? []),
  ]);
  const safetyHandoff = answers.visibleFailureSign === "yes" && answers.targetWithinReach === "yes";

  if (active.length === 0) {
    const candidates = universe.map((profile) => ({
      profile,
      matches: [],
      contradictions: [],
      matchedEvidence: [],
      conflictingEvidence: [],
      score: 0,
    }));
    return {
      kind: "starting-universe",
      candidates,
      alternatives: [],
      primaryTied: false,
      candidateOrderMeaning: "stable-display-only",
      startingCount: universe.length,
      validObservationCount: 0,
      seasonUnavailable,
      safetyHandoff,
      outsideSupportedUniverse: false,
      unsupportedObservations: [],
      nextObservation: chooseNextObservation(candidates, excludedFromNext) ?? null,
    };
  }

  const unsupportedObservations = active.flatMap((category) => {
    const answer = answers[category];
    if (!answer) return [];
    const supported = universe.some((profile) => supportedValues(profile, category).has(answer));
    return supported ? [] : [{
      category,
      observationValue: answer,
      observationLabel: observationValueLabels[category][answer] ?? answer,
    }];
  });

  if (unsupportedObservations.length > 0) {
    return {
      kind: "no-match",
      candidates: [],
      alternatives: [],
      primaryTied: false,
      candidateOrderMeaning: "stable-display-only",
      startingCount: universe.length,
      validObservationCount: active.length,
      seasonUnavailable,
      safetyHandoff,
      outsideSupportedUniverse: true,
      unsupportedObservations,
      nextObservation: null,
    };
  }

  const evaluated = universe.map((profile) => evaluateCandidate(profile, answers, active));
  const ranked = rankCandidates(evaluated);
  const highestRanked = ranked[0];
  const bestMatchCount = highestRanked?.score ?? 0;

  if (bestMatchCount === 0) {
    return {
      kind: "no-match",
      candidates: [],
      alternatives: [],
      primaryTied: false,
      candidateOrderMeaning: "stable-display-only",
      startingCount: universe.length,
      validObservationCount: active.length,
      seasonUnavailable,
      safetyHandoff,
      outsideSupportedUniverse: false,
      unsupportedObservations: [],
      nextObservation: null,
    };
  }

  const candidates = ranked.filter(({ score }) => score === bestMatchCount);
  const candidateIds = new Set(candidates.map(({ profile }) => profile.id));
  const alternatives = ranked
    .filter(({ profile, score }) => score > 0 && !candidateIds.has(profile.id))
    .slice(0, 3);
  const primaryTied = candidates.length > 1;
  const narrowed = candidates.length < universe.length;
  const hasContradictions = candidates.some(({ contradictions }) => contradictions.length > 0);
  const primaryCandidate = !primaryTied && !hasContradictions ? candidates[0] : undefined;
  const comparisonCandidates = [...candidates, ...alternatives];
  const recheckObservation = hasContradictions
    ? chooseRecheckObservation(comparisonCandidates, active)
    : undefined;
  const nextObservation = primaryCandidate
    ? undefined
    : recheckObservation ?? chooseNextObservation(comparisonCandidates, excludedFromNext);

  return {
    kind: narrowed && !hasContradictions ? "narrowed" : "ambiguous",
    candidates,
    primaryCandidate,
    alternatives,
    primaryTied,
    candidateOrderMeaning: primaryTied ? "stable-display-only" : "evidence-ranked",
    startingCount: universe.length,
    validObservationCount: active.length,
    seasonUnavailable,
    safetyHandoff,
    outsideSupportedUniverse: false,
    unsupportedObservations: [],
    nextObservation: nextObservation ?? null,
  };
}
