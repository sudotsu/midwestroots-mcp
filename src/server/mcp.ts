import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import {
  MatchSpeciesOutputSchema,
  RenderSpeciesGuideInputSchema,
  RenderSpeciesGuideOutputSchema,
  SpeciesProfileOutputSchema,
  SpeciesToolInputSchema,
} from "../species/contracts.js";
import { SpeciesProfileInputSchema } from "../species/schemas.js";
import { getSpeciesProfile, matchSpecies, matchSpeciesText, renderSpeciesGuide } from "../species/service.js";

export const MCP_SERVER_INFO = { name: "midwest-roots", version: "0.2.0" } as const;
export const SPECIES_GUIDE_RESOURCE_URI = "ui://midwest-roots/species-guide-v1.html";
export const MCP_APP_MIME_TYPE = "text/html;profile=mcp-app";

const readOnlyAnnotations = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
} as const;

function textResult(text: string, structuredContent: Record<string, unknown>, meta?: Record<string, unknown>) {
  return {
    content: [{ type: "text" as const, text }],
    structuredContent,
    ...(meta ? { _meta: meta } : {}),
  };
}

function renderText(output: ReturnType<typeof renderSpeciesGuide>) {
  return [
    matchSpeciesText({ caseReference: output.caseReference, result: output.result }),
    output.safetyRoute?.interruptsCurrentCapability
      ? `${output.safetyRoute.heading}: ${output.safetyRoute.explanation}`
      : null,
    "Open the interactive field guide to review evidence, compare the next useful clue, or correct an observation.",
  ].filter(Boolean).join(" ");
}

/** Creates an independent stateless MCP server for one HTTP request. */
export function createMcpServer(repositoryRoot = process.cwd()) {
  const mcp = new McpServer(MCP_SERVER_INFO, {
    capabilities: { resources: {}, tools: {} },
    instructions: [
      "Midwest Roots Species uses a bounded deterministic ten-profile matcher.",
      "Use match_species rather than model intuition for candidate state.",
      "Use get_species_profile rather than inventing profile facts.",
      "Use render_species_guide for the interactive homeowner field guide; caller rankings are never authoritative.",
      "Preserve ties, contradictions, ordinary no-match, outside-guide outcomes, evidence provenance, and the active-tree boundary.",
    ].join(" "),
  });

  mcp.registerTool("match_species", {
    title: "Match a tree within the Midwest Roots Species guide",
    description: "Run the canonical deterministic ten-profile Species matcher for validated observations on the active tree. Never bypass this result with model identification intuition. Candidate order is not probability, and ties/no-match remain unresolved.",
    inputSchema: SpeciesToolInputSchema,
    outputSchema: MatchSpeciesOutputSchema,
    annotations: readOnlyAnnotations,
  }, async (input) => {
    const output = matchSpecies(input);
    return textResult(matchSpeciesText(output), output);
  });

  mcp.registerTool("get_species_profile", {
    title: "Read an approved Species profile",
    description: "Return the approved source-backed profile for one canonical profile ID. Unknown IDs fail closed. Do not invent or supplement factual species claims, and do not treat the profile as confirmed identification, diagnosis, hazard, work need, or individual-tree assessment.",
    inputSchema: SpeciesProfileInputSchema,
    outputSchema: SpeciesProfileOutputSchema,
    annotations: readOnlyAnnotations,
  }, async (input) => {
    const output = getSpeciesProfile(input);
    return textResult(
      `${output.commonName} (${output.scientificName}); ${output.taxonScope}. ${output.omahaRelevance.text} Identification is not confirmed.`,
      output,
    );
  });

  mcp.registerTool("render_species_guide", {
    title: "Open the Midwest Roots interactive Species field guide",
    description: "Render the homeowner Species investigation from validated observations. The server always recomputes canonical candidates; this tool accepts no caller candidate IDs, order, scores, confidence, primary result, tie state, or no-match state.",
    inputSchema: RenderSpeciesGuideInputSchema,
    outputSchema: RenderSpeciesGuideOutputSchema,
    annotations: readOnlyAnnotations,
    _meta: {
      ui: { resourceUri: SPECIES_GUIDE_RESOURCE_URI },
      "openai/outputTemplate": SPECIES_GUIDE_RESOURCE_URI,
      "openai/fileParams": ["photos"],
    },
  }, async (input) => {
    const output = renderSpeciesGuide(input);
    return textResult(renderText(output), output, {
      activeTreeId: output.caseReference.activeTreeId,
      originalPhotoAvailable: output.platform.originalPhotoAvailable,
    });
  });

  mcp.registerResource("Midwest Roots Species field guide", SPECIES_GUIDE_RESOURCE_URI, {
    title: "Midwest Roots Species field guide",
    description: "Versioned interactive field-guide view for render_species_guide.",
    mimeType: MCP_APP_MIME_TYPE,
    _meta: {
      ui: {
        prefersBorder: false,
        csp: { connectDomains: [], resourceDomains: [] },
      },
    },
  }, async () => {
    const html = await readFile(resolve(repositoryRoot, "dist/ui/species-guide-v1.html"), "utf8");
    return {
      contents: [{
        uri: SPECIES_GUIDE_RESOURCE_URI,
        mimeType: MCP_APP_MIME_TYPE,
        text: html,
        _meta: {
          ui: {
            prefersBorder: false,
            csp: { connectDomains: [], resourceDomains: [] },
          },
        },
      }],
    };
  });

  return mcp;
}
