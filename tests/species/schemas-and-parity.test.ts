import { describe, expect, it } from "vitest";

import {
  canonicalQuestionValues,
  SpeciesMatchInputSchema,
  speciesSchemaValues,
} from "../../src/species/schemas.js";
import { parseSpeciesMatchInput } from "../../src/species/validation.js";
import { narrowSpeciesCandidates } from "../../tools/species-guide/vendor/omahatreecare/src/data/tree-species-matching.js";
import { speciesReview, treeDatabase } from "../../tools/species-guide/vendor/omahatreecare/src/data/tree-species.js";
import { treeCaseFixture } from "../fixtures/tree-case.js";

describe("strict Species adapter schemas", () => {
  const validInput = {
    treeCase: { caseId: "case-1", activeTreeId: "tree-1", expectedRevision: 1 },
    observations: { leafArrangement: "opposite" },
    skippedObservations: [],
  };

  it("matches every canonical question option without adding adapter-only values", () => {
    const canonical = canonicalQuestionValues();
    expect(speciesSchemaValues).toEqual(canonical);
  });

  it("rejects unknown keys and invalid enums", () => {
    expect(() => SpeciesMatchInputSchema.parse({ ...validInput, preferredCandidate: "silver-maple" })).toThrow();
    expect(() => SpeciesMatchInputSchema.parse({
      ...validInput,
      observations: { leafArrangement: "sometimes-opposite" },
    })).toThrow();
  });

  it("accepts explicit null as unknown without coercing it into evidence", () => {
    expect(SpeciesMatchInputSchema.parse({
      ...validInput,
      observations: { fruit: null, leafShape: null },
    }).observations).toEqual({ fruit: null, leafShape: null });
  });

  it("rejects mismatched case, tree, and revision references", () => {
    expect(() => parseSpeciesMatchInput({
      ...validInput,
      treeCase: { ...validInput.treeCase, activeTreeId: "tree-2" },
    }, treeCaseFixture())).toThrow(/activeTreeId/);
    expect(() => parseSpeciesMatchInput({
      ...validInput,
      treeCase: { ...validInput.treeCase, expectedRevision: 0 },
    }, treeCaseFixture())).toThrow(/stale/);
  });
});

describe("canonical Species fixture parity", () => {
  it("retains the PR #113 ash, neutral-fruit, unsupported, tie, and contradiction outcomes", () => {
    const ash = narrowSpeciesCandidates({
      season: "leaf-on",
      leafArrangement: "opposite",
      leafType: "compound",
      fruit: "paddle-seeds",
    });
    expect(ash.kind).toBe("narrowed");
    expect(ash.primaryCandidate?.profile.id).toBe("true-ash");
    expect(ash.nextObservation).toBeNull();

    const noFruit = narrowSpeciesCandidates({ fruit: "none-seen" });
    expect(noFruit.kind).toBe("starting-universe");
    expect(noFruit.validObservationCount).toBe(0);

    const conifer = narrowSpeciesCandidates({ leafType: "needles-or-scales" });
    expect(conifer).toMatchObject({
      kind: "no-match",
      candidates: [],
      outsideSupportedUniverse: true,
      nextObservation: null,
    });

    const tie = narrowSpeciesCandidates({ leafArrangement: "alternate", leafType: "simple" });
    expect(tie.primaryTied).toBe(true);
    expect(tie.primaryCandidate).toBeUndefined();
    expect(tie.candidateOrderMeaning).toBe("stable-display-only");

    const contradiction = narrowSpeciesCandidates({ leafArrangement: "opposite", leafShape: "triangular" });
    expect(contradiction.kind).toBe("ambiguous");
    expect(contradiction.primaryCandidate).toBeUndefined();
    expect(contradiction.candidates.flatMap(({ conflictingEvidence }) => conflictingEvidence).length).toBeGreaterThan(0);
  });

  it("retains the ten-profile dataset and pending final content gate", () => {
    expect(treeDatabase).toHaveLength(10);
    expect(speciesReview.finalContentReview).toBe("pending");
  });
});
