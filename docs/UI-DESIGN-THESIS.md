# Midwest Roots UI Design Thesis

**Status:** Approved product-level direction

## Core thesis

**Midwest Roots should feel like an interactive field investigation, not an AI form.**

The core interaction principle is: **It should feel like discovery, not data entry.**

The primary feedback principle is: **Every meaningful input should produce meaningful visible feedback.**

The homeowner's reward is greater clarity: visible progress, narrower possibilities, revealed relationships, or better understanding. The product does not manufacture engagement through artificial game mechanics.

## Interaction principles

### Make each observation consequential

The interface should show what changed after a meaningful input. Depending on the capability, that may mean a candidate disappears, a route closes, evidence conflicts, a category remains plausible, a site factor changes the planning result, or the next useful question changes.

“Not sure,” “cannot observe,” and unknown are valid evidence states. They are not failed answers and must not be styled as mistakes.

### Make deterministic reasoning legible

The interface should expose enough of the tool's reasoning for a homeowner to understand why candidates or routes remain, disappear, or conflict. It must not imply that the model magically knows the answer.

Dynamic paths are preferable to fixed questionnaires when the deterministic engine can identify the next observation with real decision value. Progress should be represented through the developing investigation and its state, rather than dominated by step counts or percentage completion.

### Use motion to explain change

Motion may draw attention to a candidate leaving, evidence joining the case, a route closing, or a result changing. It should clarify cause and effect, respect reduced-motion preferences, and never exist only as decoration.

### Author a recognizable Midwest Roots system

Typography, illustration, shape language, spacing, texture, copy, and interaction should feel deliberately authored by Midwest Roots. The visual language may draw from a modern field guide, naturalist notebook, specimen reference, or field-work documentation system while retaining contemporary clarity and usability. It should avoid nostalgic imitation.

The complete experience must remain understandable in text-only and fallback conditions. Meaning must not depend only on imagery, animation, position, or color.

## Explicitly rejected patterns

The product must not default to:

- a generic AI or SaaS appearance;
- a repeated “write here → next → result” pattern;
- identical form or card layouts across all five capabilities;
- progress dominated by “Step 2 of 8” or percentage completion;
- fake confidence percentages;
- points, XP, streaks, badges, confetti, or completion for its own sake;
- generic rounded cards, gradients, and icons without a deliberate visual system;
- playful reward treatment around safety-critical Hazard outcomes.

## One philosophy, five expressions

All five capabilities share the same interaction philosophy, evidence semantics, visual authorship, accessibility bar, and Tree Case continuity. They must not simply copy the Species UI.

Each capability receives a visual metaphor, information architecture, interaction pattern, progress model, result presentation, and motion intensity appropriate to its job. The product should feel like one family without feeling like the same tool five times.

The approved capability expressions are defined in `docs/CROSS-TOOL-UX-MAP.md`. Species is the first/reference implementation and is defined in `docs/SPECIES-UX-BLUEPRINT.md`.

## Product-level acceptance criteria

A capability's UI direction is successful when:

- meaningful inputs create understandable visible changes;
- evidence provenance and uncertainty remain visible where they affect interpretation;
- the homeowner can tell why the result or route changed;
- “not sure” remains a normal path;
- the interaction follows engine state rather than a cosmetic questionnaire sequence;
- the capability uses its approved metaphor instead of cloning another tool;
- safety-critical outcomes use an appropriate tone;
- keyboard, touch, color-independent, reduced-motion, and text fallback behavior preserve the task;
- the result looks and reads like a Midwest Roots product rather than a generic generated interface.

## Implementation choices still open

This thesis locks the product direction, interaction principles, and capability boundaries. The exact production typography, palette tokens, shape language, texture treatment, illustration finish, and motion timings remain to be designed in the Species vertical slice. Midwest Roots/AJ must approve that practical visual execution before it becomes the shared production system.

Platform-specific layout adaptations may be resolved during implementation when they preserve this contract. A proposed adaptation that materially weakens the visible-feedback, accessibility, fallback, or capability-metaphor requirements requires an explicit product decision.
