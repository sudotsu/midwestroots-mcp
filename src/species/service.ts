import {
  narrowSpeciesCandidates,
  observationValueLabels,
  type CandidateMatch,
  type MatchCategory,
  type ObservationAnswers,
} from "../../tools/species-guide/vendor/omahatreecare/src/data/tree-species-matching.js";
import { speciesGuideQuestions } from "../../tools/species-guide/vendor/omahatreecare/src/data/species-guide-questions.js";
import {
  speciesReview,
  speciesSourcesById,
  treeDatabase,
} from "../../tools/species-guide/vendor/omahatreecare/src/data/tree-species.js";
import { deriveSharedSafetyRoute } from "../safety/utility-routing.js";
import { EvidenceSchema, type Evidence, type TreeCase } from "../case/schema.js";
import { addEvidence, confirmEvidence, correctEvidence } from "../case/revisions.js";
import type { z } from "zod";
import {
  CanonicalSpeciesResultSchema,
  MatchSpeciesOutputSchema,
  RenderSpeciesGuideInputSchema,
  RenderSpeciesGuideOutputSchema,
  SpeciesToolInputSchema,
  SpeciesProfileOutputSchema,
  type CanonicalSpeciesResult,
} from "./contracts.js";
import {
  SpeciesProfileInputSchema,
  type SpeciesObservations,
} from "./schemas.js";
import { parseSpeciesMatchInput } from "./validation.js";

const DATASET_COMMIT = "473e0407e42f60d6ecb4717de3f2649300d3be08" as const;

function serializeCandidate(candidate: CandidateMatch) {
  return {
    profileId: candidate.profile.id,
    commonName: candidate.profile.commonName,
    scientificName: candidate.profile.scientificName,
    taxonScope: candidate.profile.taxonScope,
    score: candidate.score,
    matches: candidate.matches,
    contradictions: candidate.contradictions,
    matchedEvidence: candidate.matchedEvidence,
    conflictingEvidence: candidate.conflictingEvidence,
  };
}

export function computeCanonicalSpeciesResult(
  observations: SpeciesObservations,
  skippedObservations: readonly MatchCategory[] = [],
): CanonicalSpeciesResult {
  const cleaned = Object.fromEntries(
    Object.entries(observations).filter(([, value]) => value !== null),
  ) as ObservationAnswers;
  const result = narrowSpeciesCandidates(cleaned, treeDatabase, { skippedObservations });
  return CanonicalSpeciesResultSchema.parse({
    kind: result.kind,
    startingCount: result.startingCount,
    validObservationCount: result.validObservationCount,
    seasonUnavailable: result.seasonUnavailable,
    safetyHandoff: result.safetyHandoff,
    primaryTied: result.primaryTied,
    primaryCandidate: result.primaryCandidate ? serializeCandidate(result.primaryCandidate) : null,
    candidates: result.candidates.map(serializeCandidate),
    alternatives: result.alternatives.map(serializeCandidate),
    candidateOrderMeaning: result.candidateOrderMeaning,
    outsideSupportedUniverse: result.outsideSupportedUniverse,
    unsupportedObservations: result.unsupportedObservations,
    nextObservation: result.nextObservation,
    identificationStatus: "not-confirmed",
    datasetCommit: DATASET_COMMIT,
    dataset: {
      scope: "bounded-omaha-area-ten-profile-guide",
      profileCount: 10,
      contentCheckedOn: speciesReview.sourcesCheckedOn,
      nextReviewDue: speciesReview.nextReviewDue,
      finalContentReview: speciesReview.finalContentReview,
    },
  });
}

function caseReference(treeCase: TreeCase) {
  return { caseId: treeCase.caseId, activeTreeId: treeCase.activeTreeId, expectedRevision: treeCase.revision };
}

export function matchSpecies(input: unknown) {
  const parsed = SpeciesToolInputSchema.parse(input);
  const request = parseSpeciesMatchInput(parsed.request, parsed.case);
  return MatchSpeciesOutputSchema.parse({
    caseReference: caseReference(parsed.case),
    result: computeCanonicalSpeciesResult(request.observations, request.skippedObservations),
  });
}

export function getSpeciesProfile(input: unknown) {
  const { profileId } = SpeciesProfileInputSchema.parse(input);
  const profile = treeDatabase.find(({ id }) => id === profileId);
  if (!profile) throw new Error("Unknown canonical Species profile ID");
  return SpeciesProfileOutputSchema.parse({
    profileId: profile.id,
    commonName: profile.commonName,
    scientificName: profile.scientificName,
    taxonScope: profile.taxonScope,
    taxonNote: profile.taxonNote,
    omahaRelevance: profile.omahaRelevance,
    recognition: profile.recognition,
    matureSize: profile.matureSize,
    importantLocalConcern: profile.importantLocalConcern,
    whatToWatchFor: profile.whatToWatchFor,
    maintenanceNote: profile.maintenanceNote,
    traits: profile.traits,
    traitSourceIds: profile.traitSourceIds,
    sourceIds: profile.sourceIds,
    sources: profile.sourceIds.map((id) => speciesSourcesById[id]),
    review: speciesReview,
    limitations: [
      "This bounded profile supports comparison and does not confirm identification.",
      "It does not diagnose a condition, establish hazard, determine work need, or assess an individual tree.",
      "Final homeowner-facing content review is still pending.",
    ],
  });
}

