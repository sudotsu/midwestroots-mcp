import { loadServerConfig } from "./config.js";
import { createHttpService } from "./http.js";

const config = loadServerConfig();
const service = await createHttpService(config);
let shuttingDown = false;
async function shutdown(signal: NodeJS.Signals) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(JSON.stringify({ level: "info", event: "server_stopping", signal }));
  const timeout = setTimeout(() => {
    console.error(JSON.stringify({ level: "error", event: "shutdown_timeout" }));
    process.exitCode = 1;
  }, config.shutdownTimeoutMs);
  timeout.unref();
  try {
    await service.close();
  } finally {
    clearTimeout(timeout);
  }
}

process.once("SIGINT", () => void shutdown("SIGINT"));
process.once("SIGTERM", () => void shutdown("SIGTERM"));

const address = await service.start();
console.log(JSON.stringify({
  level: "info",
  event: "server_started",
  host: address.host,
  port: address.port,
  mcpPath: "/mcp",
  canonicalSpeciesCommit: service.manifest.sourceCommit,
}));
