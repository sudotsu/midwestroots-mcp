import { describe, expect, it } from "vitest";

import { correctEvidence } from "../../src/case/revisions.js";
import { routeSharedSafety, SharedSafetyInputSchema } from "../../src/safety/utility-routing.js";
import { recordedAt, treeCaseFixture } from "../fixtures/tree-case.js";

function withArcingEvidence() {
  const treeCase = treeCaseFixture();
  treeCase.trees[0]!.evidence.push({
    id: "electrical-1",
    treeId: "tree-1",
    field: "safety.activeElectricalSign",
    value: "arcing",
    origin: "user_stated",
    state: "observed",
    revision: 1,
    sourceReference: { kind: "conversation-turn", id: "turn-1" },
    recordedAt,
  });
  return treeCase;
}

describe("shared utility routing", () => {
  it("uses Midwest Roots review for nearby or uncertain lines", () => {
    expect(routeSharedSafety({
      treeId: "tree-1",
      utilityStatus: "nearby-or-uncertain",
      evidenceIds: ["utility-1"],
    }, treeCaseFixture())).toMatchObject({
      firstAction: "pause-for-midwest-roots-review",
      interruptsCurrentCapability: true,
      affectsSpeciesRanking: false,
      evidenceIds: ["utility-1"],
    });
  });

  it("uses stay-clear review for apparent contact", () => {
    const contactCase = treeCaseFixture();
    contactCase.trees[0]!.evidence.find(({ id }) => id === "utility-1")!.value = "apparent-contact";
    expect(routeSharedSafety({
      treeId: "tree-1",
      utilityStatus: "apparent-contact",
      evidenceIds: ["utility-1"],
    }, contactCase).firstAction).toBe("stay-clear-midwest-roots-utility-review");
  });

  it("derives emergency escalation from current Tree Case evidence even when sign summary is omitted", () => {
    const route = routeSharedSafety({
      treeId: "tree-1",
      utilityStatus: "nearby-or-uncertain",
      evidenceIds: ["utility-1"],
    }, withArcingEvidence());
    expect(route).toMatchObject({
      utilityStatus: "active-electrical-signs",
      firstAction: "utility-emergency-first",
      evidenceIds: ["utility-1", "electrical-1"],
      affectsSpeciesRanking: false,
    });
  });

  it("rejects stale superseded utility evidence instead of allowing a downgrade", () => {
    const original = treeCaseFixture();
    original.trees[0]!.evidence.find(({ id }) => id === "utility-1")!.value = "clear";
    const corrected = correctEvidence(original, "utility-1", {
      id: "utility-2",
      value: "apparent-contact",
      sourceTurnId: "turn-2",
      recordedAt,
    });

    expect(() => routeSharedSafety({
      treeId: "tree-1",
      utilityStatus: "clear",
      evidenceIds: ["utility-1"],
    }, corrected)).toThrow(/superseded/);

    expect(routeSharedSafety({
      treeId: "tree-1",
      utilityStatus: "apparent-contact",
      evidenceIds: ["utility-2"],
    }, corrected).firstAction).toBe("stay-clear-midwest-roots-utility-review");
  });

  it("rejects a caller-supplied electrical-sign summary that contradicts current evidence", () => {
    expect(() => routeSharedSafety({
      treeId: "tree-1",
      utilityStatus: "nearby-or-uncertain",
      activeElectricalSigns: ["fire"],
      evidenceIds: ["utility-1"],
    }, withArcingEvidence())).toThrow(/do not match current Tree Case evidence/);
  });

  it("does not accept homeowner utility ownership or clearance judgments", () => {
    expect(() => SharedSafetyInputSchema.parse({
      treeId: "tree-1",
      utilityStatus: "nearby-or-uncertain",
      evidenceIds: ["utility-1"],
      utilityOwner: "OPPD",
      measuredClearance: 12,
    })).toThrow();
  });

  it("rejects evidence from another or unknown tree", () => {
    expect(() => routeSharedSafety({
      treeId: "tree-1",
      utilityStatus: "nearby-or-uncertain",
      evidenceIds: ["missing-evidence"],
    }, treeCaseFixture())).toThrow(/unknown, different-tree, or superseded/);
  });
});