function currentEvidence(treeCase: TreeCase) {
  const tree = treeCase.trees.find(({ id }) => id === treeCase.activeTreeId);
  if (!tree) return [];
  const superseded = new Set(tree.evidence.flatMap((item) => item.supersedesEvidenceId ? [item.supersedesEvidenceId] : []));
  return tree.evidence.filter((item) => !superseded.has(item.id));
}

function applySpeciesEvidenceAction(
  treeCase: TreeCase,
  action: z.infer<typeof RenderSpeciesGuideInputSchema>["evidenceAction"],
  observations: SpeciesObservations,
) {
  if (!action) return treeCase;

  if (action.kind === "record") {
    const expectedValue = observations[action.field];
    if (expectedValue !== action.value) throw new Error("Recorded evidence must match the normalized observation");
    const field = `species.${action.field}` as Evidence["field"];
    if (currentEvidence(treeCase).some((item) => item.field === field)) {
      throw new Error("Current evidence for this field must be confirmed or corrected");
    }
    return addEvidence(treeCase, EvidenceSchema.parse({
      id: action.evidenceId,
      treeId: treeCase.activeTreeId,
      field,
      value: action.value,
      origin: "user_stated",
      state: "confirmed-by-user",
      revision: 1,
      sourceReference: { kind: "conversation-turn", id: action.sourceTurnId },
      recordedAt: action.recordedAt,
    }));
  }

  const prior = currentEvidence(treeCase).find(({ id }) => id === action.evidenceId);
  if (!prior || prior.treeId !== treeCase.activeTreeId || !prior.field.startsWith("species.")) {
    throw new Error("Evidence action must reference current Species evidence on the active tree");
  }
  const field = prior.field.replace("species.", "") as keyof SpeciesObservations;
  const expectedValue = observations[field];
  if (action.kind === "confirm") {
    if (prior.value !== expectedValue) throw new Error("Confirmed evidence must match the normalized observation");
    return confirmEvidence(treeCase, action.evidenceId, action.nextEvidenceId, action.recordedAt);
  }

  if ((action.value ?? undefined) !== (expectedValue ?? undefined)) {
    throw new Error("Corrected evidence must match the normalized observation");
  }
  return correctEvidence(treeCase, action.evidenceId, {
    id: action.nextEvidenceId,
    value: action.value as Evidence["value"],
    sourceTurnId: action.sourceTurnId,
    recordedAt: action.recordedAt,
  });
}

function annotationLabel(field: string, value: unknown) {
  const category = field.replace("species.", "") as MatchCategory;
  return typeof value === "string"
    ? observationValueLabels[category]?.[value] ?? value
    : "Unknown";
}

function deriveUiState(result: CanonicalSpeciesResult, skippedObservations: readonly MatchCategory[]) {
  if (result.outsideSupportedUniverse) return "outside-guide" as const;
  if (result.kind === "no-match") return "no-match" as const;
  if (result.candidates.some(({ contradictions }) => contradictions.length > 0)) return "contradiction-recheck" as const;
  if (result.primaryTied) return "tie" as const;
  if (result.primaryCandidate) return "strongest-match" as const;
  if (result.validObservationCount === 0) {
    return !result.nextObservation && skippedObservations.length > 0 ? "completed-record" as const : "empty" as const;
  }
  if (result.nextObservation) return "next-clue" as const;
  return "completed-record" as const;
}

