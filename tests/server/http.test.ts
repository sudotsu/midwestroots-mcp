import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { request as httpRequest } from "node:http";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { afterEach, describe, expect, it } from "vitest";
import { treeCaseFixture } from "../fixtures/tree-case.js";

const services: ChildProcessWithoutNullStreams[] = [];

afterEach(async () => {
  await Promise.all(services.splice(0).map((service) => new Promise<void>((resolve) => {
    if (service.exitCode !== null) return resolve();
    service.once("exit", () => resolve());
    service.kill("SIGTERM");
  })));
});

async function startService(options: { allowedOrigins?: string[] } = {}) {
  const service = spawn(process.execPath, ["--import", "tsx", "src/server/main.ts"], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      NODE_ENV: "test",
      HOST: "127.0.0.1",
      PORT: "0",
      MCP_ALLOWED_HOSTS: "",
      MCP_ALLOWED_ORIGINS: options.allowedOrigins?.join(",") ?? "",
    },
    stdio: ["pipe", "pipe", "pipe"],
  });
  services.push(service);
  const address = await new Promise<{ host: string; port: number }>((resolve, reject) => {
    let output = "";
    const timeout = setTimeout(() => reject(new Error(`server startup timed out: ${output}`)), 5_000);
    service.stderr.on("data", (chunk) => { output += chunk.toString(); });
    service.once("exit", (code) => reject(new Error(`server exited during startup (${code}): ${output}`)));
    service.stdout.on("data", (chunk) => {
      output += chunk.toString();
      for (const line of output.split("\n")) {
        try {
          const event = JSON.parse(line) as { event?: string; host?: string; port?: number };
          if (event.event === "server_started" && event.host && event.port !== undefined) {
            clearTimeout(timeout);
            resolve({ host: event.host, port: event.port });
          }
        } catch {
          // Wait for a complete structured startup line.
        }
      }
    });
  });
  const baseUrl = `http://${address.host}:${address.port}`;
  let lastError: unknown;
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const health = await fetch(`${baseUrl}/healthz`);
      if (health.ok) return { service, baseUrl };
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
  throw new Error(`server did not accept requests after startup: ${String(lastError)}`);
}

async function stopService(service: ChildProcessWithoutNullStreams, signal: NodeJS.Signals = "SIGTERM") {
  return new Promise<number | null>((resolve) => {
    service.once("exit", (code) => resolve(code));
    service.kill(signal);
  });
}

async function requestRawPath(baseUrl: string, path: string) {
  const url = new URL(baseUrl);
  return new Promise<{ statusCode: number | undefined; body: string }>((resolve, reject) => {
    const request = httpRequest({
      hostname: url.hostname,
      port: Number(url.port),
      method: "GET",
      path,
    }, (response) => {
      let body = "";
      response.setEncoding("utf8");
      response.on("data", (chunk) => { body += chunk; });
      response.on("end", () => resolve({ statusCode: response.statusCode, body }));
    });
    request.once("error", reject);
    request.end();
  });
}

