import { EvidenceSchema, TreeCaseSchema, type Evidence, type TreeCase } from "./schema.js";

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
