# Species UX Blueprint

**Status:** Approved Phase 1 reference experience

## Experience goal

Species should feel like an investigation unfolding around the homeowner's actual tree, not a spoken questionnaire. It is the first/reference implementation of the product philosophy in `docs/UI-DESIGN-THESIS.md`, while the other capabilities retain their own metaphors.

The experience is driven by the canonical deterministic matcher. The interface explains and visualizes matcher state; it does not create a second ranking system.

## Representative experience

1. The homeowner asks something like “What kind of tree is this?” and may upload photographs.
2. When the platform supports it, the homeowner's tree or photograph becomes the visual center of the investigation.
3. Traits that can reasonably be extracted appear as field annotations or clues.
4. Every clue visibly distinguishes its provenance/state: user-confirmed, image-observed, provisional, conflicted, or unknown.
5. `match_species` runs immediately with the usable normalized evidence.
6. The remaining canonical candidates become visible.
7. The matcher selects the most useful next observation through its deterministic `nextObservation` logic.
8. When that observation is visual, the interface presents illustrated selectable comparison cards with meaningful labels and descriptions instead of relying on prose alone.
9. Selecting an observation creates visible state change:
   - incompatible candidates may disappear or move;
   - surviving candidates update;
   - supporting and conflicting evidence updates;
   - the selected clue joins the developing field sheet;
   - concise feedback may explain the effect, such as “This clue ruled out three candidates.”
10. The matcher chooses the next observation from the new candidate state.
11. Different trees and conversations may therefore follow different paths.
12. Contradictions cause a targeted recheck when a recheck can improve the result; they do not force a winner.
13. Ties remain ties and candidate order does not imply confidence.
14. No-match remains no-match.
15. “Not sure” and “cannot observe” remain normal routes.
16. Questioning stops when another observation will not materially improve candidate separation.
17. The final result feels like a completed field-guide or specimen entry rather than a chatbot answer.

## Visible feedback contract

Every meaningful Species input should make its effect understandable. The interface may use candidate movement, removal, evidence annotations, changed comparison prompts, or brief explanatory copy. Motion should support this cause-and-effect relationship and respect reduced-motion settings.

The interface must not animate away important contradictions or imply that elimination proves identification. Text-only and fallback output must preserve the same candidate, evidence, tie, contradiction, no-match, and next-observation meaning.

## Final Species state

As applicable to the case, the completed field entry may show:

- the homeowner's tree or photograph;
- strongest candidate or tied candidates;
- common and scientific names;
- explicit provisional/not-confirmed status;
- supporting observations;
- conflicting observations;
- unanswered or unknown clues;
- why each displayed candidate survived;
- what would distinguish a remaining tie;
- source-backed profile access through `get_species_profile`;
- a relevant next action;
- a natural handoff to Problem Navigator, DIY/Professional, Hazard, or Cost without restarting the Tree Case.

`render_species_guide` must use or recompute the canonical deterministic result. Caller-supplied candidate IDs, rankings, order, scores, or confidence values are not authoritative display state.

## Visual vocabulary

`SpeciesTraitVisual.tsx` in the canonical `sudotsu/omahatreecare` repository is the starting visual vocabulary. Misleading or insufficiently distinct illustrations must be corrected upstream before they are used as identification aids, especially where seed or pod forms differ materially.

The illustrated system must distinguish, as applicable:

- leaf arrangement;
- leaf structure;
- leaf shape;
- bark;
- seeds and fruit;
- crown and overall form;
- size;
- other approved traits added to the canonical vocabulary.

Illustrated choices require meaningful labels and descriptions. Interactions must work by keyboard and touch, preserve visible focus, and never depend on color alone.

Generated botanical imagery must not masquerade as identification evidence. Real photography may be added later only with appropriate provenance and licensing. Candidate cards should resemble authored field-guide material rather than generic AI confidence cards.

## Safety and evidence boundaries

The homeowner should never be directed to climb, break branches, enter a fall zone, or approach utility lines to collect a clue. Image-derived observations remain provisional unless their evidence status supports stronger treatment.

A Species result does not establish diagnosis, treatment need, structural condition, hazard, or necessary work. Safety handoffs preserve the Species result while routing the relevant Tree Case evidence under the canonical utility and Hazard policy.

## Phase 1 acceptance criteria

Species Phase 1 is not complete until:

- the actual tree/photo can anchor the experience when supported;
- clue provenance and uncertainty are legible;
- visual comparison choices use corrected canonical illustrations;
- every selection updates canonical matcher state and shows meaningful feedback;
- different candidate states can produce different next observations;
- ties, contradictions, unknowns, and no-match survive visually and in text fallback;
- the interface stops when no useful separation remains;
- keyboard, touch, color-independent, reduced-motion, and fallback behavior are verified;
- the final state reads as a Midwest Roots field entry;
- cross-tool continuation reuses the Tree Case.

The reward is understanding and visible discovery, not points.
