import { z } from "zod";
import type { SpeciesProfile, SpeciesReview, SpeciesSource } from "./tree-species.js";

const isoDate = z.iso.date();
const sourceSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().trim().min(3),
  organization: z.string().trim().min(3),
  url: z.string().url().startsWith("https://"),
  publicationDate: z.string().regex(/^\d{4}(?:-\d{2}(?:-\d{2})?)?$/).optional(),
  accessedOn: isoDate,
  geography: z.enum(["Nebraska", "Eastern Nebraska", "Upper Midwest", "United States"]),
});
const statementSchema = z.object({ text: z.string().trim().min(20), sourceIds: z.array(z.string()).min(1) });
const traitsSchema = z.object({
  leafArrangement: z.array(z.enum(["opposite", "alternate"])).min(1),
  leafType: z.array(z.enum(["simple", "compound", "needles-or-scales"])).min(1),
  leafShape: z.array(z.enum(["deeply-lobed", "rounded-lobes", "pointed-lobes", "triangular", "oval-serrated", "elm-like", "many-small-leaflets", "very-large-compound"])).min(1),
  bark: z.array(z.enum(["diamond-ridged", "warty-corky", "smooth-to-scaly", "deeply-furrowed", "gray-furrowed", "rough-scaly"])).min(1),
  fruit: z.array(z.enum(["paddle-seeds", "paired-winged-seeds", "cottony-seeds", "small-round-pears", "fringed-acorn-cap", "acorn", "small-dark-berries", "long-flat-pods", "round-winged-seeds", "thick-dark-pods", "none-seen"])).min(1),
  overallForm: z.array(z.enum(["vase", "rounded", "upright", "broad-spreading", "open-irregular"])).min(1),
  sizeClass: z.array(z.enum(["under-40", "40-to-70", "over-70"])).min(1),
});
const traitSourceSchema = z.object({
  leafArrangement: z.array(z.string()).min(1),
  leafType: z.array(z.string()).min(1),
  leafShape: z.array(z.string()).min(1),
  bark: z.array(z.string()).min(1),
  fruit: z.array(z.string()).min(1),
  overallForm: z.array(z.string()).min(1),
  sizeClass: z.array(z.string()).min(1),
});
const profileSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  commonName: z.string().trim().min(3),
  scientificName: z.string().trim().min(3),
  taxonScope: z.enum(["species", "genus-group"]),
  taxonNote: statementSchema,
  omahaRelevance: statementSchema,
  recognition: z.array(statementSchema).min(1),
  matureSize: statementSchema,
  importantLocalConcern: statementSchema.optional(),
  whatToWatchFor: statementSchema.optional(),
  maintenanceNote: statementSchema,
  traits: traitsSchema,
  traitSourceIds: traitSourceSchema,
  sourceIds: z.array(z.string()).min(1),
});
const reviewSchema = z.object({
  reviewerName: z.literal("A.J."),
  reviewerRole: z.literal("Midwest Roots Tree Services Owner/Climber and business/product owner"),
  independent: z.literal(false),
  isaCertifiedArborist: z.literal(false),
  reviewScope: z.string().min(20),
  evidenceBoundary: z.string().min(20),
  finalContentReview: z.enum(["pending", "completed"]),
  sourcesCheckedOn: isoDate,
  nextReviewDue: isoDate,
});

const prohibited = [
  /concernLevel/i,
  /high[- ]concern/i,
  /moderate[- ]concern/i,
  /low[- ]concern/i,
  /more concerns/i,
  /fewer concerns/i,
  /species (?:is|means) (?:dangerous|hazardous)/i,
  /must be removed/i,
  /ISA[- ]certified review/i,
  /independent review completed/i,
  /professionally certified review/i,
];

function statementSourceIds(profile: SpeciesProfile) {
  return [
    profile.taxonNote,
    profile.omahaRelevance,
    ...profile.recognition,
    profile.matureSize,
    profile.importantLocalConcern,
    profile.whatToWatchFor,
    profile.maintenanceNote,
  ].filter(Boolean).flatMap((item) => item!.sourceIds);
}

