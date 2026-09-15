import { loadServerConfig } from "./config.js";
import { createHttpService } from "./http.js";

const config = loadServerConfig();
const service = await createHttpService(config);
let shuttingDown = false;

/**
 * Handles the first termination signal by closing the HTTP service. If shutdown
 * exceeds the configured deadline, the process is marked for a failing exit.
 */
async function shutdown(signal: NodeJS.Signals) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(JSON.stringify({ level: "info", event: "server_stopping", signal }));
  const timeout = setTimeout(() => {
    console.error(JSON.stringify({ level: "error", event: "shutdown_timeout" }));
    process.exit(1);
  }, config.shutdownTimeoutMs);
  timeout.unref();
  try {
    await service.close();
  } finally {
    clearTimeout(timeout);
  }
}

const address = await service.start();
process.once("SIGINT", () => void shutdown("SIGINT"));
process.once("SIGTERM", () => void shutdown("SIGTERM"));

console.log(JSON.stringify({
  level: "info",
  event: "server_started",
  host: address.host,
  port: address.port,
  mcpPath: "/mcp",
  canonicalSpeciesCommit: service.manifest.sourceCommit,
}));
