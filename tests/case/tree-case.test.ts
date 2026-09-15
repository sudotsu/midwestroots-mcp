import { describe, expect, it } from "vitest";

import { addEvidence, confirmEvidence, correctEvidence } from "../../src/case/revisions.js";
import { EvidenceSchema, TreeCaseSchema } from "../../src/case/schema.js";
import { recordedAt, treeCaseFixture } from "../fixtures/tree-case.js";

describe("Tree Case evidence contract", () => {
  it("keeps image origin and reference when a homeowner confirms the observation", () => {
    const confirmed = confirmEvidence(treeCaseFixture(), "evidence-1", "evidence-2", recordedAt);
    const revision = confirmed.trees[0]?.evidence.at(-1);
    expect(revision).toMatchObject({
      id: "evidence-2",
      origin: "image_observed",
      state: "confirmed-by-user",
      sourceReference: { kind: "image", id: "image-1" },
      supersedesEvidenceId: "evidence-1",
      revision: 2,
    });
    expect(confirmed.results[0]?.stale).toBe(true);
  });

  it("records an explicit correction as user-stated evidence and preserves revision history", () => {
    const corrected = correctEvidence(treeCaseFixture(), "evidence-1", {
      id: "evidence-2",
      value: "alternate",
      sourceTurnId: "turn-2",
      recordedAt,
    });
    expect(corrected.trees[0]?.evidence).toHaveLength(4);
    expect(corrected.trees[0]?.evidence.at(-1)).toMatchObject({
      origin: "user_stated",
      state: "confirmed-by-user",
      value: "alternate",
      supersedesEvidenceId: "evidence-1",
      sourceReference: { kind: "conversation-turn", id: "turn-2" },
    });
    expect(corrected.results[0]?.stale).toBe(true);
  });

  it("marks dependent results stale when new relevant evidence arrives", () => {
    const next = addEvidence(treeCaseFixture(), EvidenceSchema.parse({
      id: "evidence-2",
      treeId: "tree-1",
      field: "species.leafArrangement",
      value: "alternate",
      origin: "user_stated",
      state: "observed",
      revision: 1,
      sourceReference: { kind: "conversation-turn", id: "turn-2" },
      recordedAt,
    }));
    expect(next.results[0]?.stale).toBe(true);
  });

  it("rejects malformed evidence, unknown keys, and field/value mismatches", () => {
    expect(() => EvidenceSchema.parse({
      id: "evidence-1",
      treeId: "tree-1",
      field: "species.leafType",
      value: "opposite",
      origin: "image_observed",
      state: "provisional",
      revision: 1,
      recordedAt,
      unexpected: true,
    })).toThrow();
  });

  it("rejects evidence and results that cross tree boundaries", () => {
    const treeCase = treeCaseFixture();
    treeCase.trees[0]!.evidence[0]!.treeId = "tree-2";
    expect(() => TreeCaseSchema.parse(treeCase)).toThrow(/cross tree boundaries/);
  });

  it("requires activeTreeId to reference a tree in the case", () => {
    const treeCase = treeCaseFixture();
    treeCase.activeTreeId = "tree-missing";
    expect(() => TreeCaseSchema.parse(treeCase)).toThrow(/activeTreeId/);
  });

  it("requires an explicit active-tree switch before adding adjacent-tree evidence", () => {
    expect(() => addEvidence(treeCaseFixture(), EvidenceSchema.parse({
      id: "tree-2-evidence",
      treeId: "tree-2",
      field: "species.leafType",
      value: "simple",
      origin: "user_stated",
      state: "observed",
      revision: 1,
      recordedAt,
    }))).toThrow(/Switch activeTreeId/);
  });
});