export function getSpeciesContentIssues(content: {
  sources: readonly SpeciesSource[];
  profiles: readonly SpeciesProfile[];
  review: SpeciesReview;
  candidateUniverse: { inclusion: { text: string; sourceIds: string[] }; exclusion: { text: string; sourceIds: string[] } };
}, asOf = new Date()): string[] {
  const issues: string[] = [];
  const sources = content.sources.flatMap((source, index) => {
    const parsed = sourceSchema.safeParse(source);
    if (parsed.success) return [parsed.data];
    issues.push(`source[${index}] malformed: ${parsed.error.issues.map((issue) => issue.message).join(", ")}`);
    return [];
  });
  const profiles = content.profiles.flatMap((profile, index) => {
    const parsed = profileSchema.safeParse(profile);
    if (parsed.success) return [profile];
    issues.push(`profile[${index}] malformed: ${parsed.error.issues.map((issue) => issue.message).join(", ")}`);
    return [];
  });
  const review = reviewSchema.safeParse(content.review);
  if (!review.success) issues.push(`review malformed: ${review.error.issues.map((issue) => issue.message).join(", ")}`);
  const candidateUniverse = z.object({ inclusion: statementSchema, exclusion: statementSchema }).safeParse(content.candidateUniverse);
  if (!candidateUniverse.success) issues.push(`candidate universe malformed: ${candidateUniverse.error.issues.map((issue) => issue.message).join(", ")}`);
  if (sources.length === 0) issues.push("source collection is empty");
  if (profiles.length === 0) issues.push("profile collection is empty");

  for (const [label, values] of [
    ["source ID", sources.map(({ id }) => id)],
    ["profile ID", profiles.map(({ id }) => id)],
    ["scientific name", profiles.map(({ scientificName }) => scientificName)],
  ] as const) {
    const duplicates = values.filter((value, index) => values.indexOf(value) !== index);
    if (duplicates.length) issues.push(`duplicate ${label}: ${[...new Set(duplicates)].join(", ")}`);
  }

  const sourceIds = new Set(sources.map(({ id }) => id));
  if (candidateUniverse.success) {
    for (const sourceId of [...candidateUniverse.data.inclusion.sourceIds, ...candidateUniverse.data.exclusion.sourceIds]) {
      if (!sourceIds.has(sourceId)) issues.push(`candidate universe references missing source ${sourceId}`);
    }
  }
  const asOfDate = asOf.toISOString().slice(0, 10);
  if (review.success && review.data.nextReviewDue < asOfDate) issues.push(`review is stale as of ${asOfDate}`);
  for (const profile of profiles) {
    const used = [...statementSourceIds(profile), ...Object.values(profile.traitSourceIds).flat()];
    for (const sourceId of used) {
      if (!sourceIds.has(sourceId)) issues.push(`${profile.id} references missing source ${sourceId}`);
      if (!profile.sourceIds.includes(sourceId)) issues.push(`${profile.id} source ${sourceId} is absent from its public source list`);
    }
    for (const sourceId of profile.sourceIds) {
      if (!used.includes(sourceId)) issues.push(`${profile.id} declares unused source ${sourceId}`);
    }
    for (const pattern of prohibited) {
      if (pattern.test(JSON.stringify(profile))) issues.push(`${profile.id} contains prohibited copy matching ${pattern}`);
    }
    if (profile.taxonScope === "species" && !/^[A-Z][a-z-]+\s[a-z-]+(?:\s[‘'][^’']+[’'])?$/.test(profile.scientificName)) {
      issues.push(`${profile.id} lacks species-level taxonomic specificity`);
    }
    if (profile.taxonScope === "genus-group" && !/ spp\.$/.test(profile.scientificName)) {
      issues.push(`${profile.id} genus group must use an explicit spp. label`);
    }
  }
  return issues;
}

export function assertSpeciesContent(content: {
  sources: readonly SpeciesSource[];
  profiles: readonly SpeciesProfile[];
  review: SpeciesReview;
  candidateUniverse: { inclusion: { text: string; sourceIds: string[] }; exclusion: { text: string; sourceIds: string[] } };
}, asOf = new Date()) {
  const issues = getSpeciesContentIssues(content, asOf);
  if (issues.length) throw new Error(`Species content is not publishable: ${issues.join("; ")}`);
}