describe("MCP HTTP foundation", () => {
  it("reports health and canonical readiness", async () => {
    const { baseUrl } = await startService();
    const health = await fetch(`${baseUrl}/healthz`);
    expect(health.status).toBe(200);
    expect(await health.json()).toEqual({ status: "ok" });

    const readiness = await fetch(`${baseUrl}/readyz`);
    expect(readiness.status).toBe(200);
    expect(await readiness.json()).toEqual({
      status: "ready",
      canonicalSpeciesCommit: "473e0407e42f60d6ecb4717de3f2649300d3be08",
    });
  });

  it("initializes MCP and enumerates exactly the approved Species surface", async () => {
    const { baseUrl } = await startService();
    const client = new Client({ name: "foundation-test", version: "1.0.0" });
    const transport = new StreamableHTTPClientTransport(new URL(`${baseUrl}/mcp`));
    await client.connect(transport);
    expect(client.getServerVersion()).toMatchObject({ name: "midwest-roots", version: "0.2.0" });
    expect(client.getInstructions()).toContain("bounded deterministic ten-profile matcher");
    const tools = await client.listTools();
    expect(tools.tools.map(({ name }) => name)).toEqual([
      "match_species", "get_species_profile", "render_species_guide",
    ]);
    expect(tools.tools.every(({ annotations }) => (
      annotations?.readOnlyHint === true
      && annotations.destructiveHint === false
      && annotations.openWorldHint === false
    ))).toBe(true);
    const renderTool = tools.tools.find(({ name }) => name === "render_species_guide");
    expect(renderTool?._meta).toMatchObject({
      ui: { resourceUri: "ui://midwest-roots/species-guide-v1.html" },
      "openai/outputTemplate": "ui://midwest-roots/species-guide-v1.html",
      "openai/fileParams": ["photos"],
    });
    const inputSchema = renderTool?.inputSchema as {
      properties?: {
        photos?: {
          items?: {
            properties?: Record<string, unknown>;
            required?: string[];
            additionalProperties?: boolean;
          };
        };
      };
    };
    expect(Object.keys(inputSchema.properties?.photos?.items?.properties ?? {})).toEqual([
      "download_url", "file_id", "mime_type", "file_name",
    ]);
    expect(inputSchema.properties?.photos?.items).toMatchObject({
      required: ["download_url", "file_id"],
      additionalProperties: false,
    });
    const resources = await client.listResources();
    expect(resources.resources).toHaveLength(1);
    expect(resources.resources[0]).toMatchObject({
      uri: "ui://midwest-roots/species-guide-v1.html",
      mimeType: "text/html;profile=mcp-app",
    });
    const resource = await client.readResource({ uri: "ui://midwest-roots/species-guide-v1.html" });
    expect(resource.contents[0]).toMatchObject({
      mimeType: "text/html;profile=mcp-app",
      _meta: { ui: { csp: { connectDomains: [], resourceDomains: [] } } },
    });
    expect("text" in resource.contents[0] && resource.contents[0].text).toContain("MIDWEST ROOTS");
    expect(await client.listResourceTemplates()).toEqual({ resourceTemplates: [] });
    await client.close();
  });

  it("returns structured errors for invalid routes, methods, JSON, and request targets", async () => {
    const { baseUrl } = await startService();
    const missing = await fetch(`${baseUrl}/missing`);
    expect(missing.status).toBe(404);
    expect(await missing.json()).toMatchObject({ error: { code: "not_found" } });

    const method = await fetch(`${baseUrl}/mcp`);
    expect(method.status).toBe(405);
    expect(await method.json()).toMatchObject({ jsonrpc: "2.0", error: { code: -32000 } });

    const malformed = await fetch(`${baseUrl}/mcp`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{",
    });
    expect(malformed.status).toBe(400);
    expect(await malformed.json()).toMatchObject({ jsonrpc: "2.0", error: { code: -32700 } });

    const malformedTarget = await requestRawPath(baseUrl, "//[");
    expect(malformedTarget.statusCode).toBe(400);
    expect(JSON.parse(malformedTarget.body)).toMatchObject({
      error: { code: "invalid_request_target" },
    });

    const healthAfterMalformedTarget = await fetch(`${baseUrl}/healthz`);
    expect(healthAfterMalformedTarget.status).toBe(200);
  });

  it("executes representative Species calls and rejects invalid public inputs", async () => {
    const { baseUrl } = await startService();
    const client = new Client({ name: "species-call-test", version: "1.0.0" });
    const transport = new StreamableHTTPClientTransport(new URL(`${baseUrl}/mcp`));
    await client.connect(transport);
    const treeCase = treeCaseFixture();
    const context = {
      case: treeCase,
      request: {
        treeCase: { caseId: treeCase.caseId, activeTreeId: treeCase.activeTreeId, expectedRevision: treeCase.revision },
        observations: { leafArrangement: "opposite", leafType: "compound", fruit: "paddle-seeds" },
        skippedObservations: [],
      },
    };
    const match = await client.callTool({ name: "match_species", arguments: context });
    expect(match.isError).not.toBe(true);
    expect(match.structuredContent).toMatchObject({
      result: { primaryCandidate: { profileId: "true-ash" }, identificationStatus: "not-confirmed" },
    });
    const profile = await client.callTool({ name: "get_species_profile", arguments: { profileId: "true-ash" } });
    expect(profile.structuredContent).toMatchObject({ profileId: "true-ash", review: { finalContentReview: "pending" } });
    const render = await client.callTool({ name: "render_species_guide", arguments: context });
    expect(render.structuredContent).toMatchObject({
      result: { primaryCandidate: { profileId: "true-ash" } },
      platform: { originalPhotoAvailable: false },
    });
    const invalid = await client.callTool({ name: "match_species", arguments: {
      ...context,
      request: { ...context.request, observations: { leafType: "evergreen-ish" } },
    } });
    expect(invalid.isError).toBe(true);
    const unknownProfile = await client.callTool({ name: "get_species_profile", arguments: { profileId: "made-up-tree" } });
    expect(unknownProfile.isError).toBe(true);
    await client.close();
  });

  it("rejects an unapproved browser origin before MCP dispatch", async () => {
    const { baseUrl } = await startService({ allowedOrigins: ["https://chatgpt.com"] });
    const response = await fetch(`${baseUrl}/mcp`, {
      method: "POST",
      headers: { "content-type": "application/json", origin: "https://example.invalid" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
          protocolVersion: "2025-11-25",
          capabilities: {},
          clientInfo: { name: "origin-test", version: "1.0.0" },
        },
      }),
    });
    expect(response.status).toBe(403);
    expect(await response.json()).toMatchObject({ jsonrpc: "2.0", error: { code: -32000 } });
  });

  it("shuts down cleanly on SIGTERM", async () => {
    const { service } = await startService();
    expect(await stopService(service)).toBe(0);
  });
});
