import { z } from "zod";

import {
  EvidenceIdSchema,
  EvidenceOriginSchema,
  EvidenceSourceReferenceSchema,
  EvidenceStateSchema,
  TreeCaseSchema,
} from "../case/schema.js";
import { StructuredIdSchema } from "../shared/ids.js";
import {
  SpeciesMatchCategorySchema,
  SpeciesObservationFieldSchema,
  SpeciesObservationsSchema,
  SpeciesMatchInputSchema,
  SpeciesProfileIdSchema,
  TreeCaseReferenceSchema,
  SeasonSchema,
  LeafArrangementSchema,
  LeafTypeSchema,
  LeafShapeSchema,
  BarkSchema,
  FruitSchema,
  OverallFormSchema,
  SizeClassSchema,
} from "./schemas.js";
import { SharedSafetyRouteSchema } from "../safety/utility-routing.js";

export const CandidateEvidenceSchema = z.strictObject({
  category: SpeciesMatchCategorySchema,
  observationValue: z.string().min(1),
  observationLabel: z.string().min(1),
  profileValueLabels: z.array(z.string().min(1)),
});

export const SpeciesToolInputSchema = z.strictObject({
  case: TreeCaseSchema,
  request: SpeciesMatchInputSchema,
});

export const OpenAIFileSchema = z.strictObject({
  download_url: z.url(),
  file_id: z.string().min(1),
  mime_type: z.string().min(1).optional(),
  file_name: z.string().min(1).optional(),
});

export const SpeciesEvidenceActionSchema = z.discriminatedUnion("kind", [
  z.strictObject({
    kind: z.literal("record"),
    evidenceId: EvidenceIdSchema,
    field: SpeciesObservationFieldSchema,
    value: z.string().min(1),
    sourceTurnId: StructuredIdSchema,
    recordedAt: z.iso.datetime({ offset: true }),
  }),
  z.strictObject({
    kind: z.literal("confirm"),
    evidenceId: EvidenceIdSchema,
    nextEvidenceId: EvidenceIdSchema,
    recordedAt: z.iso.datetime({ offset: true }),
  }),
  z.strictObject({
    kind: z.literal("correct"),
    evidenceId: EvidenceIdSchema,
    nextEvidenceId: EvidenceIdSchema,
    value: z.string().min(1).nullable(),
    sourceTurnId: StructuredIdSchema,
    recordedAt: z.iso.datetime({ offset: true }),
  }),
]);

export const RenderSpeciesGuideInputSchema = SpeciesToolInputSchema.extend({
  previousObservations: SpeciesObservationsSchema.optional(),
  previousSkippedObservations: z.array(SpeciesMatchCategorySchema).max(7).optional(),
  photos: z.array(OpenAIFileSchema).min(1).max(4).optional(),
  evidenceAction: SpeciesEvidenceActionSchema.optional(),
});

export const SpeciesCandidateSchema = z.strictObject({
  profileId: SpeciesProfileIdSchema,
  commonName: z.string().min(1),
  scientificName: z.string().min(1),
  taxonScope: z.enum(["species", "genus-group"]),
  score: z.number().int().nonnegative(),
  matches: z.array(SpeciesMatchCategorySchema),
  contradictions: z.array(SpeciesMatchCategorySchema),
  matchedEvidence: z.array(CandidateEvidenceSchema),
  conflictingEvidence: z.array(CandidateEvidenceSchema),
});

export const UnsupportedObservationSchema = z.strictObject({
  category: SpeciesMatchCategorySchema,
  observationValue: z.string().min(1),
  observationLabel: z.string().min(1),
});

