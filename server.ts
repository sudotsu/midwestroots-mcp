import { loadServerConfig } from "./src/server/config.js";
import { createHttpService } from "./src/server/http.js";
import { applyVercelEnvironment } from "./src/server/vercel-environment.js";

applyVercelEnvironment();

const config = loadServerConfig();
const service = await createHttpService(config);
const address = await service.start({ listenerCaptured: true });

console.log(JSON.stringify({
  level: "info",
  event: "server_started",
  host: address.host,
  port: address.port,
  mcpPath: "/mcp",
  canonicalSpeciesCommit: service.manifest.sourceCommit,
  listenerCaptured: true,
}));
