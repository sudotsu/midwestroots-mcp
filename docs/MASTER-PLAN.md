# Midwest Roots MCP — Master Planning Document

**Status:** Active planning  
**Implementation authorization:** Not yet granted by this document  
**Product:** Homeowner tree-care tools delivered through ChatGPT/MCP  
**Publisher:** Midwest Roots

## 1. Planning objective

Convert the five existing homeowner tools into a high-quality ChatGPT/MCP product without assuming they need more underlying logic simply because they are moving into ChatGPT.

The planning job is to determine, capability by capability, whether the current implementation should:

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

These capabilities already exist on the Midwest Roots website surface at OmahaTreeCare.com. The current web implementations are the starting point and must be inspected directly before MCP behavior is finalized.

## 3. Core product hypothesis

The leading hypothesis is one homeowner-facing product exposing multiple internal tools rather than five unrelated products.

A homeowner should be able to ask a natural question such as:

> What should I do about this tree?

The product should determine which capability or sequence of capabilities is relevant, collect only materially necessary information, invoke deterministic tool logic, and return a clear result with uncertainty preserved.

This packaging hypothesis is not final until current OpenAI distribution/discoverability requirements and competing products are reviewed.

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

Decide whether the final distribution unit is:

- five independently listed tools/products;
- one Midwest Roots homeowner product exposing five named capabilities; or
- one broader tree-care product where the five capabilities are internal tools selected automatically.

Current working hypothesis: the third option is strongest, but this remains subject to platform/discovery research.

### 5.4 Location strategy

The current tools contain Omaha/Nebraska/local-utility assumptions in places. Planning must decide where the product is:

- explicitly Omaha/local;
- usable more broadly with constrained behavior; or
- expanded into genuinely location-aware guidance.

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
- ordinary uncertainty near utilities should not be presented as a confirmed electrical emergency;
- obvious downed wire, arcing, fire, or active electrical emergency conditions warrant immediate keep-away/emergency or utility guidance;
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

### 5.8 Current platform research

Before architecture is locked, verify current OpenAI requirements for:

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

### 5.9 Competitive research

Search the current ChatGPT/plugin/app ecosystem for:

- homeowner tree-care tools;
- plant/tree identification;
- hazard screening;
- home-maintenance decision tools;
- cost-planning tools;
- arboriculture/tree-diagnosis products.

The goal is to understand packaging, discoverability, missing functionality, and review risk—not to copy feature counts.

### 5.10 Evaluation

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

## 6. Definition of done for planning

Planning is complete only when the repository contains approved answers for:

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
- post-launch success metrics.

## 7. Implementation gate

Implementation should begin only after the planning documents make the above decisions explicit enough that an implementation agent does not have to invent product behavior while coding.

Once implementation begins, non-documentation repository changes must go through a branch and pull request for review. Passing CI does not authorize merging.
