# Midwest Roots MCP — Master Planning Document

**Status:** Approved for phased implementation

**Implementation authorization:** Granted only through the approved reviewable sequence

**Product:** Homeowner tree-care tools delivered through ChatGPT/MCP  
**Publisher:** Midwest Roots

## 1. Planning objective

Convert the five existing homeowner tools into a high-quality ChatGPT/MCP product without assuming they need more underlying logic simply because they are moving into ChatGPT.

The approved planning method determines, capability by capability, whether the current implementation should:

- remain substantially unchanged;
- be adapted to a structured MCP contract;
- be expanded because conversational/image/location context creates a real user benefit; or
- be redesigned because the existing web interaction model does not translate cleanly.

No expansion should happen merely to make the product feel more "AI" or more complex.

## 2. Existing capabilities in scope

1. **Hazard Screening**
2. **Tree Problem Navigator**
3. **Tree Species Guide**
4. **DIY-or-Professional Navigator**
5. **Cost Planning Guide**

These capabilities already exist on the Midwest Roots website surface at OmahaTreeCare.com. Their web implementations were inspected directly for the current audit and remain the canonical starting point for MCP behavior.

## 3. Core product architecture

The approved architecture is one homeowner-facing product exposing multiple internal tools rather than five unrelated products.

A homeowner should be able to ask a natural question such as:

> What should I do about this tree?

The product should determine which capability or sequence of capabilities is relevant, collect only materially necessary information, invoke deterministic tool logic, and return a clear result with uncertainty preserved.

Platform terminology and submission requirements remain time-sensitive and must be reverified before publication, without reopening the settled product architecture by default.

## 4. Non-AI tool principle

The five tools are not themselves AI systems.

Where current logic is deterministic, rules-based, or source-based, it should remain so. ChatGPT may provide:

- conversational intake;
- routing/orchestration;
- extraction of structured facts from user language;
- image observations where appropriate;
- follow-up question selection;
- explanation of tool output;
- composition of multiple tool outputs.

The model must not silently replace tool calculations, decision trees, source constraints, or safety rules with free-form guesses.

## 5. Planning workstreams

### 5.1 Existing-tool audit

For each of the five existing implementations, document:

- current user goal;
- exact inputs;
- exact outputs;
- decision tree / rules;
- source data;
- local assumptions;
- current safety boundaries;
- failure behavior;
- dependencies;
- analytics if present;
- known limitations;
- what the web UI is doing versus what the underlying logic is doing.

### 5.2 Capability gap analysis

For each tool, classify every meaningful gap as one of:

- MCP contract gap;
- conversational UX gap;
- image-input opportunity;
- location-awareness gap;
- domain-logic gap;
- source/provenance gap;
- safety gap;
- evaluation gap;
- no gap / keep as-is.

The output must explicitly recommend **keep, adapt, expand, or redesign** for each capability.

### 5.3 Product packaging

The final distribution unit is one Midwest Roots homeowner product in which the five capabilities are internal tools selected or combined as the homeowner's case requires.

### 5.4 Location strategy

The initial launch is explicitly Omaha/local. Broader coverage requires separately approved, genuinely location-aware rules and content.

Local rules and pricing must never be silently generalized nationally.

### 5.5 Safety and epistemic boundaries

The product must preserve distinctions among:

- user-reported facts;
- visible/model-observed facts;
- inferred possibilities;
- uncertainty;
- deterministic tool results;
- recommendations.

Specific principles already established:

- remote output is not an on-site safety inspection;
- tree-problem guidance is not a definitive diagnosis;
- species identification must preserve uncertainty;
- species identity alone does not prove condition, hazard, or work need;
- nearby or uncertain lines mean pause work while Midwest Roots reviews;
- apparent contact means stay clear while Midwest Roots reviews utility coordination;
- downed wire, arcing, or fire means utility/emergency first;
- homeowners should not be pushed into making technical utility-clearance determinations they cannot reasonably make;
- DIY guidance should not pretend a remote system can certify a task as universally safe.

### 5.6 Tool contracts

Define for each capability:

- tool name;
- description;
- input schema;
- required versus optional inputs;
- output schema;
- uncertainty representation;
- source/provenance representation;
- error/fallback behavior;
- whether image-derived observations are accepted;
- whether location is required;
- orchestration dependencies.

### 5.7 Orchestration

Define when the system should invoke one capability versus several.

Examples to evaluate:

- species -> problem navigator;
- problem navigator -> hazard screening;
- hazard screening -> DIY/pro navigator;
- DIY/pro navigator -> cost planner;
- direct cost planning without any health/hazard analysis.

