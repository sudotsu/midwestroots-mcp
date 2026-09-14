# Midwest Roots Species — Visual Execution Spec v1

## Purpose

This document defines the visual and interaction execution for the first Midwest Roots homeowner experience: **Species**.

`docs/SPECIES-SCREEN-STATE-WIREFRAME-SPEC.md` translates this authoritative visual system into the required screen anatomy, state transitions, persistent elements, implementation copy, mobile and reduced-motion behavior, and UI guardrails.

Species establishes the shared design language for the Midwest Roots product family, but it does **not** establish a reusable page template for the other capabilities.

The goal is not to create a beautiful questionnaire.

The goal is to create an **interactive field investigation** that visibly develops as the homeowner contributes useful observations.

The user should feel:

> “I’m figuring this tree out.”

Not:

> “I’m filling out a form.”

---

# 1. Core experience

## Primary design thesis

**Discovery, not data entry.**

Every meaningful observation should create a meaningful visible change.

The user should be able to see that their answer affected the investigation.

Possible visible consequences include:

- candidates disappearing;
- candidates moving;
- candidate evidence changing;
- a clue joining the field record;
- a contradiction appearing;
- a new comparison becoming relevant;
- the remaining candidate count changing;
- the next useful observation emerging;
- the investigation reaching a natural stopping point.

A selected answer should never merely enable a **Next** button.

---

# 2. Reward system

The product may feel rewarding, but it must not use artificial gamification.

## The reward is

- understanding;
- visible progress;
- narrowing possibilities;
- revealing relationships;
- resolving uncertainty;
- completing a useful field record.

## Do not use

- XP;
- points;
- streaks;
- badges;
- confetti;
- celebratory explosions;
- fake completion percentages;
- fake confidence percentages;
- “7/8 questions complete” as the main progress language.

A strong clue may receive restrained recognition such as:

**Strong clue · narrowed 7 → 3**

or:

**Useful observation · removed 4 candidates**

That is enough.

---

# 3. Visual character

The visual world should feel like:

**modern field guide + working arborist notebook + polished digital field instrument**

It should not feel like:

- generic AI software;
- a SaaS dashboard;
- a chatbot wrapped in rounded cards;
- a rustic/tree-service website;
- an outdoors-brand catalog;
- fake vintage parchment;
- scrapbook design.

The result should feel deliberately authored by Midwest Roots.

---

# 4. Color system

## Core palette

- **Deep Ink** `#17221C` — primary text, dark structural UI, high-contrast marks.
- **Midwest Pine** `#214D38` — primary brand green.
- **Field Green** `#3F7253` — supporting evidence, lighter interaction state, botanical diagrams.
- **Moss** `#7F9672` — muted botanical support.
- **Lichen** `#C8D3B9` — pale selected/supporting surface.
- **Field Paper** `#F4F0E6` — primary application surface.
- **Specimen Paper** `#FCFAF4` — elevated reading/specimen surface.
- **Bark** `#765B45` — warm structural neutral.
- **Discovery Amber** `#C88A34` — useful discovery/reveal accent.
- **Rust** `#A5573E` — conflict/caution.
- **Deep Red** `#8C302C` — genuine danger/safety states only.

### Discovery Amber rule

Amber should communicate:

**Something useful just changed.**

Examples:

- a strong observation;
- a newly revealed clue;
- a candidate-count transition;
- an annotation appearing;
- a relation between evidence and result.

Do not overuse it.

### Deep Red rule

Do not use Deep Red as a generic error color.

Its scarcity gives it meaning when the Hazard capability eventually uses the shared system.

---

# 5. Color semantics

Color alone must never communicate state.

Every semantic color requires a textual, iconographic, structural, or positional companion.

Examples:

- Green + “Supports”
- Rust + “Conflicts”
- Amber + “Useful clue”
- Muted + “Unknown”
- Red + explicit safety language

---

# 6. Typography

The system should use typography as part of its identity rather than relying on generic app styling.

## Primary UI sans

Preferred direction: **Source Sans 3** or a similarly readable humanist sans.

Use for body text, controls, descriptions, explanatory language, buttons, and prompts.

Avoid Inter as the default primary typeface unless implementation constraints force it.

## Field-guide serif

Preferred direction: **Source Serif 4** or similar sturdy editorial/scientific serif.

Use for species names, major field-record titles, specimen headings, and select high-value explanatory moments.

## Metadata mono

Preferred direction: **IBM Plex Mono** or similar.

Use sparingly for observation IDs, evidence provenance, review/source labels, timestamps, dataset metadata, and small field-record markers.

Example:

`OBS 03 · USER CONFIRMED`

Do not turn the whole interface into a terminal aesthetic.

---

# 7. Shape language

