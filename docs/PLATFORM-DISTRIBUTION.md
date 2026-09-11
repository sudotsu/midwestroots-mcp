# ChatGPT Platform & Distribution Strategy

**Reviewed:** 2026-09-11  
**Status:** Planning decision support

## Decision summary

For ordinary homeowners, the primary product should be a **ChatGPT app distributed through a Plugin listing**, with the app built using the **Apps SDK** and backed by **MCP tools**.

MCP is the implementation protocol, not the homeowner-facing product identity.

A standalone Skill is not the primary consumer distribution target for this project.

## Why

OpenAI's current product documentation says:

- the Plugin Directory is the primary discovery surface for workflow capabilities across ChatGPT and Codex;
- a Plugin can package apps, skills, and app templates;
- the Plugin Directory is visible across ChatGPT plans, with actual install/use availability depending on plan, region, role, workspace, surface, and included capabilities;
- the Apps SDK is the recommended way to build app logic and interactive UI that runs inside ChatGPT;
- the Apps SDK is built on MCP;
- Skills are currently available to eligible Business, Enterprise, Healthcare, and Edu users and are primarily reusable workflow packages rather than the broad consumer surface we need.

Current OpenAI references:

- [Apps in ChatGPT](https://help.openai.com/en/articles/11487775-apps-in-chatgpt)
- [Build with the Apps SDK](https://help.openai.com/en/articles/12515353-build-with-the-apps-sdk)
- [Plugins in ChatGPT and Codex](https://help.openai.com/en/articles/20001256/)
- [Skills in ChatGPT](https://help.openai.com/en/articles/20001066-skills-in-chatgpt)

These platform details are time-sensitive and must be rechecked before submission or when a platform-specific architecture decision changes.

## Intended packaging

### User-visible layer

One homeowner-facing Plugin listing representing the Midwest Roots homeowner tree-care product.

The listing should make clear what the homeowner can accomplish rather than advertise protocol terms such as MCP.

### App layer

One ChatGPT app providing the chat-native experience and interactive result UI.

Responsibilities:

- conversational orchestration;
- Tree Case state/context;
- selective follow-up questions;
- interactive cards/results;
- cross-capability navigation;
- clear uncertainty and source presentation.

### MCP layer

One MCP server can expose the internal homeowner capabilities.

Initial conceptual surface:

- `match_species`
- `get_species_profile`
- `navigate_tree_problem`
- `get_problem_guide`
- `route_tree_task`
- `get_diy_guide`
- `screen_tree_hazard`
- `plan_removal_cost`

These names are planning placeholders until schemas are finalized.

There is no product reason to operate five separate MCP servers simply because there are five homeowner tools.

## Authentication posture

The initial homeowner capabilities are based on public/source-backed information and do not inherently require access to a homeowner account or private third-party service.

Therefore, the preferred initial product posture is **no account connection unless a real feature later requires it**.

Do not add authentication merely because the platform supports it. If persistence, saved cases, premium features, or account-specific actions are later approved, authentication can be reconsidered as a separate product decision.

## Skills

A Skill may eventually be useful for a specific reusable workflow or workspace use case, but it is not the initial consumer product.

Do not fork the same homeowner logic into a Skill simply to say the product supports Skills. Shared capability logic should remain in the app/MCP architecture unless a concrete Skill use case justifies packaging it differently.

## Discovery implications

Directory success depends on the product being understandable as one coherent homeowner job, not five implementation primitives.

The listing should lead with homeowner intents such as:

- identify or narrow a tree species;
- make sense of visible tree changes;
- screen reported warning signs;
- decide whether a task belongs in a DIY or professional path;
- plan local removal costs.

The internal orchestration can move between those capabilities without making the homeowner install or understand five separate products.

## Submission implication

OpenAI currently accepts app submissions and emphasizes functionality, safety, privacy, and design quality. Submission requirements and directory terminology are actively evolving.

Before submission, re-verify:

- current Apps SDK version and requirements;
- MCP requirements;
- Plugin/app submission terminology;
- supported authentication modes;
- directory metadata requirements;
- safety/privacy requirements;
- country availability controls;
- testing/review requirements;
- any restrictions affecting homeowner safety-oriented guidance;
- monetization rules if monetization is introduced.

No 2026 platform assumption should be hardcoded permanently into product logic.