export const CanonicalSpeciesResultSchema = z.strictObject({
  kind: z.enum(["starting-universe", "narrowed", "ambiguous", "no-match"]),
  startingCount: z.number().int().nonnegative(),
  validObservationCount: z.number().int().nonnegative(),
  seasonUnavailable: z.boolean(),
  safetyHandoff: z.boolean(),
  primaryTied: z.boolean(),
  primaryCandidate: SpeciesCandidateSchema.nullable(),
  candidates: z.array(SpeciesCandidateSchema),
  alternatives: z.array(SpeciesCandidateSchema),
  candidateOrderMeaning: z.enum(["evidence-ranked", "stable-display-only"]),
  outsideSupportedUniverse: z.boolean(),
  unsupportedObservations: z.array(UnsupportedObservationSchema),
  nextObservation: SpeciesMatchCategorySchema.nullable(),
  identificationStatus: z.literal("not-confirmed"),
  datasetCommit: z.literal("473e0407e42f60d6ecb4717de3f2649300d3be08"),
  dataset: z.strictObject({
    scope: z.literal("bounded-omaha-area-ten-profile-guide"),
    profileCount: z.literal(10),
    contentCheckedOn: z.string().min(1),
    nextReviewDue: z.string().min(1),
    finalContentReview: z.enum(["pending", "completed"]),
  }),
});

export const MatchSpeciesOutputSchema = z.strictObject({
  caseReference: TreeCaseReferenceSchema,
  result: CanonicalSpeciesResultSchema,
});

export const EvidenceStatementSchema = z.strictObject({
  text: z.string().min(1),
  sourceIds: z.array(z.string().min(1)).min(1),
});

export const SpeciesSourceSchema = z.strictObject({
  id: z.string().min(1),
  title: z.string().min(1),
  organization: z.string().min(1),
  url: z.url(),
  publicationDate: z.string().min(1).optional(),
  accessedOn: z.string().min(1),
  geography: z.enum(["Nebraska", "Eastern Nebraska", "Upper Midwest", "United States"]),
});

const traitValuesSchema = z.strictObject({
  leafArrangement: z.array(LeafArrangementSchema),
  leafType: z.array(LeafTypeSchema),
  leafShape: z.array(LeafShapeSchema),
  bark: z.array(BarkSchema),
  fruit: z.array(FruitSchema),
  overallForm: z.array(OverallFormSchema),
  sizeClass: z.array(SizeClassSchema),
});

const traitSourcesSchema = z.strictObject({
  leafArrangement: z.array(z.string().min(1)),
  leafType: z.array(z.string().min(1)),
  leafShape: z.array(z.string().min(1)),
  bark: z.array(z.string().min(1)),
  fruit: z.array(z.string().min(1)),
  overallForm: z.array(z.string().min(1)),
  sizeClass: z.array(z.string().min(1)),
});

export const SpeciesProfileOutputSchema = z.strictObject({
  profileId: SpeciesProfileIdSchema,
  commonName: z.string().min(1),
  scientificName: z.string().min(1),
  taxonScope: z.enum(["species", "genus-group"]),
  taxonNote: EvidenceStatementSchema,
  omahaRelevance: EvidenceStatementSchema,
  recognition: z.array(EvidenceStatementSchema),
  matureSize: EvidenceStatementSchema,
  importantLocalConcern: EvidenceStatementSchema.optional(),
  whatToWatchFor: EvidenceStatementSchema.optional(),
  maintenanceNote: EvidenceStatementSchema,
  traits: traitValuesSchema,
  traitSourceIds: traitSourcesSchema,
  sourceIds: z.array(z.string().min(1)),
  sources: z.array(SpeciesSourceSchema),
  review: z.strictObject({
    reviewerName: z.literal("A.J."),
    reviewerRole: z.string().min(1),
    independent: z.literal(false),
    isaCertifiedArborist: z.literal(false),
    reviewScope: z.string().min(1),
    evidenceBoundary: z.string().min(1),
    finalContentReview: z.enum(["pending", "completed"]),
    sourcesCheckedOn: z.string().min(1),
    nextReviewDue: z.string().min(1),
  }),
  limitations: z.array(z.string().min(1)).min(1),
});

