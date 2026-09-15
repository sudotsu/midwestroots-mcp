import type { MatchCategory, ObservationAnswers } from "./tree-species-matching.js";

export type SpeciesQuestionKey = keyof ObservationAnswers;

export type SpeciesQuestionOption = {
  value: string;
  label: string;
  description?: string;
};

export type SpeciesGuideQuestion = {
  key: SpeciesQuestionKey;
  eyebrow: string;
  prompt: string;
  help: string;
  options: SpeciesQuestionOption[];
  matchCategory?: MatchCategory;
  visualKind?: "season" | "leaf-arrangement" | "leaf-type" | "leaf-shape" | "bark" | "fruit" | "crown" | "size" | "safety";
  availableWhen?: (answers: ObservationAnswers) => boolean;
};

const leavesAvailable = (answers: ObservationAnswers) => answers.season === "leaf-on";

export const speciesGuideQuestions: SpeciesGuideQuestion[] = [
  {
    key: "season",
    eyebrow: "Start with what you can actually see",
    prompt: "Can you clearly use the leaves?",
    help: "Choose no for winter, a distant canopy, damaged leaves, or anything you cannot safely reach or see.",
    visualKind: "season",
    options: [
      { value: "leaf-on", label: "Yes, usable leaves are visible", description: "The guide will ask about how the leaves grow and what they look like." },
      { value: "leaf-off-or-unavailable", label: "No, the leaves are not usable", description: "The guide will use bark, fruit or seeds, overall shape, and size instead." },
    ],
  },
  {
    key: "leafArrangement",
    eyebrow: "Look at one twig",
    prompt: "How do the leaves or buds attach?",
    help: "Use one intact twig. Opposite means a pair at the same point; alternate means they are staggered.",
    matchCategory: "leafArrangement",
    visualKind: "leaf-arrangement",
    availableWhen: leavesAvailable,
    options: [
      { value: "opposite", label: "Opposite", description: "Paired at the same point on the twig." },
      { value: "alternate", label: "Alternate", description: "Staggered one after another along the twig." },
    ],
  },
  {
    key: "leafType",
    eyebrow: "Follow the stem back to the twig",
    prompt: "Is it one leaf blade or several leaflets?",
    help: "A compound leaf has several leaflets attached to one shared stem. That whole stem meets the twig at one bud.",
    matchCategory: "leafType",
    visualKind: "leaf-type",
    availableWhen: leavesAvailable,
    options: [
      { value: "simple", label: "One leaf blade", description: "A single blade attaches to the twig by its own stem." },
      { value: "compound", label: "Several leaflets", description: "Several leaflets share one stem before it reaches the twig." },
      { value: "needles-or-scales", label: "Needles or scales", description: "This tree is probably not one of the 10 deciduous trees covered by this guide." },
    ],
  },
  {
    key: "leafShape",
    eyebrow: "Use the closest overall shape",
    prompt: "Which leaf pattern is closest?",
    help: "Do not force a choice from one damaged leaf. Skip it when the pattern is unclear.",
    matchCategory: "leafShape",
    visualKind: "leaf-shape",
    availableWhen: leavesAvailable,
    options: [
      { value: "deeply-lobed", label: "Deep maple-like lobes" },
      { value: "rounded-lobes", label: "Rounded lobes" },
      { value: "pointed-lobes", label: "Pointed, bristle-tipped lobes" },
      { value: "triangular", label: "Broad triangular leaf" },
      { value: "oval-serrated", label: "Oval with a toothed edge" },
      { value: "elm-like", label: "Toothed, elm-like leaf" },
      { value: "many-small-leaflets", label: "Many small leaflets" },
      { value: "very-large-compound", label: "Very large compound leaf" },
    ],
  },
  {
    key: "bark",
    eyebrow: "Use part of the mature trunk",
    prompt: "Which bark pattern is closest?",
    help: "Compare a safely visible section of the mature trunk. Young branches can look very different.",
    matchCategory: "bark",
    visualKind: "bark",
    options: [
      { value: "diamond-ridged", label: "Diamond-pattern ridges" },
      { value: "warty-corky", label: "Warty or cork-like ridges" },
      { value: "smooth-to-scaly", label: "Smooth becoming shallow or scaly" },
      { value: "deeply-furrowed", label: "Deep furrows" },
      { value: "gray-furrowed", label: "Gray furrows or ridges" },
      { value: "rough-scaly", label: "Rough or scaly" },
    ],
  },
  {
    key: "fruit",
    eyebrow: "Use only what is there now",
    prompt: "Do you see a useful fruit or seed clue?",
    help: "Not seeing fruit does not mean much by itself. Fruit can vary by season, age, sex, or variety.",
    matchCategory: "fruit",
    visualKind: "fruit",
    options: [
      { value: "paddle-seeds", label: "Paddle-shaped seeds in clusters" },
      { value: "paired-winged-seeds", label: "Paired winged helicopter seeds" },
      { value: "cottony-seeds", label: "Cottony seeds" },
      { value: "small-round-pears", label: "Tiny round pears" },
      { value: "fringed-acorn-cap", label: "Acorn with a fringed cap" },
      { value: "acorn", label: "Acorn; cap detail unclear" },
      { value: "small-dark-berries", label: "Small dark berry-like fruit" },
      { value: "long-flat-pods", label: "Long flat pods" },
      { value: "round-winged-seeds", label: "Round wafer-like winged seeds" },
      { value: "thick-dark-pods", label: "Thick dark pods" },
      { value: "none-seen", label: "None visible right now" },
    ],
  },
  {
    key: "overallForm",
    eyebrow: "Step back to a safe viewing point",
    prompt: "Which overall tree shape is closest?",
    help: "Use the general shape of the whole tree. Pruning, storm damage, and crowding can change it.",
    matchCategory: "overallForm",
    visualKind: "crown",
    options: [
      { value: "vase", label: "Vase-shaped or arching" },
      { value: "rounded", label: "Rounded" },
      { value: "upright", label: "Narrow and upright" },
      { value: "broad-spreading", label: "Broad and spreading" },
      { value: "open-irregular", label: "Open or irregular" },
    ],
  },
  {
    key: "sizeClass",
    eyebrow: "A rough estimate is enough",
    prompt: "About how tall is the tree?",
    help: "Skip this for a young tree or when height is hard to judge.",
    matchCategory: "sizeClass",
    visualKind: "size",
    options: [
      { value: "under-40", label: "Likely under 40 feet" },
      { value: "40-to-70", label: "About 40 to 70 feet" },
      { value: "over-70", label: "Over about 70 feet" },
    ],
  },
  {
    key: "visibleFailureSign",
    eyebrow: "Now check the tree's condition",
    prompt: "Do you see a possible failure sign?",
    help: "Examples include a hanging or broken limb, fresh trunk split, new lean, or movement at the base. This answer does not change which species matches best.",
    visualKind: "safety",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
      { value: "not-sure", label: "Not sure" },
    ],
  },
  {
    key: "targetWithinReach",
    eyebrow: "Check what could be hit",
    prompt: "Could people or property be within reach?",
    help: "Think about buildings, parked vehicles, roads, utility lines, or places where people spend time. This answer does not change which species matches best.",
    visualKind: "safety",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
      { value: "not-sure", label: "Not sure" },
    ],
  },
];

export function getAvailableSpeciesQuestions(answers: ObservationAnswers) {
  return speciesGuideQuestions.filter((question) => question.availableWhen?.(answers) ?? true);
}

export function getNextSpeciesQuestion(
  answers: ObservationAnswers,
  currentKey?: SpeciesQuestionKey,
) {
  const available = getAvailableSpeciesQuestions(answers);
  if (!currentKey) return available[0];
  const currentIndex = available.findIndex((question) => question.key === currentKey);
  return available[currentIndex + 1];
}
