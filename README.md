# Midwest Roots MCP

Homeowner tree-care tools delivered through ChatGPT/MCP and published by **Midwest Roots**.

> **Status:** The implementation plan and owner decisions are approved. Work proceeds as narrow, reviewable changes in the approved sequence.

OmahaTreeCare.com is a domain and distribution surface. **Midwest Roots is the publisher/company identity; homeowners are the users.**

## Product goal

Make the five existing homeowner tree-care tools available through one coherent ChatGPT/MCP product while preserving the deterministic logic and safety boundaries that already make the tools useful.

The current capabilities are:

1. **Hazard Screening** — help homeowners organize visible conditions that may justify prompt professional review without pretending to perform a remote safety inspection.
2. **Tree Problem Navigator** — organize visible symptoms and likely next steps without presenting remote diagnosis as certainty.
3. **Tree Species Guide** — help identify or narrow likely tree species using location and observable traits.
4. **DIY-or-Professional Navigator** — help determine whether a task is plausibly homeowner-manageable or should be routed to a professional.
5. **Cost Planning Guide** — help homeowners understand the variables that drive likely professional tree-work cost without presenting generic averages as binding local quotes.

The product is **one homeowner-facing MCP/app exposing multiple coordinated capabilities**, not five unrelated products.

## Important architecture distinction

The five homeowner tools are **not AI-powered tools**. Their underlying logic should remain deterministic or explicitly rules/data-driven wherever that is how the existing implementations work.

ChatGPT/MCP is the interaction and distribution layer: it can gather conversational context, route a homeowner to the right capability, pass structured inputs into the tools, combine outputs where appropriate, and explain results. It should not replace established tool logic with model improvisation.

## Product principles

- Preserve the useful logic already proven on the website.
- Do not expand a tool merely because it is moving into ChatGPT.
- Expand only where conversation, image input, orchestration, location awareness, or missing coverage clearly creates a real user benefit.
- Separate observed facts, user claims, inferences, uncertainty, deterministic results, and recommendations.
- Do not present uncertain visual inference as diagnosis or confirmed hazard.
- Do not make homeowners responsible for technical determinations they cannot reasonably make.
- Ask only questions that materially improve the result.
- Keep the user-facing experience simple even when internal logic is thorough.
- Prefer professional review over false certainty when remote evidence is insufficient.
- Treat the website and ChatGPT product as separate surfaces that may share domain logic.
- Make meaningful input produce meaningful visible feedback.
- Make the experience feel like discovery rather than data entry.
- Give each capability its own job-appropriate visual metaphor within one authored Midwest Roots system.

## Canonical source and Phase 1

`sudotsu/omahatreecare` remains canonical for domain logic, source-backed content, utility policy, trait vocabulary, and Species illustrations. This repository will consume approved snapshots through reproducible, versioned vendoring that records and verifies the upstream commit and source paths. Informal manual copying is not the source strategy.

Species Phase 1 exposes `match_species`, `get_species_profile`, and `render_species_guide`. The render tool must use or recompute the canonical deterministic result rather than trust candidate rankings from its caller. Illustrated Species choice cards and candidate UI are required in Phase 1.

The version 1 Tree Case is conversation-carried and stateless unless implementation proves persistence necessary. Launch scope is Omaha/local first.

The merged website implementation is canonical for shared electrical routing:

- nearby or uncertain lines: pause work; Midwest Roots reviews;
- apparent contact: stay clear; Midwest Roots reviews utility coordination;
- downed wire, arcing, or fire: utility/emergency first.

## Intended final repository structure

