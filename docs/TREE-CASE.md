# Shared Tree Case

**Status:** Planning contract  
**Purpose:** Define the shared case state that lets the homeowner capabilities cooperate without turning ChatGPT into the decision engine.

## Why this exists

The five homeowner tools should not behave like five unrelated questionnaires inside ChatGPT.

A homeowner may start with a photograph, a symptom, a work question, or a price question. Information learned once should remain available to later capabilities when it is relevant. The shared Tree Case is the structured record of that information.

Example flow:

1. Homeowner asks what kind of tree they have and supplies photos.
2. Species matching narrows the tree to a provisional candidate.
3. The homeowner asks why leaves are changing.
4. Tree Problem Navigator receives the existing species evidence and photos instead of restarting intake.
5. The homeowner asks whether they can remove a dead branch themselves.
6. DIY/Professional receives the same tree, condition, target, utility, and task context.
7. If removal planning becomes relevant, the Cost Planner reuses known height/site facts and asks only for materially missing price drivers.

The Tree Case is therefore shared structured context, not a sixth homeowner tool.

## Core rule

**Conversation and images can populate evidence. Deterministic capability engines make the decisions they are designed to make.**

ChatGPT may:

- understand natural-language descriptions;
- extract candidate observations from user-provided images;
- recognize when the homeowner already answered a structured question;
- ask for missing information;
- choose which capability to invoke;
- explain structured results conversationally;
- request a better photograph or observation when useful.

ChatGPT must not silently replace deterministic matching, routing, screening, or pricing logic with an improvised conclusion.

## Evidence model

Every meaningful Tree Case fact must preserve both its value and how that value was obtained.

Each evidence item should support at least:

- `field` — canonical field name;
- `value` — normalized structured value;
- `provenance` — where it came from;
- `status` — how strongly the case should treat it;
- `source_turn` or equivalent trace when available;
- `notes` — optional human-readable context.

### Provenance

Initial provenance types:

- `user_stated` — the homeowner explicitly said it;
- `image_observed` — a visual feature was extracted from a supplied image;
- `model_inferred` — interpretation that goes beyond an explicit statement or direct visual observation;
- `tool_derived` — returned by one of the deterministic engines;
- `external_source` — supplied by an approved external/local source;
- `unknown` — deliberately unresolved.

### Evidence status

Use categorical state rather than fake precision by default:

- `confirmed-by-user` — homeowner explicitly confirms the normalized fact;
- `observed` — directly visible or directly stated but not independently verified;
- `provisional` — plausible inference that should not be treated as settled;
- `conflicted` — two pieces of evidence disagree;
- `unknown` — no responsible value is available.

A future capability may justify a numeric confidence measure, but a generic LLM confidence percentage is not part of the initial contract.

## Field groups

The Tree Case should be extensible, but the first version should cover the fields the five existing engines actually need.

### Case identity

- case/session ID;
- approximate location or service area when supplied/available;
- local-rule jurisdiction where relevant;
- number of trees being discussed;
- active tree within a multi-tree case.

### Tree identity

- species candidate(s);
- scientific/common name identifiers from the approved species dataset;
- species match state: narrowed, ambiguous, tied, no-match, outside-current-guide;
- matched features;
- conflicting features;
- next discriminating observation.

Species identity must remain provisional unless the product later adds an approved confirmation process. A species match does not establish diagnosis, treatment need, structural condition, or hazard.

### Visible observations

- leaves/needles;
- bark/trunk;
- branches/crown;
- roots/base/soil;
- fruit/seeds;
- overall form;
- approximate size;
- visible insects/residue;
- storm or whole-tree changes;
- photographs associated with each observation where supported.

### Timeline and context

- when change was first noticed;
- pace of change;
- recent weather;
- watering/moisture context;
- construction/root-zone disturbance;
- recent pruning/loading/site changes;
- one tree vs multiple trees affected.

### Safety and target context

- reported trunk/root warning level;
- reported branch/crown warning level;
- recent structural-change context;
- target exposure;
- overhead-line/utility context;
- active electrical warning signs;
- existing hazard-screening result and reasons.

Safety-critical image interpretation remains provisional unless the homeowner explicitly confirms the observation. The system may conservatively route an uncertain condition to review, but it must not describe an uncertain visual inference as a confirmed defect or emergency.

### Work intent

- homeowner's desired task;
- pruning/removal/storm/stump/plant/mulch/water/concern/unsure;
- proposed method;
- equipment/elevated-work context;
- DIY/pro routing result;
- stop condition that drove the route;
- approved next destination.

### Cost-planning context

- approximate height band;
- access;
- drop-zone/target constraints;
- reported condition;
- utility-sensitive/site-review state;
- applicable local pricing dataset/version;
- planning result;
- explicit unknowns.

Local Midwest Roots/Omaha pricing must never be silently reinterpreted as a national average.

## Precedence and conflict rules

1. Never silently overwrite conflicting evidence.
2. A deterministic tool result does not overwrite the observations that produced it; both remain available.
3. A user correction supersedes an earlier model extraction for future routing, while the history remains traceable.
4. Image-derived safety observations remain provisional until confirmed or conservatively routed.
5. A species result cannot be used as proof of health, hazard, treatment need, or work necessity.
6. A problem category cannot be promoted to a diagnosis merely because it is conversationally convenient.
7. Capability-specific source rules outrank generic model assumptions.
8. Unknown is a valid state. The system should not invent a value merely to complete a schema.

## Question-selection rule

ChatGPT should ask a follow-up only when the missing or uncertain answer can materially change one of the following:

- the candidate set;
- the next tool/capability;
- the safety route;
- the DIY/pro route;
- the cost-planning result;
- the usefulness of the homeowner's next action.

Do not force the homeowner through every field in a website questionnaire when the conversation or images already supply the necessary evidence.

When several useful questions remain, prefer the question with the highest expected decision value. Species matching already provides a concrete example through its `nextObservation` logic.

## Tool interaction contract

Each capability should declare:

- which Tree Case fields it reads;
- which fields it may write;
- what it considers required vs optional;
- what uncertainty states it accepts;
- what deterministic result it returns;
- what handoffs it may request;
- which fields it must never infer itself.

The orchestration layer should pass the smallest relevant structured subset to each tool rather than dumping the entire conversation into every engine.

## Privacy principle

Version 1 should minimize retained personal information. The Tree Case is about the tree, visible site conditions, and the homeowner's task—not a general-purpose homeowner profile.

Account/authentication and persistence beyond the active product experience are separate decisions and must not be assumed by this document.

## Definition of done for the Tree Case contract

Before implementation begins, the contract is complete when:

- every existing tool input maps to a canonical Tree Case field or is explicitly tool-local;
- provenance and uncertainty states are defined for all safety-relevant fields;
- cross-tool handoffs have explicit read/write behavior;
- no capability requires the model to fabricate a missing deterministic input;
- representative multi-turn homeowner conversations can move across capabilities without repeating already-known information;
- correction/conflict behavior is covered by planned tests;
- local-only data and rules remain clearly scoped.
