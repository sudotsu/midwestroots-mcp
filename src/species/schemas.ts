import { z } from "zod";

import { speciesGuideQuestions } from "../../tools/species-guide/vendor/omahatreecare/src/data/species-guide-questions.js";
import { StructuredIdSchema } from "../shared/ids.js";

export const SpeciesMatchCategorySchema = z.enum([
  "leafArrangement",
  "leafType",
  "leafShape",
  "bark",
  "fruit",
  "overallForm",
  "sizeClass",
]);

export const SpeciesObservationFieldSchema = z.enum([
  "season",
  ...SpeciesMatchCategorySchema.options,
]);

export const SeasonSchema = z.enum(["leaf-on", "leaf-off-or-unavailable"]);
export const LeafArrangementSchema = z.enum(["opposite", "alternate"]);
export const LeafTypeSchema = z.enum(["simple", "compound", "needles-or-scales"]);
export const LeafShapeSchema = z.enum([
  "deeply-lobed",
  "rounded-lobes",
  "pointed-lobes",
  "triangular",
  "oval-serrated",
  "elm-like",
  "many-small-leaflets",
  "very-large-compound",
]);
export const BarkSchema = z.enum([
  "diamond-ridged",
  "warty-corky",
  "smooth-to-scaly",
  "deeply-furrowed",
  "gray-furrowed",
  "rough-scaly",
]);
export const FruitSchema = z.enum([
  "paddle-seeds",
  "paired-winged-seeds",
  "cottony-seeds",
  "small-round-pears",
  "fringed-acorn-cap",
  "acorn",
  "small-dark-berries",
  "long-flat-pods",
  "round-winged-seeds",
  "thick-dark-pods",
  "none-seen",
]);
export const OverallFormSchema = z.enum([
  "vase",
  "rounded",
  "upright",
  "broad-spreading",
  "open-irregular",
]);
export const SizeClassSchema = z.enum(["under-40", "40-to-70", "over-70"]);
export const YesNoUnknownSchema = z.enum(["yes", "no", "not-sure"]);

export const SpeciesObservationsSchema = z.strictObject({
  season: SeasonSchema.nullable().optional(),
  leafArrangement: LeafArrangementSchema.nullable().optional(),
  leafType: LeafTypeSchema.nullable().optional(),
  leafShape: LeafShapeSchema.nullable().optional(),
  bark: BarkSchema.nullable().optional(),
  fruit: FruitSchema.nullable().optional(),
  overallForm: OverallFormSchema.nullable().optional(),
  sizeClass: SizeClassSchema.nullable().optional(),
  visibleFailureSign: YesNoUnknownSchema.nullable().optional(),
  targetWithinReach: YesNoUnknownSchema.nullable().optional(),
});

export const TreeCaseReferenceSchema = z.strictObject({
  caseId: StructuredIdSchema,
  activeTreeId: StructuredIdSchema,
  expectedRevision: z.number().int().nonnegative(),
});

export const SpeciesMatchInputSchema = z.strictObject({
  treeCase: TreeCaseReferenceSchema,
  observations: SpeciesObservationsSchema,
  skippedObservations: z.array(SpeciesMatchCategorySchema).max(7).default([]),
});

export type SpeciesObservations = z.infer<typeof SpeciesObservationsSchema>;
export type SpeciesMatchInput = z.infer<typeof SpeciesMatchInputSchema>;
export type TreeCaseReference = z.infer<typeof TreeCaseReferenceSchema>;

/**
 * Returns each canonical Species question key mapped to its ordered option values.
 */
export function canonicalQuestionValues() {
  return Object.fromEntries(
    speciesGuideQuestions.map((question) => [question.key, question.options.map(({ value }) => value)]),
  );
}

export const speciesSchemaValues = {
  season: SeasonSchema.options,
  leafArrangement: LeafArrangementSchema.options,
  leafType: LeafTypeSchema.options,
  leafShape: LeafShapeSchema.options,
  bark: BarkSchema.options,
  fruit: FruitSchema.options,
  overallForm: OverallFormSchema.options,
  sizeClass: SizeClassSchema.options,
  visibleFailureSign: YesNoUnknownSchema.options,
  targetWithinReach: YesNoUnknownSchema.options,
} as const;
