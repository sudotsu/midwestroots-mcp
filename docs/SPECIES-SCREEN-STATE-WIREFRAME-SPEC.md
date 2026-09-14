# Midwest Roots Species — Screen-State & Wireframe Spec v1

**Status:** Implementation-ready design specification<br>
**Capability:** Species Matching Guide<br>
**Scope:** Phase 1 illustrated in-chat Species UI<br>
**Companion authority:** `docs/SPECIES-VISUAL-EXECUTION-SPEC.md`

## Purpose

This document converts the 16 required states in the Species visual execution spec into a concrete screen-state blueprint. It defines what appears, where it appears, what persists, what changes after input, how motion explains that change, what the interface says, and how the experience behaves on mobile and with reduced motion.

The intended experience is an interactive field investigation around the homeowner's tree. The interface must visualize the canonical deterministic matcher; it must not create an independent ranking, confidence, or question sequence.

This document does not define application code, component APIs, framework choices, or final pixel measurements. Those decisions may be made during implementation only when they preserve the anatomy and behavior specified here.

## Document authority

The Species design documents have separate roles:

- `docs/UI-DESIGN-THESIS.md` defines the product-wide philosophy.
- `docs/CROSS-TOOL-UX-MAP.md` defines how each capability expresses that philosophy.
- `docs/SPECIES-UX-BLUEPRINT.md` defines the Species experience and behavior.
- `docs/SPECIES-VISUAL-EXECUTION-SPEC.md` defines the authoritative Species visual system.
- This document defines the required Species screens, transitions, responsive behavior, and implementation guardrails.

If this document conflicts with canonical matcher behavior, the matcher wins and this document must be corrected. If it conflicts with the visual execution spec, the visual execution spec wins unless the product owner explicitly approves a revision.

## Experience contract

Every meaningful input must make its effect understandable. Depending on the input, the homeowner should see evidence join the field record, candidate evidence change, candidates leave or reposition, a contradiction surface, the candidate count change, or a new useful comparison appear.

The UI must preserve these truths in every state:

- The guide is bounded to its approved candidate universe.
- Candidate order does not imply probability.
- A strongest current match is provisional and is not a confirmed identification.
- Ties remain ties.
- Ordinary no-match remains distinct from an outside-supported-universe result; neither outcome invents a candidate.
- Conflicts remain visible.
- Image-derived observations show their provenance and may remain provisional.
- Unknown, skipped, unavailable, and not observable are valid evidence states.
- The interface stops when another observation will not materially improve separation.
- The Tree Case carries useful evidence into later capabilities without proving diagnosis, work need, hazard, or cost.

## Shared screen anatomy

All states are composed on one continuous field surface. Rule lines, specimen frames, annotations, index marks, and structured whitespace establish hierarchy. Repeated floating cards are not the page model.

### Large surface anatomy

```text
┌──────────────────────────────────────────────────────────────────────────┐
│ MIDWEST ROOTS · FIELD GUIDE                              Case controls    │ A
├──────────────────────────────────────────────────────────────────────────┤
│ Investigation prompt / state explanation / temporary change message      │ B
├──────────────────────────────────────┬───────────────────────────────────┤
│                                      │ Candidate universe                │
│ Homeowner tree specimen              │ count + compact candidate rail    │ C
│ photo or intentional empty frame     │                                   │
│                                      ├───────────────────────────────────┤
│ evidence annotations attach here     │ Active clue / visual comparison   │ D
│ without covering the specimen        │                                   │
├──────────────────────────────────────┴───────────────────────────────────┤
│ Developing field record / evidence ledger / completion actions           │ E
└──────────────────────────────────────────────────────────────────────────┘
```

The zones are behavioral, not rigid columns:

- **A — Identity and case continuity:** small product identity, case continuity, and only necessary controls. No wizard progress.
- **B — Investigation voice:** the current prompt, bounded-state explanation, contradiction message, or concise cause-and-effect feedback.
- **C — Specimen and candidate relationship:** the homeowner's tree remains the subject; the candidate universe shows what still fits the canonical evidence.
- **D — Active observation:** the one comparison or check with the highest current decision value.
- **E — Field record:** evidence accumulates with provenance and state, then becomes the completed record.

### Mobile anatomy

```text
┌────────────────────────────────┐
│ MIDWEST ROOTS · FIELD GUIDE    │ A
├────────────────────────────────┤
│ Prompt / change explanation    │ B
├────────────────────────────────┤
│ Homeowner tree specimen        │ C1
├────────────────────────────────┤
│ Current evidence annotations   │ E1
├────────────────────────────────┤
│ Active clue / comparison       │ D
├────────────────────────────────┤
│ Candidate count + rail         │ C2
├────────────────────────────────┤
│ Field record / next action     │ E2
└────────────────────────────────┘
```

Mobile uses a single reading order. The active clue and its visible consequence must remain close enough that a homeowner can connect them without remembering a prior screen. The candidate rail may become a horizontal, keyboard-operable list, but no essential explanation may exist only off-screen.

## Persistent elements and continuity

The following elements persist whenever their underlying information remains relevant:

- the `MIDWEST ROOTS · FIELD GUIDE` identity;
- the homeowner specimen or intentional no-photo frame;
- accepted and unresolved evidence annotations;
- evidence provenance and certainty state;
- the bounded candidate count;
- all candidates still returned by the canonical matcher;
- visible conflicts, unknowns, and skipped observations;
- the current Tree Case context.

Persistence does not require every element to remain fully expanded. A prior comparison may condense into an evidence annotation. A candidate may gain detail as the field narrows. Important evidence must never vanish merely to simplify the layout.

### Active-tree boundary

Every visible Species observation, image, annotation, candidate result, and completed record belongs to the current Tree Case `activeTreeId`. Evidence from an adjacent or newly introduced tree must never merge silently into the active tree. When the homeowner changes which tree they are discussing, the orchestration layer must switch to or create the appropriate tree context before accepting new Species evidence.

### Global shared-safety interruption

The shared safety route has precedence and may interrupt any Species state without becoming another numbered Species screen. The interruption preserves the current Species investigation, its `activeTreeId`, all collected Species evidence, and the surrounding Tree Case. It shows the first action from the canonical shared utility/safety policy:

- nearby or uncertain lines: pause work; Midwest Roots reviews;
- apparent contact: stay clear; Midwest Roots reviews utility coordination;
- downed wire, arcing, or fire: utility/emergency first.

Species must not ask the homeowner to collect an observation through unsafe approach, climbing, entering a fall zone, or approaching utility lines. Species matching does not invent or modify hazard severity, and safety observations do not affect Species candidate ranking. Resume the preserved Species investigation only when appropriate after the shared safety route.

## State transition sequence

