import { EvidenceSchema, TreeCaseSchema, type Evidence, type TreeCase } from "./schema.js";

/**
 * Appends evidence to the active tree in a validated copy of a Tree Case.
 * The case revision is incremented, and results that depend on the new evidence
 * field are marked stale.
 *
 * @throws If either input is invalid or the evidence does not target the active tree.
 */
export function addEvidence(treeCaseInput: TreeCase, evidenceInput: Evidence): TreeCase {
  const treeCase = TreeCaseSchema.parse(treeCaseInput);
  const evidence = EvidenceSchema.parse(evidenceInput);
  if (evidence.treeId !== treeCase.activeTreeId) {
    throw new Error("Switch activeTreeId before adding evidence for another tree");
  }
  const next = structuredClone(treeCase);
  const tree = next.trees.find(({ id }) => id === evidence.treeId);
  if (!tree) throw new Error(`Unknown tree ${evidence.treeId}`);
  if (
    evidence.supersedesEvidenceId
    && tree.evidence.some((item) => item.supersedesEvidenceId === evidence.supersedesEvidenceId)
  ) {
    throw new Error(`Evidence ${evidence.supersedesEvidenceId} is already superseded`);
  }
  tree.evidence.push(evidence);
  next.revision += 1;
  next.results = next.results.map((result) => ({
    ...result,
    stale: result.stale || (
      result.treeId === evidence.treeId && result.dependsOnFields.includes(evidence.field)
    ),
  }));
  return TreeCaseSchema.parse(next);
}

/**
 * Records a user confirmation as a new revision of existing evidence while
 * preserving its origin and source reference.
 *
 * @throws If the referenced evidence is missing, has no value, or cannot be
 * added to the active tree.
 */
export function confirmEvidence(
  treeCaseInput: TreeCase,
  evidenceId: string,
  nextId: string,
  recordedAt: string,
): TreeCase {
  const treeCase = TreeCaseSchema.parse(treeCaseInput);
  const prior = treeCase.trees.flatMap(({ evidence }) => evidence).find(({ id }) => id === evidenceId);
  if (!prior) throw new Error(`Unknown evidence ${evidenceId}`);
  if (prior.value === null) throw new Error("Evidence without a value cannot be confirmed");
  const confirmation = EvidenceSchema.parse({
    ...prior,
    id: nextId,
    state: "confirmed-by-user",
    revision: prior.revision + 1,
    supersedesEvidenceId: prior.id,
    recordedAt,
  });
  return addEvidence(treeCase, confirmation);
}

/**
 * Records a correction as a user-stated revision of existing evidence. A null
 * correction becomes unknown evidence; other values become user-confirmed.
 *
 * @throws If the referenced evidence is missing or the replacement cannot be
 * validated and added to the active tree.
 */
export function correctEvidence(
  treeCaseInput: TreeCase,
  evidenceId: string,
  correction: Pick<Evidence, "id" | "value" | "recordedAt"> & { sourceTurnId: string },
): TreeCase {
  const treeCase = TreeCaseSchema.parse(treeCaseInput);
  const prior = treeCase.trees.flatMap(({ evidence }) => evidence).find(({ id }) => id === evidenceId);
  if (!prior) throw new Error(`Unknown evidence ${evidenceId}`);
  const replacement = EvidenceSchema.parse({
    id: correction.id,
    treeId: prior.treeId,
    field: prior.field,
    value: correction.value,
    origin: "user_stated",
    state: correction.value === null ? "unknown" : "confirmed-by-user",
    revision: prior.revision + 1,
    supersedesEvidenceId: prior.id,
    sourceReference: { kind: "conversation-turn", id: correction.sourceTurnId },
    recordedAt: correction.recordedAt,
  });
  return addEvidence(treeCase, replacement);
}
