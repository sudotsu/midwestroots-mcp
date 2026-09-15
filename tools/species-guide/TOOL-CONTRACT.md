# Species Capability — Tool Contract

**Status:** Approved Phase 1 contract; canonical PR #113 foundation imported by the MCP foundation

**Applies to:** Species vertical slice

This document defines the data contract the implementation should satisfy. It is intentionally separate from transport/framework syntax so the semantic contract survives Apps SDK or MCP version changes.

`sudotsu/omahatreecare` is canonical for Species domain logic, source-backed content, trait vocabulary, illustrations, and applicable utility policy. The implementation consumes a reproducibly vendored, versioned snapshot of that source.

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

The public MCP input carries the complete conversation-carried Tree Case plus a strict request referencing its current active tree and revision:

```json
{
  "case": { "schemaVersion": 1, "caseId": "case-1", "revision": 1, "activeTreeId": "tree-1", "trees": [{ "id": "tree-1", "evidence": [] }], "facts": [], "results": [] },
  "request": {
    "treeCase": { "caseId": "case-1", "activeTreeId": "tree-1", "expectedRevision": 1 },
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
    },
    "skippedObservations": []
  }
}
```

### Input rules

- Omitted and `null` mean unknown/unusable, not negative evidence.
- Leaf matching fields must be ignored when `season = leaf-off-or-unavailable`.
- `visibleFailureSign` and `targetWithinReach` must never contribute to species ranking.
- Invalid enum values must fail validation rather than being coerced to a nearby category.
- `fruit=none-seen` is non-discriminating and must not count as positive match evidence.
- The MCP adapter must not turn model free text directly into unvalidated matcher values.
- Provenance/confidence remain in the Tree Case/orchestration layer; the pure matcher receives normalized values.

## Output

The public result contains `caseReference` and this canonical `result` object. This schema-backed example shows an outside-supported-guide result:

<!-- schema-example:match-species-output:start -->
```json
{
  "caseReference": {
    "caseId": "case-1",
    "activeTreeId": "tree-1",
    "expectedRevision": 0
  },
  "result": {
    "kind": "no-match",
    "startingCount": 10,
    "validObservationCount": 1,
    "seasonUnavailable": false,
    "safetyHandoff": false,
    "primaryTied": false,
    "primaryCandidate": null,
    "candidates": [],
    "alternatives": [],
    "candidateOrderMeaning": "stable-display-only",
    "outsideSupportedUniverse": true,
    "unsupportedObservations": [
      {
        "category": "leafType",
        "observationValue": "needles-or-scales",
        "observationLabel": "needles or scales"
      }
    ],
    "nextObservation": null,
    "identificationStatus": "not-confirmed",
    "datasetCommit": "473e0407e42f60d6ecb4717de3f2649300d3be08",
    "dataset": {
      "scope": "bounded-omaha-area-ten-profile-guide",
      "profileCount": 10,
      "contentCheckedOn": "2026-08-02",
      "nextReviewDue": "2027-02-02",
      "finalContentReview": "pending"
    }
  }
}
```
<!-- schema-example:match-species-output:end -->

### Output rules

- `primaryCandidate` is `null` for starting-universe, ties, contradictions without a clean winner, and no-match.
- Ordinary no-match is `kind = no-match` with `outsideSupportedUniverse = false`.
- An outside-guide no-match is `kind = no-match` with `outsideSupportedUniverse = true` and retains `unsupportedObservations`.
- A tied candidate must not be described as uniquely strongest by downstream UI/copy.
- `nextObservation` must be selected by deterministic candidate differentiation logic, not a model preference.
- `nextObservation` must actually separate remaining candidates and must be `null` when no unused observation can usefully separate them.
- No-match must remain no-match; the adapter cannot promote the highest zero/weak candidate into a result.
- Usable needles/scales evidence outside the supported dataset must preserve an outside-guide/no-match result.
- `candidateOrderMeaning = stable-display-only` must not be interpreted as confidence or likelihood.
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

