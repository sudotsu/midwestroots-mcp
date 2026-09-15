import { describe, expect, it } from "vitest";
import {
  candidateUniverseRationale,
  speciesReview,
  speciesSources,
  treeDatabase,
} from "./tree-species.js";
import { narrowSpeciesCandidates } from "./tree-species-matching.js";
import { assertSpeciesContent, getSpeciesContentIssues } from "./tree-species-validation.js";

const cloneContent = () => structuredClone({
  sources: speciesSources,
  profiles: treeDatabase,
  review: speciesReview,
  candidateUniverse: candidateUniverseRationale,
});

describe("reviewed Species content", () => {
  it("publishes the deliberately bounded ten-profile universe", () => {
    expect(treeDatabase).toHaveLength(10);
    expect(new Set(treeDatabase.map(({ id }) => id)).size).toBe(10);
    expect(candidateUniverseRationale.inclusion.sourceIds.length).toBeGreaterThan(0);
    expect(candidateUniverseRationale.exclusion.text).toContain("not a complete Omaha inventory");
    expect(() => assertSpeciesContent(cloneContent(), new Date("2026-08-02"))).not.toThrow();
  });

  it("records the custom owner reviewer model without implying independence or certification", () => {
    expect(speciesReview).toMatchObject({
      reviewerName: "A.J.",
      reviewerRole: "Midwest Roots Tree Services Owner/Climber and business/product owner",
      independent: false,
      isaCertifiedArborist: false,
      finalContentReview: "pending",
    });
  });

  it("rejects missing statement sources, duplicate records, stale review, and comparative concern tiers", () => {
    const content = cloneContent();
    content.candidateUniverse.inclusion.sourceIds.push("missing-universe-source");
    content.profiles[0].recognition[0].sourceIds.push("missing-source");
    content.profiles[1].id = content.profiles[0].id;
    content.profiles[2].maintenanceNote.text = "This is a high-concern profile that requires more concerns.";
    content.review.nextReviewDue = "2026-01-01";
    expect(getSpeciesContentIssues(content, new Date("2026-08-02"))).toEqual(expect.arrayContaining([
      expect.stringContaining("candidate universe references missing source missing-universe-source"),
      expect.stringContaining("references missing source missing-source"),
      expect.stringContaining("duplicate profile ID"),
      expect.stringContaining("review is stale"),
      expect.stringContaining("contains prohibited copy"),
    ]));
  });

  it("rejects malformed taxonomy and falsely certified review metadata", () => {
    const content = cloneContent();
    content.profiles[1].scientificName = "maple";
    (content.review as { isaCertifiedArborist: boolean }).isaCertifiedArborist = true;
    expect(getSpeciesContentIssues(content, new Date("2026-08-02"))).toEqual(expect.arrayContaining([
      expect.stringContaining("lacks species-level taxonomic specificity"),
      expect.stringContaining("review malformed"),
    ]));
  });
});

