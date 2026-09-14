# Midwest Roots MCP — Decision Log

This file records product/architecture decisions already made. Open questions belong in the master plan until resolved.

## D-001 — Product audience

**Decision:** The product is for homeowners.

Midwest Roots is the publisher/company identity, not the internal end user of the tools.

## D-002 — Underlying tool technology

**Decision:** The five existing homeowner tools are not AI-powered tools.

Their existing deterministic/rules/data-driven logic should remain authoritative where applicable. ChatGPT/MCP is an interaction, routing, evidence-extraction, and distribution layer rather than a reason to replace the tools with model-generated decisions.

## D-003 — Existing five capabilities

**Decision:** Planning begins with the five already-built capabilities: hazard screening, tree problem navigation, species guidance, DIY/pro guidance, and cost planning.

## D-004 — Expansion is not presumed

**Decision:** Moving a tool into ChatGPT does not automatically justify expanding it. Each capability must be audited and then classified as keep, adapt, expand, or redesign.

## D-005 — Consumer packaging

**Decision:** Build one homeowner-facing ChatGPT product rather than five unrelated consumer listings.

Current platform strategy as of 2026-09-11:

- one Plugin listing for discovery/installation;
- one Apps SDK app for the chat-native experience and interactive UI;
- one MCP backend exposing the internal homeowner capabilities;
- no requirement for five separate MCP servers.

Platform terminology and submission requirements are time-sensitive and must be reverified before submission.

## D-006 — Local assumptions cannot silently become national rules

**Decision:** Omaha/Nebraska/utility-specific logic or pricing must remain properly scoped unless genuinely location-aware replacements are built.

The initial launch is explicitly Omaha/local. Local rules and Midwest Roots pricing must not be presented as universal.

## D-007 — FieldQuote is separate

**Decision:** The homeowner product and FieldQuote are separate products. Shared infrastructure may be extracted later only when actual reuse is demonstrated.

## D-008 — Shared Tree Case

**Decision:** The five capabilities share a structured Tree Case so information learned once can be reused across the conversation.

The Tree Case records values plus provenance/uncertainty. Conversation and images may populate evidence; deterministic capability engines remain responsible for the decisions they are designed to make.

A capability must not force the homeowner to repeat a question that the current Tree Case already answers with sufficient evidence.

For version 1, the Tree Case is conversation-carried and stateless. Do not add persistence unless implementation evidence shows that the active conversation cannot carry the required case reliably.

See `docs/TREE-CASE.md`.

## D-009 — Initial capability sequence

**Decision:** Initial implementation sequence:

1. Species Matching Guide
2. Tree Problem Navigator
3. DIY or Professional
4. Hazard Screening
5. Cost Planner

This order is chosen to prove shared evidence, image/conversation intake, deterministic tool calls, iterative questioning, cross-tool routing, and increasing safety complexity before the local pricing capability.

It is not a ranking of homeowner importance.

## D-010 — Species is the first implementation slice

**Decision:** Species is first because the existing deterministic matcher already supports ambiguity, contradictions, ties, leaf-off conditions, no-match outcomes, and `nextObservation` selection.

The canonical Species foundation in `sudotsu/omahatreecare` must first correct the known matching, discrimination, contradiction, and illustration issues identified in planning. The ChatGPT version should then use those capabilities to ask the highest-value next observation rather than replay the website questionnaire step by step.

The model may extract/normalize visible traits but may not bypass the matcher and simply declare a species.

See `tools/species-guide/README.md`.

## D-011 — Model/engine boundary

**Decision:** Generative interpretation and deterministic decisions are explicitly separated.

The model may:

- interpret natural-language descriptions;
- extract provisional image observations;
- normalize facts into approved schemas;
- determine which capability should run;
- ask materially useful follow-ups;
- explain and render structured results.

The model may not silently replace deterministic species matching, problem routing, DIY/pro routing, hazard screening, or pricing logic with improvised conclusions.

## D-012 — Hazard model baseline

**Decision:** The homeowner MCP planning baseline is the five-part source-informed hazard model merged into `sudotsu/omahatreecare` through PR #108, with the cross-tool electrical-routing policy merged through PR #112. The merged website implementation is canonical.

The current baseline separately models:

- trunk/root observations;
- branch/crown observations;
- recent change/context;
- target exposure;
- utility context;

and returns Monitor / On-Site Review / Prompt Review / Keep Clear without presenting a fake professional risk score.

The shared electrical-routing policy is:

- nearby or uncertain lines: pause work; Midwest Roots reviews;
- apparent contact: stay clear; Midwest Roots reviews utility coordination;
- downed wire, arcing, or fire: utility/emergency first.

