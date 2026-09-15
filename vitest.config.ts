import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: { enabled: false },
    include: [
      "tests/**/*.test.ts",
      "tools/species-guide/vendor/omahatreecare/src/data/*.test.ts",
    ],
  },
});
