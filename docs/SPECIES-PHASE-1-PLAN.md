# Species — Phase 1 Implementation Plan

**Status:** Approved; canonical Species foundation prerequisite satisfied by merged PR #113

**Capability:** Species Matching  
**Goal:** Prove the MCP/app architecture with one deterministic homeowner capability before expanding to the other four.

## 1. Proposed runtime

### Recommendation

Use **TypeScript/Node.js** for the MCP server.

Current OpenAI plugin documentation explicitly supports the official TypeScript MCP SDK (`@modelcontextprotocol/sdk`) with Zod schemas, Streamable HTTP transport, typed tool input/output schemas, structured tool results, and safety annotations.

The five existing Midwest Roots homeowner engines are already TypeScript. Keeping the MCP implementation in TypeScript allows us to preserve and test the deterministic logic directly instead of translating it to another language and introducing parity risk.

### Initial dependencies

Expected minimal server dependencies:

- `@modelcontextprotocol/sdk`
- `zod`
- minimal HTTP/server adapter required by the chosen deployment runtime

Do not add an LLM SDK to the deterministic Species server merely to identify trees. ChatGPT provides the conversational/multimodal interpretation layer; the MCP server performs normalized deterministic work.

### Deployment

Production hosting is intentionally undecided. Keep the server host-neutral and compare Vercel with Render only after this vertical slice has a working `/mcp` handler.

The comparison must verify public HTTPS, compatible Streamable HTTP behavior, stateless Node deployment, no sleeping production instance, acceptable cold-start and request-duration behavior, health checks, useful logs, controlled releases and rollback, a stable custom domain, required origin validation, and UI Content Security Policy support. Hosting must not shape the Species architecture before that runnable comparison.

## 2. Build the deterministic tools and required UI as one vertical slice

Follow the current OpenAI plugin guidance:

1. implement and test the MCP server/tool contracts;
2. inspect them with MCP Inspector;
3. connect them to ChatGPT in developer mode;
4. run direct/indirect/edge/out-of-scope evals;
5. implement and verify the illustrated in-chat UI against those tool results.

Tool behavior should be established before wiring the UI to it, but Phase 1 is not complete without illustrated choice cards and illustrated candidate results. The UI must preserve matched/conflicting evidence, ties, ambiguity, ordinary no-match, outside-supported-universe, and next-observation behavior.

The Species design documents have distinct roles:

- `docs/UI-DESIGN-THESIS.md` defines the product-wide design philosophy;
- `docs/CROSS-TOOL-UX-MAP.md` defines how each capability expresses that philosophy differently;
- `docs/SPECIES-UX-BLUEPRINT.md` defines the Species experience concept and behavior;
- `docs/SPECIES-VISUAL-EXECUTION-SPEC.md` defines the authoritative Species visual system;
- `docs/SPECIES-SCREEN-STATE-WIREFRAME-SPEC.md` defines the required screen anatomy, state transitions, persistent elements, implementation copy, mobile and reduced-motion behavior, and UI guardrails.

Together they require the homeowner's tree/photo to anchor an evolving field sheet, visible evidence provenance, understandable candidate/evidence changes after selections, and a final state that reads as an authored field-guide entry.

## 3. Source reuse strategy

### Problem

The deterministic Species engine currently lives in `sudotsu/omahatreecare`, while the MCP product has its own repository.

Runtime imports across repositories would create brittle deployment coupling. Creating a third shared-domain repository/package immediately would add infrastructure before we know it is necessary.

### Approved Phase 1 decision

Vendor the minimum approved Species domain modules, source-backed content, trait vocabulary, illustrations, and behavioral fixtures from `sudotsu/omahatreecare` through a reproducible, versioned import process.

Initial source set is expected to include the relevant portions of:

- `src/data/tree-species.ts`
- `src/data/tree-species-matching.ts`
- any required species question/label data
- matching tests that define current behavior
- the Species illustrations required by the Phase 1 UI

`sudotsu/omahatreecare` remains canonical for domain logic, source-backed content, utility policy, trait vocabulary, and Species illustrations. Do not maintain an informal independent copy in this repository. Shared behavior/content changes start upstream and arrive through a reviewed vendor update.

