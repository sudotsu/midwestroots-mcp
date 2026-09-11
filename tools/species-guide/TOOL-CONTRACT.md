# Species Capability — Tool Contract

**Status:** Pre-implementation contract  
**Applies to:** First MCP implementation slice

This document defines the data contract the implementation should satisfy. It is intentionally separate from transport/framework syntax so the semantic contract survives Apps SDK or MCP version changes.

## Release gate discovered during audit

The source species dataset currently records:

- source content checked: 2026-08-02;
- next review due: 2027-02-02;
- owner/practical review metadata present;
- `finalContentReview: pending`.

Implementation may proceed against the current source dataset, but public release of Species requires an explicit final content review decision rather than silently treating the pending state as complete.

---

# Tool 1 — `match_species`

## Purpose

Run the approved deterministic Omaha-area species matcher against normalized visible observations.

This tool does not accept arbitrary free-form species guesses and does not call a model internally to decide the species.

## Input

All fields are optional individually. The engine must be able to return a starting-universe result when no usable matching observations are supplied.

```json
{
  "observations": {
    "season": "leaf-on | leaf-off-or-unavailable | null",
    "leafArrangement": "opposite | alternate | null",
    "leafType": "simple | compound | needles-or-scales | null",
    "leafShape": "deeply-lobed | rounded-lobes | pointed-lobes | triangular | oval-serrated | elm-like | many-small-leaflets | very-large-compound | null",
    "bark": "diamond-ridged | warty-corky | smooth-to-scaly | deeply-furrowed | gray-furrowed | rough-scaly | null",
    "fruit": "paddle-seeds | paired-winged-seeds | cottony-seeds | small-round-pears | fringed-acorn-cap | acorn | small-dark-berries | long-flat-pods | round-winged-seeds | thick-dark-pods | none-seen | null",
    "overallForm": "vase | rounded | upright | broad-spreading | open-irregular | null",
    "sizeClass": "under-40 | 40-to-70 | over-70 | null",
    "visibleFailureSign": "yes | no | not-sure | null",
    "targetWithinReach": "yes | no | not-sure | null"
  }
}
```

### Input rules

- Omitted and `null` mean unknown/unusable, not negative evidence.
- Leaf matching fields must be ignored when `season = leaf-off-or-unavailable`.
- `visibleFailureSign` and `targetWithinReach` must never contribute to species ranking.
- Invalid enum values must fail validation rather than being coerced to a nearby category.
- The MCP adapter must not turn model free text directly into unvalidated matcher values.
- Provenance/confidence remain in the Tree Case/orchestration layer; the pure matcher receives normalized values.

## Output

```json
{
  "resultKind": "starting-universe | narrowed | ambiguous | no-match",
  "startingCount": 0,
  "validObservationCount": 0,
  "seasonUnavailable": false,
  "safetyHandoff": false,
  "primaryTied": false,
  "primaryCandidateId": null,
  "candidateIds": [],
  "alternativeCandidateIds": [],
  "nextObservation": null,
  "candidates": [
    {
      "profileId": "string",
      "commonName": "string",
      "scientificName": "string",
      "score": 0,
      "matchedEvidence": [
        {
          "category": "leafArrangement | leafType | leafShape | bark | fruit | overallForm | sizeClass",
          "observationValue": "string",
          "observationLabel": "string",
          "profileValueLabels": ["string"]
        }
      ],
      "conflictingEvidence": []
    }
  ],
  "limitations": {
    "confirmedIdentification": false,
    "diagnosis": false,
    "hazardRating": false,
    "treatmentRecommendation": false
  },
  "dataset": {
    "scope": "omaha-common-trees",
    "contentCheckedOn": "YYYY-MM-DD",
    "nextReviewDue": "YYYY-MM-DD",
    "finalContentReview": "pending | completed"
  }
}
```

### Output rules

- `primaryCandidateId` is `null` for starting-universe and no-match.
- A tied candidate must not be described as uniquely strongest by downstream UI/copy.
- `nextObservation` must be selected by deterministic candidate differentiation logic, not a model preference.
- No-match must remain no-match; the adapter cannot promote the highest zero/weak candidate into a result.
- `safetyHandoff` is routing information only. It must not modify candidate scores.
- Dataset review metadata must be exposed to the application so stale/pending source status cannot be silently hidden from release checks.

## Idempotence

Given the same validated observation set and dataset version, `match_species` must return the same deterministic result.

---

# Tool 2 — `get_species_profile`

## Purpose

Return approved, source-backed profile material for a candidate produced by the Species dataset.

## Input

