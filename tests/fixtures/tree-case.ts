import type { TreeCase } from "../../src/case/schema.js";

export const recordedAt = "2026-09-14T12:00:00Z";

export function treeCaseFixture(): TreeCase {
  return {
    schemaVersion: 1,
    caseId: "case-1",
    revision: 1,
    activeTreeId: "tree-1",
    trees: [
      {
        id: "tree-1",
        evidence: [
          {
            id: "evidence-1",
            treeId: "tree-1",
            field: "species.leafArrangement",
            value: "opposite",
            origin: "image_observed",
            state: "provisional",
            revision: 1,
            sourceReference: { kind: "image", id: "image-1" },
            recordedAt,
          },
          {
            id: "utility-1",
            treeId: "tree-1",
            field: "safety.utilityStatus",
            value: "nearby-or-uncertain",
            origin: "user_stated",
            state: "observed",
            revision: 1,
            sourceReference: { kind: "conversation-turn", id: "turn-1" },
            recordedAt,
          },
          {
            id: "electrical-1",
            treeId: "tree-1",
            field: "safety.activeElectricalSign",
            value: "arcing",
            origin: "user_stated",
            state: "observed",
            revision: 1,
            sourceReference: { kind: "conversation-turn", id: "turn-1" },
            recordedAt,
          },
        ],
      },
      { id: "tree-2", evidence: [] },
    ],
    facts: [],
    results: [
      {
        id: "result-1",
        treeId: "tree-1",
        capability: "species",
        dependsOnFields: ["species.leafArrangement"],
        evidenceRevisions: { "evidence-1": 1 },
        computedAt: recordedAt,
        stale: false,
      },
    ],
  };
}
