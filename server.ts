import { applyVercelEnvironment } from "./src/server/vercel-environment.js";

applyVercelEnvironment();

// Import after adapting the environment because main.ts validates configuration
// at module initialization before opening the HTTP listener.
await import("./src/server/main.js");
