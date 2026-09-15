import { randomUUID } from "node:crypto";
import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";

import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

import { verifySpeciesVendor, type SpeciesVendorManifest } from "../species/vendor-integrity.js";
import { createMcpServer } from "./mcp.js";
import { ServerConfigSchema, type ServerConfig } from "./config.js";

type JsonRecord = Record<string, unknown>;

function writeJson(response: ServerResponse, statusCode: number, body: JsonRecord) {
  if (response.headersSent) return;
  response.writeHead(statusCode, { "content-type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(body));
}

function validateMcpRequestHeaders(request: IncomingMessage, config: ServerConfig) {
  const host = request.headers.host;
  if (config.allowedHosts.length > 0 && (!host || !config.allowedHosts.includes(host))) {
    throw new HttpRequestError(403, -32000, "Invalid Host header");
  }
  const origin = request.headers.origin;
  if (origin && config.allowedOrigins.length > 0 && !config.allowedOrigins.includes(origin)) {
    throw new HttpRequestError(403, -32000, "Invalid Origin header");
  }
}

async function readJsonBody(request: IncomingMessage, maxBytes: number): Promise<unknown> {
  const chunks: Buffer[] = [];
  let bytes = 0;
  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    bytes += buffer.length;
    if (bytes > maxBytes) throw new HttpRequestError(413, -32000, "Request body is too large");
    chunks.push(buffer);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new HttpRequestError(400, -32700, "Invalid JSON");
  }
}

class HttpRequestError extends Error {
  constructor(
    readonly statusCode: number,
    readonly jsonRpcCode: number,
    message: string,
  ) {
    super(message);
  }
}

async function closeServer(server: Server) {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  });
}

export type HttpService = {
  server: Server;
  manifest: SpeciesVendorManifest;
  handle(request: IncomingMessage, response: ServerResponse): Promise<void>;
  start(): Promise<{ host: string; port: number }>;
  close(): Promise<void>;
};

/**
 * Creates the shared HTTP application after validating configuration and the
 * vendored Species snapshot. The returned `handle` method is the transport-neutral
 * request surface used by both the local Node listener and Vercel functions.
 *
 * `readyz` reflects application readiness (validated config + verified vendor
 * snapshot), not whether a particular hosting platform opened a TCP socket.
 *
 * @throws If configuration or vendor verification fails.
 */
export async function createHttpService(
  configInput: ServerConfig,
  repositoryRoot = process.cwd(),
): Promise<HttpService> {
  const config = ServerConfigSchema.parse(configInput);
  const manifest = await verifySpeciesVendor(repositoryRoot);
  let ready = true;
  const activeRequests = new Set<Promise<void>>();

  async function handleRequest(request: IncomingMessage, response: ServerResponse, requestId: string) {
    let path: string;
    try {
      path = new URL(request.url ?? "/", "http://localhost").pathname;
    } catch {
      writeJson(response, 400, {
        error: { code: "invalid_request_target", message: "Invalid request target", requestId },
      });
      return;
    }
    if (request.method === "GET" && path === "/healthz") {
      writeJson(response, 200, { status: "ok" });
      return;
    }
    if (request.method === "GET" && path === "/readyz") {
      writeJson(response, ready ? 200 : 503, {
        status: ready ? "ready" : "not-ready",
        canonicalSpeciesCommit: manifest.sourceCommit,
      });
      return;
    }
    if (path !== "/mcp") {
      writeJson(response, 404, { error: { code: "not_found", message: "Route not found", requestId } });
      return;
    }
    if (request.method !== "POST") {
      writeJson(response, 405, {
        jsonrpc: "2.0",
        error: { code: -32000, message: "Method not allowed", data: { requestId } },
        id: null,
      });
      return;
    }

    let mcp;
    let transport;
    try {
      validateMcpRequestHeaders(request, config);
      const body = await readJsonBody(request, config.maxRequestBytes);
      mcp = createMcpServer(repositoryRoot);
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
        enableJsonResponse: true,
        enableDnsRebindingProtection: true,
        allowedHosts: config.allowedHosts,
        allowedOrigins: config.allowedOrigins,
      });
      transport.onerror = (error) => {
        console.error(JSON.stringify({ level: "error", event: "mcp_transport_error", requestId, message: error.message }));
      };
      await mcp.connect(transport);
      await transport.handleRequest(request, response, body);
    } catch (error) {
      const known = error instanceof HttpRequestError;
      console.error(JSON.stringify({
        level: "error",
        event: "request_failed",
        requestId,
        message: error instanceof Error ? error.message : "Unknown error",
      }));
      writeJson(response, known ? error.statusCode : 500, {
        jsonrpc: "2.0",
        error: {
          code: known ? error.jsonRpcCode : -32603,
          message: known ? error.message : "Internal server error",
          data: { requestId },
        },
        id: null,
      });
    } finally {
      if (mcp) await mcp.close().catch(() => undefined);
      else if (transport) await transport.close().catch(() => undefined);
    }
  }

  function handle(request: IncomingMessage, response: ServerResponse) {
    const requestId = randomUUID();
    response.setHeader("x-request-id", requestId);
    let task: Promise<void>;
    task = handleRequest(request, response, requestId)
      .catch((error) => {
        console.error(JSON.stringify({
          level: "error",
          event: "unhandled_request_failure",
          requestId,
          message: error instanceof Error ? error.message : "Unknown error",
        }));
        if (!response.headersSent) {
          writeJson(response, 500, {
            error: { code: "internal_error", message: "Internal server error", requestId },
          });
        } else if (!response.writableEnded) {
          response.destroy();
        }
      })
      .finally(() => activeRequests.delete(task));
    activeRequests.add(task);
    return task;
  }

  const server = createServer((request, response) => {
    void handle(request, response);
  });

  return {
    server,
    manifest,
    handle,
    async start() {
      await new Promise<void>((resolve, reject) => {
        const onError = (error: Error) => reject(error);
        server.once("error", onError);
        server.listen(config.port, config.host, () => {
          server.off("error", onError);
          resolve();
        });
      });
      const address = server.address();
      if (!address || typeof address === "string") throw new Error("HTTP server did not expose a TCP address");
      ready = true;
      return { host: config.host, port: address.port };
    },
    async close() {
      ready = false;
      if (!server.listening) return;
      const forceClose = setTimeout(() => server.closeAllConnections(), config.shutdownTimeoutMs);
      forceClose.unref();
      try {
        await closeServer(server);
        await Promise.allSettled(activeRequests);
      } finally {
        clearTimeout(forceClose);
      }
    },
  };
}