```text
Empty / no photo
   ├── add photo ──> Photo-loaded start ──> Initial extracted clues
   └── manual route ─────────────────────> Multiple candidates remaining

Multiple candidates remaining
   └── nextObservation ──> Visual next-clue comparison
                              ├── useful choice ──> High-value clue submitted
                              │                       └── Candidate elimination
                              │                              └── repeat or resolve
                              └── cannot observe ──> Not sure route

Any evidence update
   ├── conflicting evidence ──> Contradiction / recheck
   ├── equally supported set ──> Equal tie
   ├── outside candidate set ──> Outside supported guide
   ├── ordinary no-match + useful recheck ──> Contradiction / recheck
   ├── ordinary no-match + no useful recheck ──> Completed Species field record
   └── one strongest survivor ─> Strongest current match

Strongest match / tie / outside guide / ordinary no-match / responsible stop
   └── Completed Species field record ──> Cross-tool handoff
```

The canonical matcher determines which branch applies. The UI does not force every case through every state.

## State 1 Empty or no photo

### Entry condition

No usable photo and no normalized Species observations are present in the Tree Case.

### Layout anatomy

```text
[small identity]

Let's figure out what you're looking at.

┌──────────────────────────────────────────┐
│                                          │
│       intentional specimen frame         │
│       Add a photo, or start with          │
│       what you can see.                   │
│                                          │
└──────────────────────────────────────────┘

Use my photo     I know a few features
Show me what to photograph

10 trees in this guide
```

The specimen frame dominates the surface. Entry actions sit directly beneath or beside it as routes into the same investigation, not as three promotional cards.

### Persistent elements

- Product identity.
- Intentional specimen frame.
- Bounded-guide context.
- Any non-Species Tree Case context that is relevant but does not yet establish a Species clue.

### State changes

- **Use my photo** opens or invokes the host-supported photo route. A selected image enters State 2.
- **I know a few features** reveals the highest-value safe manual comparison supported at an empty evidence state. It does not open a fixed questionnaire.
- **Show me what to photograph** gives concise, safe photo guidance while keeping the specimen frame present.
- Natural-language evidence already supplied by the homeowner is normalized and may move directly to State 4.

### Motion

- On entry, use only a restrained specimen-frame reveal or no motion.
- When a route is chosen, the selected label settles into place while the next relevant surface enters nearby.
- Do not animate a progress bar, completion ring, or decorative botanical flourish.

### Required copy

- `MIDWEST ROOTS · FIELD GUIDE`
- `Let's figure out what you're looking at.`
- `Add a photo, or start with what you can see.`
- `Use my photo`
- `I know a few features`
- `Show me what to photograph`
- `10 trees in this guide`, using the actual approved dataset count if it changes.

Photo guidance must prohibit climbing, breaking branches, entering a fall zone, or approaching utility lines.

### Mobile behavior

The specimen frame appears immediately after the prompt and should fit within the first useful viewport with at least one entry action. Stack actions vertically with adequate touch targets. Do not place three narrow buttons in one row.

### Reduced-motion behavior

The next surface appears without spatial movement. Focus moves to its heading. The selected route remains marked in text.

### Guardrails

- Do not label this `Question 1`, `Step 1`, or `Tree Species Identifier`.
- Do not require a photo.
- Do not imply that image upload alone identifies the tree.
- Do not show ten large candidate plates before evidence exists.

## State 2 Photo-loaded starting investigation

### Entry condition

At least one homeowner image is available, but extracted observations have not yet been accepted into the deterministic match request.

### Layout anatomy

The homeowner photo replaces the empty specimen frame and remains the visual center. A small source marker such as `HOMEOWNER PHOTO · 1 OF 2` appears outside the image. A short status line sits near the specimen: `Looking for usable features in this photo.` The bounded candidate rail remains compact and neutral because no canonical narrowing has occurred yet.

If multiple photos exist, show one primary image and a simple thumbnail or index strip. Preserve the homeowner's framing and avoid decorative cropping that removes leaves, twig attachment, bark, seeds, or overall form.

### Persistent elements

- Product identity.
- Bounded-guide context.
- All supplied photos.
- Any previously normalized manual evidence.

### State changes

- Image interpretation creates proposed evidence, never a Species result.
- On completion, usable and provisional observations attach to the specimen and the experience moves to State 3.
- If no usable traits can be observed, keep the photo and present a manual or better-photo route without treating the image as a failed submission.

### Motion

- The photo may settle into the specimen frame with a short opacity and scale adjustment.
- Do not use a theatrical scan line, AI sparkle, pulsing analysis loop, or indefinite animation.
- A bounded loading indication may appear only while actual interpretation is pending.

### Required copy

- `Looking for usable features in this photo.`
- If no features are usable: `I can't confirm a useful feature from this photo yet.`
- Follow-up: `Try a closer leaf-and-twig photo, or start with what you can see.`

### Mobile behavior

Use an aspect ratio that makes the photo useful without pushing all actions beyond several viewports. Provide a clear full-image view. The photo index, replace/add-photo controls, and source label must remain keyboard and touch accessible.

### Reduced-motion behavior

Replace the settling animation with an immediate framed image and a static status line. Loading completion is announced through text and live-region semantics, not motion.

### Guardrails

- Generated imagery must never replace or augment the homeowner photo as evidence.
- Do not claim a species before the deterministic matcher runs.
- Do not hide image limitations.
- Do not discard the photo when the next observation appears.

## State 3 Initial extracted clues

### Entry condition

The model or host has proposed one or more traits from a homeowner photo. Each trait has an explicit provenance and evidence state.

### Layout anatomy

Annotations connect the proposed observations to the specimen without covering useful image regions. Confirmed usable clues use stable supporting treatment. Provisional clues use a question marker and a nearby confirmation action. Unavailable traits appear quietly and do not compete with useful evidence.

```text
                    SIMPLE LEAF
                    Observed from photo
[homeowner photo] ── usable clue
        │
        └─────────── ALTERNATE?
                    Photo suggests this
                    Needs confirmation

FRUIT / SEED
Not visible · No penalty
```

The first canonical candidate result may appear in a compact rail only after usable normalized evidence has been submitted to `match_species`.

### Persistent elements

- Photo and source marker.
- All proposed observations.
- Existing evidence confirmed by the homeowner, with its original origin/reference retained.
- Candidate universe before and after the canonical match.

### State changes

- Confirming a proposed image clue retains its historical `image_observed` origin/reference, changes its evidence state to `confirmed-by-user`, and reruns the matcher. Confirmation means the homeowner confirmed their observation or report; it is not professional verification of the botanical fact.
- Correcting a proposed clue creates `user_stated` evidence that supersedes the earlier image extraction for current matching while preserving the prior extraction and correction history in the Tree Case.
- Rejecting a proposed clue removes it from usable match evidence but keeps the unresolved trait available if it remains decision-relevant.
- `I can't tell` records an unknown or unavailable state and lets the matcher choose around it.

### Motion