## Do not default to cards

Not every piece of information belongs inside a rounded rectangle.

The Species experience should primarily feel like **one continuous working field surface**.

Use:

- rule lines;
- specimen frames;
- brackets;
- annotation leaders;
- subtle tabs;
- index marks;
- structured whitespace;
- small labels;
- restrained corner treatment.

Candidate content may use **specimen plates** with square or minimally rounded corners, thin borders/rules, strong internal hierarchy, and botanical-reference character.

Avoid giant pills, excessive border radius, floating glass cards, gradient containers, and generic shadow-heavy dashboard blocks.

---

# 8. Texture

Texture should be nearly invisible.

Possible treatments:

- faint paper fiber;
- subtle field-grid lines;
- very light ink irregularity;
- restrained botanical drafting marks.

Approximate perceived strength: **1–2%**.

The user should notice the atmosphere, not the texture itself.

Explicitly avoid woodgrain backgrounds, fake torn paper, tape graphics, coffee stains, scrapbook elements, and faux antique maps.

This is a field instrument, not a moodboard.

---

# 9. Illustration language

Species visual comparisons should feel like **field-guide diagrams**, not icons.

Illustrations should emphasize discriminating features, preserve botanical differences clearly, use consistent stroke/fill language, remain legible at mobile size, and prioritize recognition over decoration.

The existing `SpeciesTraitVisual` vocabulary is the starting point.

Illustration groups include:

- leaf arrangement;
- leaf structure;
- leaf shape;
- bark;
- fruit/seeds;
- crown/form;
- size.

Generated botanical imagery must never be presented as identification evidence.

Real photography may be introduced later where licensing and provenance are appropriate.

---

# 10. Motion principles

Motion exists to communicate consequence.

It should answer:

> “What changed because of what I just did?”

## Primary transition sequence

When a homeowner submits a useful observation:

1. the selected observation visibly settles into the field record;
2. affected candidate evidence updates;
3. incompatible candidates de-emphasize;
4. eliminated candidates collapse or leave;
5. surviving candidates reposition;
6. candidate count updates;
7. the next useful observation emerges.

Target total transition time: approximately **500–700 ms**.

The experience should feel responsive, not theatrical.

## Candidate elimination

Do not instantly delete candidates.

Preferred behavior:

- briefly reduce emphasis;
- show the relationship to the new clue;
- then collapse them out.

## Discovery accent

A restrained amber line, flash, underline, or annotation may briefly connect the submitted clue to the candidate region it affected.

This is one of the product’s signature feedback mechanisms.

## Reduced motion

All important state change must remain understandable with reduced-motion preferences enabled.

Motion can disappear. Meaning cannot.

---

# 11. Species opening state

Small contextual identity:

**MIDWEST ROOTS · FIELD GUIDE**

Preferred main prompt:

**Let’s figure out what you’re looking at.**

Do not lead with “Tree Species Identifier” or “Question 1.”

## Main specimen area

A large central field area establishes the homeowner’s actual tree as the subject of the investigation.

If an uploaded image is available:

- display the homeowner’s tree prominently;
- preserve useful framing;
- allow additional images where appropriate.

If no photo is available, show an intentional empty specimen frame with:

**Add a photo, or start with what you can see.**

Possible understated entry actions:

- **Use my photo**
- **I know a few features**
- **Show me what to photograph**

These are entry routes, not wizard steps.

---

# 12. Evidence annotations

As usable observations become available, they join the visual field record.

Do not represent everything as chips.

Example:

**SIMPLE LEAF**<br>
Observed from photo<br>
✓ usable clue

**ALTERNATE?**<br>
Photo suggests this<br>
Needs confirmation

**FRUIT / SEED**<br>
Not visible<br>
No penalty

Possible evidence states:

- user confirmed;
- image observed;
- provisional;
- conflicted;
- unknown;
- skipped/unavailable.

The user should understand which facts are solid and which are tentative.

---

# 13. Candidate universe

Initial state may show:

**10 trees in this guide**

After usable observations:

**5 still fit what we know**

The candidate count can transition visually when evidence changes.

Do not treat this as a progress percentage. It represents actual narrowing of the bounded guide.

---

# 14. Candidate presentation

Candidates should initially occupy relatively little space.

Avoid immediately rendering ten giant profile cards.

Possible early representation:

- botanical silhouettes;
- names;
- compact specimen tabs;
- small reference rows.

As the candidate universe narrows, remaining candidates can gain detail.

The interface should visually concentrate as certainty increases.

---

# 15. Signature next-clue interaction

Do not say:

**Question 4: What kind of seeds does the tree have?**

Preferred framing:

**One clue would separate these trees fastest.**

Then:

**Look for seeds or fruit.**

