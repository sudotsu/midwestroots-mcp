import type { IncomingMessage, ServerResponse } from "node:http";

import { loadServerConfig } from "./config.js";
import { createHttpService } from "./http.js";
import { applyVercelEnvironment } from "./vercel-environment.js";

applyVercelEnvironment();

const servicePromise = createHttpService(loadServerConfig());

/**
 * Adapts one Vercel Function invocation to the shared HTTP application without
 * starting a second listener. The public route is restored after dispatch so
 * Vercel's request object is not left mutated if the runtime reuses it.
 */
export async function handleVercelRequest(
  path: "/mcp" | "/healthz" | "/readyz",
  request: IncomingMessage,
  response: ServerResponse,
) {
  const service = await servicePromise;
  const originalUrl = request.url;
  request.url = path;
  try {
    await service.handle(request, response);
  } finally {
    request.url = originalUrl;
  }
}