- New annotations draw or fade in from the specimen toward the label.
- Confirmation changes the annotation from provisional to stable before candidate changes begin.
- Keep all annotation motion subordinate to the evidence meaning.

### Required copy

- `Here's what the photo may show.`
- `Observed from photo`
- `Photo suggests this`
- `Needs confirmation`
- `Confirm`
- `Confirmed by you`
- `Change this`
- `I can't tell`
- `Not visible · No penalty`

### Mobile behavior

Do not draw long crossing leader lines over a narrow photo. Place numbered or keyed markers on the image and list the corresponding annotations directly beneath it. Confirmation controls stay with the relevant annotation.

### Reduced-motion behavior

Annotations appear together in reading order. A text status reports how many usable and provisional observations were found. Confirmation updates the label immediately and moves focus to the candidate change summary.

### Guardrails

- Image-derived evidence cannot silently become `confirmed-by-user`, and homeowner confirmation must not erase its `image_observed` origin/reference.
- Color cannot distinguish confirmed from provisional by itself.
- Do not render evidence as an undifferentiated chip cloud.
- Do not run the matcher on display labels that have not been normalized and validated.

## State 4 Multiple candidates remaining

### Entry condition

The canonical matcher returns more than one candidate and may return a useful `nextObservation`.

### Layout anatomy

The specimen stays prominent. The candidate rail occupies a persistent secondary region and reports the real bounded count, such as `5 still fit what we know`. Candidates appear as compact specimen tabs, silhouettes, or reference rows. Each shows common name and a plain state label such as `Still fits`; it does not show a percentage or score.

The evidence ledger remains visible in condensed form. Candidate details expand only enough to show why the candidate remains and which known clue matters most. Equal candidates receive equal visual weight.

### Persistent elements

- Specimen and photo source.
- Evidence annotations and provenance.
- Candidate count.
- Every canonical surviving candidate.
- Visible conflicts and unknowns.

### State changes

- If `nextObservation` can materially separate candidates, State 5 enters adjacent to the rail.
- If no useful separation remains, route to State 10 or State 13 as the canonical result requires.
- A homeowner correction reruns the matcher and may restore previously eliminated candidates if the canonical engine returns them.

### Motion

- Candidate positions may settle into a stable order, but order cannot imply confidence.
- Newly expanded evidence uses restrained emphasis.
- No candidate leaves without an evidence-related explanation.

### Required copy

- `[n] still fit what we know`
- `Still fits`
- `Why it remains`
- `One clue would separate these trees fastest.`, only when the matcher returns a useful next observation.

### Mobile behavior

Place the count before the candidate rail. Use compact rows or a horizontal rail with a visible position indicator and non-swipe controls. The active clue follows immediately after the candidate summary or uses a sticky jump link labeled `Compare the next clue`. Do not make the homeowner inspect every candidate before continuing.

### Reduced-motion behavior

Candidate changes occur as a list update followed by a concise summary such as `5 trees still fit what we know`. Restored, added, or removed candidates are named in text when the update would otherwise be unclear.

### Guardrails

- Do not label the first candidate `Most likely` unless the canonical result explicitly supports a single strongest match.
- Do not expose raw matcher scores as probabilities.
- Do not inflate compact candidates into ten full dashboard cards.
- Do not hide why a candidate remains.

## State 5 Visual next-clue comparison

### Entry condition

The canonical matcher returns a `nextObservation` that can materially distinguish the remaining candidates.

### Layout anatomy

The comparison enters in the active-clue region while the specimen, evidence, and candidate count remain visible. It contains one clear purpose statement, one safe observation instruction, and an illustrated radio-group-style set of mutually exclusive choices.

```text
One clue would separate these trees fastest.
Look for seeds or fruit.

┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ illustration │ │ illustration │ │ illustration │
│ Paired wings │ │ Single paddle│ │ Round wafer  │
│ short cue    │ │ short cue    │ │ short cue    │
└──────────────┘ └──────────────┘ └──────────────┘

I can't see any
```

The choices are specimen comparisons, not generic icon cards. Labels and descriptions carry the same recognition value as the images.

### Persistent elements

- Current specimen.
- Evidence ledger.
- Candidate count and compact candidate rail.
- Any unresolved conflict that affects the comparison.

### State changes

- Selecting a concrete observation enters State 6 immediately; no separate `Next` action is required.
- Choosing `I can't see any`, `I can't tell`, or `Not available right now` enters State 8.
- Leaving the comparison does not erase prior evidence.

### Motion

- The comparison appears from the spatial relationship between the candidates it can separate, when the layout permits.
- Hover motion is optional and never the only selection cue.
- The chosen option settles into a selected state before its consequences animate.

### Required copy

- `One clue would separate these trees fastest.`
- A direct observation instruction such as `Look for seeds or fruit.`
- Plain-language option labels and one short recognition cue for each.
- A valid unavailable option appropriate to the trait.

### Mobile behavior

Use one or two options per row only when illustrations remain legible; otherwise stack them. Each option is a complete touch target with a visible focus/selected state. Keep the unavailable option visually equal as a legitimate route, not as a faint text link.

### Reduced-motion behavior

The comparison appears in document order with no entrance motion. Selection is conveyed through border, icon, label, and announced checked state.

### Guardrails

- Do not use `Question 4`, a step number, or a completion percentage.
- Do not ask for evidence the matcher says has no material separation value.
- Do not direct unsafe observation collection.
- Do not rely on botanical images without labels and text descriptions.

## State 6 High-value clue submitted

### Entry condition

The homeowner has selected a usable observation that materially changes the canonical candidate state. The selection has been normalized and accepted, but the visible consequence sequence has not completed.

### Layout anatomy

The selected comparison condenses into a new evidence annotation near the specimen. The original choice remains visibly selected long enough to preserve cause and effect. A temporary `InvestigationChange` message appears between the new clue and the candidate region.

Example:

```text
PAIRED WINGS
User confirmed · usable clue

Strong clue · narrowed 5 → 2
```

The before and after counts must come from canonical matcher results. If the observation is useful but does not eliminate candidates, explain the actual effect rather than manufacturing a narrowing claim.

### Persistent elements

- Selected comparison value.
- New evidence annotation and provenance.
- Pre-update candidate arrangement until the transition begins.
- All prior evidence.

### State changes

- The evidence ledger updates first.
- Candidate evidence relationships update second.
- State 7 begins only when candidates will actually be removed or repositioned.
- If the candidate set does not change, show the changed evidence relationship or next observation and return to State 4 or 5.

### Motion

- Target sequence portion: roughly 100–200 ms within the full 500–700 ms response.
- The selected option settles into the field record.
- A restrained amber leader, underline, or flash may connect the clue to the affected candidate region.
- Amber communicates a useful change; it is not a celebration.

### Required copy

- `Strong clue · narrowed [before] → [after]`, when true.
- `Useful observation · removed [n] candidates`, when true and clearer.
- If no elimination occurs: `Useful observation · updated the evidence for these trees.`

