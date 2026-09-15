import { z } from "zod";

import {
  BarkSchema,
  FruitSchema,
  LeafArrangementSchema,
  LeafShapeSchema,
  LeafTypeSchema,
  OverallFormSchema,
  SeasonSchema,
  SizeClassSchema,
  YesNoUnknownSchema,
} from "../species/schemas.js";
import { StructuredIdSchema } from "../shared/ids.js";

export const CaseIdSchema = StructuredIdSchema;
export const TreeIdSchema = CaseIdSchema;
export const EvidenceIdSchema = CaseIdSchema;

export const EvidenceOriginSchema = z.enum([
  "user_stated",
  "image_observed",
  "model_inferred",
  "tool_derived",
  "external_source",
  "unknown",
]);

export const EvidenceStateSchema = z.enum([
  "confirmed-by-user",
  "observed",
  "provisional",
  "conflicted",
  "unknown",
]);

export const EvidenceFieldSchema = z.enum([
  "species.season",
  "species.leafArrangement",
  "species.leafType",
  "species.leafShape",
  "species.bark",
  "species.fruit",
  "species.overallForm",
  "species.sizeClass",
  "tree.visibleFailureSign",
  "site.targetWithinReach",
  "safety.utilityStatus",
  "safety.activeElectricalSign",
]);

const UtilityStatusSchema = z.enum([
  "clear",
  "nearby-or-uncertain",
  "apparent-contact",
  "active-electrical-signs",
]);
const ActiveElectricalSignSchema = z.enum([
  "downed-wire",
  "arcing",
  "fire",
  "active-electrical-emergency",
]);

const evidenceValueSchemas = {
  "species.season": SeasonSchema,
  "species.leafArrangement": LeafArrangementSchema,
  "species.leafType": LeafTypeSchema,
  "species.leafShape": LeafShapeSchema,
  "species.bark": BarkSchema,
  "species.fruit": FruitSchema,
  "species.overallForm": OverallFormSchema,
  "species.sizeClass": SizeClassSchema,
  "tree.visibleFailureSign": YesNoUnknownSchema,
  "site.targetWithinReach": YesNoUnknownSchema,
  "safety.utilityStatus": UtilityStatusSchema,
  "safety.activeElectricalSign": ActiveElectricalSignSchema,
} as const;

export const EvidenceValueSchema = z.union([
  SeasonSchema,
  LeafArrangementSchema,
  LeafTypeSchema,
  LeafShapeSchema,
  BarkSchema,
  FruitSchema,
  OverallFormSchema,
  SizeClassSchema,
  YesNoUnknownSchema,
  UtilityStatusSchema,
  ActiveElectricalSignSchema,
  z.null(),
]);

export const EvidenceSourceReferenceSchema = z.strictObject({
  kind: z.enum(["conversation-turn", "image", "tool-result", "external-source"]),
  id: CaseIdSchema,
});

export const EvidenceSchema = z.strictObject({
  id: EvidenceIdSchema,
  treeId: TreeIdSchema,
  field: EvidenceFieldSchema,
  value: EvidenceValueSchema,
  origin: EvidenceOriginSchema,
  state: EvidenceStateSchema,
  revision: z.number().int().positive(),
  supersedesEvidenceId: EvidenceIdSchema.optional(),
  sourceReference: EvidenceSourceReferenceSchema.optional(),
  notes: z.string().trim().min(1).max(500).optional(),
  recordedAt: z.iso.datetime({ offset: true }),
}).superRefine((evidence, context) => {
  const valueSchema = evidenceValueSchemas[evidence.field];
  if (evidence.value !== null && !valueSchema.safeParse(evidence.value).success) {
    context.addIssue({
      code: "custom",
      path: ["value"],
      message: `value is invalid for ${evidence.field}`,
    });
  }
  if (evidence.value === null && evidence.state !== "unknown") {
    context.addIssue({ code: "custom", path: ["state"], message: "null evidence must use the unknown state" });
  }
  if (evidence.value !== null && evidence.state === "unknown") {
    context.addIssue({ code: "custom", path: ["value"], message: "unknown evidence must have a null value" });
  }
  if (evidence.origin === "image_observed" && !evidence.sourceReference) {
    context.addIssue({ code: "custom", path: ["sourceReference"], message: "image evidence requires its original source reference" });
  }
});

export const FactSchema = z.strictObject({
  id: CaseIdSchema,
  treeId: TreeIdSchema,
  field: EvidenceFieldSchema,
  value: EvidenceValueSchema,
  state: EvidenceStateSchema,
  evidenceIds: z.array(EvidenceIdSchema).min(1),
  revision: z.number().int().positive(),
}).superRefine((fact, context) => {
  const valueSchema = evidenceValueSchemas[fact.field];
  if (fact.value !== null && !valueSchema.safeParse(fact.value).success) {
    context.addIssue({ code: "custom", path: ["value"], message: `value is invalid for ${fact.field}` });
  }
  if (fact.value === null && fact.state !== "unknown") {
    context.addIssue({ code: "custom", path: ["state"], message: "null fact must use the unknown state" });
  }
  if (fact.value !== null && fact.state === "unknown") {
    context.addIssue({ code: "custom", path: ["value"], message: "unknown fact must have a null value" });
  }
});

