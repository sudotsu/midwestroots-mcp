import { z } from "zod";

import {
  utilityGuidance,
  type UtilityStatus,
} from "../../tools/species-guide/vendor/omahatreecare/src/data/utility-guidance.js";
import { EvidenceIdSchema, TreeCaseSchema, TreeIdSchema, type TreeCase } from "../case/schema.js";

const ActiveElectricalSignSchema = z.enum(["downed-wire", "arcing", "fire", "active-electrical-emergency"]);

export const SharedSafetyInputSchema = z.strictObject({
  treeId: TreeIdSchema,
  utilityStatus: z.enum(["clear", "nearby-or-uncertain", "apparent-contact", "active-electrical-signs"]),
  activeElectricalSigns: z.array(ActiveElectricalSignSchema).max(4).optional(),
  evidenceIds: z.array(EvidenceIdSchema).min(1),
});

export const SharedSafetyRouteSchema = z.strictObject({
  treeId: TreeIdSchema,
  utilityStatus: z.enum(["clear", "nearby-or-uncertain", "apparent-contact", "active-electrical-signs"]),
  firstAction: z.enum([
    "continue",
    "pause-for-midwest-roots-review",
    "stay-clear-midwest-roots-utility-review",
    "utility-emergency-first",
  ]),
  heading: z.string().min(1),
  explanation: z.string().min(1),
  evidenceIds: z.array(EvidenceIdSchema).min(1),
  interruptsCurrentCapability: z.boolean(),
  affectsSpeciesRanking: z.literal(false),
});

const firstActionByStatus = {
  clear: "continue",
  "nearby-or-uncertain": "pause-for-midwest-roots-review",
  "apparent-contact": "stay-clear-midwest-roots-utility-review",
  "active-electrical-signs": "utility-emergency-first",
} as const;

const utilityPriority: Record<UtilityStatus, number> = {
  clear: 0,
  "nearby-or-uncertain": 1,
  "apparent-contact": 2,
  "active-electrical-signs": 3,
};

/**
 * Builds shared utility-safety guidance from current evidence on the active tree.
 * The supplied utility status and optional electrical signs must match that
 * evidence; any current electrical sign requires emergency-first guidance.
 *
 * @throws If the input, Tree Case, or selected evidence is invalid, stale, or inconsistent.
 */
export function routeSharedSafety(
  input: z.input<typeof SharedSafetyInputSchema>,
  treeCaseInput: TreeCase,
) {
  const parsed = SharedSafetyInputSchema.parse(input);
  const treeCase = TreeCaseSchema.parse(treeCaseInput);
  if (treeCase.activeTreeId !== parsed.treeId) throw new Error("Safety input must reference the active tree");

  const tree = treeCase.trees.find(({ id }) => id === parsed.treeId);
  if (!tree) throw new Error("Safety input references an unknown tree");

  const supersededEvidenceIds = new Set(
    tree.evidence.flatMap((item) => item.supersedesEvidenceId ? [item.supersedesEvidenceId] : []),
  );
  const currentEvidence = tree.evidence.filter((item) => !supersededEvidenceIds.has(item.id));
  const currentEvidenceById = new Map(currentEvidence.map((item) => [item.id, item]));

  const selectedEvidence = parsed.evidenceIds.map((id) => currentEvidenceById.get(id));
  if (selectedEvidence.some((item) => !item)) {
    throw new Error("Safety input contains unknown, different-tree, or superseded evidence");
  }
  if (selectedEvidence.some((item) => !item?.field.startsWith("safety."))) {
    throw new Error("Safety routing accepts only safety evidence IDs");
  }

  const currentUtilityEvidence = currentEvidence.filter(
    (item) => item.field === "safety.utilityStatus" && item.value !== null,
  );
  if (currentUtilityEvidence.length === 0) {
    throw new Error("Safety input lacks current utility-status evidence");
  }
  const strongestUtilityEvidence = currentUtilityEvidence.reduce((strongest, item) => (
    utilityPriority[item.value as UtilityStatus] > utilityPriority[strongest.value as UtilityStatus] ? item : strongest
  ));
  const currentUtilityStatus = strongestUtilityEvidence.value as UtilityStatus;
  if (parsed.utilityStatus !== currentUtilityStatus) {
    throw new Error(`Safety utility status is stale or conflicts with current evidence (${currentUtilityStatus})`);
  }
  if (!selectedEvidence.some((item) => (
    item?.field === "safety.utilityStatus" && item.value === currentUtilityStatus
  ))) {
    throw new Error("Safety input must select current evidence for its utility status");
  }

  const currentElectricalEvidence = currentEvidence.filter(
    (item) => item.field === "safety.activeElectricalSign" && item.value !== null,
  );
  const currentElectricalSigns = [...new Set(
    currentElectricalEvidence.map((item) => ActiveElectricalSignSchema.parse(item.value)),
  )].sort();
  if (parsed.activeElectricalSigns !== undefined) {
    const suppliedSigns = [...new Set(parsed.activeElectricalSigns)].sort();
    if (JSON.stringify(suppliedSigns) !== JSON.stringify(currentElectricalSigns)) {
      throw new Error("Supplied active electrical signs do not match current Tree Case evidence");
    }
  }

  const status: UtilityStatus = currentElectricalSigns.length > 0
    ? "active-electrical-signs"
    : currentUtilityStatus;
  const guidance = utilityGuidance[status];
  const routeEvidenceIds = [...new Set([
    ...currentUtilityEvidence
      .filter((item) => item.value === currentUtilityStatus)
      .map((item) => item.id),
    ...(status === "active-electrical-signs" ? currentElectricalEvidence.map((item) => item.id) : []),
  ])];

  return SharedSafetyRouteSchema.parse({
    treeId: parsed.treeId,
    utilityStatus: status,
    firstAction: firstActionByStatus[status],
    heading: guidance.heading,
    explanation: guidance.explanation,
    evidenceIds: routeEvidenceIds,
    interruptsCurrentCapability: status !== "clear",
    affectsSpeciesRanking: false,
  });
}
