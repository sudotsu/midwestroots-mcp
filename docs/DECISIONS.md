# Midwest Roots MCP — Decision Log

This file records product/architecture decisions already made. Open questions belong in the master plan until resolved.

## D-001 — Product audience

**Decision:** The product is for homeowners.

Midwest Roots is the publisher/company identity, not the internal end user of the tools.

## D-002 — Underlying tool technology

**Decision:** The five existing homeowner tools are not AI-powered tools.

Their existing deterministic/rules/data-driven logic should remain authoritative where applicable. ChatGPT/MCP is an interaction, routing, and distribution layer rather than a reason to replace the tools with model-generated decisions.

## D-003 — Existing five capabilities

**Decision:** Planning begins with the five already-built capabilities: hazard screening, tree problem navigation, species guidance, DIY/pro guidance, and cost planning.

## D-004 — Expansion is not presumed

**Decision:** Moving a tool into ChatGPT does not automatically justify expanding it. Each capability must be audited and then classified as keep, adapt, expand, or redesign.

## D-005 — Product packaging remains open

**Current hypothesis:** One homeowner product with five coordinated internal capabilities is likely stronger than five unrelated listings.

**Status:** Not final until current platform/discoverability research is complete.

## D-006 — Local assumptions cannot silently become national rules

**Decision:** Omaha/Nebraska/utility-specific logic or pricing must remain properly scoped unless genuinely location-aware replacements are built.

## D-007 — FieldQuote is separate

**Decision:** The homeowner product and FieldQuote are separate products. Shared infrastructure may be extracted later only when actual reuse is demonstrated.
