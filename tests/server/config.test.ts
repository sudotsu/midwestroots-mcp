import { describe, expect, it } from "vitest";

import { loadServerConfig } from "../../src/server/config.js";

describe("server configuration", () => {
  it("fails closed when production host and origin validation are absent", () => {
    expect(() => loadServerConfig({ NODE_ENV: "production", PORT: "3000" })).toThrow(/MCP_ALLOWED_HOSTS/);
    expect(() => loadServerConfig({
      NODE_ENV: "production",
      PORT: "3000",
      MCP_ALLOWED_HOSTS: "mcp.midwestroots.example",
    })).toThrow(/MCP_ALLOWED_ORIGINS/);
  });

  it("accepts explicit host-neutral production settings", () => {
    expect(loadServerConfig({
      NODE_ENV: "production",
      HOST: "0.0.0.0",
      PORT: "3000",
      MCP_ALLOWED_HOSTS: "mcp.midwestroots.example",
      MCP_ALLOWED_ORIGINS: "https://chatgpt.com",
    })).toMatchObject({
      environment: "production",
      host: "0.0.0.0",
      allowedHosts: ["mcp.midwestroots.example"],
      allowedOrigins: ["https://chatgpt.com"],
    });
  });
});
