import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

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

describe("Vercel packaging contract", () => {
  it("keeps the Vercel API entrypoints inside the TypeScript project", async () => {
    const tsconfig = JSON.parse(await readFile("tsconfig.json", "utf8")) as {
      include?: string[];
    };
    expect(tsconfig.include).toContain("api/**/*.ts");
  });

  it("builds the MCP App resource before Vercel packages functions", async () => {
    const packageJson = JSON.parse(await readFile("package.json", "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(packageJson.scripts?.["vercel-build"]).toBe("npm run build:ui");
  });

  it("packages runtime-read Species assets through a valid api function glob", async () => {
    const config = JSON.parse(await readFile("vercel.json", "utf8")) as {
      functions?: Record<string, { includeFiles?: string }>;
    };
    const includeFiles = config.functions?.["api/*.ts"]?.includeFiles ?? "";
    expect(includeFiles).toContain("dist/ui/species-guide-v1.html");
    expect(includeFiles).toContain("tools/species-guide/**");
    expect(includeFiles).toContain("scripts/vendor-species.mjs");
    expect(config.functions?.["server.ts"]).toBeUndefined();
  });

  it("rewrites the public MCP and health routes to the matching API functions", async () => {
    const config = JSON.parse(await readFile("vercel.json", "utf8")) as {
      rewrites?: Array<{ source: string; destination: string }>;
    };
    expect(config.rewrites).toEqual([
      { source: "/mcp", destination: "/api/mcp" },
      { source: "/healthz", destination: "/api/healthz" },
      { source: "/readyz", destination: "/api/readyz" },
    ]);
  });

  it("keeps each API function pinned to its public route", async () => {
    const [mcp, healthz, readyz] = await Promise.all([
      readFile("api/mcp.ts", "utf8"),
      readFile("api/healthz.ts", "utf8"),
      readFile("api/readyz.ts", "utf8"),
    ]);
    expect(mcp).toContain('handleVercelRequest("/mcp"');
    expect(healthz).toContain('handleVercelRequest("/healthz"');
    expect(readyz).toContain('handleVercelRequest("/readyz"');
  });
});