### Drift control

Each vendor update must include a machine-readable manifest or equivalent provenance record containing:

- source repository;
- source commit SHA;
- copied source paths;
- import date;
- intentional deviations, if any.

The repository must provide repeatable import and verification commands. Verification should detect drift from the recorded upstream version and prove that the vendored matcher behaves like the canonical source for the same fixtures.

Vendoring is a controlled, reviewed source update; it must not automatically deploy arbitrary upstream changes. If maintaining the vendor boundary becomes materially costly, a shared package can be evaluated later from evidence.

## 4. Proposed repository slice

```text
midwestroots-mcp/
├── docs/
│   ├── TREE-CASE.md
│   ├── CURRENT-TOOLS-AUDIT.md
│   ├── PLATFORM-DISTRIBUTION.md
│   └── SPECIES-PHASE-1-PLAN.md
│
├── tools/
│   └── species-guide/
│       ├── README.md
│       ├── TOOL-CONTRACT.md
│       ├── SOURCE-MANIFEST.json
│       ├── schema/
│       ├── vendor/
│       ├── ui/
│       └── tests/
│
├── scripts/
│   ├── vendor-species.*
│   └── verify-species-vendor.*
│
├── server/
│   └── mcp/
│       ├── server.ts
│       └── tools/
│           ├── match-species.ts
│           ├── get-species-profile.ts
│           └── render-species-guide.ts
│
└── evals/
    └── species-guide/
        ├── cases/
        └── README.md
```

Exact filenames may change during implementation; the boundaries should not.

## 5. Stateless Tree Case posture for Phase 1

The Tree Case is a **logical structured case contract**, not initially a database record.

Phase 1 should not add accounts, sessions, Redis, or a database simply to remember species observations.

ChatGPT/app orchestration should carry the relevant structured evidence through the conversation and pass the current normalized subset to tools. Tool results should return stable structured values that can be reused by later calls.

If later testing shows that conversation-carried state is unreliable or too large, persistence can be evaluated as a specific architecture problem with evidence.

## 6. Phase 1 MCP tools

Implement exactly three Species tools in Phase 1:

### `match_species`

- read-only;
- deterministic;
- closed-world against the approved dataset;
- typed input/output;
- no network dependency;
- no generative identification;
- returns structured candidate/evidence/ambiguity data.

### `get_species_profile`

- read-only;
- closed-world approved profile lookup;
- unknown IDs fail closed;
- source-backed profile output;
- no generative fallback.

### `render_species_guide`

- read-only illustrated Species UI resource/result;
- renders choice cards, candidate results, evidence, ambiguity, ordinary no-match, outside-supported-universe, and next-observation state;
- uses or recomputes the canonical deterministic result from normalized observations and the recorded dataset version;
- never trusts caller-supplied candidate IDs, ordering, scores, confidence, or rankings;
- uses the canonical trait vocabulary and Species illustrations vendored from `omahatreecare`.

Do not add generic catch-all tools such as `analyze_tree` in Phase 1.

## 7. MCP metadata

All three tools should declare accurate metadata including:

- action-oriented stable names;
- human-readable titles;
- descriptions that tell the model when it must use the tool;
- explicit Zod input schema;
- explicit output schema;
- `readOnlyHint: true`;
- `openWorldHint: false` for the closed species dataset;
- `destructiveHint: false`.

The server should have concise shared instructions reinforcing that the Species matcher is authoritative for in-scope candidate narrowing and that ambiguity, ordinary no-match, and outside-supported-universe must be preserved distinctly.

## 8. Tool result design

Use `structuredContent` for compact, machine-usable deterministic results.

Human-readable `content` may summarize the outcome, but it must not contain a different conclusion from `structuredContent`.

The render result must be bound to the same canonical deterministic outcome. A caller cannot change the display outcome by supplying a preferred candidate list or ordering.

Do not hide information the model needs for reasoning only in `_meta`. `_meta` is reserved for client/UI-only details when needed later.

## 9. Image handling

No image classifier is added to the MCP server in Phase 1.