## D-013 — Initial authentication posture

**Decision:** Do not require a homeowner account merely because the platform supports authentication.

The initial five capabilities operate on public/source-backed information and active-session homeowner inputs. Start with a no-account experience unless an approved persistence, premium, or account-specific feature creates a real need for authentication.

## D-014 — Skills are not the initial consumer vehicle

**Decision:** Do not build a parallel standalone Skill simply to duplicate the homeowner app.

A Skill can be considered later if a concrete reusable workflow or workspace use case justifies it. The initial consumer experience is the Plugin/App backed by MCP capabilities.

## D-015 — Canonical source and reproducible vendoring

**Decision:** `sudotsu/omahatreecare` remains canonical for domain logic, source-backed content, utility policy, trait vocabulary, and Species illustrations.

`sudotsu/midwestroots-mcp` will consume the approved source through reproducible, versioned vendoring. Each import must identify the upstream commit and source paths, use a repeatable import/verification process, and record any intentional deviations. Vendored files are not maintained as an informal independent copy; product changes begin in the canonical repository and arrive through a reviewed vendor update.

## D-016 — Species Phase 1 surface and UI

**Decision:** Species Phase 1 exposes exactly these homeowner capability tools:

- `match_species`;
- `get_species_profile`;
- `render_species_guide`.

`render_species_guide` must use or recompute the canonical deterministic match result. It must not trust candidate IDs, order, scores, or rankings supplied by a caller.

Illustrated choice cards and illustrated candidate results are required Phase 1 behavior. The illustrations and trait vocabulary come from the canonical `omahatreecare` source.

## D-017 — Production hosting remains undecided

**Decision:** Keep the MCP implementation host-neutral. Compare Vercel and Render only after the Species vertical slice has a working `/mcp` handler.

The hosting decision must evaluate public HTTPS, compatible Streamable HTTP behavior, stateless Node deployment, no sleeping production instance, acceptable cold-start and request-duration behavior, health checks, useful logs, controlled releases and rollback, a stable custom domain, required origin validation, and UI Content Security Policy support.

## D-018 — Content approval, release gates, and publisher identity

**Decision:** Midwest Roots/AJ owns practical and product approval. Authoritative factual claims remain source-backed.

Species final content review remains a release gate. Refreshed local pricing approval remains a release gate before Cost launches. Publication should ultimately use the Midwest Roots or other owner-controlled verified publisher identity.

## D-019 — Next implementation work

**Decision:** After this planning-document reconciliation, the next implementation work is the narrowly scoped canonical Species foundation PR in `sudotsu/omahatreecare`.

Do not begin the MCP foundation until that canonical Species PR is reviewed and merged.

## D-020 — Shared UI philosophy and feedback

**Decision:** The Midwest Roots experience is an interactive field investigation rather than an AI form. It should feel like discovery rather than data entry.

Every meaningful input must create meaningful visible feedback. The reward is clearer understanding, visible progress, narrower possibilities, or revealed relationships rather than points, XP, streaks, badges, confetti, fake confidence percentages, or completion for its own sake.

“Not sure” is a valid observation. The interface must make deterministic reasoning legible and must not imply that the model magically knows the answer.

## D-021 — Species is the reference UX

**Decision:** Species is the first/reference UX implementation. Its illustrated investigation, choice cards, candidate states, evidence annotations, and field-guide result are required Phase 1 behavior.

`render_species_guide` must remain bound to the canonical deterministic result as defined in D-016. `docs/SPECIES-UX-BLUEPRINT.md` defines the Species experience and behavior; `docs/SPECIES-VISUAL-EXECUTION-SPEC.md` defines the authoritative Species visual system; and `docs/SPECIES-SCREEN-STATE-WIREFRAME-SPEC.md` defines the required implementation states, anatomy, transitions, copy, responsive behavior, reduced-motion behavior, and guardrails.

## D-022 — Capability-specific UX expressions

**Decision:** All five capabilities share the Midwest Roots design philosophy and system, but each must reinterpret them through a metaphor and interaction pattern appropriate to its job. Other capabilities must not mechanically copy the Species UI.

Generic AI/SaaS visual output, repeated form/card layouts, and an undifferentiated “write → next → result” pattern are not acceptable defaults. See `docs/UI-DESIGN-THESIS.md` and `docs/CROSS-TOOL-UX-MAP.md`.

## D-023 — Hazard visual tone

**Decision:** Hazard uses a restrained, safety-appropriate expression of the design system. Motion may clarify state or first-action changes, but Hazard must not celebrate, gamify, or make danger feel entertaining.