### Mobile behavior

Keep the new evidence annotation and change message immediately above the candidate update. If the prior selected option scrolls away, retain its label in the annotation so the cause remains clear.

### Reduced-motion behavior

Insert the evidence annotation and change summary immediately. Announce the update once. Do not simulate the transition with flashing or rapid color changes.

### Guardrails

- Never display invented candidate counts.
- Never use `Great job`, `Amazing`, confetti, points, or badges.
- Never use amber for every selection; reserve it for a useful state change.
- Never make a selected option merely enable `Next`.

## State 7 Candidate elimination transition

### Entry condition

The canonical matcher returns fewer candidates after a submitted observation.

### Layout anatomy

The candidate rail remains in place while each affected candidate briefly exposes its relationship to the new clue. Incompatible candidates de-emphasize, show a concise conflict reason, then collapse or leave. Survivors reposition and may gain detail. The candidate count changes only as the visible set changes.

```text
New clue: Paired wings

Silver Maple       Still fits · supports paired wings
Green Ash          Conflicts · fruit form points elsewhere  ↓ leaves
American Elm       Conflicts · fruit form points elsewhere  ↓ leaves

5 still fit what we know  →  2 still fit what we know
```

### Persistent elements

- New clue and its provenance.
- Surviving candidates.
- Conflict reason for departing candidates long enough to understand the change.
- Prior conflicts and unknowns unrelated to the elimination.

### State changes

- Departing candidates cease to occupy active candidate positions only after the conflict relationship is visible.
- Survivors update their support/conflict ledger.
- The new canonical count replaces the old count.
- The next useful observation appears, or the investigation resolves to State 10, 12, or 13.

### Motion

- Target full response from selection through next prompt: approximately 500–700 ms.
- De-emphasize incompatible candidates before collapse.
- Preserve spatial continuity when survivors move.
- Do not stagger ten items into a theatrical sequence.
- If candidates are restored after a correction, use the reverse semantic pattern: name the correction, restore the candidates, and state why they fit again.

### Required copy

- Each departing candidate receives a reason tied to the new observation.
- Updated count: `[n] still fit what we know`.
- Temporary summary from State 6 may persist until the next clue is ready.

### Mobile behavior

Do not animate items out above the homeowner's current viewport without explanation. Keep the change summary sticky within the transition region until acknowledged by scroll or until the next prompt receives focus. Compact departed candidates into a short `Ruled out by this clue` disclosure after the transition so the reasoning remains reviewable.

### Reduced-motion behavior

Replace movement and collapse with an atomic list update. Show a persistent textual change log naming removed candidates and the reason. Move focus to the updated count or next-state heading, not to the top of the app.

### Guardrails

- Do not instantly delete candidates.
- Do not imply elimination confirms identification.
- Do not hide eliminated-candidate reasoning after motion ends.
- Do not let animation order imply ranking.

## State 8 Not sure route

### Entry condition

The homeowner cannot observe, cannot distinguish, or does not currently have access to the requested trait.

### Layout anatomy

The unavailable choice condenses into the evidence ledger with an explicit state such as `Not visible`, `Unknown`, or `Skipped for now`. The comparison does not turn red and does not show a failure icon. The candidate rail remains unchanged unless canonical handling of missing evidence changes the next observation.

The next highest-value observable clue appears with a short explanation, or the investigation stops responsibly if no useful alternative remains.

### Persistent elements

- The unanswered trait and its unavailable state.
- All candidates that still fit.
- All prior usable and conflicting evidence.
- The specimen and photo.

### State changes

- The matcher receives the approved unknown/skipped representation when applicable.
- The current trait is not treated as negative evidence.
- A different `nextObservation` may replace the unavailable comparison.
- The homeowner can revisit the skipped trait later without restarting.

### Motion

- The unavailable option settles quietly into the ledger.
- The next comparison replaces the current one without error shake, red flash, or penalty animation.

### Required copy

- `I can't tell`
- `I can't see this`
- `Not available right now`
- `No problem. We'll use another clue.` when another useful clue exists.
- `This guide can't separate the remaining trees without that observation.` when the investigation must stop.

### Mobile behavior

Place the acknowledgement and next clue in the same region. Do not send the homeowner back to the top or open a modal. Keep the skipped clue reviewable in the field record.

### Reduced-motion behavior

Update the evidence label and next prompt immediately. Announce that the missing observation did not count against any candidate.

### Guardrails

- Unknown is not a mismatch.
- Do not pressure the homeowner to obtain unsafe evidence.
- Do not repeatedly ask for the same unavailable trait unless the homeowner explicitly revisits it.
- Do not use punitive copy or error styling.

## State 9 Contradiction or recheck

### Entry condition

Two or more observations point in materially different directions, and the canonical matcher identifies a targeted recheck that may improve the result.

### Layout anatomy

The conflicting annotations move into a shared review region while remaining connected to the specimen and evidence ledger. Each clue names its provenance and relationship to the candidates. The targeted comparison appears directly beneath the explanation.

```text
These two observations point in different directions.

LEAF SHAPE                         BARK
User confirmed                    Observed from photo
Supports maple-like candidates    Conflicts with those candidates

This check would help most:
[targeted illustrated comparison]
```

The candidate rail remains visible but secondary. No candidate is declared the winner while the conflict is unresolved.

### Persistent elements

- Every conflicting observation.
- Provenance for each conflict.
- Candidates affected by the conflict.
- Unrelated supporting and unknown evidence.

### State changes

- Reconfirming an observation updates its evidence state and reruns the matcher.
- Correcting an observation preserves the fact of correction and recomputes the candidate set.
- Choosing `I can't tell` leaves the contradiction visible and allows a different clue or responsible stop.
- If the conflict cannot be resolved, it remains in the final field record.

### Motion

- Conflicting clues may draw toward the review region over a restrained transition.
- A rust line or bracket may establish their relationship.
- No shaking, alarm pulse, destructive red, or error-dialog entrance.

### Required copy

- `These two observations point in different directions.`
- `[clue] supports [candidate group].`
- `[clue] conflicts with [candidate group].`
- `This check would help most:`
- `Take another look at [specific safe feature].`

### Mobile behavior

Stack the two clues with a clear `conflicts with` relationship between them. Do not rely on side-by-side position. Place the targeted comparison immediately after the pair. Keep a `Review all evidence` route available.

### Reduced-motion behavior

Render the review region in place and announce the contradiction heading. Use labels, icons, and border treatment to express the relationship. Focus moves to the targeted comparison heading.

### Guardrails

- Do not silently discard either observation.
- Do not automatically privilege user or image evidence without canonical evidence rules.
- Do not present contradiction as a system error or a homeowner mistake.
- Do not force a winner to avoid an unresolved state.

## State 10 Equal tie

### Entry condition

The canonical result contains two or more equally supported candidates, and their ordering must not imply a stronger match.

