#!/usr/bin/env node

import { createHash } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const recipePath = resolve(repositoryRoot, "tools/species-guide/VENDOR-SOURCE.json");
const manifestPath = resolve(repositoryRoot, "tools/species-guide/SOURCE-MANIFEST.json");
const vendorRoot = resolve(repositoryRoot, "tools/species-guide/vendor/omahatreecare");
const importerVersion = "1.0.0";

function fail(message) {
  throw new Error(`Species vendor import failed: ${message}`);
}

function readSourceArgument(args) {
  const index = args.indexOf("--source");
  if (index === -1 || !args[index + 1] || args[index + 2]) {
    fail("use npm run vendor:species -- --source /path/to/omahatreecare");
  }
  return resolve(args[index + 1]);
}

function git(sourceRoot, args, encoding = "utf8") {
  const result = spawnSync("git", ["-C", sourceRoot, ...args], {
    encoding,
    maxBuffer: 20 * 1024 * 1024,
  });
  if (result.status !== 0) {
    const detail = Buffer.isBuffer(result.stderr) ? result.stderr.toString("utf8") : result.stderr;
    fail(`git ${args.join(" ")} failed${detail ? `: ${detail.trim()}` : ""}`);
  }
  return result.stdout;
}

function sha256(content) {
  return createHash("sha256").update(content).digest("hex");
}

function transformForNodeEsm(sourcePath, bytes) {
  if (!/\.tsx?$/.test(sourcePath)) return bytes;
  const source = bytes.toString("utf8");
  return Buffer.from(source.replace(
    /(from\s+["']\.\.?\/[^"']+?)(["'])/g,
    (match, specifier, quote) => /\.(?:c|m)?(?:js|json)$/.test(specifier) ? match : `${specifier}.js${quote}`,
  ));
}

function sourceMetadata(treeSpeciesSource) {
  const contentCheckedOn = treeSpeciesSource.match(/SPECIES_CONTENT_CHECKED_ON = "([^"]+)"/)?.[1];
  const nextReviewDue = treeSpeciesSource.match(/SPECIES_NEXT_REVIEW_DUE = "([^"]+)"/)?.[1];
  const finalContentReview = treeSpeciesSource.match(/finalContentReview: "(pending|completed)"/)?.[1];
  const databaseSection = treeSpeciesSource.split("export const treeDatabase: SpeciesProfile[] = [")[1];
  const profileCount = databaseSection?.match(/^    id: "[a-z0-9-]+",$/gm)?.length;
  if (!contentCheckedOn || !nextReviewDue || !finalContentReview || profileCount === undefined) {
    fail("could not derive Species dataset/review metadata from tree-species.ts");
  }
  return { profileCount, contentCheckedOn, nextReviewDue, finalContentReview };
}

const sourceRoot = readSourceArgument(process.argv.slice(2));
const recipe = JSON.parse(await readFile(recipePath, "utf8"));
if (
  !Array.isArray(recipe.sourcePaths)
  || recipe.sourcePaths.length === 0
  || new Set(recipe.sourcePaths).size !== recipe.sourcePaths.length
  || recipe.sourcePaths.some((sourcePath) => !/^src\/[A-Za-z0-9_./-]+$/.test(sourcePath) || sourcePath.includes(".."))
) fail("sourcePaths must be unique, repository-relative src paths");
const resolvedCommit = git(sourceRoot, ["rev-parse", `${recipe.sourceCommit}^{commit}`]).trim();
if (resolvedCommit !== recipe.sourceCommit) fail(`expected ${recipe.sourceCommit}, resolved ${resolvedCommit}`);

const remoteUrl = git(sourceRoot, ["remote", "get-url", "origin"]).trim();
const normalizeRepository = (value) => value
  .replace(/^git@github\.com:/, "https://github.com/")
  .replace(/\.git$/, "")
  .replace(/\/$/, "");
const normalizedRemote = normalizeRepository(remoteUrl);
if (normalizedRemote !== normalizeRepository(recipe.sourceRepository)) {
  fail(`origin ${remoteUrl} does not match ${recipe.sourceRepository}`);
}

await rm(vendorRoot, { recursive: true, force: true });
const files = [];
let treeSpeciesSource;
for (const sourcePath of recipe.sourcePaths) {
  const sourceBytes = git(sourceRoot, ["show", `${recipe.sourceCommit}:${sourcePath}`], null);
  const outputBytes = transformForNodeEsm(sourcePath, sourceBytes);
  const outputPath = `tools/species-guide/vendor/omahatreecare/${sourcePath}`;
  const absoluteOutputPath = resolve(repositoryRoot, outputPath);
  await mkdir(dirname(absoluteOutputPath), { recursive: true });
  await writeFile(absoluteOutputPath, outputBytes);
  files.push({
    sourcePath,
    outputPath,
    sourceSha256: sha256(sourceBytes),
    outputSha256: sha256(outputBytes),
  });
  if (sourcePath === "src/data/tree-species.ts") treeSpeciesSource = sourceBytes.toString("utf8");
}

const importerBytes = await readFile(fileURLToPath(import.meta.url));
const manifest = {
  schemaVersion: 1,
  sourceRepository: recipe.sourceRepository,
  sourceCommit: recipe.sourceCommit,
  sourceCommitSubject: git(sourceRoot, ["show", "-s", "--format=%s", recipe.sourceCommit]).trim(),
  importedOn: recipe.importedOn,
  importer: {
    name: "midwestroots-species-vendor",
    version: importerVersion,
    path: "scripts/vendor-species.mjs",
    sha256: sha256(importerBytes),
  },
  dataset: sourceMetadata(treeSpeciesSource),
  mechanicalTransforms: [{
    id: "node-esm-relative-import-extensions",
    version: 1,
    description: "Append .js to extensionless relative TypeScript import specifiers for executable Node ESM output.",
  }],
  generatedArtifacts: true,
  files,
};

await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Imported ${files.length} canonical files from ${recipe.sourceCommit}.`);
