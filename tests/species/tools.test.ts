import { describe, expect, it } from "vitest";

import { TreeCaseSchema, type TreeCase } from "../../src/case/schema.js";
import {
  CanonicalSpeciesResultSchema,
  RenderSpeciesGuideInputSchema,
  RenderSpeciesGuideOutputSchema,
} from "../../src/species/contracts.js";
import { getSpeciesProfile, matchSpecies, matchSpeciesText, renderSpeciesGuide } from "../../src/species/service.js";
import { treeCaseFixture } from "../fixtures/tree-case.js";

function toolInput(observations: Record<string, unknown>, skippedObservations: string[] = [], treeCase = treeCaseFixture()) {
  return {
    case: treeCase,
    request: {
      treeCase: { caseId: treeCase.caseId, activeTreeId: treeCase.activeTreeId, expectedRevision: treeCase.revision },
      observations,
      skippedObservations,
    },
  };
}

function caseWithoutSafety() {
  const treeCase = structuredClone(treeCaseFixture());
  treeCase.trees[0].evidence = treeCase.trees[0].evidence.filter(({ field }) => !field.startsWith("safety."));
  return TreeCaseSchema.parse(treeCase);
}

describe("Species public tool services", () => {
  it("returns deterministic canonical output for the same case and observations", () => {
    const input = toolInput({ season: "leaf-on", leafArrangement: "opposite", leafType: "compound", fruit: "paddle-seeds" });
    expect(matchSpecies(input)).toEqual(matchSpecies(input));
    expect(matchSpecies(input).result.primaryCandidate?.profileId).toBe("true-ash");
    expect(matchSpecies(input).result.dataset).toMatchObject({
      profileCount: 10,
      finalContentReview: "pending",
      contentCheckedOn: "2026-08-02",
    });
  });

  it("keeps leaf-off and skipped observations neutral and preserves canonical nextObservation", () => {
    const leafOff = matchSpecies(toolInput({ season: "leaf-off-or-unavailable", leafArrangement: "opposite" }));
    expect(leafOff.result.validObservationCount).toBe(0);
    expect(leafOff.result.seasonUnavailable).toBe(true);
    expect(leafOff.result.candidates.every(({ contradictions }) => contradictions.length === 0)).toBe(true);

    const skipped = matchSpecies(toolInput({ leafArrangement: "alternate", leafType: "simple" }, ["fruit"]));
    expect(skipped.result.nextObservation).not.toBe("fruit");
  });

  it("preserves ties, contradictions, ordinary no-match, and outside-guide as distinct contracts", () => {
    const tie = matchSpecies(toolInput({ leafArrangement: "alternate", leafType: "simple" })).result;
    expect(tie.primaryTied).toBe(true);
    expect(tie.primaryCandidate).toBeNull();
    expect(tie.candidateOrderMeaning).toBe("stable-display-only");

    const contradiction = matchSpecies(toolInput({ leafArrangement: "opposite", leafShape: "triangular" })).result;
    expect(contradiction.candidates.flatMap(({ conflictingEvidence }) => conflictingEvidence)).not.toHaveLength(0);
    expect(matchSpeciesText({ caseReference: { caseId: "case-1", activeTreeId: "tree-1", expectedRevision: 1 }, result: contradiction })).toContain("remain ambiguous and conflict");

    const outside = matchSpecies(toolInput({ leafType: "needles-or-scales" })).result;
    expect(outside).toMatchObject({ kind: "no-match", outsideSupportedUniverse: true, primaryCandidate: null });
    expect(outside.unsupportedObservations).not.toHaveLength(0);

    expect(CanonicalSpeciesResultSchema.parse({
      ...outside,
      outsideSupportedUniverse: false,
      unsupportedObservations: [],
    })).toMatchObject({ kind: "no-match", outsideSupportedUniverse: false, candidates: [] });
  });

  it("keeps safety evidence out of ranking", () => {
    const withSafety = treeCaseFixture();
    const withoutSafety = structuredClone(withSafety);
    withoutSafety.trees[0].evidence = withoutSafety.trees[0].evidence.filter(({ field }) => !field.startsWith("safety."));
    const observations = { leafArrangement: "opposite", leafType: "compound" };
    expect(matchSpecies(toolInput(observations, [], withSafety)).result)
      .toEqual(matchSpecies(toolInput(observations, [], TreeCaseSchema.parse(withoutSafety))).result);
  });

  it("fails closed for unknown profile IDs and propagates source/review metadata", () => {
    expect(() => getSpeciesProfile({ profileId: "made-up-tree" })).toThrow();
    const profile = getSpeciesProfile({ profileId: "true-ash" });
    expect(profile.sourceIds.length).toBeGreaterThan(0);
    expect(profile.sources.map(({ id }) => id)).toEqual(profile.sourceIds);
    expect(profile.review.finalContentReview).toBe("pending");
    expect(profile.taxonScope).toBe("genus-group");
  });

  it("rejects caller rankings and recomputes render changes from observations", () => {
    expect(() => RenderSpeciesGuideInputSchema.parse({
      ...toolInput({ leafArrangement: "opposite" }),
      candidates: [{ profileId: "silver-maple", score: 999 }],
    })).toThrow();
    const output = renderSpeciesGuide({
      ...toolInput({ leafArrangement: "alternate", leafType: "compound" }),
      previousObservations: { leafArrangement: "opposite", leafType: "compound" },
      previousSkippedObservations: [],
    });
    expect(RenderSpeciesGuideOutputSchema.parse(output)).toEqual(output);
    expect(output.change?.returnedProfileIds.length).toBeGreaterThan(0);
    expect(output.result.primaryCandidate).toBeNull();
  });

  it("retains active-tree image provenance and exposes a current safety interruption separately", () => {
    const twoTreeCase = structuredClone(treeCaseFixture());
    twoTreeCase.trees[1].evidence.push({
      id: "evidence-tree-2",
      treeId: "tree-2",
      field: "species.bark",
      value: "rough-scaly",
      origin: "user_stated",
      state: "observed",
      revision: 1,
      sourceReference: { kind: "conversation-turn", id: "turn-tree-2" },
      recordedAt: "2026-09-14T12:05:00Z",
    });
    const output = renderSpeciesGuide(toolInput(
      { leafArrangement: "opposite" },
      [],
      TreeCaseSchema.parse(twoTreeCase),
    ));
    expect(output.caseReference.activeTreeId).toBe("tree-1");
    expect(output.activeTreeEvidence).toContainEqual(expect.objectContaining({
      evidenceId: "evidence-1", origin: "image_observed", state: "provisional",
    }));
    expect(output.activeTreeEvidence.some(({ evidenceId }) => evidenceId === "evidence-tree-2")).toBe(false);
    expect(output.safetyRoute).toMatchObject({
      firstAction: "pause-for-midwest-roots-review", affectsSpeciesRanking: false,
    });
  });

  it("carries confirmation and correction revisions through the returned Tree Case", () => {
    const confirmed = renderSpeciesGuide({
      ...toolInput({ leafArrangement: "opposite" }),
      evidenceAction: {
        kind: "confirm",
        evidenceId: "evidence-1",
        nextEvidenceId: "evidence-confirmed",
        recordedAt: "2026-09-14T12:10:00Z",
      },
    });
    expect(confirmed.caseReference.expectedRevision).toBe(2);
    expect(confirmed.activeTreeEvidence).toContainEqual(expect.objectContaining({
      evidenceId: "evidence-confirmed",
      origin: "image_observed",
      state: "confirmed-by-user",
      sourceReference: { kind: "image", id: "image-1" },
      supersedesEvidenceId: "evidence-1",
    }));
    expect(confirmed.treeCase.results[0]?.stale).toBe(true);

    const corrected = renderSpeciesGuide({
      ...toolInput({ leafArrangement: "alternate" }),
      evidenceAction: {
        kind: "correct",
        evidenceId: "evidence-1",
        nextEvidenceId: "evidence-corrected",
        value: "alternate",
        sourceTurnId: "turn-correction",
        recordedAt: "2026-09-14T12:11:00Z",
      },
    });
    expect(corrected.treeCase.trees[0]?.evidence).toContainEqual(expect.objectContaining({
      id: "evidence-1",
      origin: "image_observed",
      state: "provisional",
    }));
    expect(corrected.activeTreeEvidence).toContainEqual(expect.objectContaining({
      evidenceId: "evidence-corrected",
      origin: "user_stated",
      state: "confirmed-by-user",
      value: "alternate",
      supersedesEvidenceId: "evidence-1",
    }));
  });

  it("records visual choices on the active tree and fails closed on mismatched actions", () => {
    const output = renderSpeciesGuide({
      ...toolInput({ leafArrangement: "opposite", leafType: "compound" }),
      evidenceAction: {
        kind: "record",
        evidenceId: "evidence-leaf-type",
        field: "leafType",
        value: "compound",
        sourceTurnId: "ui-observation",
        recordedAt: "2026-09-14T12:12:00Z",
      },
    });
    expect(output.activeTreeEvidence).toContainEqual(expect.objectContaining({
      evidenceId: "evidence-leaf-type",
      field: "species.leafType",
      value: "compound",
      origin: "user_stated",
      state: "confirmed-by-user",
    }));
    expect(output.treeCase.trees.find(({ id }) => id === "tree-2")?.evidence).toEqual([]);

    expect(() => renderSpeciesGuide({
      ...toolInput({ leafArrangement: "opposite", leafType: "simple" }),
      evidenceAction: {
        kind: "record",
        evidenceId: "evidence-mismatch",
        field: "leafType",
        value: "compound",
        sourceTurnId: "ui-observation",
        recordedAt: "2026-09-14T12:12:00Z",
      },
    })).toThrow(/must match/);
  });

  it("represents the approved investigation, stopping, and handoff states from canonical data", () => {
    const treeCase = caseWithoutSafety();
    const start = renderSpeciesGuide(toolInput({}, [], treeCase));
    expect(start).toMatchObject({ uiState: "empty", result: { startingCount: 10 }, platform: { originalPhotoAvailable: false } });
    expect(start.nextQuestion?.options.length).toBeGreaterThan(1);

    const changed = renderSpeciesGuide({
      ...toolInput({ leafArrangement: "opposite", leafType: "compound", fruit: "paddle-seeds" }, [], treeCase),
      previousObservations: {},
      previousSkippedObservations: [],
    });
    expect(changed).toMatchObject({ uiState: "strongest-match", result: { primaryCandidate: { profileId: "true-ash" } } });
    expect(changed.change?.eliminatedProfileIds.length).toBeGreaterThan(0);

    const notSure = renderSpeciesGuide(toolInput({}, [start.result.nextObservation!], treeCase));
    expect(notSure.skippedObservations).toContain(start.result.nextObservation);
    expect(notSure.result.nextObservation).not.toBe(start.result.nextObservation);
    const allUnavailable = renderSpeciesGuide(toolInput({}, [
      "leafArrangement", "leafType", "leafShape", "bark", "fruit", "overallForm", "sizeClass",
    ], treeCase));
    expect(allUnavailable).toMatchObject({
      uiState: "completed-record",
      result: { validObservationCount: 0, nextObservation: null },
    });

    expect(renderSpeciesGuide(toolInput({ leafArrangement: "opposite", leafShape: "triangular" }, [], treeCase)))
      .toMatchObject({ uiState: "contradiction-recheck" });
    expect(renderSpeciesGuide(toolInput({ leafArrangement: "alternate", leafType: "simple" }, [], treeCase)))
      .toMatchObject({ uiState: "tie", result: { primaryTied: true, primaryCandidate: null } });
    expect(renderSpeciesGuide(toolInput({ leafType: "needles-or-scales" }, [], treeCase)))
      .toMatchObject({ uiState: "outside-guide", result: { kind: "no-match", outsideSupportedUniverse: true } });
    expect(changed.handoffs.map(({ label }) => label)).toEqual([
      "Something looks wrong with it", "Can I trim this myself?", "I'm worried it might be unsafe", "What might removal cost?",
    ]);
  });

  it("accepts only the official file shape and exposes photos without leaking download URLs", () => {
    const output = renderSpeciesGuide({
      ...toolInput({}, [], caseWithoutSafety()),
      photos: [{
        download_url: "https://files.example.test/tree.jpg?token=short-lived",
        file_id: "file-tree-1",
        mime_type: "image/jpeg",
        file_name: "front-yard-tree.jpg",
      }],
    });
    expect(output.platform).toEqual({
      originalPhotoAvailable: true,
      photoCount: 1,
      photoFileIds: ["file-tree-1"],
      photoLimitation: null,
    });
    expect(JSON.stringify(output)).not.toContain("download_url");
    expect(() => RenderSpeciesGuideInputSchema.parse({
      ...toolInput({}, [], caseWithoutSafety()),
      photos: [{ download_url: "https://files.example.test/tree.jpg" }],
    })).toThrow();
    expect(() => RenderSpeciesGuideInputSchema.parse({
      ...toolInput({}, [], caseWithoutSafety()),
      photos: [{
        download_url: "https://files.example.test/tree.jpg",
        file_id: "file-tree-1",
        unapproved: true,
      }],
    })).toThrow();
  });
});
