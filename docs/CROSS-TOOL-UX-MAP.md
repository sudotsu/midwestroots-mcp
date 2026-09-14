# Cross-Tool UX Map

**Status:** Approved capability-level direction

All five capabilities implement the interaction philosophy in `docs/UI-DESIGN-THESIS.md`: meaningful observations create meaningful visible feedback, deterministic reasoning remains legible, and the homeowner gains clarity through the interaction. Each capability expresses that philosophy through a different metaphor suited to its job.

## Species

**Metaphor:** Interactive field guide / specimen investigation.

- Clues accumulate.
- Candidates narrow.
- Comparisons are visual when the observation is visual.
- The path changes with the remaining canonical candidates.
- The completed result becomes a field-guide/specimen entry.

Species is the first/reference UX implementation. `docs/SPECIES-UX-BLUEPRINT.md` defines its experience and behavior, `docs/SPECIES-VISUAL-EXECUTION-SPEC.md` defines its authoritative visual system, and `docs/SPECIES-SCREEN-STATE-WIREFRAME-SPEC.md` defines its required implementation states and transitions. These Species-specific documents do not establish a reusable page template for the other capabilities.

## Tree Problem Navigator

**Metaphor:** Observation/evidence board.

- Reported signs, timeline, context, pattern, and known species appear as observations.
- Plausible categories emerge, weaken, disappear, or remain as evidence changes.
- The interface explains why each category remains plausible.
- The next prompt asks for an observation that can materially distinguish the remaining categories.
- The result never implies diagnosis.

This capability must not mechanically clone the Species candidate-card experience.

## DIY / Professional

**Metaphor:** Route/path selection.

- Homeowner facts open and close possible routes.
- The interface explains why a task remains plausibly DIY-friendly, requires review, reaches a safety stop, or redirects into another capability.
- Stop conditions appear as clearly closed paths rather than failed quiz answers.
- A route change is visible when a new fact changes the deterministic result.

This capability must not use a Species-style specimen sheet.

## Hazard Screening

**Metaphor:** Sober tree/site situation map.

- Trunk/roots, crown/branches, recent context, targets, and utility context form a concise visual picture of the reported situation.
- The interface shows which reported observations drive Monitor, On-Site Review, Prompt Review, or Keep Clear.
- Motion is restrained and used only to clarify state or first-action changes.
- Danger is never celebrated, gamified, or made entertaining.
- Utility routing changes the first action without creating a fifth severity category.

The electrical-routing presentation follows the canonical website policy:

- nearby or uncertain lines: pause work; Midwest Roots reviews;
- apparent contact: stay clear; Midwest Roots reviews utility coordination;
- downed wire, arcing, or fire: utility/emergency first.

Hazard must not inherit playful discovery mechanics merely for visual consistency.

## Cost Planner

**Metaphor:** Assembling the job/site profile.

- Height, access, targets, condition, cleanup, and site factors progressively form a visible project picture.
- The homeowner can see which factors move planning toward simpler or more complex work.
- A price or range emerges from assembled, approved local context rather than arbitrary form completion.
- When utility, safety, or site-review conditions suppress online pricing, the interface explains why.

This capability must not become another Species questionnaire. Refreshed local pricing approval remains a release gate before Cost launches.

## Shared design system

These elements remain shared across all capabilities:

- Midwest Roots visual identity;
- typography and color family;
- illustration language;
- annotation conventions;
- accessibility behavior;
- evidence and provenance semantics;
- motion principles;
- Tree Case continuity;
- interaction quality;
- authored, non-generic character.

## Capability-specific design

Each capability defines its own:

- metaphor;
- information architecture;
- layout;
- progress representation;
- interaction mechanics;
- result presentation;
- tone and motion intensity.

The shared system creates family resemblance. The capability-specific system prevents the product from feeling like the same tool repeated five times.

## Cross-tool continuity

Moving between capabilities should preserve relevant Tree Case evidence and make the handoff understandable. The destination capability reinterprets shared evidence within its own metaphor; it does not restart intake or visually carry over a layout that does not fit the new job.

When a handoff changes the first action because of safety or utility context, that change must be visible and sober. When a handoff only adds context, the interface should show the carried observations without implying that one capability's conclusion proves another's.
