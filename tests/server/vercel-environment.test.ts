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
