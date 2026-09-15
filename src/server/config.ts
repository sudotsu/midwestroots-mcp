import { z } from "zod";

const RuntimeEnvironmentSchema = z.enum(["development", "test", "production"]);

function list(value: string | undefined) {
  return value?.split(",").map((item) => item.trim()).filter(Boolean) ?? [];
}

export const ServerConfigSchema = z.strictObject({
  environment: RuntimeEnvironmentSchema,
  host: z.string().min(1),
  port: z.number().int().min(0).max(65_535),
  allowedHosts: z.array(z.string().min(1)),
  allowedOrigins: z.array(z.url()),
  maxRequestBytes: z.number().int().positive().max(10 * 1024 * 1024),
  shutdownTimeoutMs: z.number().int().positive().max(60_000),
}).superRefine((config, context) => {
  if (config.environment === "production" && config.allowedHosts.length === 0) {
    context.addIssue({ code: "custom", path: ["allowedHosts"], message: "production requires MCP_ALLOWED_HOSTS" });
  }
  if (config.environment === "production" && config.allowedOrigins.length === 0) {
    context.addIssue({ code: "custom", path: ["allowedOrigins"], message: "production requires MCP_ALLOWED_ORIGINS" });
  }
});

export type ServerConfig = z.infer<typeof ServerConfigSchema>;

export function loadServerConfig(environment: NodeJS.ProcessEnv = process.env): ServerConfig {
  const runtimeEnvironment = RuntimeEnvironmentSchema.parse(environment.NODE_ENV ?? "development");
  const port = z.coerce.number().int().min(0).max(65_535).parse(environment.PORT ?? "3000");
  const configuredHosts = list(environment.MCP_ALLOWED_HOSTS);
  return ServerConfigSchema.parse({
    environment: runtimeEnvironment,
    host: environment.HOST ?? "127.0.0.1",
    port,
    allowedHosts: configuredHosts.length > 0
      ? configuredHosts
      : runtimeEnvironment === "production" || port === 0
        ? []
        : [`127.0.0.1:${port}`, `localhost:${port}`],
    allowedOrigins: list(environment.MCP_ALLOWED_ORIGINS),
    maxRequestBytes: z.coerce.number().int().positive().parse(environment.MAX_REQUEST_BYTES ?? String(1024 * 1024)),
    shutdownTimeoutMs: z.coerce.number().int().positive().parse(environment.SHUTDOWN_TIMEOUT_MS ?? "10000"),
  });
}
