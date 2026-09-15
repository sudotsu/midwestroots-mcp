import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

import { MatchSpeciesOutputSchema, SpeciesProfileOutputSchema } from "../../src/species/contracts.js";

function schemaExample(markdown: string, name: string) {
  const pattern = new RegExp(
    "<!-- schema-example:" + name + ":start -->\\s*```json\\s*([\\s\\S]*?)\\s*```\\s*<!-- schema-example:" + name + ":end -->",
  );
  const match = markdown.match(pattern);
  if (!match?.[1]) throw new Error(`Missing ${name} schema example`);
  return JSON.parse(match[1]) as unknown;
}

describe("Species tool contract examples", () => {
  it("keeps checked-in output examples aligned with strict runtime schemas", async () => {
    const contract = await readFile("tools/species-guide/TOOL-CONTRACT.md", "utf8");
    expect(MatchSpeciesOutputSchema.parse(schemaExample(contract, "match-species-output")))
      .toMatchObject({ caseReference: { activeTreeId: "tree-1" }, result: { kind: "no-match" } });
    expect(SpeciesProfileOutputSchema.parse(schemaExample(contract, "species-profile-output")))
      .toMatchObject({ profileId: "honeylocust" });
  });
});
