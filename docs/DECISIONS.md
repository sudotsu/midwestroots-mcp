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

The initial product should prefer an explicit local scope over pretending local rules or Midwest Roots pricing are universal.

## D-007 — FieldQuote is separate

**Decision:** The homeowner product and FieldQuote are separate products. Shared infrastructure may be extracted later only when actual reuse is demonstrated.

## D-008 — Shared Tree Case

**Decision:** The five capabilities share a structured Tree Case so information learned once can be reused across the conversation.

The Tree Case records values plus provenance/uncertainty. Conversation and images may populate evidence; deterministic capability engines remain responsible for the decisions they are designed to make.

A capability must not force the homeowner to repeat a question that the current Tree Case already answers with sufficient evidence.

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

The ChatGPT version should use those capabilities to ask the highest-value next observation rather than replay the website questionnaire step by step.

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

**Decision:** The homeowner MCP planning baseline is the five-part source-informed hazard model merged into `sudotsu/omahatreecare` through PR #108, not the obsolete numeric likelihood × consequence implementation.

The current baseline separately models:

- trunk/root observations;
- branch/crown observations;
- recent change/context;
- target exposure;
- utility context;

and returns Monitor / On-Site Review / Prompt Review / Keep Clear without presenting a fake professional risk score.

## D-013 — Initial authentication posture

**Decision:** Do not require a homeowner account merely because the platform supports authentication.

The initial five capabilities operate on public/source-backed information and active-session homeowner inputs. Start with a no-account experience unless an approved persistence, premium, or account-specific feature creates a real need for authentication.

## D-014 — Skills are not the initial consumer vehicle

**Decision:** Do not build a parallel standalone Skill simply to duplicate the homeowner app.

A Skill can be considered later if a concrete reusable workflow or workspace use case justifies it. The initial consumer experience is the Plugin/App backed by MCP capabilities.
