#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = resolve(repositoryRoot, "tools/species-guide/SOURCE-MANIFEST.json");
const recipePath = resolve(repositoryRoot, "tools/species-guide/VENDOR-SOURCE.json");

function sha256(content) {
  return createHash("sha256").update(content).digest("hex");
}

function fail(message) {
  throw new Error(`Species vendor verification failed: ${message}`);
}

const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const recipe = JSON.parse(await readFile(recipePath, "utf8"));
if (!/^[0-9a-f]{40}$/.test(manifest.sourceCommit)) fail("sourceCommit is not an immutable Git SHA");
if (
  manifest.sourceRepository !== recipe.sourceRepository
  || manifest.sourceCommit !== recipe.sourceCommit
  || manifest.importedOn !== recipe.importedOn
  || JSON.stringify(manifest.files.map((file) => file.sourcePath)) !== JSON.stringify(recipe.sourcePaths)
) fail("manifest does not match the checked-in vendor recipe");
if (
  manifest.mechanicalTransforms.length !== 1
  || manifest.mechanicalTransforms[0].id !== "node-esm-relative-import-extensions"
  || manifest.mechanicalTransforms[0].version !== 1
) fail("unexpected mechanical transform record");
if (manifest.generatedArtifacts !== true) fail("vendored files must be marked as generated artifacts");

const importerBytes = await readFile(resolve(repositoryRoot, manifest.importer.path));
if (sha256(importerBytes) !== manifest.importer.sha256) fail("importer hash does not match the manifest");

for (const file of manifest.files) {
  const outputBytes = await readFile(resolve(repositoryRoot, file.outputPath));
  const actual = sha256(outputBytes);
  if (actual !== file.outputSha256) {
    fail(`${file.outputPath} differs from its recorded canonical source`);
  }
}

const treeSpeciesPath = manifest.files.find((file) => file.sourcePath === "src/data/tree-species.ts")?.outputPath;
if (!treeSpeciesPath) fail("tree-species.ts is absent from the manifest");
const treeSpeciesSource = await readFile(resolve(repositoryRoot, treeSpeciesPath), "utf8");
for (const [label, value] of [
  ["content review date", manifest.dataset.contentCheckedOn],
  ["next review date", manifest.dataset.nextReviewDue],
  ["final content review", manifest.dataset.finalContentReview],
]) {
  if (!treeSpeciesSource.includes(`"${value}"`)) fail(`${label} metadata is inconsistent`);
}

console.log(`Verified ${manifest.files.length} generated vendor files from ${manifest.sourceCommit}.`);