ChatGPT can inspect homeowner-provided images and translate supported visible traits into the approved Species enums. The MCP server validates those enums and performs matching.

This cleanly separates:

- multimodal interpretation: model/app layer;
- species candidate computation: deterministic server layer.

The eval suite must ensure the model does not use its visual recognition to bypass the matcher.

## 10. Release/content gate

The source dataset currently reports `finalContentReview: pending`.

Before public release:

- review all ten profiles;
- confirm source/review metadata;
- resolve or explicitly approve any taxon-scope/local-relevance wording;
- change the source review state deliberately rather than through implementation side effects;
- rerun matcher/profile tests after the approved content snapshot is imported.

Midwest Roots/AJ owns practical and product approval. Authoritative factual claims remain source-backed.

This gate does not block building the MCP adapter against the current dataset.

## 11. Minimal implementation validation

Avoid a huge test blast. Phase 1 validation should be proportional and purposeful.

### Unit/contract

- existing deterministic matcher behavior;
- MCP schema validation;
- output serialization;
- profile lookup failure behavior;
- source review metadata propagation.
- reproducible vendor import/drift verification;
- render rejection or disregard of caller-supplied candidate rankings;
- illustrated card/result states use the canonical vocabulary, assets, and deterministic result.
- keyboard, touch, color-independent, reduced-motion, and text/fallback behavior;
- meaningful visible feedback after every input that changes canonical state.

### MCP Inspector

- initialize server;
- inspect advertised instructions/tools;
- call each tool with representative valid input;
- call with invalid enums/unknown IDs;
- verify annotations and structured results.

### ChatGPT developer-mode eval

Test a focused set of conversational cases:

- natural-language traits already supplied;
- photo-first;
- ambiguous/tied;
- winter/leaf-off;
- contradiction;
- ordinary no-match;
- outside-supported-universe;
- user correction;
- safety-handoff context;
- adversarial request to "just tell me what it is" without using the matcher.
- illustrated choice and candidate states, including ties, contradiction, ordinary no-match, and outside-supported-universe.

Do not run unrelated full-repository/browser suites repeatedly during every edit. Define the gate and run what the change actually requires.

## 12. Phase 1 completion criteria

Phase 1 is complete when:

- TypeScript MCP server starts through Streamable HTTP;
- `match_species` matches the approved deterministic engine;
- `get_species_profile` returns only approved profile data;
- `render_species_guide` renders the canonical deterministic result and cannot be steered by caller rankings;
- schemas reject unsupported input;
- tool annotations are accurate;
- MCP Inspector passes representative/invalid calls;
- ChatGPT developer mode can call the tools naturally;
- the model does not replay the entire website questionnaire when evidence is already available;
- ambiguity, ties, contradictions, ordinary no-match, and outside-supported-universe survive distinctly end to end;
- `nextObservation` drives targeted follow-up;
- illustrated choice cards and candidate UI work end to end;
- the completed experience meets `docs/SPECIES-UX-BLUEPRINT.md`, `docs/SPECIES-VISUAL-EXECUTION-SPEC.md`, and `docs/SPECIES-SCREEN-STATE-WIREFRAME-SPEC.md` rather than presenting a generic form or chatbot result;
- the vendored source can be reproduced and verified against its recorded `omahatreecare` commit;
- Tree Case evidence can continue into the next capability later;
- implementation is delivered through a branch and PR for review.

## 13. Not in Phase 1

- Problem Navigator implementation;
- DIY/Professional implementation;
- Hazard implementation;
- Cost implementation;
- national species expansion;
- user accounts;
- persistent saved cases;
- billing;
- production Plugin submission;
- broad analytics stack;
- unreviewed automatic upstream pulls or deployment;
- a generic AI tree-identification model;

## 14. Implementation starting point

The matching, discrimination, contradiction/recheck, tie, no-match, and illustration corrections required for the canonical Species foundation were merged into `sudotsu/omahatreecare` through PR #113 (`473e0407e42f60d6ecb4717de3f2649300d3be08`). Begin the Species MCP foundation from that approved canonical state, and record that commit as the source of the first reproducible vendor snapshot.