Show illustrated specimen comparisons such as:

- **Paired wings** — maple-style paired samaras.
- **Single paddle** — ash-style single samara.
- **Round wafer** — elm-style round winged seed.
- **I can’t see any** — continue without using fruit as evidence.

Each choice includes an illustration, plain-language label, and short recognition description.

---

# 16. Observation selection feedback

When the homeowner selects an observation, the visual should cause an immediate investigation update.

Example:

User selects **Paired wings**.

Then:

- that clue enters the field record;
- incompatible candidates fade/collapse;
- remaining candidates shift;
- supporting evidence updates;
- candidate count changes from 5 to 2;
- an amber annotation briefly appears:

**Strong clue · narrowed 5 → 2**

Then the next useful observation appears.

---

# 17. Dynamic investigation

Species must not have a rigid universal path.

Different cases may unfold differently.

Example A:

photo → leaf arrangement → seed → result

Example B:

photo → bark → leaf shape → contradiction recheck → result

Example C:

manual start → leaf type → unsupported universe → stop

Avoid fixed-step language.

---

# 18. “Not sure” behavior

**Not sure** is not a failure state.

Possible language:

- **I can’t tell**
- **I can’t see this**
- **Not available right now**

The investigation should update around the missing evidence.

The user should never feel punished for uncertainty.

---

# 19. Contradiction experience

Contradiction is an investigation state, not an error dialog.

If two observations conflict, visually bring them into relation.

Example:

**These two observations point in different directions.**

Then show:

Leaf shape → supports maple-like candidates<br>
Bark → conflicts with those candidates

Follow with:

**This check would help most:**

and show a targeted visual comparison.

Contradictory evidence must remain visible. Do not silently discard it or force a winner.

---

# 20. Tie state

If multiple candidates remain equally supported, do not rank one first as though it is more likely.

Use language such as:

**Two trees still fit equally well.**

Show the differentiating evidence.

Then either offer the next useful comparison, explain what photo would help, or stop if the guide cannot responsibly separate them.

---

# 21. Unsupported-universe state

If observations clearly fall outside the bounded guide, do not present this as failure.

Preferred treatment:

**This tree appears to fall outside this 10-tree guide.**

Explain which observation led there.

Example:

**Needles/scales**

The current guide covers ten common Omaha-area deciduous profiles.

Keep useful observations in the Tree Case.

---

# 22. Completed Species field record

When the guide has gone as far as it responsibly can, the investigation resolves into a coherent field record.

Possible structure:

## Homeowner tree
User photo(s)

## Best current match
**Silver Maple**<br>
*Acér saccharinum*

**Best current match · not confirmed**

## Evidence

### Supports
✓ Alternate leaf arrangement<br>
✓ Deep lobes<br>
✓ Paired winged seeds

### Unknown
? Bark not checked

### Conflicts
None currently recorded

## Why it remains
Short deterministic explanation.

## What could change this result
Relevant remaining distinction if one exists.

## Source/profile
Source-backed reference access.

---

# 23. Cross-tool handoff

The completed Species record should naturally lead into the next homeowner need.

Use homeowner language:

- **Something looks wrong with it** → Problem Navigator
- **Can I trim this myself?** → DIY / Professional
- **I’m worried it might be unsafe** → Hazard
- **What might removal cost?** → Cost

The existing Tree Case should carry forward.

Do not restart intake unnecessarily.

---

# 24. Component anatomy

Conceptual components:

- `FieldGuideShell` — main Species working surface.
- `TreeSpecimen` — homeowner photo(s) or empty specimen state.
- `EvidenceAnnotation` — observation, state, origin, relationship to investigation.
- `TraitComparison` — next useful visual distinction and options.
- `CandidateRail` — compact current-candidate representation.
- `CandidateSpecimen` — detailed candidate view.
- `InvestigationChange` — temporary feedback such as “Useful clue · 6 → 3 candidates.”
- `ConflictReview` — targeted contradiction state.
- `SpeciesFieldRecord` — completed investigation result.
- `CaseHandoff` — contextual continuation into another capability.

Component names are conceptual; implementation naming may differ.

---

# 25. Responsive behavior

The experience must be mobile-first because many homeowners will be standing outside beside the tree.

## Mobile

Prefer vertical flow:

specimen → active clue → visual comparison → candidate state

Avoid dense multi-column layouts.

Keep candidate changes close enough to the active observation that the user sees cause and effect.

## Larger surfaces

Use more spatial relationships:

- specimen at center/left;
- annotations surrounding it;
- candidates in a persistent secondary region;
- next comparison entering contextually.

Do not simply stretch mobile cards across desktop width.

---

# 26. Accessibility

Required:

