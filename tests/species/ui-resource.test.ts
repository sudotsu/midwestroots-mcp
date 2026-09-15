import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("Species MCP App resource", () => {
  it("builds one self-contained field-guide resource with required state language and accessibility semantics", async () => {
    const html = await readFile("dist/ui/species-guide-v1.html", "utf8");
    expect(html).toContain("MIDWEST ROOTS");
    expect(html).toContain("No match among these trees");
    expect(html).toContain("fall outside this 10-tree guide");
    expect(html).toContain("fit equally well");
    expect(html).toContain("not confirmed");
    expect(html).toContain("I can't see this");
    expect(html).toContain("prefers-reduced-motion");
    expect(html).toContain("aria-label");
    expect(html).toContain("getFileDownloadUrl");
    expect(html).toContain("downloadUrl");
    expect(html).toContain("HOMEOWNER PHOTO");
    expect(html).toContain("Choose a homeowner tree photo");
    expect(html).toContain("OTHER PARTIAL MATCHES");
    expect(html).toContain("lower-ranked canonical alternatives");
    expect(html).toContain("Removed by the latest clue");
    expect(html).toContain("Continue to Hazard screening");
    expect(html).toContain("Confirm");
    expect(html).toContain("Change this");
    expect(html).toContain("confirmed-by-user");
    expect(html).toMatch(/role[:=]["']status["']/);
    expect(html).not.toMatch(/Step \d+ of \d+|confidence: ?\d+%|AI sparkles/i);
    expect(html).toContain("#c88a34");
    expect(html).toContain("#17221c");
  });

  it("uses host-authorized file refreshes instead of dereferencing input download URLs", async () => {
    const source = await readFile("ui/species-guide/main.tsx", "utf8");
    expect(source).toContain("getFileDownloadUrl({ fileId: selectedPhoto.file_id })");
    expect(source).not.toContain("setPhotoUrl(photo.download_url)");
    expect(source).not.toContain("input.photos?.[0]?.download_url");
  });
});
