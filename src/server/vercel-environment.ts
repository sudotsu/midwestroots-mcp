function commaList(value: string | undefined) {
  return value?.split(",").map((item) => item.trim()).filter(Boolean) ?? [];
}

/**
 * Adapts Vercel's generated deployment hostnames to the existing strict server
 * configuration without making the core HTTP service Vercel-specific.
 *
 * Explicit MCP_ALLOWED_HOSTS entries are preserved, while Vercel's current,
 * branch, and production hostnames are added when available. The process binds
 * to all interfaces on Vercel unless HOST was explicitly configured.
 */
export function applyVercelEnvironment(environment: NodeJS.ProcessEnv = process.env) {
  if (environment.VERCEL !== "1") return environment;

  environment.HOST ??= "0.0.0.0";

  const allowedHosts = new Set(commaList(environment.MCP_ALLOWED_HOSTS));
  for (const host of [
    environment.VERCEL_URL,
    environment.VERCEL_BRANCH_URL,
    environment.VERCEL_PROJECT_PRODUCTION_URL,
  ]) {
    if (host?.trim()) allowedHosts.add(host.trim());
  }
  if (allowedHosts.size > 0) environment.MCP_ALLOWED_HOSTS = [...allowedHosts].join(",");

  return environment;
}
