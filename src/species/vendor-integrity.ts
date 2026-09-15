import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { z } from "zod";

const HashSchema = z.string().regex(/^[0-9a-f]{64}$/);

export const SpeciesVendorManifestSchema = z.strictObject({
  schemaVersion: z.literal(1),
  sourceRepository: z.url().startsWith("https://github.com/"),
  sourceCommit: z.string().regex(/^[0-9a-f]{40}$/),
  sourceCommitSubject: z.string().min(1),
  importedOn: z.iso.date(),
  importer: z.strictObject({
    name: z.literal("midwestroots-species-vendor"),
    version: z.string().regex(/^\d+\.\d+\.\d+$/),
    path: z.literal("scripts/vendor-species.mjs"),
    sha256: HashSchema,
  }),
  dataset: z.strictObject({
    profileCount: z.literal(10),
    contentCheckedOn: z.iso.date(),
    nextReviewDue: z.iso.date(),
    finalContentReview: z.enum(["pending", "completed"]),
  }),
  mechanicalTransforms: z.tuple([z.strictObject({
    id: z.literal("node-esm-relative-import-extensions"),
    version: z.literal(1),
    description: z.string().min(1),
  })]),
  generatedArtifacts: z.literal(true),
  files: z.array(z.strictObject({
    sourcePath: z.string().startsWith("src/"),
    outputPath: z.string().startsWith("tools/species-guide/vendor/omahatreecare/src/"),
    sourceSha256: HashSchema,
    outputSha256: HashSchema,
  })).min(1),
});

const SpeciesVendorRecipeSchema = z.strictObject({
  schemaVersion: z.literal(1),
  sourceRepository: z.url().startsWith("https://github.com/"),
  sourceCommit: z.string().regex(/^[0-9a-f]{40}$/),
  importedOn: z.iso.date(),
  sourcePaths: z.array(z.string().startsWith("src/")).min(1),
});

function sha256(bytes: Uint8Array) {
  return createHash("sha256").update(bytes).digest("hex");
}

/**
 * Loads the Species vendor manifest and recipe, validates their shared metadata,
 * and verifies the recorded importer and output-file hashes.
 *
 * @returns The validated vendor manifest.
 * @throws If a required file cannot be read or any schema, metadata, or hash check fails.
 */
export async function verifySpeciesVendor(repositoryRoot = process.cwd()) {
  const manifestPath = resolve(repositoryRoot, "tools/species-guide/SOURCE-MANIFEST.json");
  const manifest = SpeciesVendorManifestSchema.parse(JSON.parse(await readFile(manifestPath, "utf8")));
  const recipe = SpeciesVendorRecipeSchema.parse(JSON.parse(await readFile(
    resolve(repositoryRoot, "tools/species-guide/VENDOR-SOURCE.json"),
    "utf8",
  )));
  if (
    manifest.sourceRepository !== recipe.sourceRepository
    || manifest.sourceCommit !== recipe.sourceCommit
    || manifest.importedOn !== recipe.importedOn
    || JSON.stringify(manifest.files.map(({ sourcePath }) => sourcePath)) !== JSON.stringify(recipe.sourcePaths)
  ) throw new Error("Species vendor manifest does not match its checked-in recipe");
  const importerHash = sha256(await readFile(resolve(repositoryRoot, manifest.importer.path)));
  if (importerHash !== manifest.importer.sha256) throw new Error("Species vendor importer hash mismatch");
  for (const file of manifest.files) {
    const outputHash = sha256(await readFile(resolve(repositoryRoot, file.outputPath)));
    if (outputHash !== file.outputSha256) {
      throw new Error(`Species vendor hash mismatch: ${file.outputPath}`);
    }
  }
  return manifest;
}

export type SpeciesVendorManifest = z.infer<typeof SpeciesVendorManifestSchema>;
