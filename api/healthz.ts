import type { IncomingMessage, ServerResponse } from "node:http";

import { handleVercelRequest } from "../src/server/vercel-handler.js";

export default async function handler(request: IncomingMessage, response: ServerResponse) {
  await handleVercelRequest("/healthz", request, response);
}