The optional `importantLocalConcern` field is absent in this canonical Honeylocust example; optional profile fields are omitted rather than serialized as `null`.

<!-- schema-example:species-profile-output:start -->
```json
{
  "profileId": "honeylocust",
  "commonName": "Honeylocust",
  "scientificName": "Gleditsia triacanthos",
  "taxonScope": "species",
  "taxonNote": {
    "text": "This profile is Gleditsia triacanthos; thornless and fruitless landscape varieties may omit wild-type thorns or pods.",
    "sourceIds": [
      "nfs-honeylocust"
    ]
  },
  "omahaRelevance": {
    "text": "Nebraska Forest Service describes honeylocust as an eastern Great Plains native used extensively in paved urban landscapes and suitable throughout Nebraska.",
    "sourceIds": [
      "nfs-honeylocust"
    ]
  },
  "recognition": [
    {
      "text": "Fine compound foliage is typical; long bean-like pods may occur on fruiting trees but can be absent on fruitless varieties.",
      "sourceIds": [
        "nfs-honeylocust"
      ]
    }
  ],
  "matureSize": {
    "text": "Nebraska Forest Service lists a typical mature height of 50–70 feet and spread of 50–60 feet.",
    "sourceIds": [
      "nfs-honeylocust"
    ]
  },
  "whatToWatchFor": {
    "text": "Seasonal leaf damage from several insects is often cosmetic according to Nebraska Forest Service; observe the actual extent and change rather than inferring decline from the species.",
    "sourceIds": [
      "nfs-honeylocust"
    ]
  },
  "maintenanceNote": {
    "text": "Cultivar and the individual tree's observable condition matter when comparing this profile.",
    "sourceIds": [
      "nfs-honeylocust"
    ]
  },
  "traits": {
    "leafArrangement": [
      "alternate"
    ],
    "leafType": [
      "compound"
    ],
    "leafShape": [
      "many-small-leaflets"
    ],
    "bark": [
      "rough-scaly"
    ],
    "fruit": [
      "long-flat-pods",
      "none-seen"
    ],
    "overallForm": [
      "open-irregular",
      "broad-spreading"
    ],
    "sizeClass": [
      "40-to-70",
      "over-70"
    ]
  },
  "traitSourceIds": {
    "leafArrangement": [
      "nfs-honeylocust"
    ],
    "leafType": [
      "nfs-honeylocust"
    ],
    "leafShape": [
      "nfs-honeylocust"
    ],
    "bark": [
      "nfs-honeylocust"
    ],
    "fruit": [
      "nfs-honeylocust"
    ],
    "overallForm": [
      "nfs-honeylocust"
    ],
    "sizeClass": [
      "nfs-honeylocust"
    ]
  },
  "sourceIds": [
    "nfs-honeylocust"
  ],
  "sources": [
    {
      "id": "nfs-honeylocust",
      "title": "Honeylocust",
      "organization": "Nebraska Forest Service",
      "url": "https://nfs.unl.edu/honeylocust/",
      "accessedOn": "2026-08-02",
      "geography": "Nebraska"
    }
  ],
  "review": {
    "reviewerName": "A.J.",
    "reviewerRole": "Midwest Roots Tree Services Owner/Climber and business/product owner",
    "independent": false,
    "isaCertifiedArborist": false,
    "reviewScope": "Practical Omaha relevance and homeowner usefulness; not independent or credentialed arboricultural review.",
    "evidenceBoundary": "Practical experience does not replace authoritative sources, identification, diagnosis, or an individual-tree risk assessment.",
    "finalContentReview": "pending",
    "sourcesCheckedOn": "2026-08-02",
    "nextReviewDue": "2027-02-02"
  },
  "limitations": [
    "This bounded profile supports comparison and does not confirm identification.",
    "It does not diagnose a condition, establish hazard, determine work need, or assess an individual tree.",
    "Final homeowner-facing content review is still pending."
  ]
}
```
<!-- schema-example:species-profile-output:end -->