### Layout anatomy

Tied candidate plates receive equal dimensions, hierarchy, and visual emphasis. A shared heading spans the group. The distinguishing evidence appears as a comparison below or between the tied candidates. Shared supporting evidence is shown once; candidate-specific conflicts and unknowns remain attached to the correct candidate.

### Persistent elements

- All tied candidates in canonical neutral order.
- Shared and candidate-specific evidence.
- Unresolved conflicts and unknowns.
- Specimen and photo.

### State changes

- If another observation can separate the tie, offer it through State 5.
- If a particular photo would help, state exactly what to photograph and why, within safety boundaries.
- If the guide cannot responsibly separate the tie, stop and carry the tie into State 13.

### Motion

- Tied candidates align to equal visual weight.
- Do not animate one into a leading position.
- A differentiating clue may receive restrained amber emphasis only when it is newly useful.

### Required copy

- `Two trees still fit equally well.`, adjusted for the actual count.
- `This would help separate them:` when another useful clue exists.
- `This guide can't responsibly separate these trees with the evidence available.` when stopping.

### Mobile behavior

Stack tied candidates with an explicit `Equal current fit` label repeated on each. Do not use a carousel whose first item appears preferred. Show a compact comparison table or repeated evidence rows only when it remains readable at zoom.

### Reduced-motion behavior

No reordering animation. The equal-tie heading and labels provide the complete meaning. Any change from a single leader to a tie is named in text.

### Guardrails

- Do not break ties through arbitrary order, visual size, color intensity, or unsupported scores.
- Do not use `runner-up` or `second most likely`.
- Do not hide a tie in a disclosure beneath one featured candidate.

## State 11 Outside supported guide

### Entry condition

Canonical matcher output indicates that the observations fall outside the approved bounded Species universe.

### Layout anatomy

The specimen and evidence remain present. The candidate rail gives way to a bounded-guide explanation. The observation that caused the outside-guide result receives a direct annotation. Useful evidence stays in the field record.

```text
This tree appears to fall outside this 10-tree guide.

NEEDLES / SCALES
User confirmed
This guide covers ten common Omaha-area deciduous profiles.

[keep evidence]   [review an observation]   [continue with another need]
```

### Persistent elements

- Homeowner photo.
- All collected evidence and provenance.
- The observation or combination that established the boundary.
- Tree Case continuity.

### State changes

- The homeowner may review or correct the boundary-causing observation.
- A correction reruns the canonical matcher and may restore the candidate universe.
- Otherwise, Species stops without inventing a result. Relevant cross-tool routes may remain available.

### Motion

- Candidate plates de-emphasize into a bounded-guide statement; do not scatter, fail, or explode away.
- The boundary-causing clue receives restrained structural emphasis, not danger styling.

### Required copy

- `This tree appears to fall outside this [n]-tree guide.`
- A specific scope statement, such as `The current guide covers ten common Omaha-area deciduous profiles.`
- `This observation led here:` followed by the relevant clue.
- `Your useful observations will stay with this tree case.`

### Mobile behavior

Place the boundary explanation before any continuation actions. Keep the relevant clue and scope statement in the first result viewport. Do not reduce the outcome to a toast.

### Reduced-motion behavior

Replace the candidate region atomically with the boundary explanation and a text list of observations that caused the result. Announce `outside supported guide` as a status, not an error.

### Guardrails

- Do not guess a species outside the dataset.
- Do not call this `No results` without explaining the guide boundary.
- Do not present the state as homeowner failure.
- Do not erase observations from the Tree Case.

## State 12 Strongest current match

### Entry condition

The canonical matcher returns one strongest surviving candidate, while the result remains provisional and may retain unknown or conflicting evidence.

### Layout anatomy

The strongest candidate expands from the rail into a specimen plate beside or below the homeowner specimen. Common and scientific names lead the plate. The provisional status appears immediately beneath the name. Supporting, unknown, and conflicting evidence remains visible. Other surviving candidates, if any, remain secondary but reviewable.

```text
BEST CURRENT MATCH · NOT CONFIRMED

Silver Maple
Acer saccharinum

Supports                 Unknown                  Conflicts
Alternate leaves         Bark not checked         None recorded
Deep lobes
Paired winged seeds

Why it remains
[short deterministic explanation]
```

### Persistent elements

- Homeowner specimen.
- Strongest canonical candidate.
- Any other surviving candidates.
- Full evidence state, including conflicts and unknowns.
- Guide scope and provenance access.

### State changes

- If a remaining observation could materially alter the result, offer it as `What could change this result`.
- If no useful observation remains, proceed to State 13.
- Reviewing or correcting evidence reruns the matcher and may return to State 4, 9, 10, or 11.

### Motion

- The strongest candidate may expand from its existing rail position.
- The homeowner photo does not shrink into irrelevance.
- Do not use a trophy reveal, success burst, or probability count-up.

### Required copy

- `Best current match · not confirmed`
- `Why it remains`
- `What could change this result`
- Evidence labels: `Supports`, `Unknown`, and `Conflicts`.

### Mobile behavior

Place status before species details so the provisional nature is heard and seen early. The homeowner photo and candidate illustration may appear in sequence rather than side by side. Evidence sections use headings and lists, not a cramped three-column table.

### Reduced-motion behavior

Expand the candidate by replacing the compact row with the detailed plate in place. Announce the status and candidate name together. All evidence changes remain textual.

### Guardrails

- Do not use a confidence percentage.
- Do not say `identified`, `confirmed`, or `definitely`.
- Do not hide conflicts beneath a success-styled result.
- Do not let the candidate illustration masquerade as evidence from the homeowner's tree.

## State 13 Completed Species field record

### Entry condition

The guide has gone as far as it responsibly can in one of four result modes: a strongest match exists, a tie remains, the tree is outside the supported universe, or the current observations produce an ordinary no-match among the profiles in the bounded guide. State 13 also applies when no additional observation will materially improve separation.

### Layout anatomy

The working investigation resolves into a coherent field record. The record preserves the path's evidence rather than replacing it with a summary card.

Required order:

1. `Homeowner tree` with photo or intentional no-photo state.
2. `Best current match`, `Current tie`, `Outside this guide`, or `No match among these trees`.
3. Explicit provisional or bounded status.
4. `Evidence` grouped into `Supports`, `Unknown`, and `Conflicts` as applicable.
5. `Why it remains` for every displayed candidate.
6. `What could change this result` when a meaningful distinction remains.
7. `Source/profile` access with dataset or review provenance where available.
8. `What do you want to figure out next?` and contextual handoffs.

#### Ordinary no-match mode

For an ordinary no-match, the candidate area becomes an honest bounded result rather than displaying a fallback candidate:

```text
NO MATCH AMONG THESE TREES

The current observations do not support any profile in this 10-tree guide.

Review an observation
```

