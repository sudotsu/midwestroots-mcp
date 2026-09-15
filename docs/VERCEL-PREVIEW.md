# Vercel Preview Runbook

**Status:** Preview/developer acceptance only. This does not select Vercel as the production host or approve public Species release.

The purpose of this deployment is to put the merged Species vertical slice behind public HTTPS so it can be exercised by a real ChatGPT host. In particular, the live pass must settle the remaining temporary-photo/CSP uncertainty that local browser tests cannot prove.

## Deployment shape

Vercel can run the repository's existing native Node HTTP server through the root `server.ts` entrypoint. The core MCP transport remains host-neutral and unchanged.

The Vercel-specific layer does three things:

1. `server.ts` applies the Vercel environment adapter and starts the existing HTTP service in captured-listener mode. Vercel intercepts `server.listen()` rather than opening a normal local TCP listener, so this mode treats a successful `listen()` return as startup completion; ordinary local startup still waits for the callback and validates the bound address.
2. `src/server/vercel-environment.ts` adds Vercel's generated deployment, branch, and production hostnames to the strict Host-header allowlist. Explicit `MCP_ALLOWED_HOSTS` entries are preserved for custom domains.
3. `vercel.json` traces the generated MCP App HTML, Species vendor snapshot/metadata, and vendor importer into the function because those files are read at runtime. `vercel-build` generates the self-contained Species UI before packaging.

No database, authentication system, persistence layer, image proxy, alternative MCP transport, or provider-specific domain logic is introduced.

## Create the preview project

Import `sudotsu/midwestroots-mcp` into Vercel as a new project.

The connected Vercel account currently does not have a `midwestroots-mcp` project, so project creation/import is the one platform-side step that cannot be completed by the ChatGPT Vercel connector.

Use the repository root. Do not select a framework preset that replaces the native Node server. Vercel should detect the root `server.ts` entrypoint.

## Environment

The existing production configuration remains fail-closed.

Set an exact `MCP_ALLOWED_ORIGINS` value for the ChatGPT surface being used for the preview. The repository `.env.example` currently uses:

```text
MCP_ALLOWED_ORIGINS=https://chatgpt.com
```

Do not use `*` and do not disable origin validation simply to make the preview connect. If the real ChatGPT request presents a different legitimate Origin, record that exact origin and update the deployment configuration rather than broadening the allowlist.

Generated Vercel hostnames do not need to be copied manually into `MCP_ALLOWED_HOSTS`; the adapter adds the current `VERCEL_URL`, `VERCEL_BRANCH_URL`, and `VERCEL_PROJECT_PRODUCTION_URL`. Add only additional explicit/custom domains there when needed.

No secret is required for the current no-auth Species preview.

## Endpoint checks

After the deployment is ready, verify:

- `GET /healthz` returns HTTP 200 and `{ "status": "ok" }`.
- `GET /readyz` returns HTTP 200 and the canonical Species source commit `473e0407e42f60d6ecb4717de3f2649300d3be08`.
- `POST /mcp` completes MCP initialization and enumerates exactly `match_species`, `get_species_profile`, and `render_species_guide` plus the versioned Species UI resource.

A readiness failure is not something to work around: inspect the deployment bundle/logs for a missing manifest, importer, vendor file, or generated UI asset.

## ChatGPT live acceptance

Connect the deployed `/mcp` endpoint as a custom/developer app in ChatGPT using the currently supported Developer Mode flow for the account/workspace.

Keep this pass focused. It is host integration acceptance, not another broad regression suite.

Verify all of the following in the real ChatGPT host:

1. ChatGPT discovers exactly the three approved Species tools.
2. `render_species_guide` opens the actual interactive MCP App resource rather than only the text fallback.
3. A normal Species investigation can submit a clue and receive an interactive rerender.
4. Upload one homeowner tree photo and confirm it displays through ChatGPT's host-authorized file flow.
5. Upload two to four photos and confirm every supplied photo is selectable and displays.
6. Confirm the browser console/host does not report a CSP rejection for the refreshed temporary photo URL.
7. Confirm a canonical alternative is shown as a subordinate partial match rather than an equal/probabilistic result.
8. Confirm eliminated-candidate reasoning remains reviewable after its transition.
9. Confirm the visible-failure + reachable-target condition presents the distinct Hazard handoff and preserves the Species case.
10. Confirm active electrical evidence presents utility/emergency-first guidance without inventing a Species ranking effect.
11. Exercise at least one cross-capability handoff message and confirm the actual ChatGPT presentation is sensible.
12. Confirm mobile/reduced-motion semantics remain usable if the host surface exposes them differently than the local harness.

## Photo/CSP decision

The widget intentionally does not render the caller-provided `download_url`. It refreshes a selected file through `window.openai.getFileDownloadUrl({ fileId })`.

The MCP App resource currently declares no external `resourceDomains`. Current OpenAI documentation describes the temporary-file API and separately documents resource-domain CSP, but does not provide a stable temporary-file hostname to allowlist or an explicit temporary-file CSP exemption. Do not invent a wildcard or permanent hostname.

The live test above is therefore the decision point:

- if the refreshed photo displays, record the behavior and close the outstanding review note;
- if the host blocks it, capture the actual host/CSP failure and fix only the demonstrated integration requirement in a new PR.

## Release boundary

A successful Vercel/ChatGPT preview proves deployment and host integration only.

It does **not** change these gates:

- `finalContentReview` remains `pending` for Species;
- production hosting remains an explicit Vercel-vs-Render decision;
- Plugin/app submission requirements must be rechecked before publication;
- later homeowner capabilities remain separate implementation phases.