`importantLocalConcern` and `whatToWatchFor` are optional and are omitted when absent in the canonical source profile.

---

# Tool 3 — `render_species_guide`

## Purpose

Return the required illustrated Phase 1 Species interface for observation choices, deterministic candidate results, evidence, ambiguity/no-match, and next actions.

## Input

The render request supplies the same strict Tree Case and validated observations as `match_species`. It may also supply the prior observation set so the server can recompute an evidence-change transition. An optional strict `evidenceAction` records one direct widget observation, confirmation, or correction through the shared Tree Case revision functions. The returned Tree Case carries that revision forward: image confirmation retains its original image provenance, correction creates superseding user-stated evidence, active-tree boundaries remain enforced, and dependent results become stale when their evidence changes.

An optional top-level `photos` array may contain one to four current host-authorized ChatGPT file objects with required `download_url` and `file_id` properties and optional `mime_type` and `file_name` properties. The widget exposes every supplied photo and refreshes the selected file through ChatGPT's documented `window.openai.getFileDownloadUrl({ fileId })` host extension. It does not dereference caller-supplied `download_url` values or declare an arbitrary temporary file hostname in its CSP. Photos provide the UI specimen display and provenance reference only; the server does not classify, store, or proxy them. The request does not accept candidate IDs, candidate order, scores, confidence values, primary result, tie state, or no-match state.

## Canonical-result rule

Before rendering candidate state, the tool recomputes it from validated observations against the recorded dataset version. Prior observations, when present, are also recomputed and are used only to explain eliminated or returned candidates.

The structured output returns the updated validated `treeCase` plus its current `caseReference`, so the stateless conversation can use the exact evidence revision on the next call or a future capability handoff.

Utility/electrical routing is returned as `safetyRoute`. The canonical visible-failure-sign plus reachable-target condition is returned separately as `hazardHandoff`; it recommends Hazard screening without reclassifying the observation as utility evidence, changing Species ranking, or claiming a professional tree-risk assessment. Interactive and text representations must expose the same applicable handoffs while preserving the Species investigation and Tree Case.

The UI must preserve:

- ties without implying that the first candidate is more likely;
- matched and conflicting evidence;
- no-match/outside-guide results;
- no further question when no useful candidate separation remains;
- the canonical next useful observation when one exists;
- the Omaha/local scope and identification limitations.

Choice cards and candidate results must use the canonical Species illustrations and trait vocabulary vendored from `omahatreecare`.

The rendered interaction must expose meaningful state changes after input, support keyboard and touch, preserve meaning without color, respect reduced-motion preferences, and provide a text/fallback representation of the same canonical result. Generated botanical imagery must not be presented as identification evidence.

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
7. Use `render_species_guide` for the illustrated Phase 1 interaction; do not construct or reorder candidates outside the canonical result.

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

Draft intent for `render_species_guide`:

> Render the illustrated Midwest Roots Species choices or canonical matcher result. Use validated observations or a server-verifiable result reference. Never accept caller-supplied candidate rankings as authoritative.

The implementation uses the standardized `_meta.ui.resourceUri` linkage and `text/html;profile=mcp-app` resource MIME type. It also publishes the current ChatGPT `openai/outputTemplate` compatibility alias and `openai/fileParams` declaration for the optional top-level `photos` field; these point to the same canonical render contract rather than defining separate behavior.

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
- model-facing orchestration cannot bypass `match_species` for an in-scope species-identification request;
- `render_species_guide` cannot be steered by caller-supplied candidate IDs, order, scores, confidence, or rankings;
- rendered ties, contradictions, next-observation, and no-match states agree with the canonical deterministic result;
- illustrated choices and candidate results use the versioned canonical assets and trait vocabulary.