Use the actual approved dataset count if it changes. Preserve all evidence, conflicts, unknowns, and provenance. If canonical logic provides a useful contradiction/recheck before stopping, use State 9 first. Otherwise complete into State 13. This mode is distinct from State 11: use `Outside this guide` only when the canonical result explicitly indicates that the observation falls outside the supported universe.

### Persistent elements

- Homeowner photo and all useful evidence.
- Candidate, tie, outside-guide, or ordinary no-match result exactly as returned by the canonical engine.
- Provenance, unknowns, and conflicts.
- Tree Case continuity.

### State changes

- `Review an observation` reopens the relevant evidence without destroying the completed record.
- A correction returns to the appropriate investigation state and recomputes the record, including an ordinary no-match.
- Selecting a related homeowner need enters State 14.
- Profile access uses approved source-backed content only.

### Motion

- Annotations and candidate evidence may reorganize into the record over a restrained transition.
- Maintain recognizable continuity between working evidence and completed sections.
- Completion receives no confetti, badge, score, or artificial celebration.

### Required copy

- `Homeowner tree`
- One of `Best current match`, `Current tie`, `Outside this guide`, or `No match among these trees`
- `Not confirmed` or the more specific canonical bounded-status language
- For ordinary no-match: `The current observations do not support any profile in this [n]-tree guide.`
- `Evidence`
- `Supports`
- `Unknown`
- `Conflicts`
- `Why it remains`
- `What could change this result`
- `Source/profile`
- `What do you want to figure out next?`

### Mobile behavior

Use the required order as the reading order. Keep the result status adjacent to the result name. Evidence groups stack. A persistent `Back to result summary` link may aid long records, but no sticky control may cover evidence or host UI.

### Reduced-motion behavior

Render the completed record in place with headings and lists. A status message announces that the guide has reached its responsible stopping point and identifies the result type.

### Guardrails

- Do not collapse the record into a chatbot paragraph.
- Do not omit conflicting or unknown evidence.
- Do not invent a candidate for ordinary no-match or present it as outside-supported-universe unless the canonical result says so.
- Do not imply that Species establishes diagnosis, treatment, structural condition, hazard, necessary work, or price.
- Do not allow caller-supplied candidate IDs, order, rankings, scores, or confidence to control the record.

## State 14 Cross-tool handoff

### Entry condition

A completed or responsibly stopped Species record exists and the homeowner may continue into another tree-care need.

### Layout anatomy

The completed field record stays visible above the handoff region. Continuation choices use homeowner language and briefly state that known tree information will carry forward. They are structured routes attached to the record, not generic product cards.

```text
What do you want to figure out next?

Something looks wrong with it        → Problem Navigator
Can I trim this myself?              → DIY / Professional
I'm worried it might be unsafe       → Hazard
What might removal cost?             → Cost

Your tree photo and useful observations will carry forward.
```

### Persistent elements

- Species result and provisional status.
- Relevant photos and evidence.
- Conflicts, unknowns, location scope, and utility context already present in the Tree Case.

### State changes

- The selected capability receives relevant structured Tree Case evidence.
- The destination interprets that evidence through its own approved metaphor.
- If a safety or utility fact changes the first action, the destination shows that change soberly.
- Returning to Species restores the field record rather than restarting intake.

### Motion

- The selected route may establish a short visual connection from the field record to the destination label.
- Do not morph the Species specimen layout into the next capability's interface.
- Hazard handoff uses restrained motion and no discovery celebration.

### Required copy

- `What do you want to figure out next?`
- `Something looks wrong with it`
- `Can I trim this myself?`
- `I'm worried it might be unsafe`
- `What might removal cost?`
- `Your tree photo and useful observations will carry forward.`

### Mobile behavior

Stack routes as full-width text actions with the destination name as secondary text. Keep the carry-forward explanation before the first action or immediately after the heading. Preserve the completed result above the routes.

### Reduced-motion behavior

Use an immediate destination-state change with a text summary of carried evidence. Move focus to the destination heading. Do not animate a layout transformation.

### Guardrails

- Do not restart intake for facts already known with sufficient evidence.
- Do not imply that a Species match proves a problem, hazard, work route, or price.
- Do not copy the Species candidate rail or specimen-sheet anatomy into another capability.
- Do not expose unavailable capabilities as if they are complete in Phase 1; label or omit them according to release state.

## State 15 Mobile versions of all critical states

### Purpose

Mobile is a complete responsive expression of States 1–14, not a desktop layout squeezed into a narrow container. The homeowner may be outdoors, holding a phone in one hand, dealing with glare, and moving between the screen and the tree.

### Entry condition

The Species surface renders within a narrow host viewport or at a zoom level that requires the single-column responsive anatomy. This state overlays the canonical investigation state; it does not create different matcher behavior.

### Layout anatomy

Use the shared mobile wireframe defined near the beginning of this document. The specimen occupies one full-width region. Keyed evidence annotations follow it. The active clue appears before the candidate consequence, and the field record or handoff follows the candidate region. Contradiction pairs, tied candidates, and evidence groups stack in semantic reading order.

### Persistent elements

- Product identity and current state explanation.
- Homeowner specimen or intentional no-photo frame.
- All usable, provisional, conflicted, unknown, and skipped evidence.
- Canonical candidate count and candidate set.
- Current active clue or responsible stopping explanation.
- Tree Case continuity and completed result when one exists.

Elements may condense, but mobile layout cannot remove evidence or candidate meaning available on a larger surface.

### State changes

Every transition defined in States 1–14 uses the same canonical input and result on mobile. Responsive reflow may change position, stacking, and disclosure behavior, but it cannot change candidate order semantics, skip an evidence confirmation, bypass a contradiction, or turn a tie into a featured result. Rotation and resize preserve the current investigation state, focus target where practical, and homeowner scroll anchor.

### Mobile behavior

- Use the shared mobile reading order: identity, current explanation, specimen, current evidence, active clue, candidate state, field record or next action.
- Keep the active observation and its consequence within the same or adjacent viewport whenever practical.
- Use one primary column. A two-column option grid is allowed only when illustrations, labels, and touch targets remain clear.
- Preserve the homeowner photo as a useful reference; provide a full-image view without losing the investigation state.
- Replace crossing annotation leaders with keyed markers and ordered annotation rows.
- Use minimum comfortable touch targets and sufficient spacing for outdoor one-handed use.
- Keep keyboard order identical to visual reading order.
- Support browser and operating-system zoom without horizontal page scrolling.
- Do not depend on hover.
- Avoid nested horizontal scrolling. If the candidate rail scrolls horizontally, every candidate must also be reachable by explicit controls and assistive technology.
- Respect the host application's safe areas, message width, and fixed controls.

### Critical mobile state requirements

#### Opening and photo states

The prompt, specimen frame or photo, and at least one primary route appear early. Photo controls must not obscure the image. Photo guidance stays concise and safe.

#### Evidence review