export function renderSpeciesGuide(input: unknown) {
  const parsed = RenderSpeciesGuideInputSchema.parse(input);
  const request = parseSpeciesMatchInput(parsed.request, parsed.case);
  const treeCase = applySpeciesEvidenceAction(parsed.case, parsed.evidenceAction, request.observations);
  const result = computeCanonicalSpeciesResult(request.observations, request.skippedObservations);
  const hazardHandoff = result.safetyHandoff ? {
    kind: "visible-failure-target" as const,
    firstAction: "open-hazard-screening" as const,
    heading: "Possible safety concern" as const,
    explanation: "You reported a visible failure sign and people or property within reach. That combination, not the tree species, is why Hazard screening is recommended. This is not a professional tree-risk assessment.",
    interruptsCurrentCapability: true as const,
    affectsSpeciesRanking: false as const,
    basis: { visibleFailureSign: "yes" as const, targetWithinReach: "yes" as const },
  } : null;
  const nextQuestion = result.nextObservation
    ? speciesGuideQuestions.find(({ key }) => key === result.nextObservation) ?? null
    : null;
  const previous = parsed.previousObservations
    ? computeCanonicalSpeciesResult(parsed.previousObservations, parsed.previousSkippedObservations)
    : null;
  const previousIds = new Set(previous?.candidates.map(({ profileId }) => profileId) ?? []);
  const currentIds = new Set(result.candidates.map(({ profileId }) => profileId));
  const eliminatedCandidates = previous?.candidates
    .filter(({ profileId }) => !currentIds.has(profileId))
    .map(({ profileId, commonName }) => ({ profileId, commonName })) ?? [];
  const returnedCandidates = result.candidates
    .filter(({ profileId }) => !previousIds.has(profileId))
    .map(({ profileId, commonName }) => ({ profileId, commonName }));
  const change = previous ? {
    previousCount: previous.candidates.length,
    currentCount: result.candidates.length,
    eliminatedProfileIds: [...previousIds].filter((id) => !currentIds.has(id)),
    returnedProfileIds: [...currentIds].filter((id) => !previousIds.has(id)),
    eliminatedCandidates,
    returnedCandidates,
    message: result.candidates.length < previous.candidates.length
      ? `Useful clue · narrowed ${previous.candidates.length} → ${result.candidates.length}`
      : result.candidates.length > previous.candidates.length
        ? `Evidence corrected · restored ${result.candidates.length - previous.candidates.length} candidate${result.candidates.length - previous.candidates.length === 1 ? "" : "s"}`
        : "Field record updated · candidate set unchanged",
  } : null;
  const evidence = currentEvidence(treeCase)
    .filter(({ field }) => field.startsWith("species."))
    .map((item) => ({
      evidenceId: item.id,
      field: item.field,
      value: item.value === null ? null : String(item.value),
      label: annotationLabel(item.field, item.value),
      origin: item.origin,
      state: item.state,
      sourceReference: item.sourceReference,
      supersedesEvidenceId: item.supersedesEvidenceId,
    }));
  return RenderSpeciesGuideOutputSchema.parse({
    treeCase,
    caseReference: caseReference(treeCase),
    observations: request.observations,
    skippedObservations: request.skippedObservations,
    result,
    activeTreeEvidence: evidence,
    nextQuestion: nextQuestion ? {
      key: nextQuestion.key,
      eyebrow: nextQuestion.eyebrow,
      prompt: nextQuestion.prompt,
      help: nextQuestion.help,
      visualKind: nextQuestion.visualKind ?? null,
      options: nextQuestion.options,
    } : null,
    change,
    safetyRoute: deriveSharedSafetyRoute(treeCase),
    hazardHandoff,
    uiState: deriveUiState(result, request.skippedObservations),
    handoffs: [
      { id: "problem", label: "Something looks wrong with it" },
      { id: "diy", label: "Can I trim this myself?" },
      { id: "hazard", label: "I'm worried it might be unsafe" },
      { id: "cost", label: "What might removal cost?" },
    ],
    platform: {
      originalPhotoAvailable: Boolean(parsed.photos?.length),
      photoCount: parsed.photos?.length ?? 0,
      photoFileIds: parsed.photos?.map(({ file_id }) => file_id) ?? [],
      photoLimitation: parsed.photos?.length
        ? null
        : "No host-authorized photo was supplied to this tool. Image provenance remains visible without inventing a URL or adding storage.",
    },
  });
}

export function matchSpeciesText(output: ReturnType<typeof matchSpecies>) {
  const { result } = output;
  if (result.outsideSupportedUniverse) return `Outside this guide: ${result.unsupportedObservations.map(({ observationLabel }) => observationLabel).join(", ")}. No candidate was selected.`;
  if (result.kind === "no-match") return "No match among these ten trees. The current observations do not support a profile; no candidate was selected.";
  const conflicts = [...new Set(result.candidates.flatMap(({ conflictingEvidence }) => conflictingEvidence.map(({ observationLabel }) => observationLabel)))];
  if (conflicts.length > 0) return `The observations remain ambiguous and conflict on ${conflicts.join(", ")}. No primary candidate was selected. Recheck: ${result.nextObservation ?? "no useful discriminator remains"}.`;
  if (result.primaryTied) return `${result.candidates.length} trees fit equally: ${result.candidates.map(({ commonName }) => commonName).join(", ")}. No primary candidate was selected.`;
  if (result.primaryCandidate) return `Best current match, not confirmed: ${result.primaryCandidate.commonName} (${result.primaryCandidate.scientificName}).`;
  return `${result.candidates.length} of ${result.startingCount} trees remain in this bounded guide. Next useful observation: ${result.nextObservation ?? "none"}.`;
}

export function renderSpeciesGuideText(output: ReturnType<typeof renderSpeciesGuide>) {
  return [
    matchSpeciesText({ caseReference: output.caseReference, result: output.result }),
    output.safetyRoute?.interruptsCurrentCapability
      ? `${output.safetyRoute.heading}: ${output.safetyRoute.explanation}`
      : null,
    output.hazardHandoff
      ? `${output.hazardHandoff.heading}: ${output.hazardHandoff.explanation}`
      : null,
    "Open the interactive field guide to review evidence, compare the next useful clue, or correct an observation.",
  ].filter(Boolean).join(" ");
}