export const SpeciesEvidenceAnnotationSchema = z.strictObject({
  evidenceId: z.string().min(1),
  field: z.enum([
    "species.season",
    "species.leafArrangement",
    "species.leafType",
    "species.leafShape",
    "species.bark",
    "species.fruit",
    "species.overallForm",
    "species.sizeClass",
  ]),
  value: z.string().nullable(),
  label: z.string().min(1),
  origin: EvidenceOriginSchema,
  state: EvidenceStateSchema,
  sourceReference: EvidenceSourceReferenceSchema.optional(),
  supersedesEvidenceId: z.string().optional(),
});

export const SpeciesQuestionSchema = z.strictObject({
  key: SpeciesObservationFieldSchema,
  eyebrow: z.string().min(1),
  prompt: z.string().min(1),
  help: z.string().min(1),
  visualKind: z.enum(["season", "leaf-arrangement", "leaf-type", "leaf-shape", "bark", "fruit", "crown", "size", "safety"]).nullable(),
  options: z.array(z.strictObject({
    value: z.string().min(1),
    label: z.string().min(1),
    description: z.string().optional(),
  })),
}).nullable();

export const InvestigationChangeSchema = z.strictObject({
  previousCount: z.number().int().nonnegative(),
  currentCount: z.number().int().nonnegative(),
  eliminatedProfileIds: z.array(SpeciesProfileIdSchema),
  returnedProfileIds: z.array(SpeciesProfileIdSchema),
  eliminatedCandidates: z.array(z.strictObject({ profileId: SpeciesProfileIdSchema, commonName: z.string().min(1) })),
  returnedCandidates: z.array(z.strictObject({ profileId: SpeciesProfileIdSchema, commonName: z.string().min(1) })),
  message: z.string().min(1),
}).nullable();

export const SpeciesHazardHandoffSchema = z.strictObject({
  kind: z.literal("visible-failure-target"),
  firstAction: z.literal("open-hazard-screening"),
  heading: z.literal("Possible safety concern"),
  explanation: z.string().min(1),
  interruptsCurrentCapability: z.literal(true),
  affectsSpeciesRanking: z.literal(false),
  basis: z.strictObject({
    visibleFailureSign: z.literal("yes"),
    targetWithinReach: z.literal("yes"),
  }),
});

export const RenderSpeciesGuideOutputSchema = z.strictObject({
  treeCase: TreeCaseSchema,
  caseReference: TreeCaseReferenceSchema,
  observations: SpeciesObservationsSchema,
  skippedObservations: z.array(SpeciesMatchCategorySchema),
  result: CanonicalSpeciesResultSchema,
  activeTreeEvidence: z.array(SpeciesEvidenceAnnotationSchema),
  nextQuestion: SpeciesQuestionSchema,
  change: InvestigationChangeSchema,
  safetyRoute: SharedSafetyRouteSchema.nullable(),
  hazardHandoff: SpeciesHazardHandoffSchema.nullable(),
  uiState: z.enum([
    "empty", "initial-clues", "multiple-candidates", "next-clue", "contradiction-recheck",
    "tie", "outside-guide", "strongest-match", "no-match", "completed-record",
  ]),
  handoffs: z.array(z.strictObject({ id: z.enum(["problem", "diy", "hazard", "cost"]), label: z.string() })),
  platform: z.strictObject({
    originalPhotoAvailable: z.boolean(),
    photoCount: z.number().int().nonnegative(),
    photoFileIds: z.array(z.string().min(1)),
    photoLimitation: z.string().min(1).nullable(),
  }),
});

export type CanonicalSpeciesResult = z.infer<typeof CanonicalSpeciesResultSchema>;
export type RenderSpeciesGuideOutput = z.infer<typeof RenderSpeciesGuideOutputSchema>;
export type SpeciesToolInput = z.infer<typeof SpeciesToolInputSchema>;
export type RenderSpeciesGuideInput = z.infer<typeof RenderSpeciesGuideInputSchema>;
