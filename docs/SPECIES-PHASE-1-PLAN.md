# Species — Phase 1 Implementation Plan

**Status:** Ready for review before code implementation  
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

Deployment provider remains open until Streamable HTTP behavior, cold starts, logs, and public HTTPS endpoint requirements are validated against the chosen host.

Do not select infrastructure merely because another Midwest Roots property happens to use it.

## 2. Build tools before custom UI

Follow the current OpenAI plugin guidance:

1. implement and test the MCP server/tool contracts;
2. inspect them with MCP Inspector;
3. connect them to ChatGPT in developer mode;
4. run direct/indirect/edge/out-of-scope evals;
5. only then add custom in-chat UI where it materially improves the experience.

For Species, custom UI is likely worthwhile eventually for candidate comparisons, matched/conflicting evidence, and next-observation prompts. It is not required to prove the engine/tool behavior first.

## 3. Source reuse strategy

### Problem

The deterministic Species engine currently lives in `sudotsu/omahatreecare`, while the MCP product has its own repository.

Runtime imports across repositories would create brittle deployment coupling. Creating a third shared-domain repository/package immediately would add infrastructure before we know it is necessary.

### Phase 1 decision

Copy the minimum **pure domain modules/data** needed by Species into `midwestroots-mcp` and record the exact source repository commit used.

Initial source set is expected to include the relevant portions of:

- `src/data/tree-species.ts`
- `src/data/tree-species-matching.ts`
- any required species question/label data
- matching tests that define current behavior

Do not copy React/web UI into the MCP engine.

### Drift control

The copied engine must include a provenance record containing:

- source repository;
- source commit SHA;
- copied source paths;
- copy date;
- intentional deviations, if any.

Parity tests should prove that the copied matcher behaves like the source version for the same fixtures.

Do not build an automated cross-repo synchronization system in Phase 1. If maintaining both implementations becomes painful in real use, then evaluate extracting a shared package. Demonstrate the need first.

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
│       ├── SOURCE-PROVENANCE.md
│       ├── schema/
│       ├── logic/
│       ├── data/
│       └── tests/
│
├── server/
│   └── mcp/
│       ├── server.ts
│       └── tools/
│           ├── match-species.ts
│           └── get-species-profile.ts
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

Implement exactly two Species tools first:

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

Do not add generic catch-all tools such as `analyze_tree` in Phase 1.

## 7. MCP metadata

Both tools should declare accurate metadata including:

- action-oriented stable names;
- human-readable titles;
- descriptions that tell the model when it must use the tool;
- explicit Zod input schema;
- explicit output schema;
- `readOnlyHint: true`;
- `openWorldHint: false` for the closed species dataset;
- `destructiveHint: false`.

The server should have concise shared instructions reinforcing that the Species matcher is authoritative for in-scope candidate narrowing and that ambiguity/no-match must be preserved.

## 8. Tool result design

Use `structuredContent` for compact, machine-usable deterministic results.

Human-readable `content` may summarize the outcome, but it must not contain a different conclusion from `structuredContent`.

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

This gate does not block building the MCP adapter against the current dataset.

## 11. Minimal implementation validation

Avoid a huge test blast. Phase 1 validation should be proportional and purposeful.

### Unit/contract

- existing deterministic matcher behavior;
- MCP schema validation;
- output serialization;
- profile lookup failure behavior;
- source review metadata propagation.

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
- no-match;
- user correction;
- safety-handoff context;
- adversarial request to "just tell me what it is" without using the matcher.

Do not run unrelated full-repository/browser suites repeatedly during every edit. Define the gate and run what the change actually requires.

## 12. Phase 1 completion criteria

Phase 1 is complete when:

- TypeScript MCP server starts through Streamable HTTP;
- `match_species` matches the approved deterministic engine;
- `get_species_profile` returns only approved profile data;
- schemas reject unsupported input;
- tool annotations are accurate;
- MCP Inspector passes representative/invalid calls;
- ChatGPT developer mode can call the tools naturally;
- the model does not replay the entire website questionnaire when evidence is already available;
- ambiguity, ties, contradictions, and no-match survive end to end;
- `nextObservation` drives targeted follow-up;
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
- automatic synchronization back into OmahaTreeCare.com;
- a generic AI tree-identification model;
- custom UI before the tools themselves work end to end.
