# Current Homeowner Tools Audit

**Source product:** OmahaTreeCare.com / Midwest Roots  
**Source repository:** `sudotsu/omahatreecare`  
**Audit date:** 2026-09-11  
**Status:** Active planning document

## Purpose

This audit treats the existing tools as working products with logic worth preserving. The goal is not to recreate their current web forms in chat. The goal is to identify:

- the deterministic engine each tool already has;
- the actual decision value of each input;
- what the current web UI forces users to enter manually;
- what ChatGPT can responsibly infer from ordinary conversation or images;
- where a conversational version can reduce repetition or add useful context;
- what must remain deterministic;
- what must remain local to Omaha/Nebraska/Midwest Roots;
- where the existing logic genuinely needs expansion before distribution.

## Current capability map

| Capability | Existing engine | Current assessment | Initial ChatGPT treatment |
|---|---|---|---|
| Species Matching Guide | Trait matching/ranking with contradiction tracking and next-observation selection | Strong first implementation slice | **Adapt + conversationally expand** |
| Tree Problem Navigator | Six-stage deterministic routing with sourced symptom categories and cross-tool handoffs | Strong orchestration candidate | **Adapt + conversationally expand** |
| DIY or Professional | Task/utility/emergency/structural/method/detail routing | Substantially richer than a binary DIY verdict | **Adapt** |
| Hazard Screening | Five-part source-informed screening model with structural/context/target/utility separation | Expanded model merged from PR #108 | **Adapt** |
| Cost Planner | Local deterministic planning ranges plus site-review routes | Useful, but pricing/source freshness must be reviewed | **Adapt after data refresh** |

The initial implementation sequence is Species → Problem Navigator → DIY/Professional → Hazard → Cost. This sequence is about proving the architecture with increasing cross-tool and safety complexity, not ranking the tools by consumer importance.

---

# 1. Species Matching Guide

## Current source files

Primary implementation currently includes:

- `src/components/tools/SpeciesIdentifier.tsx`
- `src/data/species-guide-questions.ts`
- `src/data/tree-species-matching.ts`
- `src/data/tree-species.ts`
- supporting species attribution, tests, visuals, and profile pages.

## Current universe

The guide intentionally covers ten common Omaha-area trees rather than pretending to be a universal tree-identification system.

That limitation is a product feature, not merely missing data: the existing UI explains that the guide covers trees Omaha homeowners are especially likely to encounter and explicitly allows a no-match/outside-guide outcome.

## Current observations

The matching model can use:

- season / whether leaves are usable;
- leaf arrangement;
- simple vs compound leaf type;
- leaf shape;
- bark pattern;
- fruit or seed clues;
- overall form;
- approximate mature size.

The flow also records two safety-context fields:

- visible possible failure sign;
- whether people/property could be within reach.

Those safety fields do not alter the species match itself.

## Existing strengths that must survive the port

### Uncertainty is first-class

The web tool lets the homeowner skip an observation instead of forcing a guess. When leaves are unavailable, leaf-based categories are removed rather than counted against candidates.

### Contradictions are preserved

Candidate evaluation tracks both supporting observations and conflicting observations. The result can therefore explain not only why a species fits but what points elsewhere.

### Ties are honest

When two candidates score equally, the first display position is not represented as stronger evidence.

### No-match is valid

If none of the ten species matches selected observations, the engine says so instead of forcing a winner.

### Next observation is selected intentionally

The matcher examines unused trait categories and chooses the observation with the most variety among remaining candidates. This is exactly the behavior we want to exploit conversationally: ask for the next observation that is most likely to distinguish the current candidates.

### Species identity is bounded

A match is not presented as a diagnosis, treatment recommendation, work recommendation, or hazard rating.

## What should change in ChatGPT

The web UI currently asks the homeowner to work through trait questions manually. The ChatGPT version should first use information the homeowner already supplied.

Example:

> "What kind of tree is this? It has opposite leaves and helicopter seeds. Here are two pictures."

The conversational layer should not ask the homeowner whether leaves are opposite or whether winged seeds are present again. It should create provisional structured observations from the statement/images, invoke the deterministic matcher, then use `nextObservation` if another fact would materially distinguish the remaining candidates.

### Image use

Images should help populate candidate observations, but image interpretation must not become a second competing species engine.

Initial rule:

1. Extract visible traits that correspond to the approved observation vocabulary.
2. Mark image-derived observations as provisional unless the evidence is clear and/or the homeowner confirms it.
3. Pass those normalized observations to the deterministic matcher.
4. Return candidate matches, contradictions, and the engine-selected next observation.
5. Ask for a specific better photograph or homeowner observation when needed.

Example follow-up:

> "We are down to three useful possibilities. The best next clue is leaf arrangement. Send a close photo of one intact twig where the leaves attach, or tell me whether they appear in pairs directly across from each other or alternate up the twig."

That is materially better than translating `Step 2 of 10` into chat.

## Initial internal tool surface

Planning hypothesis:

### `match_species`

Inputs should be structured observation evidence, not free-form prose.

Returns should include:

- result kind;
- candidate IDs;
- primary candidate when applicable;
- tied state;
- matched evidence;
- conflicting evidence;
- valid observation count;
- season-unavailable state;
- next useful observation;
- safety-handoff signal where applicable.

### `get_species_profile`

Input:

- approved species/profile ID.

Returns:

- source-backed profile fields needed for homeowner explanation;
- local relevance/context;
- distinguishing traits;
- approved source/provenance information;
- explicit limitations.

The first implementation should not give the model a generic `identify_any_tree` tool that bypasses the approved Omaha dataset.