export const DependentResultSchema = z.strictObject({
  id: CaseIdSchema,
  treeId: TreeIdSchema,
  capability: z.enum(["species", "problem-navigator", "diy-professional", "hazard", "cost"]),
  dependsOnFields: z.array(EvidenceFieldSchema).min(1),
  evidenceRevisions: z.record(EvidenceIdSchema, z.number().int().positive()),
  computedAt: z.iso.datetime({ offset: true }),
  stale: z.boolean(),
});

export const TreeRecordSchema = z.strictObject({
  id: TreeIdSchema,
  label: z.string().trim().min(1).max(120).optional(),
  evidence: z.array(EvidenceSchema),
});

export const TreeCaseSchema = z.strictObject({
  schemaVersion: z.literal(1),
  caseId: CaseIdSchema,
  revision: z.number().int().nonnegative(),
  activeTreeId: TreeIdSchema,
  trees: z.array(TreeRecordSchema).min(1),
  facts: z.array(FactSchema),
  results: z.array(DependentResultSchema),
}).superRefine((treeCase, context) => {
  const treesById = new Map(treeCase.trees.map((tree) => [tree.id, tree]));
  if (treesById.size !== treeCase.trees.length) {
    context.addIssue({ code: "custom", path: ["trees"], message: "tree IDs must be unique" });
  }
  if (!treesById.has(treeCase.activeTreeId)) {
    context.addIssue({ code: "custom", path: ["activeTreeId"], message: "activeTreeId must reference a tree in this case" });
  }

  const evidence = treeCase.trees.flatMap((tree) => tree.evidence);
  const evidenceById = new Map(evidence.map((item) => [item.id, item]));
  if (evidenceById.size !== evidence.length) {
    context.addIssue({ code: "custom", path: ["trees"], message: "evidence IDs must be unique across the case" });
  }

  treeCase.trees.forEach((tree, treeIndex) => {
    tree.evidence.forEach((item, evidenceIndex) => {
      if (item.treeId !== tree.id) {
        context.addIssue({ code: "custom", path: ["trees", treeIndex, "evidence", evidenceIndex, "treeId"], message: "evidence cannot cross tree boundaries" });
      }
      if (item.supersedesEvidenceId) {
        const prior = evidenceById.get(item.supersedesEvidenceId);
        if (!prior || prior.treeId !== item.treeId || prior.field !== item.field || prior.revision + 1 !== item.revision) {
          context.addIssue({
            code: "custom",
            path: ["trees", treeIndex, "evidence", evidenceIndex, "supersedesEvidenceId"],
            message: "a revision must supersede older evidence for the same field and tree",
          });
        }
      } else if (item.revision !== 1) {
        context.addIssue({
          code: "custom",
          path: ["trees", treeIndex, "evidence", evidenceIndex, "revision"],
          message: "initial evidence must start at revision 1",
        });
      }
    });
  });
  treeCase.facts.forEach((fact, factIndex) => {
    if (!treesById.has(fact.treeId)) {
      context.addIssue({ code: "custom", path: ["facts", factIndex, "treeId"], message: "fact references an unknown tree" });
    }
    for (const evidenceId of fact.evidenceIds) {
      const item = evidenceById.get(evidenceId);
      if (!item || item.treeId !== fact.treeId || item.field !== fact.field) {
        context.addIssue({ code: "custom", path: ["facts", factIndex, "evidenceIds"], message: "fact evidence must reference the same field and tree" });
      }
    }
  });
  if (new Set(treeCase.facts.map(({ id }) => id)).size !== treeCase.facts.length) {
    context.addIssue({ code: "custom", path: ["facts"], message: "fact IDs must be unique" });
  }

  treeCase.results.forEach((result, resultIndex) => {
    if (!treesById.has(result.treeId)) {
      context.addIssue({ code: "custom", path: ["results", resultIndex, "treeId"], message: "result references an unknown tree" });
    }
    for (const [evidenceId, revision] of Object.entries(result.evidenceRevisions)) {
      const item = evidenceById.get(evidenceId);
      if (!item || item.treeId !== result.treeId || item.revision !== revision || !result.dependsOnFields.includes(item.field)) {
        context.addIssue({ code: "custom", path: ["results", resultIndex, "evidenceRevisions", evidenceId], message: "result evidence revision is invalid for its tree" });
      }
    }
    const supersededEvidenceIds = new Set(evidence.flatMap((item) => (
      item.supersedesEvidenceId ? [item.supersedesEvidenceId] : []
    )));
    const unseenRelevantEvidence = evidence.some((item) => (
      item.treeId === result.treeId
      && result.dependsOnFields.includes(item.field)
      && !supersededEvidenceIds.has(item.id)
      && result.evidenceRevisions[item.id] !== item.revision
    ));
    if (unseenRelevantEvidence && !result.stale) {
      context.addIssue({ code: "custom", path: ["results", resultIndex, "stale"], message: "result must be stale when relevant evidence changed" });
    }
  });
  if (new Set(treeCase.results.map(({ id }) => id)).size !== treeCase.results.length) {
    context.addIssue({ code: "custom", path: ["results"], message: "result IDs must be unique" });
  }
});

export type Evidence = z.infer<typeof EvidenceSchema>;
export type Fact = z.infer<typeof FactSchema>;
export type DependentResult = z.infer<typeof DependentResultSchema>;
export type TreeRecord = z.infer<typeof TreeRecordSchema>;
export type TreeCase = z.infer<typeof TreeCaseSchema>;
export type EvidenceOrigin = z.infer<typeof EvidenceOriginSchema>;
export type EvidenceState = z.infer<typeof EvidenceStateSchema>;
