# Species Matching Capability

**Implementation order:** 1 of 5  
**Status:** Approved Phase 1 specification; canonical foundation prerequisite pending

**Canonical source:** `sudotsu/omahatreecare`

## Objective

Turn the existing deterministic Omaha-area Species Matching Guide into a chat-native capability without reducing it to a spoken questionnaire and without replacing its matching engine with model intuition.

The homeowner should be able to begin naturally:

- "What kind of tree is this?" + photos;
- "I think this is an ash but I'm not sure";
- "It has helicopter seeds and opposite leaves";
- "What is this huge tree in my backyard?";
- or arrive here from Problem Navigator because species is unknown.

The system should reuse whatever evidence is already available, run the deterministic matcher, explain the evidence honestly, and request the highest-value missing observation when refinement is useful.

The required interaction and final field-entry experience are defined in `docs/SPECIES-UX-BLUEPRINT.md` under the shared product principles in `docs/UI-DESIGN-THESIS.md`.

## Source behavior to preserve

The existing engine is intentionally bounded to the approved common Omaha-area species dataset.

The matching contract currently supports:

- season / leaf availability;
- leaf arrangement;
- leaf type;
- leaf shape;
- bark;
- fruit/seed;
- overall form;
- approximate size;
- visible-failure context;
- target-within-reach context.

The deterministic matcher:

- removes leaf categories when leaves are unavailable;
- records supporting evidence;
- records conflicting evidence;
- ranks candidates;
- identifies tied leading candidates;
- permits no-match;
- distinguishes narrowed vs ambiguous results;
- selects a useful next observation from unused trait categories;
- emits a safety-handoff signal separately from species ranking.

Those behaviors are part of the product contract.

Domain logic, source-backed content, utility policy, trait vocabulary, and Species illustrations remain canonical in `sudotsu/omahatreecare`. This repository consumes a reviewed snapshot through reproducible, versioned vendoring. The vendor record must identify the upstream commit and paths, and the import/verification process must detect drift rather than rely on informal copying.

## Model boundary

### ChatGPT may

- extract potential trait observations from homeowner language;
- inspect homeowner-supplied images for visible traits supported by the approved vocabulary;
- normalize ordinary wording into approved values;
- recognize when an existing Tree Case already contains a usable observation;
- decide whether clarification is needed before invoking the matcher;
- ask the engine-selected next observation in natural language;
- explain candidate evidence and contradictions;
- help the homeowner take a more useful follow-up photograph;
- route the resulting case into another capability.

### ChatGPT may not

- bypass the deterministic matcher and declare a species because the model "recognizes" the photo;
- invent a trait that is not observable in the supplied evidence;
- treat a provisional image observation as homeowner-confirmed;
- force a species when the current dataset returns no match;
- hide a tie or contradiction to make the answer feel cleaner;
- infer diagnosis, treatment, structural safety, or necessary tree work from species identity.

## Approved Phase 1 tool surface

The exact transport syntax remains an implementation decision. Phase 1 exposes exactly `match_species`, `get_species_profile`, and `render_species_guide`.

### `match_species`

#### Input

A structured set of approved observations from the active Tree Case.

Candidate fields:

- `season`
- `leaf_arrangement`
- `leaf_type`
- `leaf_shape`
- `bark`
- `fruit`
- `overall_form`
- `size_class`
- `visible_failure_sign`
- `target_within_reach`

Each observation supplied to the capability should retain provenance/status in the Tree Case. The deterministic matcher itself can receive normalized values; the orchestration layer remains responsible for evidence provenance.

#### Output

At minimum:

- `result_kind`: starting-universe / narrowed / ambiguous / no-match;
- `starting_count`;
- `valid_observation_count`;
- `season_unavailable`;
- `candidate_ids`;
- `primary_candidate_id` when applicable;
- `primary_tied`;
- `matched_evidence` by candidate;
- `conflicting_evidence` by candidate;
- `alternative_candidate_ids`;
- `next_observation` when useful;
- `safety_handoff`;
- a machine-readable indication that the result is not a confirmed identification.

### `get_species_profile`

#### Input

- approved profile/species ID.

#### Output

Only source-backed profile material approved for homeowner use, including relevant provenance/source references.

The profile result should make it possible to explain distinguishing features without giving the model unrestricted authority to manufacture species facts.

### `render_species_guide`

#### Input

Validated normalized Species observations and the canonical result reference/data needed to verify or recompute that result. Caller-supplied candidate IDs, order, scores, confidence, or rankings are never authoritative inputs.

#### Output

An illustrated interactive result for Species choices and candidates, including the appropriate matched/conflicting evidence, tie/ambiguity/no-match state, next useful observation, and profile navigation.

The tool must use or recompute the canonical deterministic result before rendering. It must not display a caller's preferred candidate ranking. Choice and candidate illustrations come from the versioned canonical `omahatreecare` source.

## Conversational orchestration

### Entry: no structured evidence

If a homeowner asks only "what tree is this?" with no usable image or description, ask for the most useful initial evidence rather than reciting the whole questionnaire.

A good initial request should allow either:

- one or more photographs; or
- a description using whatever features the homeowner can actually see.

The homeowner should never be told to climb, break branches, enter a fall zone, or approach utility lines to obtain a trait.