```json
{
  "profileId": "approved profile ID"
}
```

Unknown IDs must fail closed. Do not fall back to an LLM-generated species profile.

## Output

```json
{
  "profileId": "string",
  "commonName": "string",
  "scientificName": "string",
  "taxonScope": "species | genus-group",
  "taxonNote": {
    "text": "string",
    "sourceIds": ["string"]
  },
  "omahaRelevance": {
    "text": "string",
    "sourceIds": ["string"]
  },
  "recognition": [
    {
      "text": "string",
      "sourceIds": ["string"]
    }
  ],
  "matureSize": {
    "text": "string",
    "sourceIds": ["string"]
  },
  "importantLocalConcern": null,
  "whatToWatchFor": null,
  "maintenanceNote": {
    "text": "string",
    "sourceIds": ["string"]
  },
  "traits": {
    "leafArrangement": [],
    "leafType": [],
    "leafShape": [],
    "bark": [],
    "fruit": [],
    "overallForm": [],
    "sizeClass": []
  },
  "sourceIds": ["string"],
  "review": {
    "finalContentReview": "pending | completed",
    "sourcesCheckedOn": "YYYY-MM-DD",
    "nextReviewDue": "YYYY-MM-DD"
  },
  "limitations": {
    "profileIsIndividualTreeAssessment": false,
    "speciesImpliesDiagnosis": false,
    "speciesImpliesHazard": false,
    "speciesImpliesWorkNeeded": false
  }
}
```

`importantLocalConcern` and `whatToWatchFor` may be nullable because the source profile marks them optional.

---

# Orchestration contract around these tools

The LLM/application layer is responsible for converting conversation and images into **candidate Tree Case evidence** before these deterministic calls.

## Before `match_species`

1. Read existing Tree Case species observations.
2. Extract any new explicit homeowner statements.
3. Extract only supported visible image traits.
4. Mark new image/model evidence with provenance/status.
5. Resolve simple user corrections.
6. Do not manufacture missing fields.
7. Pass only valid normalized observations to `match_species`.

## After `match_species`

1. Store the deterministic result in the Tree Case.
2. If no-match, explain the bounded ten-tree guide and do not force a winner.
3. If tied/ambiguous and `nextObservation` exists, ask for that observation when it would be useful.
4. If the homeowner supplies new evidence, rerun the matcher; do not manually edit candidate rankings.
5. If `safetyHandoff = true`, preserve the species result and separately route/suggest Hazard as appropriate.
6. Use `get_species_profile` for detailed homeowner explanation instead of hallucinating profile facts.

## Image extraction contract

Image interpretation may produce only the approved observation vocabulary.

Examples:

- model sees a clear opposite attachment pattern → provisional `leafArrangement=opposite`;
- photo is too distant to distinguish leaflets → leave `leafType` unknown;
- bark is obscured or juvenile → do not force a mature-bark category;
- no fruit is visible in a cropped canopy image → do **not** automatically infer `fruit=none-seen`; that value means the homeowner/image context is sufficient to say none is currently visible on the tree, not merely absent from one frame.

Safety fields require extra caution. A suspected failure sign from an image is provisional evidence and can justify conservative routing, but it must not be described as a confirmed structural defect.

---

# Tool description requirements

When implementation defines MCP/App SDK tool metadata, descriptions should make the deterministic boundary obvious so the model chooses the tool rather than answering from its own species intuition.

Draft intent for `match_species`:

> Narrow the approved Omaha-area tree candidate set from structured visible traits. Use this whenever the homeowner wants to identify/narrow a tree within the Midwest Roots species guide. Do not identify the species yourself when this tool applies. Unknown traits may be omitted. The result can be ambiguous, tied, or no-match and must be preserved.

Draft intent for `get_species_profile`:

> Retrieve the approved source-backed Midwest Roots profile for a species/profile ID returned by the species matcher. Use this instead of inventing species facts or local relevance details.

Exact platform metadata syntax will be set during implementation against the current Apps SDK/MCP version.

---

# Contract tests required before completion

At minimum:

- validation rejects unsupported enum values;
- same input + dataset returns same result;
- leaf-off removes leaf traits from matching;
- skipped fields do not count as contradictions;
- ties remain ties;
- contradiction arrays survive adapter serialization;
- no-match survives adapter serialization;
- nextObservation matches the deterministic engine result;
- safetyHandoff does not alter ranking;
- unknown profile ID fails closed;
- dataset review metadata is present;
- pending final content review can be detected by release checks;
- model-facing orchestration cannot bypass `match_species` for an in-scope species-identification request.