Orchestration must not manufacture dependencies where none are needed.

### 5.8 Current platform and hosting verification

Before implementing platform-specific integration or submitting the product, verify current OpenAI requirements for:

- Apps/Plugins/MCP packaging;
- tool descriptions and schemas;
- read-only versus write actions;
- image handling;
- authentication;
- privacy disclosures;
- external links and lead-generation behavior;
- review/submission requirements;
- directory/discoverability rules;
- required assets;
- analytics expectations;
- safety requirements.

Production hosting is intentionally undecided. The implementation must remain host-neutral, and Vercel and Render will be compared only after the Species vertical slice has a working `/mcp` handler. The comparison must cover public HTTPS, compatible Streamable HTTP behavior, stateless Node deployment, no sleeping production instance, acceptable cold-start and request-duration behavior, health checks, useful logs, controlled releases and rollback, a stable custom domain, required origin validation, and UI Content Security Policy support.

### 5.9 Canonical source and vendoring

`sudotsu/omahatreecare` is canonical for domain logic, source-backed content, utility policy, trait vocabulary, and Species illustrations. This repository consumes approved source snapshots through a reproducible, versioned vendor process that records upstream commit and paths and verifies the imported result. Informal manual copying is not an approved source strategy.

Midwest Roots/AJ owns practical and product approval. Authoritative factual claims remain source-backed. Species final content review and refreshed local Cost pricing approval are release gates for their respective capabilities.

### 5.10 Competitive research

Search the current ChatGPT/plugin/app ecosystem for:

- homeowner tree-care tools;
- plant/tree identification;
- hazard screening;
- home-maintenance decision tools;
- cost-planning tools;
- arboriculture/tree-diagnosis products.

The goal is to understand packaging, discoverability, missing functionality, and review risk—not to copy feature counts.

### 5.11 Evaluation

Each capability must receive its own eval set and launch threshold.

Required eval classes should include:

- normal expected use;
- incomplete information;
- ambiguous language;
- misleading user assumptions;
- image ambiguity where applicable;
- location mismatch;
- high-risk/safety edge cases;
- attempts to force diagnosis or false certainty;
- tool-routing failures;
- regression cases from the website implementation.

### 5.12 UI and interaction system

The approved product thesis is that Midwest Roots should feel like an interactive field investigation rather than an AI form. Every meaningful input should produce meaningful visible feedback, and the reward should be clarity and discovery rather than gamification.

Species is the first/reference UX implementation, with illustrated interaction required in Phase 1. Each other capability must reinterpret the shared philosophy through its own job-appropriate metaphor rather than copy the Species UI. Hazard requires a restrained, safety-appropriate expression.

The detailed product and capability contracts are in:

- `docs/UI-DESIGN-THESIS.md`;
- `docs/CROSS-TOOL-UX-MAP.md`;
- `docs/SPECIES-UX-BLUEPRINT.md`;
- `docs/SPECIES-VISUAL-EXECUTION-SPEC.md`;
- `docs/SPECIES-SCREEN-STATE-WIREFRAME-SPEC.md`.

These documents have separate roles: the thesis defines the product-wide design philosophy; the cross-tool map defines each capability's distinct expression; the Species blueprint defines the Species experience and behavior; the Species visual execution spec defines the authoritative Species visual system; and the Species screen-state wireframe spec defines the required screen anatomy, transitions, persistent elements, implementation copy, mobile and reduced-motion behavior, and UI guardrails.

## 6. Approved planning baseline

The approved planning baseline covers:

- exact product packaging;
- current-tool audit;
- keep/adapt/expand/redesign decision for each capability;
- exact tool schemas;
- orchestration rules;
- location strategy;
- safety boundaries;
- source/provenance strategy;
- image behavior;
- deterministic-versus-model responsibilities;
- privacy/security model;
- analytics plan;
- eval suites and thresholds;
- OpenAI submission requirements;
- launch checklist;
- explicit non-goals;
- post-launch success metrics;
- shared UI philosophy and capability-specific UX direction.

## 7. Implementation gate

The canonical Species foundation prerequisite was completed in `sudotsu/omahatreecare` PR #113 (`473e0407e42f60d6ecb4717de3f2649300d3be08`). The MCP application foundation and reproducible snapshot of that commit are complete. The current implementation phase is the Species vertical slice.

Once implementation begins, non-documentation repository changes must go through a branch and pull request for review. Passing CI does not authorize merging.

Publication should ultimately use the Midwest Roots or other owner-controlled verified publisher identity.
