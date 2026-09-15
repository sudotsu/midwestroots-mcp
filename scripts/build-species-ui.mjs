import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { build } from "esbuild";

const root = process.cwd();
const outputDirectory = resolve(root, "dist/ui");
await mkdir(outputDirectory, { recursive: true });

const bundle = await build({
  entryPoints: [resolve(root, "ui/species-guide/main.tsx")],
  bundle: true,
  format: "esm",
  platform: "browser",
  target: ["es2022"],
  minify: true,
  write: false,
  jsx: "automatic",
});
const script = bundle.outputFiles[0]?.text;
if (!script) throw new Error("Species UI bundle produced no JavaScript");
const css = await readFile(resolve(root, "ui/species-guide/styles.css"), "utf8");
const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Midwest Roots Species Field Guide</title><style>${css}</style></head>
<body><div id="root"><p class="boot">Opening the field guide…</p></div><script type="module">${script}</script></body></html>`;
await writeFile(resolve(outputDirectory, "species-guide-v1.html"), html);
