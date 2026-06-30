import { defineConfig } from "vitest/config";
import type { Reporter } from "vitest/reporters";
import VendorTableReporter from "./vitest-vendor-table-reporter.js";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    testTimeout: 60000, // 60 seconds for scraping operations
    reporters: ["html", "default", new VendorTableReporter() as Reporter],
  },
});
