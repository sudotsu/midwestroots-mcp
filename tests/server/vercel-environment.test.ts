import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

import { createHttpService } from "../../src/server/http.js";
import { applyVercelEnvironment } from "../../src/server/vercel-environment.js";

describe("Vercel environment adapter", () => {
  it("is a no-op outside Vercel", () => {
    const environment: NodeJS.ProcessEnv = {
      HOST: "127.0.0.1",
      MCP_ALLOWED_HOSTS: "localhost:3000",
    };

    expect(applyVercelEnvironment(environment)).toBe(environment);
    expect(environment).toEqual({
      HOST: "127.0.0.1",
      MCP_ALLOWED_HOSTS: "localhost:3000",
    });
  });

  it("binds to all interfaces and adds Vercel deployment hostnames", () => {
    const environment: NodeJS.ProcessEnv = {
      VERCEL: "1",
      VERCEL_URL: "midwestroots-mcp-a1b2.vercel.app",
      VERCEL_BRANCH_URL: "midwestroots-mcp-git-preview.vercel.app",
      VERCEL_PROJECT_PRODUCTION_URL: "midwestroots-mcp.vercel.app",
    };

    applyVercelEnvironment(environment);

    expect(environment.HOST).toBe("0.0.0.0");
    expect(environment.MCP_ALLOWED_HOSTS?.split(",")).toEqual([
      "midwestroots-mcp-a1b2.vercel.app",
      "midwestroots-mcp-git-preview.vercel.app",
      "midwestroots-mcp.vercel.app",
    ]);
  });

  it("preserves explicit host configuration and deduplicates allowlisted hosts", () => {
    const environment: NodeJS.ProcessEnv = {
      VERCEL: "1",
      HOST: "::",
      MCP_ALLOWED_HOSTS: " custom.example.com ,midwestroots-mcp.vercel.app",
      VERCEL_URL: "midwestroots-mcp.vercel.app",
      VERCEL_BRANCH_URL: "midwestroots-mcp-git-preview.vercel.app",
    };

    applyVercelEnvironment(environment);

    expect(environment.HOST).toBe("::");
    expect(environment.MCP_ALLOWED_HOSTS?.split(",")).toEqual([
      "custom.example.com",
      "midwestroots-mcp.vercel.app",
      "midwestroots-mcp-git-preview.vercel.app",
    ]);
  });

  it("does not invent an allowed host when Vercel exposes no deployment hostname", () => {
    const environment: NodeJS.ProcessEnv = { VERCEL: "1" };

    applyVercelEnvironment(environment);

    expect(environment.HOST).toBe("0.0.0.0");
    expect(environment.MCP_ALLOWED_HOSTS).toBeUndefined();
  });
});

describe("Vercel captured-listener startup", () => {
  it("resolves without a listen callback or TCP address", async () => {
    const service = await createHttpService({
      environment: "test",
      host: "0.0.0.0",
      port: 3000,
      allowedHosts: [],
      allowedOrigins: [],
      maxRequestBytes: 1024 * 1024,
      shutdownTimeoutMs: 1_000,
    });
    const originalListen = service.server.listen;
    let listenCalled = false;
    service.server.listen = (() => {
      listenCalled = true;
      return service.server;
    }) as typeof service.server.listen;

    try {
      await expect(service.start({ listenerCaptured: true })).resolves.toEqual({
        host: "0.0.0.0",
        port: 3000,
      });
      expect(listenCalled).toBe(true);
      expect(service.server.address()).toBeNull();
    } finally {
      service.server.listen = originalListen;
      await service.close();
    }
  });
});

describe("Vercel packaging contract", () => {
  it("keeps the Vercel server entrypoint inside the TypeScript project", async () => {
    const tsconfig = JSON.parse(await readFile("tsconfig.json", "utf8")) as {
      include?: string[];
    };
    expect(tsconfig.include).toContain("server.ts");
  });

  it("uses captured-listener startup in the Vercel entrypoint", async () => {
    const entrypoint = await readFile("server.ts", "utf8");
    expect(entrypoint).toContain("service.start({ listenerCaptured: true })");
  });

  it("builds the MCP App resource before Vercel packages the server", async () => {
    const packageJson = JSON.parse(await readFile("package.json", "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(packageJson.scripts?.["vercel-build"]).toBe("npm run build:ui");
  });

  it("traces the runtime-read Species assets into the Vercel function", async () => {
    const config = JSON.parse(await readFile("vercel.json", "utf8")) as {
      functions?: Record<string, { includeFiles?: string }>;
    };
    const includeFiles = config.functions?.["server.ts"]?.includeFiles ?? "";
    expect(includeFiles).toContain("dist/ui/species-guide-v1.html");
    expect(includeFiles).toContain("tools/species-guide/**");
    expect(includeFiles).toContain("scripts/vendor-species.mjs");
  });
});