### Entry: natural-language evidence already present

Normalize usable facts and avoid repeating them as questions.

Example:

> "It has opposite leaves and paired helicopter seeds."

Should populate the corresponding fields and proceed directly to matching/refinement.

### Entry: images

For each useful image observation:

1. identify only approved visible traits;
2. associate the observation with its image/evidence source;
3. mark it `observed` or `provisional` as appropriate;
4. avoid using obscured/distant/ambiguous features as if they were clear;
5. invoke the matcher with the usable structured subset.

The model should explicitly decline to use a visual feature when the image does not support it.

### Iterative refinement

After each match, use the deterministic result to decide whether another question is worthwhile.

If `next_observation` is available and the result remains meaningfully ambiguous, convert that field into a concrete request.

Examples:

- leaf arrangement → ask for a close twig photo or opposite-vs-alternate observation;
- fruit → ask whether any of the approved fruit/seed patterns is visible now;
- bark → request a safe, clear mature-trunk photograph;
- overall form → request a whole-tree photo from a safe distance;
- size → ask for a rough range only when size would actually discriminate among candidates.

Do not continue questioning just to maximize completed fields. Stop when another observation has low decision value or the homeowner is satisfied with the bounded result.

## Result presentation

The default homeowner result should answer four things clearly:

1. **What currently fits best?**
2. **What evidence supports it?**
3. **What evidence conflicts or remains uncertain?**
4. **What would most help distinguish the remaining possibilities?**

The required Phase 1 in-chat UI renders:

- a strongest-current-match card;
- tied/alternative candidate cards;
- supporting-trait chips;
- conflicting-trait chips;
- an explicit ambiguity/no-match state;
- a "next useful observation" action;
- a profile detail view;
- a cross-tool continuation such as "Investigate the leaf problem" or "Screen the visible failure concern."

The UI must not use visual confidence theater such as an unsupported `94% match` score.

Illustrations must accurately distinguish the represented trait or species. Materially different seed and pod forms must not share misleading artwork. Illustration corrections are made in the canonical `omahatreecare` source and then vendored here.

Each meaningful selection should visibly update the developing field sheet, candidates, supporting/conflicting evidence, or next observation. The final state should read as an authored field-guide/specimen entry. Text-only fallback must preserve the same result and reasoning.

## Tree Case writes

Species may write:

- normalized species observation evidence;
- candidate set;
- primary provisional candidate;
- tie/ambiguity state;
- matched/conflicting evidence;
- next observation;
- dataset/profile IDs;
- species result timestamp/version;
- safety-handoff signal.

Species may not write:

- diagnosis;
- structural condition;
- hazard priority;
- treatment recommendation;
- pruning/removal necessity;
- price estimate.

## Cross-tool handoffs

### To Problem Navigator

Pass the provisional species candidate/status plus relevant observations. Problem Navigator should not ask whether species is known when the Tree Case already contains a usable result; it should instead understand whether that result is sufficiently resolved for its branch.

### To Hazard Screening

A species-flow safety signal can initiate or suggest Hazard, but species traits themselves must not determine hazard priority.

### To DIY/Professional

Species identity may provide context but should not decide whether work is appropriate for DIY.

### To Cost Planner

Species should not directly alter price unless a future approved cost model explicitly uses a species-specific field backed by local pricing evidence.

## Failure behavior

### No match

Say that the tree may be outside the current Omaha guide or that one observation may need another look. Do not force the nearest candidate.

### Conflicted evidence

Preserve the conflict. Ask for a targeted re-check if it can materially improve the result.

### Poor image

State what cannot be seen and request the specific view that would help. Do not substitute generic image recognition certainty.

### Tree outside geographic/product scope

The initial capability is an Omaha-area guide. Until a broader location-aware species dataset is approved, do not imply national coverage.

## Evaluation set

The first eval suite should include at least:

- direct single-candidate cases;
- ties;
- contradictions;
- leaf-off/winter cases;
- skipped/unknown traits;
- no-match trees;
- natural-language input containing multiple fields;
- image-derived provisional fields;
- bad/insufficient photos;
- user correction after an initial match;
- safety handoff without contamination of species ranking;
- cross-tool continuation into Problem Navigator;
- attempts to force the model to confirm a species beyond engine evidence.

Evaluation should score both deterministic correctness and conversational behavior: no redundant questions, no hidden contradictions, no unsupported certainty, and useful next-observation selection.

## Definition of done

Species Phase 1 is complete when:

- the canonical Species foundation PR in `omahatreecare` is reviewed and merged;
- the matcher, data, trait vocabulary, and illustrations have a reproducible/versioned vendor process;
- the Tree Case fields required by Species are finalized;
- the MCP input/output schema is explicit and testable;
- image-to-observation rules are explicit;
- all major current web behaviors have contract tests;
- the conversational eval set is written before implementation is considered complete;
- the illustrated in-chat choice and candidate UI is implemented and verified;
- cross-tool handoffs are defined;
- Omaha-only scope is visible to the user and enforced internally;
- no generative shortcut can silently bypass the deterministic matching result.

Species final content review remains a public-release gate. Midwest Roots/AJ owns practical and product approval, while authoritative factual claims remain source-backed.