Annotations become a numbered or keyed list beneath the photo. Each item includes value, provenance, status, and its local confirm/change/cannot-tell controls.

#### Candidate narrowing

The candidate count appears before the rail. The homeowner can review who remains and who was removed without losing the active clue. Removed-candidate reasoning remains available after animation.

#### Visual comparison

Illustrations remain large enough to distinguish the intended trait. Labels and descriptions never truncate to the point that choices become ambiguous. Selection updates immediately without a separate next button.

#### Contradiction and tie

Relationships must be expressed in words because side-by-side position may disappear. Equal candidates receive repeated equal-status labels. Contradictory observations appear consecutively before the recheck.

#### Result and handoff

The result type and provisional status appear before detailed evidence. Evidence sections stack. Handoff actions follow the record and state what carries forward.

### Motion

- Prefer short in-place transitions over large spatial movement.
- Do not auto-scroll during candidate elimination while the homeowner is reading.
- After an input, scroll only when necessary to reveal the consequence, and preserve a clear visual anchor.
- Keep transient change messages long enough to read in outdoor conditions.

### Required copy

Use the same meaning as larger surfaces. Shorten supporting descriptions only when the complete recognition cue remains available to screen readers and through an explicit detail affordance.

### Reduced-motion behavior

Use atomic state updates, visible text summaries, stable scroll position, and deliberate focus movement. Never combine reduced motion with forced auto-scroll.

### Guardrails

- Do not hide the candidate state in a distant tab while asking for a clue.
- Do not shrink botanical comparisons into icon-sized buttons.
- Do not use bottom sheets for essential persistent evidence if closing the sheet erases context.
- Do not make landscape orientation necessary.
- Do not let sticky controls cover host UI, result status, or evidence.

## State 16 Reduced-motion behavior

### Purpose

Reduced motion preserves the same investigation meaning, evidence, candidate relationships, and focus order as the default experience. It is not a visually incomplete fallback.

### Entry condition

The user's operating system, browser, host, or explicit product preference requests reduced motion. The preference applies before the first transition when it is available and takes effect without restarting the investigation when it changes during a session.

### Layout anatomy

Reduced motion uses the same large-surface or mobile anatomy as the active investigation state. Evidence, candidates, comparison controls, conflicts, result status, and handoff routes occupy the same semantic regions. A persistent text change summary replaces meaning that default motion would have carried between regions.

### Persistent elements

- Every element required by the active State 1–14 anatomy.
- The selected observation and its provenance.
- Before-and-after candidate meaning through the updated count and named change record.
- Eliminated or restored candidate reasoning.
- Focus position and Tree Case continuity.

### State changes

Canonical state changes occur at the same time and in the same order as the default experience: evidence first, candidate relationships second, candidate set and count third, next observation or stopping state last. Presentation updates atomically or with a brief opacity change, and each meaningful batch produces no more than one primary assistive announcement.

### Motion

Movement, scale, drawing, spring, parallax, animated texture, scanning, collapse, and count-up effects are disabled. A brief opacity change is allowed only when it does not obscure the before-and-after meaning or create repeated visual stimulation.

### Global replacement rules

When the user's environment requests reduced motion:

- replace movement, scaling, drawing, and collapse animations with immediate or brief opacity-only state changes;
- avoid parallax, animated texture, scanning effects, spring movement, and count-up animation;
- keep before-and-after meaning through explicit text;
- preserve departed-candidate reasoning in a change log or disclosure;
- move focus only when required to continue the task;
- announce one concise state change rather than every small visual update;
- avoid rapid flashing and repeated live-region announcements;
- preserve the homeowner's scroll position unless the next required control is otherwise unreachable.

### Reduced-motion anatomy by event

| Event | Required replacement |
| --- | --- |
| Evidence joins the field record | Insert the labeled evidence row in place and announce its value and provenance. |
| Candidate evidence changes | Update the evidence label and provide a concise cause-and-effect summary. |
| Candidate is eliminated | Atomically update the active list and retain a named `Ruled out by this clue` record. |
| Candidate is restored | Insert it with text naming the corrected observation that restored it. |
| Candidate count changes | Replace the number without counting animation and announce the full new count. |
| Next observation appears | Place it after the change summary and move focus to its heading only when needed. |
| Contradiction appears | Render both clues and their relationship in place; announce the contradiction heading once. |
| Investigation completes | Replace the working arrangement with the ordered field record and announce the stopping state. |
| Cross-tool handoff occurs | Load the destination anatomy directly and summarize carried Tree Case evidence. |

### Required copy

Reduced-motion mode uses the same homeowner-facing copy as the default experience. Additional assistive status text may name removed candidates, restored candidates, changed counts, or focus destination. It must not expose internal matcher scores or implementation details.

### Mobile behavior

On mobile, preserve the current scroll anchor and place the text change summary directly before the updated candidate region. Do not force-scroll to the top, animate height changes, or move focus merely because list length changed. Move focus to a new comparison only when the homeowner's next action would otherwise be unclear or unreachable.

### Reduced-motion behavior

The rules in this state apply to every transition in States 1–15. Disabling motion must never disable the evidence update, candidate explanation, candidate count change, next observation, contradiction review, responsible stopping state, or cross-tool carry-forward summary.

### Guardrails

- Do not remove feedback when removing motion.
- Do not substitute flashing, color cycling, or sound.
- Do not announce decorative changes.
- Do not move focus for every candidate update.
- Do not maintain a separate result path that can drift from the canonical matcher state.

## Evidence annotation specification

Every evidence annotation must expose four properties when applicable:

1. **Trait:** the normalized observation in homeowner-readable language.
2. **Value:** the selected or observed value.
3. **Origin/provenance:** where the evidence came from, such as `user_stated`, `image_observed`, or another approved source/reference.
4. **Evidence state:** how the case treats it, such as `observed`, `provisional`, `confirmed-by-user`, `conflicted`, `unknown`, skipped, or unavailable.

Origin and evidence state are separate. Confirming an image-derived observation changes its evidence state without erasing its image origin/reference. An explicit homeowner correction creates user-stated evidence that supersedes the prior extraction while leaving the history traceable. `Confirmed by user` means the homeowner confirmed their observation or report; it does not mean a professional verified the botanical fact.

Examples:

```text
SIMPLE LEAF
Origin: Image observed
State: Observed · usable clue

ALTERNATE?
Origin: Image observed
State: Provisional · needs confirmation

ALTERNATE
Origin: Image observed
State: Confirmed by user

BARK
Origin: User stated
State: Confirmed by user · conflicts with current candidates

FRUIT / SEED
Not visible
No penalty
```

Color supports these labels but never replaces them.

## Candidate presentation specification

Candidate detail increases as the universe narrows:

- **Unexamined universe:** count, silhouettes, names, or compact reference marks.
- **Several candidates:** compact specimen rows with `Still fits` and one relevant evidence relationship.
- **Small candidate set:** expanded specimen plates with support, unknown, conflict, and differentiating evidence.
- **Strongest match or tie:** full evidence anatomy and explicit provisional status.

Candidate plates use common and scientific names when approved source content is available. Illustration and profile content come from the canonical Species source. The homeowner's photo and the reference illustration must be visually distinguishable and labeled so one cannot be mistaken for the other.

## Copy rules

Copy should sound like a knowledgeable tree crew helping the homeowner inspect the right feature.

Use:

- direct observation language;
- plain explanations of what changed;
- bounded statements about the guide;
- honest provisional language;
- specific safe instructions;
- concise explanations tied to canonical evidence.

Avoid:

- quiz and wizard language;
- AI self-description;
- celebration and praise for routine input;
- unsupported certainty;
- fake confidence or completion percentages;
- technical matcher vocabulary exposed without a homeowner-readable explanation;
- copy that blames the homeowner for ambiguity, missing evidence, or conflict.

## Accessibility requirements

Every state must support:

- complete keyboard operation;
- visible focus;
- semantic radio-group behavior for mutually exclusive comparisons;
- adequate touch targets;
- screen-reader labels and text alternatives for trait illustrations;
- meaningful headings and reading order;
- state labels independent of color;
- sufficient contrast;
- zoom and reflow;
- reduced-motion behavior defined in State 16;
- concise announcements for asynchronous and candidate-state changes;
- review of eliminated, conflicting, unknown, and skipped evidence after a transition.

The text-only or host fallback result must preserve candidate set, evidence origin and state, tie, contradiction, ordinary no-match, outside-guide, next-observation, and final bounded-status meaning.

## Implementation guardrails

### Canonical state

- `match_species` is authoritative for candidate, evidence, contradiction, tie, no-match, and `nextObservation` state.
- `render_species_guide` must use or recompute the canonical result.
- Caller-supplied candidate IDs, rankings, order, scores, and confidence are never authoritative display input.
- The UI must not maintain a second ranking system.
- The dataset version and source provenance must remain available for the final record.

### State integrity

- Each visible state must be representable directly from structured tool output and Tree Case evidence.
- Refresh, rerender, or host reconnection must not silently change the meaning of evidence.
- Corrections must recompute downstream candidate state.
- Eliminated candidates may return when corrected evidence makes them canonical survivors.
- Unknown and unavailable observations must not become negative evidence.
- Contradictions must persist until corrected, resolved by canonical logic, or carried into the final record.

### Visual integrity

- Use one continuous field surface rather than a stack of generic rounded cards.
- Use the approved typography roles, palette semantics, rule lines, specimen frames, annotations, and restrained texture.
- Discovery Amber marks a useful change, not every active control.
- Rust marks conflict or recheck; Deep Red remains reserved for genuine safety states.
- Reference illustrations support comparison and recognition; they do not prove what is in the homeowner photo.
- Larger surfaces use spatial relationships; they do not merely stretch the mobile stack.

### Interaction integrity

- A meaningful selection updates the investigation immediately.
- Do not require a `Next` button after every choice.
- Do not use universal fixed-step language.
- Do not ask a low-value question when canonical `nextObservation` provides a more useful one.
- Do not repeat a question already answered with sufficient evidence.
- Do not collect a clue through unsafe homeowner behavior.

### Result integrity

- No fake confidence, probability, or completion score.
- No identification claim stronger than the canonical bounded result.
- Ties receive equal visual weight.
- Ordinary no-match remains `No match among these trees` and displays no candidate.
- Outside-guide remains an honest bounded outcome.
- Ordinary no-match and outside-supported-universe remain visibly and textually distinct.
- Supporting, conflicting, unknown, and skipped evidence stays reviewable.
- The completed result remains a field record, not a chatbot answer or generic success card.

### Cross-tool integrity

- Carry relevant Tree Case evidence forward.
- Scope all carried Species evidence and results to the current `activeTreeId`; switch or create tree context before accepting observations about another tree.
- Do not make the homeowner re-enter sufficiently supported facts.
- Do not imply that Species proves another capability's result.
- Preserve each destination capability's approved anatomy and tone.
- Do not expose unreleased routes as completed tools.

## Design and implementation review matrix

A Species UI change is not ready for approval unless the reviewer can answer yes to every applicable item.

### State coverage

- Are all 16 specified states represented in designs, fixtures, stories, or equivalent review artifacts?
- Can the canonical engine reach the intended state without UI-only ranking logic?
- Are correction, restoration, unknown, contradiction, tie, ordinary no-match, and outside-guide branches reviewable?
- Are mobile and reduced-motion versions shown for every critical state?

### Cause and effect

- Does each meaningful input visibly update evidence, candidates, conflict state, count, or next observation?
- Can the homeowner tell which clue caused a candidate change?
- Does candidate elimination expose the conflict reason before and after motion?
- If no candidates are removed, does the interface explain the actual useful effect?

### Honesty

- Are provisional image observations labeled?
- Are ties visually equal?
- Are conflicts and unknowns visible in the result?
- Is the guide boundary explicit?
- Are ordinary no-match and outside-supported-universe presented as distinct canonical outcomes?
- Are confidence and certainty claims limited to what the canonical engine establishes?

### Usability

- Does the experience work by keyboard and touch?
- Are trait illustrations understandable through labels and text alternatives?
- Is the active clue close to its candidate consequence on mobile?
- Does zoom preserve reading order and controls?
- Is the interaction usable outdoors on a phone?

### Visual fidelity

- Does the surface read as a modern field guide and working field instrument?
- Does it avoid a generic SaaS dashboard, chatbot transcript, or wizard?
- Are annotations, rule lines, specimen frames, and evidence hierarchy doing real work?
- Is amber scarce and meaningful?
- Does the completed state read as a field record?

### Reduced motion and fallback

- Is every motion-carried relationship also stated in text or structure?
- Can a homeowner review removed candidates after an atomic update?
- Are focus and live-region announcements restrained and useful?
- Does text-only output preserve candidates, evidence origin and state, ties, conflicts, ordinary no-match, outside-guide meaning, and next observation?

## Definition of done for the screen-state layer

The screen-state layer is ready to guide implementation when:

- every required state has a reviewable large-surface and mobile expression;
- every transition names its canonical input and result;
- persistent evidence and Tree Case continuity are explicit;
- motion and reduced-motion behavior communicate the same cause and effect;
- copy is approved or clearly identified as implementation copy;
- accessibility behavior is specified for each critical interaction;
- no state requires UI-invented confidence, ranking, or decision logic;
- the completed record and cross-tool handoff preserve the approved product boundaries;
- reviewers can compare an implementation directly against this document and the visual execution spec.

Implementation should begin with state fixtures and reviewable isolated states before the states are composed into a complete Species flow. A monolithic component that only demonstrates the happy path does not satisfy this specification.