```text
midwestroots-mcp/
├── README.md
├── AGENTS.md
├── CLAUDE.md
├── LICENSE
├── package.json                        # TypeScript/Node.js
├── .env.example
├── .gitignore
│
├── docs/
│   ├── MASTER-PLAN.md                  # canonical approved plan
│   ├── PRODUCT-SPEC.md                 # product behavior and requirements
│   ├── DECISIONS.md                    # explicit decision log / ADR index
│   ├── NON-GOALS.md                    # scope boundaries
│   ├── RESEARCH.md                     # platform + competitive research
│   ├── CURRENT-TOOLS-AUDIT.md          # exact audit of the 5 existing web tools
│   ├── UI-DESIGN-THESIS.md             # shared interaction and visual philosophy
│   ├── SPECIES-UX-BLUEPRINT.md         # Phase 1 reference experience
│   ├── SPECIES-VISUAL-EXECUTION-SPEC.md # authoritative Species visual execution
│   ├── SPECIES-SCREEN-STATE-WIREFRAME-SPEC.md # required Species screen states
│   ├── CROSS-TOOL-UX-MAP.md            # distinct capability metaphors
│   ├── GAP-ANALYSIS.md                 # keep/adapt/expand/redesign by capability
│   ├── ORCHESTRATION.md                # when/how capabilities call one another
│   ├── SAFETY-BOUNDARIES.md            # hazard, utility, diagnosis, uncertainty rules
│   ├── LOCATION-STRATEGY.md            # local vs broader homeowner behavior
│   ├── DATA-SOURCES.md                 # authoritative sources and provenance
│   ├── PRIVACY-SECURITY.md             # retention, images, PII, abuse, auth
│   ├── OPENAI-SUBMISSION.md            # current ChatGPT/plugin/MCP requirements
│   ├── ANALYTICS.md                    # events, funnels, success metrics
│   ├── TEST-PLAN.md
│   ├── LAUNCH-CHECKLIST.md
│   └── ROADMAP.md
│
├── decisions/
│   ├── 0001-product-packaging.md
│   ├── 0002-runtime-and-stack.md
│   ├── 0003-location-scope.md
│   └── ...
│
├── tools/
│   ├── hazard-screening/
│   │   ├── README.md
│   │   ├── schema/
│   │   ├── logic/
│   │   ├── references/
│   │   └── tests/
│   ├── problem-navigator/
│   │   ├── README.md
│   │   ├── schema/
│   │   ├── logic/
│   │   ├── references/
│   │   └── tests/
│   ├── species-guide/
│   │   ├── README.md
│   │   ├── SOURCE-MANIFEST.json
│   │   ├── schema/
│   │   ├── vendor/
│   │   ├── ui/
│   │   └── tests/
│   ├── diy-pro-navigator/
│   │   ├── README.md
│   │   ├── schema/
│   │   ├── logic/
│   │   ├── references/
│   │   └── tests/
│   └── cost-planner/
│       ├── README.md
│       ├── schema/
│       ├── logic/
│       ├── references/
│       └── tests/
│
├── shared/
│   ├── schemas/
│   ├── taxonomy/
│   ├── tree-data/
│   ├── location/
│   ├── safety/
│   ├── sources/
│   └── utils/
│
├── server/
│   ├── mcp/
│   ├── orchestration/
│   ├── services/
│   ├── auth/                           # only if required
│   ├── telemetry/
│   └── config/
│
├── app/
│   ├── components/
│   ├── cards/
│   └── assets/
│
├── evals/
│   ├── README.md
│   ├── hazard-screening/
│   ├── problem-navigator/
│   ├── species-guide/
│   ├── diy-pro-navigator/
│   ├── cost-planner/
│   └── orchestration/
│
├── fixtures/
│   ├── conversations/
│   ├── images/
│   ├── edge-cases/
│   └── regression/
│
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── contract/
│   ├── safety/
│   └── end-to-end/
│
├── scripts/
│   ├── vendor-species.*
│   ├── verify-species-vendor.*
│   ├── validate-tool-schemas.*
│   ├── run-evals.*
│   └── release-check.*
│
└── .github/
    ├── workflows/
    ├── ISSUE_TEMPLATE/
    └── pull_request_template.md
```

The design documents have distinct authority: `docs/UI-DESIGN-THESIS.md` defines the product-wide philosophy; `docs/CROSS-TOOL-UX-MAP.md` defines how each capability expresses it; `docs/SPECIES-UX-BLUEPRINT.md` defines the Species experience and behavior; `docs/SPECIES-VISUAL-EXECUTION-SPEC.md` defines the authoritative Species visual system; and `docs/SPECIES-SCREEN-STATE-WIREFRAME-SPEC.md` defines the required screen anatomy, state transitions, persistent elements, implementation copy, mobile and reduced-motion behavior, and UI guardrails.

## Approved planning baseline

The planning documents record:

- audit of the current five website tools;
- capability-by-capability gap analysis;
- whether each tool stays unchanged, adapts, expands, or is redesigned;
- one-product-vs-multiple-product decision;
- exact MCP/tool schemas;
- orchestration rules;
- image handling strategy;
- location behavior;
- Omaha-specific versus general-tree-care boundaries;
- safety and uncertainty rules;
- source/provenance requirements;
- authentication requirements;
- privacy and data retention;
- model/provider responsibilities;
- deterministic versus model-driven logic;
- eval suite and acceptance thresholds;
- ChatGPT UI needs;
- analytics;
- current OpenAI submission/distribution requirements;
- launch assets and listing copy;
- success metrics;
- failure/rollback criteria;
- explicit non-goals.

## Capability completion rule

Each capability gets its own definition of done.

The product should not be considered launch-ready merely because the MCP server runs or because four of five tools are strong. Every exposed capability must independently meet its required functional, safety, eval, and UX thresholds.

## Relationship to other projects

### OmahaTreeCare.com

The website is a Midwest Roots distribution/SEO surface. Its repository is the canonical source for the shared domain behavior and content listed above, while the ChatGPT product may use different interaction patterns where conversation provides a better experience.

### FieldQuote

FieldQuote is a separate contractor-facing product. It may later share domain models, integrations, or reusable infrastructure, but the products should not be coupled merely because both concern tree work.

### AI Toolshed

Generic infrastructure discovered while building this product may be extracted into `sudotsu/ai-toolshed` only when it is genuinely reusable outside this product.

Examples include MCP eval harnesses, submission validators, schema linting, generic safety-test frameworks, or reusable plugin-development workflows.

## Current priority

The next implementation work is the canonical Species foundation PR in `sudotsu/omahatreecare`. Do not begin the MCP foundation until that PR is reviewed and merged.

Production hosting remains undecided. Keep the MCP implementation host-neutral and compare Vercel with Render only after the Species vertical slice has a working `/mcp` handler, using the acceptance criteria in `docs/PLATFORM-DISTRIBUTION.md`.

Species final content review and refreshed local Cost pricing approval remain release gates. Midwest Roots/AJ owns practical and product approval; authoritative factual claims remain source-backed. Publication should ultimately use the Midwest Roots or other owner-controlled verified publisher identity.