describe("observation-led candidate narrowing", () => {
  it("starts with the reviewed universe when all observations are optional", () => {
    const result = narrowSpeciesCandidates({});
    expect(result.kind).toBe("starting-universe");
    expect(result.candidates).toHaveLength(treeDatabase.length);
    expect(result.validObservationCount).toBe(0);
    expect(result.primaryCandidate).toBeUndefined();
    expect(result.alternatives).toEqual([]);
  });

  it("narrows a known ash fixture and explains the matching features", () => {
    const result = narrowSpeciesCandidates({
      season: "leaf-on",
      leafArrangement: "opposite",
      leafType: "compound",
      fruit: "paddle-seeds",
    });
    expect(result.kind).toBe("narrowed");
    expect(result.candidates.map(({ profile }) => profile.id)).toEqual(["true-ash"]);
    expect(result.candidates[0].matches).toEqual(["leafArrangement", "leafType", "fruit"]);
    expect(result.candidates[0].contradictions).toEqual([]);
    expect(result.primaryCandidate?.profile.id).toBe("true-ash");
    expect(result.primaryCandidate?.matchedEvidence.map(({ observationLabel }) => observationLabel)).toEqual([
      "paired opposite leaves or buds",
      "several leaflets on one stalk",
      "paddle-shaped seeds in clusters",
    ]);
    expect(result.primaryCandidate?.conflictingEvidence).toEqual([]);
    expect(result.primaryTied).toBe(false);
    expect(result.nextObservation).toBeNull();
    expect(result.alternatives.length).toBeLessThanOrEqual(3);
    expect(result.alternatives.every(({ profile }) => profile.id !== "true-ash")).toBe(true);
  });

  it("keeps an ambiguous partial fixture honest and marks a tied leader", () => {
    const result = narrowSpeciesCandidates({ leafArrangement: "alternate", leafType: "simple" });
    const reversedUniverseResult = narrowSpeciesCandidates(
      { leafArrangement: "alternate", leafType: "simple" },
      [...treeDatabase].reverse(),
    );
    expect(result.kind).toBe("narrowed");
    expect(result.candidates.length).toBeGreaterThan(1);
    expect(result.candidates.length).toBeLessThan(treeDatabase.length);
    expect(result.nextObservation).toBeDefined();
    expect(result.primaryCandidate).toBeUndefined();
    expect(result.primaryTied).toBe(true);
    expect(result.candidateOrderMeaning).toBe("stable-display-only");
    expect(result.candidates.map(({ profile }) => profile.id)).toEqual(
      reversedUniverseResult.candidates.map(({ profile }) => profile.id),
    );
  });

  it("explains contradictory observations instead of confirming a species", () => {
    const result = narrowSpeciesCandidates({ leafArrangement: "opposite", leafShape: "triangular" });
    expect(result.kind).toBe("ambiguous");
    expect(result.candidates.length).toBeGreaterThan(1);
    expect(result.candidates.every(({ contradictions }) => contradictions.length > 0)).toBe(true);
    expect(result.primaryCandidate).toBeUndefined();
    expect(result.candidates[0].conflictingEvidence.length).toBeGreaterThan(0);
    expect(result.candidates[0].conflictingEvidence[0]).toMatchObject({
      category: expect.any(String),
      observationLabel: expect.any(String),
      profileValueLabels: expect.any(Array),
    });
  });

  it("returns no match for evidence outside the bounded deciduous universe", () => {
    const result = narrowSpeciesCandidates({ leafType: "needles-or-scales" });
    expect(result.kind).toBe("no-match");
    expect(result.candidates).toEqual([]);
    expect(result.primaryCandidate).toBeUndefined();
    expect(result.alternatives).toEqual([]);
    expect(result.outsideSupportedUniverse).toBe(true);
    expect(result.unsupportedObservations).toEqual([{
      category: "leafType",
      observationValue: "needles-or-scales",
      observationLabel: "needles or scales",
    }]);
    expect(result.nextObservation).toBeNull();
  });

  it("treats seeing no fruit as neutral while retaining it as a distinct answer", () => {
    const result = narrowSpeciesCandidates({ fruit: "none-seen" });
    expect(result.kind).toBe("starting-universe");
    expect(result.validObservationCount).toBe(0);
    expect(result.candidates).toHaveLength(treeDatabase.length);
    expect(result.candidates.every(({ matches, contradictions }) => (
      matches.length === 0 && contradictions.length === 0
    ))).toBe(true);
    expect(result.nextObservation).not.toBe("fruit");
  });

  it("chooses an unanswered observation that separates the remaining candidates", () => {
    const result = narrowSpeciesCandidates({ leafArrangement: "opposite" });
    expect(result.primaryTied).toBe(true);
    expect(result.nextObservation).toBe("leafType");
  });

  it("stops when remaining tied candidates have no useful separation", () => {
    const first = structuredClone(treeDatabase[0]);
    const second = { ...structuredClone(treeDatabase[0]), id: "display-twin", commonName: "Display twin" };
    const result = narrowSpeciesCandidates(
      { leafArrangement: first.traits.leafArrangement[0] },
      [first, second],
    );
    expect(result.primaryTied).toBe(true);
    expect(result.primaryCandidate).toBeUndefined();
    expect(result.nextObservation).toBeNull();
  });

  it("does not select seasonally unavailable or deliberately skipped observations", () => {
    const leafOff = narrowSpeciesCandidates({ season: "leaf-off-or-unavailable" });
    expect(["leafArrangement", "leafType", "leafShape"]).not.toContain(leafOff.nextObservation);

    const skipped = narrowSpeciesCandidates(
      { leafArrangement: "opposite" },
      treeDatabase,
      { skippedObservations: ["leafType"] },
    );
    expect(skipped.nextObservation).not.toBe("leafType");
  });

  it("chooses contradiction rechecks deterministically without hiding conflicts", () => {
    const answers = { leafArrangement: "opposite", leafShape: "triangular" } as const;
    const first = narrowSpeciesCandidates(answers);
    const second = narrowSpeciesCandidates(answers);
    expect(first.nextObservation).toBe(second.nextObservation);
    expect(["leafArrangement", "leafShape"]).toContain(first.nextObservation);
    expect(first.candidates.flatMap(({ conflictingEvidence }) => conflictingEvidence).length).toBeGreaterThan(0);
  });

  it("records season-unavailable leaf evidence without treating it as a contradiction", () => {
    const result = narrowSpeciesCandidates({
      season: "leaf-off-or-unavailable",
      leafArrangement: "opposite",
      bark: "warty-corky",
    });
    expect(result.seasonUnavailable).toBe(true);
    expect(result.validObservationCount).toBe(1);
    expect(result.candidates[0].matches).toEqual(["bark"]);
    expect(result.candidates[0].profile.id).toBe("common-hackberry");
    expect(result.primaryCandidate?.profile.id).toBe("common-hackberry");
    expect(["leafArrangement", "leafType", "leafShape"]).not.toContain(result.nextObservation);
  });

  it("routes equivalent observed failure signs and targets the same way across species", () => {
    const ash = narrowSpeciesCandidates({
      leafArrangement: "opposite",
      visibleFailureSign: "yes",
      targetWithinReach: "yes",
    });
    const oak = narrowSpeciesCandidates({
      leafShape: "rounded-lobes",
      visibleFailureSign: "yes",
      targetWithinReach: "yes",
    });
    expect(ash.safetyHandoff).toBe(true);
    expect(oak.safetyHandoff).toBe(true);
    expect(narrowSpeciesCandidates({ visibleFailureSign: "yes", targetWithinReach: "no" }).safetyHandoff).toBe(false);
  });
});
