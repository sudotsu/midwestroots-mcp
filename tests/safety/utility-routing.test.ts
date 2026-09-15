import { describe, expect, it } from "vitest";

import { routeSharedSafety, SharedSafetyInputSchema } from "../../src/safety/utility-routing.js";
import { treeCaseFixture } from "../fixtures/tree-case.js";

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
    });
  });

  it("uses stay-clear review for apparent contact and emergency-first for active signs", () => {
    const contactCase = treeCaseFixture();
    contactCase.trees[0]!.evidence.find(({ id }) => id === "utility-1")!.value = "apparent-contact";
    expect(routeSharedSafety({
      treeId: "tree-1",
      utilityStatus: "apparent-contact",
      evidenceIds: ["utility-1"],
    }, contactCase).firstAction).toBe("stay-clear-midwest-roots-utility-review");
    const treeCase = treeCaseFixture();
    expect(routeSharedSafety({
      treeId: "tree-1",
      utilityStatus: "nearby-or-uncertain",
      activeElectricalSigns: ["arcing"],
      evidenceIds: ["utility-1", "electrical-1"],
    }, treeCase).firstAction).toBe("utility-emergency-first");
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
    }, treeCaseFixture())).toThrow(/unknown or different tree/);
  });
});