## Species capability acceptance scenarios

The first capability is not complete merely because an MCP function returns JSON. It should pass scenarios including:

1. **Complete natural-language description:** homeowner already supplies several traits; no redundant questions are asked.
2. **Photo-first case:** useful visible traits are extracted provisionally and passed to the matcher.
3. **Poor photo:** the system identifies the specific photograph/observation that would add the most information rather than hallucinating certainty.
4. **Winter case:** leaves are unavailable; leaf traits are excluded without penalty.
5. **Contradictory evidence:** the system shows what supports and conflicts with the leading candidate.
6. **Tie:** the system represents the tie honestly and asks the best discriminating next observation.
7. **No match:** the system says the tree may be outside the ten-tree guide instead of forcing a species.
8. **User correction:** homeowner corrects a trait; candidate set is recalculated without restarting the case.
9. **Safety context:** a visible failure concern can trigger an appropriate hazard handoff without changing species ranking.
10. **Cross-tool continuation:** after species narrowing, Problem Navigator can reuse the species result and evidence without re-asking the same questions.

## Preliminary classification

**Adapt + conversationally expand.**

The matching engine is already useful. Expansion belongs primarily in evidence extraction, image-assisted observation, iterative question selection, result presentation, and cross-tool case continuity—not in replacing the matcher with generative identification.

---

# 2. Tree Problem Navigator

## Existing logic

The deterministic router uses six decision dimensions:

1. safety;
2. visible sign;
3. pace/timing;
4. recent context;
5. one-tree vs multi-tree pattern;
6. whether species is known.

Each dimension has documented decision value. Safety can stop plant-health navigation and route to Hazard. Timing can elevate qualified plant-health review. Weather/water/construction context changes documentation and category ordering. Multi-tree patterns add shared-site/environment/pest/disease context. Unknown species routes to Species because host identity changes useful comparisons.

## Existing output behavior

The engine returns bounded plausible categories rather than a diagnosis, explains why categories fit, identifies what would help discriminate next, and selects a primary destination such as:

- Hazard;
- Species;
- independent plant-health/diagnostic resource;
- a sourced symptom guide.

## Initial classification

**Adapt + conversationally expand.**

This is the likely central routing capability once Species proves the Tree Case architecture. ChatGPT should extract already-stated timing/context/pattern information and ask only the unresolved questions that can change routing.

---

# 3. DIY or Professional

## Existing logic

The router is not a simple safe/unsafe classifier. It distinguishes:

- desired task;
- line involvement/uncertainty;
- active emergency context;
- structural warning context;
- proposed work method/equipment;
- task-specific detail.

Branches include pruning, removal, storm work, stump work, planting, mulching, watering, plant-health concerns, unknown tasks, Nebraska 811, utility routing, Hazard, Cost, independent plant-health resources, lower-risk educational guides, and Midwest Roots service review where appropriate.

## Initial classification

**Adapt.**

The main conversational gain is selective intake: infer the homeowner's task/method/context from what they already said, then ask only the missing stop-condition questions that can change the route.

---

# 4. Hazard Screening

## Current engine after merged PR #108

The old likelihood × consequence numeric score is no longer the planned/current model.

The merged source-informed model uses five input groups:

- trunk/roots;
- branches/crown;
- recent change/context;
- target exposure;
- utility context.

It derives:

- structural concern: none / watch / significant / severe;
- context state: stable / health-change / recent-change / acute-change;
- target exposure: minimal / occasional / frequent / occupied;
- utility state: clear / nearby-or-uncertain / apparent-contact / active-electrical-signs;
- homeowner priority: Monitor / On-Site Review / Prompt Review / Keep Clear.

## Important preserved rules

- Target exposure alone does not create a structural hazard result.
- Gradual foliage/vitality decline remains context rather than being converted into structural failure likelihood.
- Recent structural/site/loading change can elevate a reported structural concern.
- Nearby/uncertain lines route to Midwest Roots review rather than forcing the homeowner to decide whether OPPD is needed.
- Apparent tree-to-line contact is Keep Clear while Midwest Roots retains the coordination judgment.
- Downed line/arcing/fire changes the first action to OPPD/911 where appropriate but does not invent a fifth 'worse red' severity.
- The result is a homeowner screening priority, not an ISA TRAQ rating or remote structural inspection.

## Initial classification

**Adapt.**

The engine no longer needs a fundamental redesign before MCP work. The ChatGPT challenge is evidence handling: use conversation/images to populate the five axes responsibly, preserve uncertainty, and never silently promote a questionable image inference into a confirmed safety-critical fact.

---

# 5. Cost Planner

## Existing behavior

The planner currently considers:

- approximate height band;
- access;
- drop-zone/nearby-target constraints;
- reported condition;
- site-review conditions including utility/emergency-sensitive situations.

It deliberately refuses to manufacture detailed dollar adjustments for factors the website cannot responsibly price online. Some inputs produce a broad budgeting range; others correctly produce a site-specific-review result.

## Known planning issue

The current local pricing material is versioned to older Midwest Roots/Omaha pricing data. Before public ChatGPT distribution, the pricing dataset, dates, assumptions, and source language need an explicit freshness review.

The local dataset must never become a generic national tree-removal average through model paraphrase.

## Initial classification

**Adapt after data refresh.**

---

# Cross-tool finding

The existing tools already contain meaningful decision logic. The main product opportunity is not adding arbitrary questions or generative complexity. It is making the existing logic cooperate through a shared Tree Case, allowing natural conversation/images to populate structured evidence, and asking only the next question that has real decision value.
