import { z } from "zod";

import {
  utilityGuidance,
  type UtilityStatus,
} from "../../tools/species-guide/vendor/omahatreecare/src/data/utility-guidance.js";
import { EvidenceIdSchema, TreeCaseSchema, TreeIdSchema, type TreeCase } from "../case/schema.js";

export const SharedSafetyInputSchema = z.strictObject({
  treeId: TreeIdSchema,
  utilityStatus: z.enum(["clear", "nearby-or-uncertain", "apparent-contact", "active-electrical-signs"]),
  activeElectricalSigns: z.array(z.enum(["downed-wire", "arcing", "fire", "active-electrical-emergency"])).max(4).default([]),
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

export function routeSharedSafety(
  input: z.input<typeof SharedSafetyInputSchema>,
  treeCaseInput: TreeCase,
) {
  const parsed = SharedSafetyInputSchema.parse(input);
  const treeCase = TreeCaseSchema.parse(treeCaseInput);
  if (treeCase.activeTreeId !== parsed.treeId) throw new Error("Safety input must reference the active tree");
  const evidenceById = new Map(
    treeCase.trees.find(({ id }) => id === parsed.treeId)?.evidence.map((item) => [item.id, item]),
  );
  const selectedEvidence = parsed.evidenceIds.map((id) => evidenceById.get(id));
  if (selectedEvidence.some((item) => !item)) {
    throw new Error("Safety input contains evidence from an unknown or different tree");
  }
  if (!selectedEvidence.some((item) => (
    item?.field === "safety.utilityStatus" && item.value === parsed.utilityStatus
  ))) throw new Error("Safety input lacks evidence for its utility status");
  for (const sign of parsed.activeElectricalSigns) {
    if (!selectedEvidence.some((item) => item?.field === "safety.activeElectricalSign" && item.value === sign)) {
      throw new Error(`Safety input lacks evidence for ${sign}`);
    }
  }
  const status: UtilityStatus = parsed.activeElectricalSigns.length > 0
    ? "active-electrical-signs"
    : parsed.utilityStatus;
  const guidance = utilityGuidance[status];
  return SharedSafetyRouteSchema.parse({
    treeId: parsed.treeId,
    utilityStatus: status,
    firstAction: firstActionByStatus[status],
    heading: guidance.heading,
    explanation: guidance.explanation,
    evidenceIds: parsed.evidenceIds,
    interruptsCurrentCapability: status !== "clear",
    affectsSpeciesRanking: false,
  });
}
