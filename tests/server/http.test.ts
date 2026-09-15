import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { request as httpRequest } from "node:http";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { afterEach, describe, expect, it } from "vitest";

const services: ChildProcessWithoutNullStreams[] = [];
let nextPort = 40_000 + (process.pid % 10_000);

afterEach(async () => {
  await Promise.all(services.splice(0).map((service) => new Promise<void>((resolve) => {
    if (service.exitCode !== null) return resolve();
    service.once("exit", () => resolve());
    service.kill("SIGTERM");
  })));
});

async function startService(options: { allowedOrigins?: string[] } = {}) {
  const port = nextPort++;
  const service = spawn(process.execPath, ["--import", "tsx", "src/server/main.ts"], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      NODE_ENV: "test",
      HOST: "127.0.0.1",
      PORT: String(port),
      MCP_ALLOWED_HOSTS: `127.0.0.1:${port}`,
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
  return { service, baseUrl: `http://${address.host}:${address.port}` };
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

  it("initializes MCP and truthfully enumerates the empty foundation surface", async () => {
    const { baseUrl } = await startService();
    const client = new Client({ name: "foundation-test", version: "1.0.0" });
    const transport = new StreamableHTTPClientTransport(new URL(`${baseUrl}/mcp`));
    await client.connect(transport);
    expect(client.getServerVersion()).toMatchObject({ name: "midwest-roots", version: "0.1.0" });
    expect(client.getInstructions()).toContain("intentionally exposes no homeowner capability tools");
    expect(await client.listTools()).toEqual({ tools: [] });
    expect(await client.listResources()).toEqual({ resources: [] });
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