- keyboard-accessible trait selection;
- visible focus states;
- adequate touch targets;
- semantic radio-group behavior where appropriate;
- screen-reader labels for trait illustrations;
- state never communicated by color alone;
- reduced-motion support;
- text fallback for every visual clue;
- minimum readable contrast;
- usable zoom behavior.

The illustrated UI is an enhancement to comprehension, not a barrier to access.

---

# 27. Copy style

Copy should sound like a knowledgeable tree crew helping the homeowner look at the right thing.

Preferred:

- **One clue would separate these trees fastest.**
- **Take another look at how the leaves attach to the twig.**
- **That’s useful — it rules out three trees in this guide.**
- **These two observations disagree. Let’s recheck the leaf shape.**

Avoid:

- **Great job! 🎉**
- **Amazing!**
- **Your analysis is 75% complete.**
- **AI confidence: 87%.**
- **Please proceed to the next step.**

---

# 28. What Species may share with later capabilities

Species establishes:

- typography;
- palette;
- paper/ink atmosphere;
- annotation grammar;
- provenance language;
- illustration quality;
- motion quality;
- accessibility standards;
- evidence-state semantics;
- Midwest Roots visual identity.

---

# 29. What Species must NOT dictate

Other capabilities must not mechanically inherit:

- specimen-sheet layout;
- candidate rails;
- candidate elimination animations;
- botanical cards;
- Species progress representation;
- Species-specific clue mechanics.

Each capability gets its own interaction anatomy.

Species defines the **design DNA**, not the body plan.

---

# 30. Other capability metaphors

These remain locked.

## Tree Problem Navigator
**Observation/evidence board**

Signs, timing, pattern, context, and known tree information form an evolving evidence picture. Plausible categories strengthen, weaken, disappear, or remain. No diagnosis.

## DIY / Professional
**Route/path system**

Facts open and close routes. The homeowner should visually understand why a task remains DIY-friendly, requires review, or encounters a stop condition.

## Hazard
**Sober site situation map**

Tree structure, context, targets, and utility conditions assemble into a serious assessment view. Minimal playful motion. No celebration. No gamification.

## Cost
**Job/site assembly**

Size, access, targets, condition, cleanup, and site context progressively build the project picture from which the planning result emerges.

---

# 31. Explicit anti-patterns

Reject an implementation if it becomes:

- a sequence of generic white cards;
- a chat transcript with buttons;
- a wizard with “Step X of Y”;
- an identical layout reused across every capability;
- giant rounded rectangles for every element;
- excessive gradients;
- gratuitous shadows;
- meaningless animation;
- green everywhere because “trees”;
- AI sparkle icons;
- confidence meters unsupported by the engine;
- decorative nature photography replacing functional visual comparisons;
- a website form squeezed into ChatGPT.

---

# 32. Visual QA questions

Before approving a Species UI PR, ask:

1. Does this feel like an investigation or a form?
2. Does each important input visibly change something?
3. Can the homeowner understand why the candidate set changed?
4. Does uncertainty feel legitimate?
5. Are contradictions visible rather than hidden?
6. Are visual comparisons genuinely useful?
7. Does the result feel like a field record rather than a chatbot answer?
8. Could this plausibly have been designed specifically for Midwest Roots?
9. Does it avoid generic AI/SaaS visual patterns?
10. Would another capability still have room to feel materially different?
11. Is the interaction still understandable without animation?
12. Is the interface useful outdoors on a phone?

If several answers are “no,” the implementation is not finished merely because it functions.

---

# 33. Phase 1 screen-state requirement

Before full Species UI implementation, create and review these states:

1. Empty / no photo
2. Photo-loaded starting investigation
3. Initial extracted clues
4. Multiple candidates remaining
5. Visual next-clue comparison
6. High-value clue submitted
7. Candidate elimination transition
8. “Not sure” route
9. Contradiction / recheck
10. Equal tie
11. Outside-supported-guide
12. Strongest current match
13. Completed Species field record
14. Cross-tool handoff
15. Mobile versions of all critical states
16. Reduced-motion behavior

The required anatomy and behavior for these states are defined in `docs/SPECIES-SCREEN-STATE-WIREFRAME-SPEC.md`.

Do not jump directly from design concept to a finished monolithic component.

---

# 34. Definition of success

The Species experience succeeds when a homeowner can:

- begin naturally with words or photos;
- understand what the system observed;
- correct or confirm important clues;
- visually see the investigation narrow;
- understand why candidates remain or disappear;
- respond to visual comparisons easily;
- say “I don’t know” without breaking the process;
- understand contradictions;
- receive an honest bounded result;
- understand why that result exists;
- continue into another tree-care question without restarting.

And, subjectively but importantly:

**It should feel like something worth opening again just because using it is satisfying.**
